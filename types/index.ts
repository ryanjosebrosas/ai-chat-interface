/**
 * Core type definitions for the chat interface application
 */

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  role: MessageRole;
  content: string;
}

export interface StreamChunk {
  delta: string;
  done: boolean;
}

// Supabase Database Types
export interface Database {
  public: {
    Tables: {
      conversations: {
        Row: Conversation;
        Insert: Omit<Conversation, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Conversation, 'id' | 'created_at'>>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, 'id' | 'created_at'>;
        Update: Partial<Omit<Message, 'id' | 'created_at'>>;
      };
    };
  };
}

// PydanticAI Types
export interface AnalysisOutput {
  summary: string;
  key_points: string[];
  sentiment: string;
  confidence: number;
}

export interface AgentRequest {
  content: string;
  context?: Record<string, any>;
}

export interface AgentResponse {
  result: AnalysisOutput;
  metadata?: Record<string, any>;
}
