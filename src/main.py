from fastapi import FastAPI, Depends, HTTPException, Request, Body
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import httpx
import os
import json
from secrets.manager import get_api_key, list_available_keys, set_api_key, delete_api_key
from auth.token_utils import verify_token, get_current_user
from fastapi.middleware.cors import CORSMiddleware
from services.agui_listener import router as agui_router  # Import the AG-UI router

app = FastAPI(
    title="MCP - Model Control Panel",
    description="Unified API gateway for AI models and services",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the AG-UI router
app.include_router(agui_router)

# ===== Models =====
class ChatRequest(BaseModel):
    prompt: str
    model: str = "gpt-4o-mini"
    user: Optional[str] = None
    temperature: float = 0.7
    max_tokens: Optional[int] = None

class CompletionResult(BaseModel):
    completion: str
    model: str
    usage: Optional[Dict] = None

class TextToSpeechRequest(BaseModel):
    text: str
    voice_id: str = "EXAVITQu4vr4xnSDxMaL"  # Default voice ID (Eleven Labs - Sarah)
    model_id: str = "eleven_multilingual_v2"

class AudioResult(BaseModel):
    audio_url: str
    duration: Optional[float] = None

class VectorSearchRequest(BaseModel):
    query: str
    collection: str
    limit: int = 5

class VectorSearchResult(BaseModel):
    results: List[Dict[str, Any]]
    query: str

class APIKeyRequest(BaseModel):
    key: str
    service: str

class StatusResponse(BaseModel):
    status: str
    message: str

# ===== API Key Management =====
@app.get("/admin/keys", response_model=List[str])
async def list_keys(user: str = Depends(get_current_user)):
    """List all available API keys (names only)"""
    if user != "admin":
        raise HTTPException(status_code=403, detail="Only admin users can list keys")
    
    return list_available_keys()

@app.put("/admin/keys/{service}", response_model=StatusResponse)
async def update_key(
    service: str, 
    data: APIKeyRequest,
    user: str = Depends(get_current_user)
):
    """Update or create an API key"""
    if user != "admin":
        raise HTTPException(status_code=403, detail="Only admin users can update keys")
    
    if set_api_key(service, data.key):
        return StatusResponse(
            status="success",
            message=f"API key for {service} has been updated"
        )
    else:
        raise HTTPException(status_code=500, detail="Failed to update API key")

@app.delete("/admin/keys/{service}", response_model=StatusResponse)
async def remove_key(
    service: str,
    user: str = Depends(get_current_user)
):
    """Remove an API key"""
    if user != "admin":
        raise HTTPException(status_code=403, detail="Only admin users can delete keys")
    
    if delete_api_key(service):
        return StatusResponse(
            status="success",
            message=f"API key for {service} has been removed"
        )
    else:
        raise HTTPException(status_code=500, detail="Failed to remove API key")

# ===== Proxy: OpenAI =====
@app.post("/proxy/openai/chat", response_model=CompletionResult)
async def proxy_openai_chat(data: ChatRequest, token: Dict = Depends(verify_token)):
    """Proxy endpoint for OpenAI chat completions"""
    openai_key = get_api_key("OPENAI_API_KEY")
    if not openai_key:
        raise HTTPException(status_code=403, detail="OpenAI API key not configured")

    headers = {
        "Authorization": f"Bearer {openai_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": data.model,
        "messages": [{"role": "user", "content": data.prompt}],
        "temperature": data.temperature
    }
    
    if data.max_tokens:
        payload["max_tokens"] = data.max_tokens
        
    if data.user:
        payload["user"] = data.user

    async with httpx.AsyncClient() as client:
        try:
            r = await client.post("https://api.openai.com/v1/chat/completions", 
                               headers=headers, 
                               json=payload, 
                               timeout=30.0)
            
            if r.status_code != 200:
                raise HTTPException(status_code=r.status_code, 
                                  detail=f"OpenAI API error: {r.text}")
            
            response = r.json()
            return CompletionResult(
                completion=response["choices"][0]["message"]["content"],
                model=response["model"],
                usage=response.get("usage")
            )
        except httpx.RequestError as e:
            raise HTTPException(status_code=503, 
                              detail=f"Error communicating with OpenAI: {str(e)}")

# ===== Proxy: Hugging Face =====
@app.post("/proxy/huggingface/generate", response_model=CompletionResult)
async def proxy_huggingface_generate(data: ChatRequest, token: Dict = Depends(verify_token)):
    """Proxy endpoint for Hugging Face text generation"""
    hf_key = get_api_key("HUGGINGFACE_API_KEY")
    if not hf_key:
        raise HTTPException(status_code=403, detail="Hugging Face API key not configured")

    headers = {
        "Authorization": f"Bearer {hf_key}",
        "Content-Type": "application/json"
    }
    
    # Default to a good open model if none specified
    model_id = data.model if data.model != "gpt-4o-mini" else "mistralai/Mistral-7B-Instruct-v0.2"
    
    # HF Inference API endpoint
    api_url = f"https://api-inference.huggingface.co/models/{model_id}"
    
    payload = {
        "inputs": data.prompt,
        "parameters": {
            "temperature": data.temperature,
            "max_new_tokens": data.max_tokens or 512,
            "return_full_text": False
        }
    }

    async with httpx.AsyncClient() as client:
        try:
            r = await client.post(api_url, headers=headers, json=payload, timeout=30.0)
            
            if r.status_code != 200:
                raise HTTPException(status_code=r.status_code, 
                                  detail=f"Hugging Face API error: {r.text}")
            
            response = r.json()
            
            # Handle different response formats
            if isinstance(response, list) and len(response) > 0:
                text = response[0].get("generated_text", "")
            else:
                text = response.get("generated_text", "")
                
            return CompletionResult(
                completion=text,
                model=model_id,
                usage={"prompt_tokens": len(data.prompt), "completion_tokens": len(text)}
            )
        except httpx.RequestError as e:
            raise HTTPException(status_code=503, 
                              detail=f"Error communicating with Hugging Face: {str(e)}")

# ===== Proxy: Eleven Labs =====
@app.post("/proxy/elevenlabs/tts", response_model=AudioResult)
async def proxy_elevenlabs_tts(data: TextToSpeechRequest, token: Dict = Depends(verify_token)):
    """Proxy endpoint for Eleven Labs text-to-speech"""
    elevenlabs_key = get_api_key("ELEVENLABS_API_KEY")
    if not elevenlabs_key:
        raise HTTPException(status_code=403, detail="Eleven Labs API key not configured")

    headers = {
        "xi-api-key": elevenlabs_key,
        "Content-Type": "application/json"
    }
    
    payload = {
        "text": data.text,
        "model_id": data.model_id,
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75
        }
    }

    api_url = f"https://api.elevenlabs.io/v1/text-to-speech/{data.voice_id}"

    async with httpx.AsyncClient() as client:
        try:
            r = await client.post(api_url, headers=headers, json=payload, timeout=30.0)
            
            if r.status_code != 200:
                raise HTTPException(status_code=r.status_code, 
                                  detail=f"Eleven Labs API error: {r.text}")
            
            # This endpoint returns audio data directly
            # For this example, we'll return a mock URL
            # In a real implementation, you would save the audio file and return a URL
            
            # Mock response for demonstration
            return AudioResult(
                audio_url=f"/audio/generated/{data.voice_id}_{hash(data.text)}.mp3",
                duration=len(data.text) / 20  # Rough estimate
            )
        except httpx.RequestError as e:
            raise HTTPException(status_code=503, 
                              detail=f"Error communicating with Eleven Labs: {str(e)}")

# ===== Proxy: Vector Search =====
@app.post("/proxy/vector/search", response_model=VectorSearchResult)
async def proxy_vector_search(data: VectorSearchRequest, token: Dict = Depends(verify_token)):
    """Proxy endpoint for vector database search"""
    # This is a placeholder implementation
    # In a real system, you would integrate with Pinecone, Weaviate, Qdrant, etc.
    
    # Mock response for demonstration
    results = [
        {
            "id": f"doc_{i}",
            "score": 0.9 - (i * 0.1),
            "metadata": {
                "title": f"Sample Document {i}",
                "source": "mock-database"
            },
            "content": f"This is sample content related to '{data.query}'"
        }
        for i in range(data.limit)
    ]
    
    return VectorSearchResult(
        results=results,
        query=data.query
    )

# ===== System Status =====
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "version": "1.0.0"}

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "Model Control Panel API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
