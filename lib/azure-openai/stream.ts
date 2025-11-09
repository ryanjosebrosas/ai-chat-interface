import { azureOpenAI, getDeploymentName } from './client';
import type { ChatMessage } from '@/types';

/**
 * Stream chat completion from Azure OpenAI
 * @param messages - Array of chat messages
 * @param options - Optional configuration
 * @returns AsyncGenerator yielding content chunks
 */
export async function* streamChatCompletion(
  messages: ChatMessage[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
  }
): AsyncGenerator<string, void, unknown> {
  try {
    const stream = await azureOpenAI.chat.completions.create({
      model: getDeploymentName(),
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      stream: true,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2000,
      top_p: options?.topP ?? 1,
      frequency_penalty: options?.frequencyPenalty ?? 0,
      presence_penalty: options?.presencePenalty ?? 0,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  } catch (error) {
    console.error('Error streaming chat completion:', error);
    throw error;
  }
}

/**
 * Get a complete chat completion (non-streaming)
 * @param messages - Array of chat messages
 * @param options - Optional configuration
 * @returns Complete response content
 */
export async function getChatCompletion(
  messages: ChatMessage[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
  }
): Promise<string> {
  try {
    const response = await azureOpenAI.chat.completions.create({
      model: getDeploymentName(),
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      stream: false,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2000,
      top_p: options?.topP ?? 1,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error getting chat completion:', error);
    throw error;
  }
}

/**
 * Create a ReadableStream for streaming responses
 * Useful for API routes that need to return streaming responses
 */
export function createChatStream(
  messages: ChatMessage[],
  options?: {
    temperature?: number;
    maxTokens?: number;
  }
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamChatCompletion(messages, options)) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}
