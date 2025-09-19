import { streamText as _streamText, convertToCoreMessages, type Message } from 'ai';
import { getAPIKey, type Provider } from '~/lib/.server/llm/api-key';
import { getModel } from '~/lib/.server/llm/model';
import { MAX_TOKENS } from './constants';
import { getSystemPrompt } from './prompts';
import { GoogleGenerativeAI } from '@google/generative-ai';

export type Messages = Message[];

export type StreamingOptions = Omit<Parameters<typeof _streamText>[0], 'model'>;

export function streamText(messages: Messages, env: Env, options?: StreamingOptions, provider: Provider = 'anthropic') {
  const apiKey = getAPIKey(env, provider);
  
  if (provider === 'google') {
    // Handle Google Gemini with custom streaming
    return streamGoogleText(messages, apiKey, options);
  }
  
  const model = getModel(apiKey, provider);
  const baseOptions = {
    model,
    system: getSystemPrompt(),
    maxTokens: MAX_TOKENS,
    messages: convertToCoreMessages(messages),
    ...options,
  };

  // Add provider-specific headers
  return _streamText({
    ...baseOptions,
    headers: {
      'anthropic-beta': 'max-tokens-3-5-sonnet-2024-07-15',
    },
  } as any);
}

async function streamGoogleText(messages: Messages, apiKey: string, options?: StreamingOptions) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
  
  // Convert messages to Google's format
  const systemPrompt = getSystemPrompt();
  const lastMessage = messages[messages.length - 1];
  const conversationHistory = messages.slice(0, -1);
  
  // Build the prompt with system message and conversation history
  let prompt = systemPrompt + '\n\n';
  
  for (const message of conversationHistory) {
    if (message.role === 'user') {
      prompt += `User: ${message.content}\n\n`;
    } else if (message.role === 'assistant') {
      prompt += `Assistant: ${message.content}\n\n`;
    }
  }
  
  prompt += `User: ${lastMessage.content}`;
  
  try {
    const result = await model.generateContentStream(prompt);
    
    // Create a proper AI SDK compatible stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              // Send text delta in AI SDK format - escape properly
              const escapedText = text.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
              const data = `0:"${escapedText}"\n`;
              controller.enqueue(encoder.encode(data));
            }
          }
          // Send finish signal
          controller.enqueue(encoder.encode('d:{"finishReason":"stop"}\n'));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });
    
    return {
      toAIStream: () => stream,
    };
  } catch (error) {
    throw new Error(`Google Gemini error: ${error}`);
  }
}
