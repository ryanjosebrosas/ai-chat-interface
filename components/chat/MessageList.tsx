'use client';

import type { StoredMessage } from '@/lib/storage/conversations';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: StoredMessage[];
  onRegenerate?: () => void;
}

export function MessageList({ messages, onRegenerate }: MessageListProps) {
  const lastAssistantIndex = messages.map((m, i) => ({ ...m, index: i }))
    .filter(m => m.role === 'assistant')
    .pop()?.index;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id || index}
          role={message.role}
          content={message.content}
          timestamp={message.created_at}
          isLastAssistant={message.role === 'assistant' && index === lastAssistantIndex}
          onRegenerate={onRegenerate}
        />
      ))}
    </div>
  );
}
