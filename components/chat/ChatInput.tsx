'use client';

import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Type your message...",
  maxLength = 4000
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    if (textareaRef.current && !disabled) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || disabled) return;

    onSend(trimmedInput);
    setInput('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter without shift = send message
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }

    // Escape = clear input
    if (e.key === 'Escape') {
      e.preventDefault();
      setInput('');
      textareaRef.current?.blur();
    }
  };

  const isOverLimit = input.length > maxLength;
  const canSend = input.trim().length > 0 && !disabled && !isOverLimit;
  const charactersRemaining = maxLength - input.length;
  const showCharCount = input.length > maxLength * 0.8; // Show when 80% full

  return (
    <div className="w-full">
      {/* Input Container */}
      <div
        className={cn(
          'flex gap-2 sm:gap-3 items-end',
          'transition-all duration-200'
        )}
      >
        {/* Textarea Container */}
        <div className="flex-1 relative group">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            aria-label="Message input"
            aria-describedby="input-help-text"
            className={cn(
              'w-full rounded-2xl px-4 py-3',
              'bg-white dark:bg-gray-800',
              'border-2 transition-all duration-200',
              'text-gray-900 dark:text-white',
              'placeholder-gray-400 dark:placeholder-gray-500',
              'focus:outline-none resize-none',
              'min-h-[52px] max-h-[200px]',
              'leading-relaxed',
              // Border states
              isFocused
                ? 'border-blue-500 ring-4 ring-blue-500/10'
                : 'border-gray-300 dark:border-gray-600',
              // Disabled state
              disabled && 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900',
              // Error state
              isOverLimit && 'border-red-500 focus:ring-red-500/10'
            )}
            rows={1}
          />

          {/* Keyboard Hint */}
          {!disabled && !input && !isFocused && (
            <div className="absolute right-3 bottom-3 text-xs text-gray-400 dark:text-gray-500 pointer-events-none">
              Press Enter to send
            </div>
          )}
        </div>

        {/* Send Button */}
        <button
          onClick={handleSubmit}
          disabled={!canSend}
          aria-label="Send message"
          className={cn(
            'px-4 sm:px-6 py-3 rounded-2xl font-medium',
            'transition-all duration-200',
            'focus:outline-none focus:ring-4',
            'min-w-[60px] sm:min-w-[100px]',
            'flex items-center justify-center gap-2',
            // Enabled state
            canSend && [
              'bg-blue-500 text-white',
              'hover:bg-blue-600 hover:shadow-lg hover:scale-105',
              'active:bg-blue-700 active:scale-100',
              'focus:ring-blue-500/20',
            ],
            // Disabled state
            !canSend && [
              'bg-gray-200 dark:bg-gray-700',
              'text-gray-400 dark:text-gray-500',
              'cursor-not-allowed',
            ]
          )}
        >
          {disabled ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              <span className="hidden sm:inline">Sending...</span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline">Send</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </>
          )}
        </button>
      </div>

      {/* Helper Text & Character Count */}
      <div className="flex items-center justify-between mt-2 px-1">
        <p id="input-help-text" className="text-xs text-gray-500 dark:text-gray-400">
          {disabled ? (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing your message...
            </span>
          ) : (
            <>Shift + Enter for new line • Esc to clear</>
          )}
        </p>

        {showCharCount && (
          <span
            className={cn(
              'text-xs font-medium transition-colors',
              isOverLimit
                ? 'text-red-500'
                : charactersRemaining < 100
                  ? 'text-amber-500'
                  : 'text-gray-400'
            )}
          >
            {charactersRemaining} characters remaining
          </span>
        )}
      </div>
    </div>
  );
}
