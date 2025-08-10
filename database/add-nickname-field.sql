-- Add nickname field to users table
-- Run this in your Supabase SQL Editor

-- Add nickname column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS nickname TEXT;

-- Add comment to explain the field
COMMENT ON COLUMN public.users.nickname IS 'User''s preferred display name/nickname';

-- Create an index on nickname for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_nickname ON public.users(nickname);

-- Update the handle_new_user function to include nickname
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, nickname)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'nickname'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
