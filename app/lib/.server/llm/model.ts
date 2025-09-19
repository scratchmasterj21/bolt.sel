import { createAnthropic } from '@ai-sdk/anthropic';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Provider } from './api-key';

export function getModel(apiKey: string, provider: Provider = 'anthropic') {
  if (provider === 'google') {
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
  }
  
  const anthropic = createAnthropic({
    apiKey,
  });
  return anthropic('claude-3-5-sonnet-20240620');
}

// Keep the old function for backward compatibility
export function getAnthropicModel(apiKey: string) {
  return getModel(apiKey, 'anthropic');
}
