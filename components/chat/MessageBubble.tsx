'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { formatTime } from '@/lib/utils/helpers';
import type { MessageRole } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageBubbleProps {
  role: MessageRole;
  content: string;
  timestamp: string;
  className?: string;
  onRegenerate?: () => void;
  isLastAssistant?: boolean;
}

export function MessageBubble({
  role,
  content,
  timestamp,
  className,
  onRegenerate,
  isLastAssistant = false
}: MessageBubbleProps) {
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div
      className={cn(
        'flex w-full message-enter group',
        isUser ? 'justify-end' : 'justify-start',
        className
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="relative max-w-[85%] sm:max-w-[75%]">
        <div
          className={cn(
            'rounded-2xl px-5 py-4',
            'shadow-md border-2 transition-all duration-200',
            'hover:shadow-lg',
            isUser
              ? 'bg-blue-600 text-white border-blue-700'
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 border-gray-200 dark:border-gray-700'
          )}
        >
          {/* Content */}
          {isUser ? (
            // User messages: plain text
            <div className="whitespace-pre-wrap break-words font-medium text-base leading-relaxed">
              {content}
            </div>
          ) : (
            // Assistant messages: rendered markdown
            <div className="markdown-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-2xl md:text-3xl font-bold mt-4 mb-3 first:mt-0 text-gray-900 dark:text-white">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl md:text-2xl font-bold mt-3 mb-2 first:mt-0 text-gray-900 dark:text-white">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg md:text-xl font-bold mt-3 mb-2 first:mt-0 text-gray-900 dark:text-white">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="mb-3 last:mb-0 text-base leading-relaxed text-gray-900 dark:text-gray-50">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc ml-6 mb-3 space-y-1.5 text-gray-900 dark:text-gray-50">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal ml-6 mb-3 space-y-1.5 text-gray-900 dark:text-gray-50">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-base leading-relaxed text-gray-900 dark:text-gray-50">
                      {children}
                    </li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-gray-900 dark:text-white">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic">{children}</em>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                  code: ({ inline, children, ...props }: any) => {
                    if (inline) {
                      return (
                        <code
                          className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-1.5 py-0.5 rounded text-sm font-mono"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }
                    return (
                      <code
                        className="block bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono my-3 border border-gray-300 dark:border-gray-700"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-blue-500 dark:border-blue-400 pl-4 italic my-3 text-gray-700 dark:text-gray-300">
                      {children}
                    </blockquote>
                  ),
                  hr: () => (
                    <hr className="my-4 border-gray-300 dark:border-gray-600" />
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}

          {/* Timestamp */}
          <div
            className={cn(
              'text-xs mt-3 font-medium',
              isUser
                ? 'text-right text-blue-100'
                : 'text-left text-gray-500 dark:text-gray-400'
            )}
          >
            {formatTime(timestamp)}
          </div>
        </div>

        {/* Action buttons (only for assistant messages) */}
        {!isUser && (
          <div
            className={cn(
              'absolute -right-2 top-2 flex gap-1 transition-opacity duration-200',
              showActions ? 'opacity-100' : 'opacity-0'
            )}
          >
            {/* Copy button */}
            <button
              onClick={handleCopy}
              className={cn(
                'p-2 rounded-lg transition-all duration-200',
                'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600',
                'hover:bg-gray-100 dark:hover:bg-gray-700',
                'shadow-sm hover:shadow-md',
                'focus:outline-none focus:ring-2 focus:ring-blue-500'
              )}
              aria-label="Copy message"
              title="Copy to clipboard"
            >
              {copied ? (
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>

            {/* Regenerate button (only for last assistant message) */}
            {isLastAssistant && onRegenerate && (
              <button
                onClick={onRegenerate}
                className={cn(
                  'p-2 rounded-lg transition-all duration-200',
                  'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600',
                  'hover:bg-gray-100 dark:hover:bg-gray-700',
                  'shadow-sm hover:shadow-md',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500'
                )}
                aria-label="Regenerate response"
                title="Regenerate response"
              >
                <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
