import { supabase } from './supabase/client';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  nickname?: string;
  avatar_url?: string;
  timezone?: string;
  notification_preferences?: any;
  created_at?: string;
  updated_at?: string;
}

export const userService = {
  // Create or get user profile
  async createUserProfile(userId: string, email: string, fullName?: string, avatarUrl?: string, nickname?: string): Promise<UserProfile | null> {
    try {
      // First, try to get existing profile
      const { data: existingProfile, error: getError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (existingProfile) {
        return existingProfile;
      }

      // If no profile exists, create one
      const { data, error } = await supabase
        .from('users')
        .insert([{
          id: userId,
          email: email,
          full_name: fullName,
          nickname: nickname,
          avatar_url: avatarUrl,
          timezone: 'UTC',
          notification_preferences: {
            mood_reminders: true,
            journal_reminders: true,
            weekly_insights: true
          }
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      return null;
    }
  },

  // Get current user profile
  async getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        return null;
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getCurrentUserProfile:', error);
      return null;
    }
  },

  // Update user profile
  async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        return null;
      }

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
      return null;
    }
  },

  // Update user nickname
  async updateNickname(nickname: string): Promise<UserProfile | null> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        return null;
      }

      const { data, error } = await supabase
        .from('users')
        .update({ nickname })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating nickname:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateNickname:', error);
      return null;
    }
  }
};

