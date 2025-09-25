import { getBrandGuidelines, getBrandMessage } from '@/config/brandConfig';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
}

export interface ModelConfig {
  id: string;
  name: string;
  description: string;
  costPer1kTokens: number;
  maxTokens: number;
  capabilities: string[];
}

export interface ChatResponse {
  content: string;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  finish_reason: string;
}

export const AVAILABLE_MODELS: ModelConfig[] = [
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Fast and cost-effective for most queries',
    costPer1kTokens: 0.002,
    maxTokens: 4096,
    capabilities: ['general', 'fast_response', 'analytics']
  },
  {
    id: 'gpt-4-turbo-preview',
    name: 'GPT-4 Turbo',
    description: 'Most capable model for complex analytics',
    costPer1kTokens: 0.03,
    maxTokens: 128000,
    capabilities: ['analytics', 'complex_reasoning', 'function_calling']
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'Balanced performance and cost',
    costPer1kTokens: 0.03,
    maxTokens: 8192,
    capabilities: ['analytics', 'reasoning', 'function_calling']
  }
];

class ChatGPTService {
  private apiKey: string;
  private baseURL: string;
  private defaultModel: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    this.baseURL = 'https://api.openai.com/v1';
    this.defaultModel = import.meta.env.VITE_DEFAULT_MODEL || 'gpt-3.5-turbo';
    
    // Debug logging
    console.log('ChatGPT Service Constructor:');
    console.log('- VITE_OPENAI_API_KEY exists:', !!import.meta.env.VITE_OPENAI_API_KEY);
    console.log('- VITE_OPENAI_API_KEY value:', import.meta.env.VITE_OPENAI_API_KEY ? 'Present' : 'Missing');
    console.log('- this.apiKey length:', this.apiKey.length);
    console.log('- this.apiKey starts with:', this.apiKey.substring(0, 10) + '...');
  }

  private getCurrentDateTime(): string {
    return new Date().toLocaleString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  }

  async generateResponse(
    messages: ChatMessage[],
    model: string = this.defaultModel,
    temperature: number = 0.7,
    maxTokens: number = 800,
    stream: boolean = false
  ): Promise<ChatResponse | ReadableStream> {
    const systemMessage: ChatMessage = {
      id: 'system',
      role: 'system',
      content: `You are ParcelAce AI, a helpful shipping analytics assistant. Keep responses concise, friendly, and actionable.

Current Date and Time: ${this.getCurrentDateTime()}

Brand Guidelines:
${getBrandGuidelines()}

Guidelines:
- Be concise and to the point
- Use simple, clear language
- Provide actionable insights
- Use bullet points for lists
- Keep responses under 200 words unless detailed analysis is requested
- Be helpful but not overly verbose

Capabilities:
- Shipping metrics analysis (RTO rates, delivery success, AOV)
- Wallet expense insights
- Performance comparisons
- Shipping optimization suggestions
- General shipping and logistics help`,
      timestamp: new Date()
    };

    const formattedMessages = [
      systemMessage,
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    const requestBody = {
      model,
      messages: formattedMessages,
      temperature,
      max_tokens: maxTokens,
      stream
    };

    if (stream) {
      const response = await this.makeRequest('/chat/completions', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      return response.body as ReadableStream;
    } else {
      const response = await this.makeRequest('/chat/completions', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      return {
        content: data.choices[0].message.content,
        model: data.model,
        usage: data.usage,
        finish_reason: data.choices[0].finish_reason
      };
    }
  }

  async generateStreamingResponse(
    messages: ChatMessage[],
    model: string = this.defaultModel,
    onChunk: (chunk: string) => void,
    onComplete: (response: ChatResponse) => void,
    onError: (error: Error) => void
  ) {
    try {
      const stream = await this.generateResponse(messages, model, 0.7, 1000, true) as ReadableStream;
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              onComplete({
                content: fullResponse,
                model,
                usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
                finish_reason: 'stop'
              });
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || '';
              if (content) {
                fullResponse += content;
                onChunk(content);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      onError(error as Error);
    }
  }

  getAvailableModels(): ModelConfig[] {
    return AVAILABLE_MODELS;
  }

  getModelConfig(modelId: string): ModelConfig | undefined {
    return AVAILABLE_MODELS.find(model => model.id === modelId);
  }

  estimateCost(tokens: number, modelId: string): number {
    const model = this.getModelConfig(modelId);
    if (!model) return 0;
    return (tokens / 1000) * model.costPer1kTokens;
  }

  isConfigured(): boolean {
    const configured = !!this.apiKey;
    console.log('ChatGPT isConfigured check:');
    console.log('- this.apiKey exists:', !!this.apiKey);
    console.log('- this.apiKey length:', this.apiKey.length);
    console.log('- isConfigured result:', configured);
    return configured;
  }

  // Fallback method when AI is unavailable
  getFallbackResponse(type: 'greeting' | 'error' | 'help' | 'unavailable' | 'analytics' | 'wallet' | 'shipping'): string {
    return getBrandMessage(type);
  }
}

export const chatGPTService = new ChatGPTService(); 