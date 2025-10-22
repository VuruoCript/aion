import dotenv from 'dotenv';

dotenv.config();

export const llmConfig = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: 'gpt-4-turbo-preview',
    maxTokens: 1000,
    temperature: 0.7,
    timeout: 30000
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: 'claude-3-5-sonnet-20241022',
    maxTokens: 1000,
    temperature: 0.7,
    timeout: 30000
  },
  xai: {
    apiKey: process.env.XAI_API_KEY || '',
    model: 'grok-beta',
    maxTokens: 1000,
    temperature: 0.7,
    timeout: 30000
  },
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    model: 'deepseek-chat',
    maxTokens: 1000,
    temperature: 0.7,
    timeout: 30000
  },
  google: {
    apiKey: process.env.GOOGLE_API_KEY || '',
    model: 'gemini-pro',
    maxTokens: 1000,
    temperature: 0.7,
    timeout: 30000
  }
};

export type LLMProvider = keyof typeof llmConfig;
