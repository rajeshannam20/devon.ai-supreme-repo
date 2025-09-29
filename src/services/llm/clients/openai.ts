import { LLMConfig, LLMMessage, LLMResponse, StreamingLLMResponse } from '@/types/llm';
import { LLMClient } from '../client';

export class OpenAIClient implements LLMClient {
  async generateResponse(messages: LLMMessage[], config: LLMConfig): Promise<LLMResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        messages: this.formatMessages(messages),
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 4096,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content || '',
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
      finishReason: data.choices[0]?.finish_reason,
    };
  }

  async streamResponse(
    messages: LLMMessage[], 
    config: LLMConfig, 
    onChunk: (chunk: StreamingLLMResponse) => void
  ): Promise<void> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        messages: this.formatMessages(messages),
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 4096,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            onChunk({
              content: fullContent,
              delta: '',
              done: true,
            });
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices[0]?.delta?.content || '';
            fullContent += delta;

            onChunk({
              content: fullContent,
              delta,
              done: false,
            });
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  }

  private formatMessages(messages: LLMMessage[]) {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.images && msg.images.length > 0 
        ? [
            { type: 'text', text: msg.content },
            ...msg.images.map(img => ({
              type: 'image_url',
              image_url: { url: img }
            }))
          ]
        : msg.content
    }));
  }
}