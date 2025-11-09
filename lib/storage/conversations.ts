/**
 * Conversation storage with dual persistence: localStorage + Supabase
 */

import type { Conversation, Message } from '@/types';
import { supabase } from '@/lib/supabase/client';

const CONVERSATIONS_KEY = 'chat-conversations';
const MESSAGES_KEY = 'chat-messages';
const TEMP_USER_ID = '00000000-0000-0000-0000-000000000000'; // Temporary user ID for anonymous users

export interface StoredConversation extends Omit<Conversation, 'user_id'> {
  messageCount?: number;
  user_id?: string;
}

export interface StoredMessage extends Message {}

// Helper to sync to Supabase
async function syncConversationToSupabase(conversation: StoredConversation): Promise<void> {
  try {
    const convData = {
      id: conversation.id,
      title: conversation.title,
      user_id: conversation.user_id || TEMP_USER_ID,
      created_at: conversation.created_at,
      updated_at: conversation.updated_at,
    };

    const { error } = await supabase
      .from('conversations')
      .upsert(convData, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase sync error (conversations):', error.message);
    } else {
      console.log('✓ Conversation synced to Supabase:', conversation.id);
    }
  } catch (error: any) {
    console.warn('Failed to sync conversation to Supabase:', error.message);
  }
}

async function syncMessageToSupabase(message: StoredMessage): Promise<void> {
  try {
    const msgData = {
      id: message.id,
      conversation_id: message.conversation_id,
      role: message.role,
      content: message.content,
      metadata: message.metadata || {},
      created_at: message.created_at,
    };

    const { error } = await supabase
      .from('messages')
      .upsert(msgData, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase sync error (messages):', error.message);
    } else {
      console.log('✓ Message synced to Supabase:', message.id);
    }
  } catch (error: any) {
    console.warn('Failed to sync message to Supabase:', error.message);
  }
}

// Load from Supabase
export async function loadConversationsFromSupabase(): Promise<StoredConversation[]> {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.warn('Failed to load from Supabase:', error.message);
      return [];
    }

    console.log('✓ Loaded', data?.length || 0, 'conversations from Supabase');
    return data || [];
  } catch (error: any) {
    console.warn('Supabase query error:', error.message);
    return [];
  }
}

// Conversations (from localStorage only)
export function getConversations(): StoredConversation[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(CONVERSATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading conversations:', error);
    return [];
  }
}

// Load conversations from both sources and merge
export async function getAllConversations(): Promise<StoredConversation[]> {
  try {
    // Load from both sources
    const localConvs = getConversations();
    const supabaseConvs = await loadConversationsFromSupabase();

    // Create a map to merge by ID
    const mergedMap = new Map<string, StoredConversation>();

    // Add localStorage conversations
    localConvs.forEach(conv => {
      mergedMap.set(conv.id, conv);
    });

    // Merge/add Supabase conversations (Supabase takes precedence for updates)
    supabaseConvs.forEach(conv => {
      const existing = mergedMap.get(conv.id);
      if (!existing || new Date(conv.updated_at) > new Date(existing.updated_at)) {
        mergedMap.set(conv.id, conv);
      }
    });

    // Convert back to array and sort by updated_at
    const merged = Array.from(mergedMap.values()).sort((a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    console.log(`✓ Merged conversations: ${localConvs.length} local + ${supabaseConvs.length} Supabase = ${merged.length} total`);

    return merged;
  } catch (error) {
    console.error('Error merging conversations:', error);
    return getConversations(); // Fallback to localStorage only
  }
}

export async function saveConversation(conversation: StoredConversation): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const conversations = getConversations();
    const existingIndex = conversations.findIndex(c => c.id === conversation.id);

    const updatedConv: StoredConversation = {
      ...conversation,
      updated_at: new Date().toISOString(),
      user_id: conversation.user_id || TEMP_USER_ID,
    };

    if (existingIndex >= 0) {
      conversations[existingIndex] = updatedConv;
    } else {
      conversations.unshift(updatedConv);
    }

    // Save to localStorage
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));

    // Sync to Supabase (fire and forget - don't block on this)
    syncConversationToSupabase(updatedConv).catch(err => {
      console.warn('Failed to sync conversation to Supabase:', err.message);
    });
  } catch (error) {
    console.error('Error saving conversation:', error);
  }
}

export async function deleteConversation(id: string): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const conversations = getConversations().filter(c => c.id !== id);
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));

    // Also delete associated messages
    const messages = getMessages().filter(m => m.conversation_id !== id);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));

    // Delete from Supabase
    try {
      await supabase.from('conversations').delete().eq('id', id);
      await supabase.from('messages').delete().eq('conversation_id', id);
      console.log('✓ Conversation deleted from Supabase:', id);
    } catch (error: any) {
      console.warn('Failed to delete from Supabase:', error.message);
    }
  } catch (error) {
    console.error('Error deleting conversation:', error);
  }
}

export async function createConversation(title: string): Promise<StoredConversation> {
  const conversation: StoredConversation = {
    id: generateId(),
    title,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    messageCount: 0,
    user_id: TEMP_USER_ID,
  };

  await saveConversation(conversation);
  return conversation;
}

// Load messages from Supabase
export async function loadMessagesFromSupabase(conversationId?: string): Promise<StoredMessage[]> {
  try {
    let query = supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (conversationId) {
      query = query.eq('conversation_id', conversationId);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('Failed to load messages from Supabase:', error.message);
      return [];
    }

    console.log('✓ Loaded', data?.length || 0, 'messages from Supabase');
    return data || [];
  } catch (error: any) {
    console.warn('Supabase messages query error:', error.message);
    return [];
  }
}

// Messages (from localStorage only)
export function getMessages(conversationId?: string): StoredMessage[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(MESSAGES_KEY);
    const messages: StoredMessage[] = stored ? JSON.parse(stored) : [];

    if (conversationId) {
      return messages.filter(m => m.conversation_id === conversationId);
    }

    return messages;
  } catch (error) {
    console.error('Error loading messages:', error);
    return [];
  }
}

// Load messages from both sources and merge
export async function getAllMessages(conversationId?: string): Promise<StoredMessage[]> {
  try {
    const localMsgs = getMessages(conversationId);
    const supabaseMsgs = await loadMessagesFromSupabase(conversationId);

    // Merge by ID, Supabase takes precedence
    const mergedMap = new Map<string, StoredMessage>();

    localMsgs.forEach(msg => mergedMap.set(msg.id, msg));
    supabaseMsgs.forEach(msg => mergedMap.set(msg.id, msg));

    // Sort by created_at
    const merged = Array.from(mergedMap.values()).sort((a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    console.log(`✓ Merged messages: ${localMsgs.length} local + ${supabaseMsgs.length} Supabase = ${merged.length} total`);

    return merged;
  } catch (error) {
    console.error('Error merging messages:', error);
    return getMessages(conversationId); // Fallback to localStorage only
  }
}

export async function saveMessage(message: Omit<StoredMessage, 'id' | 'created_at'>): Promise<StoredMessage> {
  if (typeof window === 'undefined') throw new Error('Cannot save message on server');

  try {
    const newMessage: StoredMessage = {
      ...message,
      id: generateId(),
      created_at: new Date().toISOString(),
    };

    const messages = getMessages();
    messages.push(newMessage);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));

    // Update conversation's updated_at timestamp
    const conversations = getConversations();
    const convIndex = conversations.findIndex(c => c.id === message.conversation_id);
    if (convIndex >= 0) {
      conversations[convIndex].updated_at = new Date().toISOString();
      conversations[convIndex].messageCount = (conversations[convIndex].messageCount || 0) + 1;
      localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));

      // Sync conversation update to Supabase
      syncConversationToSupabase(conversations[convIndex]).catch(console.warn);
    }

    // Sync message to Supabase
    syncMessageToSupabase(newMessage).catch(console.warn);

    return newMessage;
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
}

export function clearAllData(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(CONVERSATIONS_KEY);
  localStorage.removeItem(MESSAGES_KEY);
}

// Utility
function generateId(): string {
  // Use UUID format for better compatibility with Supabase
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
