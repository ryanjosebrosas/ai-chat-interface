'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import type { StoredMessage } from '@/lib/storage/conversations';
import { cn } from '@/lib/utils/cn';

interface ChatInterfaceProps {
  conversationId?: string | null;
  onConversationUpdate?: () => void;
}

export function ChatInterface({
  conversationId,
  onConversationUpdate,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<StoredMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Load messages when conversation changes
  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
    } else {
      setMessages([]);
    }
  }, [conversationId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle scroll to show/hide scroll button
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom && scrollHeight > clientHeight);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async (convId: string) => {
    try {
      const { getAllMessages } = await import('@/lib/storage/conversations');
      const msgs = await getAllMessages(convId);
      setMessages(msgs);
      console.log('Loaded messages for conversation:', convId, msgs.length);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    setError(null);
    setIsLoading(true);

    try {
      let convId = conversationId;

      // Create new conversation if none exists
      if (!convId) {
        const { createConversation } = await import('@/lib/storage/conversations');
        const newConv = await createConversation(
          content.substring(0, 50) + (content.length > 50 ? '...' : '')
        );
        convId = newConv.id;
        onConversationUpdate?.();
      }

      // Save user message
      const { saveMessage } = await import('@/lib/storage/conversations');
      const userMessage = await saveMessage({
        conversation_id: convId,
        role: 'user',
        content,
        metadata: {},
      });

      // Update UI immediately with user message
      setMessages(prev => [...prev, userMessage]);

      // Call Azure OpenAI API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();

      // Save assistant message
      const assistantMessage = await saveMessage({
        conversation_id: convId,
        role: 'assistant',
        content: data.content,
        metadata: {},
      });

      // Update UI with assistant message
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (messages.length < 2) return;

    // Remove last assistant message
    const newMessages = messages.slice(0, -1);
    setMessages(newMessages);

    // Get the last user message
    const lastUserMessage = newMessages[newMessages.length - 1];
    if (!lastUserMessage || lastUserMessage.role !== 'user') return;

    // Resend the request
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();

      // Save new assistant message
      const { saveMessage } = await import('@/lib/storage/conversations');
      const assistantMessage = await saveMessage({
        conversation_id: conversationId!,
        role: 'assistant',
        content: data.content,
        metadata: {},
      });

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error regenerating:', error);
      setError(error instanceof Error ? error.message : 'Failed to regenerate response');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-white dark:bg-gray-900">
      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 bg-gray-50 dark:bg-gray-950 relative"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">👋</div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                How can I help you today?
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Start a conversation by typing a message below
              </p>
            </div>
          </div>
        ) : (
          <>
            <MessageList messages={messages} onRegenerate={handleRegenerate} />
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </>
        )}

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className={cn(
              'fixed bottom-24 right-8 z-10',
              'p-3 rounded-full shadow-lg',
              'bg-blue-600 text-white',
              'hover:bg-blue-700 hover:shadow-xl',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              'animate-fade-in'
            )}
            aria-label="Scroll to bottom"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        )}

        {/* Error Display */}
        {error && (
          <div className="max-w-3xl mx-auto mt-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex gap-3">
                <svg
                  className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">
                    Error
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto p-4">
          <ChatInput onSend={handleSendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
}
