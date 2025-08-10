import { supabase } from './supabase/client';
import { userService } from './userService';

export interface MoodEntry {
  id?: string;
  user_id?: string;
  mood_score: number;
  mood_emoji?: string;
  notes?: string;
  activities?: string[];
  location?: string;
  weather?: string;
  created_at?: string;
  updated_at?: string;
}

export const moodService = {
  // Save a new mood entry
  async saveMoodEntry(moodData: Omit<MoodEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<MoodEntry | null> {
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        return null;
      }

      // Ensure user profile exists
      const userProfile = await userService.createUserProfile(user.id, user.email || '', user.user_metadata?.full_name, user.user_metadata?.avatar_url);
      
      if (!userProfile) {
        console.error('Failed to create/get user profile');
        return null;
      }

      const { data, error } = await supabase
        .from('mood_entries')
        .insert([{
          ...moodData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error saving mood entry:', error);
        return null;
      }

      // Award points and update streaks
      try {
        const { gamificationService } = await import('./gamificationService');
        await gamificationService.awardPoints(user.id, 5, 'Mood entry logged');
        await gamificationService.updateStreaks(user.id, 'mood');
        await gamificationService.checkAchievements(user.id);
      } catch (gamificationError) {
        console.error('Error updating gamification:', gamificationError);
      }

      return data;
    } catch (error) {
      console.error('Error saving mood entry:', error);
      return null;
    }
  },

  // Get mood entries for a user
  async getMoodEntries(limit: number = 30): Promise<MoodEntry[]> {
    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching mood entries:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching mood entries:', error);
      return [];
    }
  },

  // Get today's mood entry
  async getTodayMoodEntry(): Promise<MoodEntry | null> {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString())
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching today\'s mood entry:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Error fetching today\'s mood entry:', error);
      return null;
    }
  },

  // Get mood statistics
  async getMoodStats(days: number = 7): Promise<{ 
    average: number; 
    count: number; 
    trend: string; 
    data: Array<{ date: string; score: number }> 
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('mood_entries')
        .select('mood_score, created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching mood stats:', error);
        return { average: 0, count: 0, trend: 'stable', data: [] };
      }

      if (!data || data.length === 0) {
        return { average: 0, count: 0, trend: 'stable', data: [] };
      }

      const scores = data.map(entry => entry.mood_score);
      const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;

      // Calculate trend
      const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
      const secondHalf = scores.slice(Math.floor(scores.length / 2));
      
      const firstHalfAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
      
      let trend = 'stable';
      if (secondHalfAvg > firstHalfAvg + 0.5) trend = 'improving';
      else if (secondHalfAvg < firstHalfAvg - 0.5) trend = 'declining';

      // Format data for charts
      const chartData = data.map(entry => ({
        date: entry.created_at!,
        score: entry.mood_score
      }));

      return {
        average: Math.round(average * 100) / 100,
        count: scores.length,
        trend,
        data: chartData
      };
    } catch (error) {
      console.error('Error calculating mood stats:', error);
      return { average: 0, count: 0, trend: 'stable', data: [] };
    }
  }
};
