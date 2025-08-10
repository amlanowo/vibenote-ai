-- Fix for user trigger issue
-- Run this in Supabase SQL Editor if the automatic trigger isn't working

-- First, let's check if the trigger exists
SELECT * FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';

-- If the trigger doesn't exist, recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Test the trigger function manually
-- Replace 'your-user-id-here' with an actual user ID from auth.users
-- SELECT public.handle_new_user();

-- Check if there are any users without profiles
SELECT 
    au.id as auth_user_id,
    au.email,
    CASE WHEN pu.id IS NULL THEN 'Missing Profile' ELSE 'Profile Exists' END as profile_status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
ORDER BY au.created_at DESC;

