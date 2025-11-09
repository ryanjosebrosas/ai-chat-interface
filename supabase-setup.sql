-- Supabase Setup: Allow anonymous users to create and manage conversations
-- Run this in your Supabase SQL Editor at: https://qwabuggkaweifcmsqqjk.supabase.co

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous read conversations" ON conversations;
DROP POLICY IF EXISTS "Allow anonymous insert conversations" ON conversations;
DROP POLICY IF EXISTS "Allow anonymous update conversations" ON conversations;
DROP POLICY IF EXISTS "Allow anonymous delete conversations" ON conversations;

DROP POLICY IF EXISTS "Allow anonymous read messages" ON messages;
DROP POLICY IF EXISTS "Allow anonymous insert messages" ON messages;
DROP POLICY IF EXISTS "Allow anonymous update messages" ON messages;
DROP POLICY IF EXISTS "Allow anonymous delete messages" ON messages;

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Conversations policies (allow all operations for anonymous users)
CREATE POLICY "Allow anonymous read conversations"
ON conversations FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow anonymous insert conversations"
ON conversations FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow anonymous update conversations"
ON conversations FOR UPDATE
TO anon
USING (true);

CREATE POLICY "Allow anonymous delete conversations"
ON conversations FOR DELETE
TO anon
USING (true);

-- Messages policies (allow all operations for anonymous users)
CREATE POLICY "Allow anonymous read messages"
ON messages FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow anonymous insert messages"
ON messages FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow anonymous update messages"
ON messages FOR UPDATE
TO anon
USING (true);

CREATE POLICY "Allow anonymous delete messages"
ON messages FOR DELETE
TO anon
USING (true);

-- Verify the policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('conversations', 'messages');
