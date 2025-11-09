/**
 * Conversation storage using localStorage
 */

import type { Conversation, Message } from '@/types';

const CONVERSATIONS_KEY = 'chat-conversations';
const MESSAGES_KEY = 'chat-messages';

export interface StoredConversation extends Omit<Conversation, 'user_id'> {
  messageCount?: number;
}

export interface StoredMessage extends Message {}

// Conversations
export function getConversations(): StoredConversation[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(CONVERSATIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading conversations from localStorage:', error);
    return [];
  }
}

export async function createConversation(title: string): Promise<StoredConversation> {
  const newConv: StoredConversation = {
    id: crypto.randomUUID(),
    title: title.trim() || 'New Conversation',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    messageCount: 0,
  };

  const conversations = getConversations();
  conversations.unshift(newConv);
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));

  return newConv;
}

export function updateConversation(
  id: string,
  updates: Partial<StoredConversation>
): void {
  const conversations = getConversations();
  const index = conversations.findIndex((c) => c.id === id);

  if (index !== -1) {
    conversations[index] = {
      ...conversations[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
  }
}

export function deleteConversation(id: string): void {
  const conversations = getConversations().filter((c) => c.id !== id);
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));

  // Also delete associated messages
  const messages = getMessages(id);
  const allMessages = getAllStoredMessages();
  const filtered = allMessages.filter(
    (m) => !messages.find((msg) => msg.id === m.id)
  );
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(filtered));
}

// Messages
function getAllStoredMessages(): StoredMessage[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(MESSAGES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading messages from localStorage:', error);
    return [];
  }
}

export function getMessages(conversationId: string): StoredMessage[] {
  const allMessages = getAllStoredMessages();
  return allMessages
    .filter((m) => m.conversation_id === conversationId)
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
}

export async function saveMessage(
  message: Omit<StoredMessage, 'id' | 'created_at'>
): Promise<StoredMessage> {
  const newMessage: StoredMessage = {
    id: crypto.randomUUID(),
    ...message,
    created_at: new Date().toISOString(),
  };

  const allMessages = getAllStoredMessages();
  allMessages.push(newMessage);
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(allMessages));

  // Update conversation message count and updated_at
  const conversations = getConversations();
  const convIndex = conversations.findIndex(
    (c) => c.id === message.conversation_id
  );

  if (convIndex !== -1) {
    const conversationMessages = allMessages.filter(
      (m) => m.conversation_id === message.conversation_id
    );
    conversations[convIndex].messageCount = conversationMessages.length;
    conversations[convIndex].updated_at = new Date().toISOString();
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
  }

  return newMessage;
}

// Aliases for compatibility
export const getAllConversations = getConversations;
export const getAllMessages = getMessages;
