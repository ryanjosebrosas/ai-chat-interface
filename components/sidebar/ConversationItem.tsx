import { cn } from '@/lib/utils/cn';
import { formatDate } from '@/lib/utils/helpers';
import type { Conversation } from '@/types';
import { useState } from 'react';

interface ConversationItemProps {
  conversation: Conversation;
  selected: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export function ConversationItem({
  conversation,
  selected,
  onClick,
  onDelete,
}: ConversationItemProps) {
  const [showDelete, setShowDelete] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this conversation?')) {
      onDelete();
    }
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
      className={cn(
        'group relative p-3 rounded-lg cursor-pointer transition-all duration-200',
        selected
          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              'font-medium text-sm truncate mb-1',
              selected
                ? 'text-blue-900 dark:text-blue-100'
                : 'text-gray-900 dark:text-gray-100'
            )}
          >
            {conversation.title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(conversation.updated_at)}
          </p>
        </div>

        {/* Delete button */}
        {showDelete && (
          <button
            onClick={handleDelete}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              'text-gray-400 hover:text-red-500',
              'hover:bg-red-50 dark:hover:bg-red-900/20',
              'focus:outline-none focus:ring-2 focus:ring-red-500'
            )}
            aria-label="Delete conversation"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
