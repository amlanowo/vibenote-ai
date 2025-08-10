-- VibeNote AI Database Schema
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create function to calculate word count
CREATE OR REPLACE FUNCTION calculate_word_count(text_content TEXT)
RETURNS INTEGER AS $$
BEGIN
    RETURN array_length(regexp_split_to_array(trim(text_content), '\s+'), 1);
END;
$$ LANGUAGE plpgsql;

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    timezone TEXT DEFAULT 'UTC',
    notification_preferences JSONB DEFAULT '{"mood_reminders": true, "journal_reminders": true, "weekly_insights": true}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mood entries table
CREATE TABLE IF NOT EXISTS public.mood_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 5) NOT NULL,
    mood_emoji TEXT,
    notes TEXT,
    activities TEXT[],
    location TEXT,
    weather TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Journal entries table
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    word_count INTEGER GENERATED ALWAYS AS (calculate_word_count(content)) STORED,
    mood_entry_id UUID REFERENCES public.mood_entries(id) ON DELETE SET NULL,
    tags TEXT[],
    is_private BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI insights table
CREATE TABLE IF NOT EXISTS public.ai_insights (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    journal_entry_id UUID REFERENCES public.journal_entries(id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL CHECK (insight_type IN ('emotion', 'pattern', 'suggestion', 'summary')),
    content TEXT NOT NULL,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wellness tips table
CREATE TABLE IF NOT EXISTS public.wellness_tips (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('mindfulness', 'exercise', 'nutrition', 'sleep', 'social', 'stress_management')),
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    duration_minutes INTEGER,
    tags TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User wellness activities table
CREATE TABLE IF NOT EXISTS public.user_wellness_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    wellness_tip_id UUID REFERENCES public.wellness_tips(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration_minutes INTEGER,
    notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5)
);

-- Reminders table
CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    reminder_type TEXT NOT NULL CHECK (reminder_type IN ('mood_check', 'journal_entry', 'wellness_activity', 'custom')),
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'custom')),
    time_of_day TIME,
    days_of_week INTEGER[] CHECK (array_length(days_of_week, 1) <= 7),
    is_active BOOLEAN DEFAULT true,
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mood patterns table (for analytics)
CREATE TABLE IF NOT EXISTS public.mood_patterns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    pattern_type TEXT NOT NULL CHECK (pattern_type IN ('weekly', 'monthly', 'seasonal')),
    average_mood DECIMAL(3,2),
    mood_trend TEXT CHECK (mood_trend IN ('improving', 'declining', 'stable')),
    common_triggers TEXT[],
    insights TEXT,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_id ON public.mood_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_created_at ON public.mood_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON public.journal_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_id ON public.ai_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_journal_entry_id ON public.ai_insights(journal_entry_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mood_entries_updated_at BEFORE UPDATE ON public.mood_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON public.journal_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON public.reminders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wellness_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_patterns ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Mood entries policies
CREATE POLICY "Users can view own mood entries" ON public.mood_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mood entries" ON public.mood_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mood entries" ON public.mood_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own mood entries" ON public.mood_entries FOR DELETE USING (auth.uid() = user_id);

-- Journal entries policies
CREATE POLICY "Users can view own journal entries" ON public.journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own journal entries" ON public.journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journal entries" ON public.journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own journal entries" ON public.journal_entries FOR DELETE USING (auth.uid() = user_id);

-- AI insights policies
CREATE POLICY "Users can view own AI insights" ON public.ai_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own AI insights" ON public.ai_insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own AI insights" ON public.ai_insights FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own AI insights" ON public.ai_insights FOR DELETE USING (auth.uid() = user_id);

-- User wellness activities policies
CREATE POLICY "Users can view own wellness activities" ON public.user_wellness_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wellness activities" ON public.user_wellness_activities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wellness activities" ON public.user_wellness_activities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own wellness activities" ON public.user_wellness_activities FOR DELETE USING (auth.uid() = user_id);

-- Reminders policies
CREATE POLICY "Users can view own reminders" ON public.reminders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reminders" ON public.reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reminders" ON public.reminders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reminders" ON public.reminders FOR DELETE USING (auth.uid() = user_id);

-- Mood patterns policies
CREATE POLICY "Users can view own mood patterns" ON public.mood_patterns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mood patterns" ON public.mood_patterns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mood patterns" ON public.mood_patterns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own mood patterns" ON public.mood_patterns FOR DELETE USING (auth.uid() = user_id);

-- Insert some sample wellness tips
INSERT INTO public.wellness_tips (title, content, category, difficulty_level, duration_minutes, tags) VALUES
('Deep Breathing Exercise', 'Take 5 deep breaths: inhale for 4 counts, hold for 4, exhale for 6. Focus on your breath and let your mind clear.', 'mindfulness', 'beginner', 2, ARRAY['breathing', 'stress-relief', 'quick']),
('Gratitude Journal', 'Write down 3 things you are grateful for today. This simple practice can shift your perspective and improve mood.', 'mindfulness', 'beginner', 5, ARRAY['gratitude', 'journaling', 'positive-thinking']),
('Quick Stretch Break', 'Stand up and stretch your arms overhead, then touch your toes. Hold each stretch for 10 seconds.', 'exercise', 'beginner', 3, ARRAY['stretching', 'movement', 'energy']),
('Mindful Walking', 'Take a 10-minute walk outside. Focus on the sensation of your feet touching the ground and the sounds around you.', 'exercise', 'beginner', 10, ARRAY['walking', 'mindfulness', 'nature']),
('Progressive Muscle Relaxation', 'Tense and relax each muscle group from your toes to your head. This helps release physical tension.', 'stress_management', 'intermediate', 10, ARRAY['relaxation', 'tension-release', 'body-awareness']);

-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile when someone signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

