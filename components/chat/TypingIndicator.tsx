'use client';

import { cn } from '@/lib/utils/cn';

export function TypingIndicator() {
  return (
    <div className="flex justify-start w-full">
      <div
        className={cn(
          'max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-4',
          'shadow-md border-2',
          'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
        )}
      >
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">AI is thinking...</span>
        </div>
      </div>
    </div>
  );
}
