# Supabase Setup Instructions

## Prerequisites
- A Supabase account (sign up at https://supabase.com)
- Your Supabase project URL and anon key (already in your `.env.local`)

## Step 1: Run the Database Schema

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project: `qwabuggkaweifcmsqqjk`
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `schema.sql` in this directory
6. Paste it into the SQL Editor
7. Click **Run** to execute the schema

This will create:
- `conversations` table
- `messages` table
- Proper indexes for performance
- Row Level Security (RLS) policies
- Automatic timestamp handling

## Step 2: Enable Authentication (Optional but Recommended)

### For Anonymous Users (Quick Start):
If you want to test without login, you can temporarily allow anonymous access:

1. Go to **Authentication** → **Policies**
2. For now, the schema allows authenticated users only
3. To enable anonymous testing, run this in SQL Editor:

```sql
-- Temporary: Allow anonymous users for testing
alter policy "Users can view own conversations" on public.conversations using (true);
alter policy "Users can insert own conversations" on public.conversations with check (true);
alter policy "Users can update own conversations" on public.conversations using (true);
alter policy "Users can delete own conversations" on public.conversations using (true);

alter policy "Users can view messages from own conversations" on public.messages using (true);
alter policy "Users can insert messages into own conversations" on public.messages with check (true);
alter policy "Users can delete messages from own conversations" on public.messages using (true);
```

### For Full Authentication:
Enable Email/Password or OAuth providers in **Authentication** → **Providers**

## Step 3: Verify Your Environment Variables

Make sure your `.env.local` file has:
```env
NEXT_PUBLIC_SUPABASE_URL=https://qwabuggkaweifcmsqqjk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-key-here
```

## Step 4: Test the Connection

1. Restart your Next.js dev server
2. Open the app in your browser
3. Send a message in the chat
4. Go to **Table Editor** in Supabase Dashboard
5. Check the `conversations` and `messages` tables for your data

## Troubleshooting

### "No conversations appear"
- Check RLS policies are correctly set
- Verify your user is authenticated (or policies allow anonymous)
- Check browser console for errors

### "Insert failed"
- Ensure user_id matches authenticated user
- For anonymous testing, use the temporary policies above
- Check the Supabase Logs for detailed errors

### "Connection refused"
- Verify environment variables are correct
- Restart the Next.js dev server
- Check Supabase project is not paused

## Next Steps

Once database is set up:
1. Uncomment the Supabase code in `components/chat/ChatInterface.tsx`
2. Uncomment the code in `components/sidebar/ConversationList.tsx`
3. Implement authentication (if desired)
4. Conversations will be automatically saved and loaded!
