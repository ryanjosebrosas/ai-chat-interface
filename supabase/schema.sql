-- Chat Interface Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create conversations table
create table if not exists public.conversations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create messages table
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better query performance
create index if not exists conversations_user_id_idx on public.conversations(user_id);
create index if not exists conversations_updated_at_idx on public.conversations(updated_at desc);
create index if not exists messages_conversation_id_idx on public.messages(conversation_id);
create index if not exists messages_created_at_idx on public.messages(created_at);

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
drop trigger if exists on_conversation_updated on public.conversations;
create trigger on_conversation_updated
  before update on public.conversations
  for each row
  execute procedure public.handle_updated_at();

-- Enable Row Level Security (RLS)
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Create RLS policies for conversations
-- Users can only see their own conversations
create policy "Users can view own conversations"
  on public.conversations for select
  using (auth.uid() = user_id);

-- Users can insert their own conversations
create policy "Users can insert own conversations"
  on public.conversations for insert
  with check (auth.uid() = user_id);

-- Users can update their own conversations
create policy "Users can update own conversations"
  on public.conversations for update
  using (auth.uid() = user_id);

-- Users can delete their own conversations
create policy "Users can delete own conversations"
  on public.conversations for delete
  using (auth.uid() = user_id);

-- Create RLS policies for messages
-- Users can view messages from their conversations
create policy "Users can view messages from own conversations"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

-- Users can insert messages into their conversations
create policy "Users can insert messages into own conversations"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

-- Users can delete messages from their conversations
create policy "Users can delete messages from own conversations"
  on public.messages for delete
  using (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

-- Grant permissions
grant usage on schema public to anon, authenticated;
grant all on public.conversations to anon, authenticated;
grant all on public.messages to anon, authenticated;
