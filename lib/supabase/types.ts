/**
 * Supabase type helpers
 *
 * Import the Database type from the main types file
 */
import type { Database as DB } from '@/types';

export type Database = DB;

/**
 * Helper type for JSON values
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

/**
 * Type helper for table rows
 */
export type Tables<T extends keyof DB['public']['Tables']> =
  DB['public']['Tables'][T]['Row'];

/**
 * Type helper for table inserts
 */
export type Inserts<T extends keyof DB['public']['Tables']> =
  DB['public']['Tables'][T]['Insert'];

/**
 * Type helper for table updates
 */
export type Updates<T extends keyof DB['public']['Tables']> =
  DB['public']['Tables'][T]['Update'];

/**
 * Re-export commonly used types
 */
export type { Conversation, Message } from '@/types';
