-- Add chat_messages table for AI therapist conversations
-- Run this in your Supabase SQL Editor

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
    type TEXT NOT NULL DEFAULT 'message' CHECK (type IN ('message', 'suggestion', 'crisis_warning')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment to explain the table
COMMENT ON TABLE public.chat_messages IS 'Stores AI therapist chat conversations';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON public.chat_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON public.chat_messages(sender);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own chat messages
CREATE POLICY "Users can view own chat messages" ON public.chat_messages
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own chat messages
CREATE POLICY "Users can insert own chat messages" ON public.chat_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own chat messages
CREATE POLICY "Users can update own chat messages" ON public.chat_messages
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own chat messages
CREATE POLICY "Users can delete own chat messages" ON public.chat_messages
    FOR DELETE USING (auth.uid() = user_id);

-- Add trigger to update updated_at column
CREATE TRIGGER update_chat_messages_updated_at 
    BEFORE UPDATE ON public.chat_messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
