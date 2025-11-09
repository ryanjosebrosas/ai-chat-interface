'use client';

import { useEffect, useState } from 'react';
import { ConversationItem } from './ConversationItem';
import { cn } from '@/lib/utils/cn';
import {
  getAllConversations,
  deleteConversation as deleteConversationStorage,
  type StoredConversation,
} from '@/lib/storage/conversations';

interface ConversationListProps {
  selectedId?: string | null;
  onSelect: (id: string) => void;
  onNewConversation: () => void;
}

export function ConversationList({
  selectedId,
  onSelect,
  onNewConversation,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<StoredConversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();

    // Listen for storage changes (from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'chat-conversations') {
        loadConversations();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const convs = await getAllConversations();
      setConversations(convs);
      console.log('Loaded conversations:', convs.length);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    try {
      deleteConversationStorage(id);

      // If the deleted conversation was selected, clear selection
      if (selectedId === id) {
        onNewConversation();
      }

      // Reload conversations
      loadConversations();
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={onNewConversation}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg font-medium text-sm',
            'bg-blue-500 text-white',
            'hover:bg-blue-600 active:bg-blue-700',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          )}
        >
          + New Conversation
        </button>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-pulse-soft text-gray-500 dark:text-gray-400">
              Loading...
            </div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400 text-sm">
            No conversations yet
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                selected={selectedId === conv.id}
                onClick={() => onSelect(conv.id)}
                onDelete={() => handleDelete(conv.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
