import { LLMConfig, LLMMessage, LLMResponse, StreamingLLMResponse } from '@/types/llm';
import { OpenAIClient } from './clients/openai';
import { AnthropicClient } from './clients/anthropic';
import { GoogleClient } from './clients/google';
import { HuggingFaceClient } from './clients/huggingface';

export interface LLMClient {
  generateResponse(messages: LLMMessage[], config: LLMConfig): Promise<LLMResponse>;
  streamResponse(
    messages: LLMMessage[], 
    config: LLMConfig, 
    onChunk: (chunk: StreamingLLMResponse) => void
  ): Promise<void>;
  generateEmbeddings?(texts: string[], config: LLMConfig): Promise<number[][]>;
}

export class UnifiedLLMClient {
  private clients: Map<string, LLMClient> = new Map();

  constructor() {
    this.clients.set('openai', new OpenAIClient());
    this.clients.set('anthropic', new AnthropicClient());
    this.clients.set('google', new GoogleClient());
    this.clients.set('huggingface', new HuggingFaceClient());
  }

  async generateResponse(messages: LLMMessage[], config: LLMConfig): Promise<LLMResponse> {
    const client = this.clients.get(config.provider);
    if (!client) {
      throw new Error(`Unsupported LLM provider: ${config.provider}`);
    }
    
    return client.generateResponse(messages, config);
  }

  async streamResponse(
    messages: LLMMessage[], 
    config: LLMConfig, 
    onChunk: (chunk: StreamingLLMResponse) => void
  ): Promise<void> {
    const client = this.clients.get(config.provider);
    if (!client) {
      throw new Error(`Unsupported LLM provider: ${config.provider}`);
    }
    
    return client.streamResponse(messages, config, onChunk);
  }

  async generateEmbeddings(texts: string[], config: LLMConfig): Promise<number[][]> {
    const client = this.clients.get(config.provider);
    if (!client?.generateEmbeddings) {
      throw new Error(`Provider ${config.provider} does not support embeddings`);
    }
    
    return client.generateEmbeddings(texts, config);
  }
}