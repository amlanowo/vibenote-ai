import { supabase } from './supabase/client';
import { useAuth } from '../contexts/AuthContext';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'mood' | 'journal' | 'streak' | 'insights' | 'wellness';
  requirement: number;
  current_progress: number;
  completed: boolean;
  completed_at?: string;
  points: number;
}

export interface Streak {
  id: string;
  type: 'mood' | 'journal' | 'combined';
  current_streak: number;
  longest_streak: number;
  last_activity: string;
  start_date: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  icon: string;
  points_required: number;
  unlocked: boolean;
  unlocked_at?: string;
}

export interface UserStats {
  total_points: number;
  level: number;
  experience: number;
  experience_to_next_level: number;
  achievements_earned: number;
  total_achievements: number;
  current_streaks: Streak[];
  rewards_unlocked: number;
}

export const gamificationService = {
  // Get user stats
  async getUserStats(userId: string): Promise<UserStats> {
    try {
      const { data: stats, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!stats) {
        // Create new user stats
        const newStats = await this.initializeUserStats(userId);
        return newStats;
      }

      // Create streak objects from database columns
      const current_streaks: Streak[] = [
        {
          id: 'mood',
          type: 'mood',
          current_streak: stats.mood_streak || 0,
          longest_streak: stats.mood_streak || 0, // We'll track this separately if needed
          last_activity: stats.last_mood_date || '',
          start_date: stats.last_mood_date || '',
        },
        {
          id: 'journal',
          type: 'journal',
          current_streak: stats.journal_streak || 0,
          longest_streak: stats.journal_streak || 0,
          last_activity: stats.last_journal_date || '',
          start_date: stats.last_journal_date || '',
        },
        {
          id: 'combined',
          type: 'combined',
          current_streak: stats.combined_streak || 0,
          longest_streak: stats.combined_streak || 0,
          last_activity: stats.last_mood_date || '',
          start_date: stats.last_mood_date || '',
        },
      ];

      return {
        total_points: stats.total_points || 0,
        level: stats.level || 1,
        experience: stats.experience_points || 0,
        experience_to_next_level: this.calculateExperienceToNextLevel(stats.level || 1),
        achievements_earned: stats.achievements_earned || 0,
        total_achievements: 20, // Total available achievements
        current_streaks: current_streaks,
        rewards_unlocked: stats.rewards_unlocked || 0,
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return this.getDefaultUserStats();
    }
  },

  // Initialize new user stats
  async initializeUserStats(userId: string): Promise<UserStats> {
    const defaultStats = {
      user_id: userId,
      total_points: 0,
      level: 1,
      experience_points: 0,
      achievements_earned: 0,
      rewards_unlocked: 0,
    };

    const { data, error } = await supabase
      .from('user_stats')
      .insert(defaultStats)
      .select()
      .single();

    if (error) throw error;

    return {
      total_points: 0,
      level: 1,
      experience: 0,
      experience_to_next_level: this.calculateExperienceToNextLevel(1),
      achievements_earned: 0,
      total_achievements: 20,
      current_streaks: [],
      rewards_unlocked: 0,
    };
  },

  // Get achievements
  async getAchievements(userId: string): Promise<Achievement[]> {
    const achievements = [
      // Mood Achievements
      {
        id: 'first_mood',
        title: 'First Step',
        description: 'Log your first mood',
        icon: '🌱',
        category: 'mood' as const,
        requirement: 1,
        points: 10,
      },
      {
        id: 'mood_streak_7',
        title: 'Week Warrior',
        description: 'Log mood for 7 days in a row',
        icon: '📅',
        category: 'mood' as const,
        requirement: 7,
        points: 50,
      },
      {
        id: 'mood_streak_30',
        title: 'Monthly Master',
        description: 'Log mood for 30 days in a row',
        icon: '🏆',
        category: 'mood' as const,
        requirement: 30,
        points: 200,
      },
      {
        id: 'mood_streak_100',
        title: 'Century Club',
        description: 'Log mood for 100 days in a row',
        icon: '💎',
        category: 'mood' as const,
        requirement: 100,
        points: 500,
      },

      // Journal Achievements
      {
        id: 'first_journal',
        title: 'Storyteller',
        description: 'Write your first journal entry',
        icon: '✍️',
        category: 'journal' as const,
        requirement: 1,
        points: 15,
      },
      {
        id: 'journal_streak_7',
        title: 'Daily Writer',
        description: 'Write journal entries for 7 days in a row',
        icon: '📝',
        category: 'journal' as const,
        requirement: 7,
        points: 75,
      },
      {
        id: 'journal_streak_30',
        title: 'Reflection Master',
        description: 'Write journal entries for 30 days in a row',
        icon: '📚',
        category: 'journal' as const,
        requirement: 30,
        points: 300,
      },
      {
        id: 'journal_words_1000',
        title: 'Word Smith',
        description: 'Write 1000+ words total',
        icon: '📖',
        category: 'journal' as const,
        requirement: 1000,
        points: 100,
      },

      // Insight Achievements
      {
        id: 'first_insight',
        title: 'Self Discovery',
        description: 'Get your first AI insight',
        icon: '💡',
        category: 'insights' as const,
        requirement: 1,
        points: 25,
      },
      {
        id: 'insights_10',
        title: 'Pattern Finder',
        description: 'Get 10 AI insights',
        icon: '🔍',
        category: 'insights' as const,
        requirement: 10,
        points: 150,
      },
      {
        id: 'insights_50',
        title: 'Mind Reader',
        description: 'Get 50 AI insights',
        icon: '🧠',
        category: 'insights' as const,
        requirement: 50,
        points: 400,
      },

      // Wellness Achievements
      {
        id: 'wellness_tips_5',
        title: 'Wellness Seeker',
        description: 'Receive 5 wellness tips',
        icon: '🧘‍♀️',
        category: 'wellness' as const,
        requirement: 5,
        points: 30,
      },
      {
        id: 'wellness_tips_20',
        title: 'Wellness Warrior',
        description: 'Receive 20 wellness tips',
        icon: '🌟',
        category: 'wellness' as const,
        requirement: 20,
        points: 120,
      },

      // Combined Achievements
      {
        id: 'combined_streak_7',
        title: 'Balanced Life',
        description: 'Log both mood and journal for 7 days in a row',
        icon: '⚖️',
        category: 'streak' as const,
        requirement: 7,
        points: 100,
      },
      {
        id: 'combined_streak_30',
        title: 'Life Master',
        description: 'Log both mood and journal for 30 days in a row',
        icon: '👑',
        category: 'streak' as const,
        requirement: 30,
        points: 500,
      },
      {
        id: 'level_5',
        title: 'Rising Star',
        description: 'Reach level 5',
        icon: '⭐',
        category: 'streak' as const,
        requirement: 5,
        points: 200,
      },
      {
        id: 'level_10',
        title: 'Vibe Master',
        description: 'Reach level 10',
        icon: '🌟',
        category: 'streak' as const,
        requirement: 10,
        points: 500,
      },
      {
        id: 'level_20',
        title: 'Vibe Legend',
        description: 'Reach level 20',
        icon: '👑',
        category: 'streak' as const,
        requirement: 20,
        points: 1000,
      },
      {
        id: 'points_1000',
        title: 'Point Collector',
        description: 'Earn 1000 points',
        icon: '💰',
        category: 'streak' as const,
        requirement: 1000,
        points: 100,
      },
      {
        id: 'points_5000',
        title: 'Point Master',
        description: 'Earn 5000 points',
        icon: '💎',
        category: 'streak' as const,
        requirement: 5000,
        points: 500,
      },
    ];

    // Get user's achievement progress
    const { data: userAchievements, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error getting user achievements:', error);
      return achievements.map(achievement => ({
        ...achievement,
        current_progress: 0,
        completed: false,
      }));
    }

    // Merge with user progress
    return achievements.map(achievement => {
      const userAchievement = userAchievements?.find(ua => ua.achievement_id === achievement.id);
      return {
        ...achievement,
        current_progress: userAchievement?.progress || 0,
        completed: userAchievement?.completed || false,
        completed_at: userAchievement?.completed_at,
      };
    });
  },

  // Get rewards
  async getRewards(userId: string): Promise<Reward[]> {
    const rewards = [
      {
        id: 'theme_dark',
        title: 'Dark Theme',
        description: 'Unlock dark mode for the app',
        icon: '🌙',
        points_required: 100,
      },
      {
        id: 'theme_rainbow',
        title: 'Rainbow Theme',
        description: 'Unlock colorful rainbow theme',
        icon: '🌈',
        points_required: 300,
      },
      {
        id: 'export_data',
        title: 'Data Export',
        description: 'Export your data as PDF',
        icon: '📄',
        points_required: 500,
      },
      {
        id: 'custom_insights',
        title: 'Custom Insights',
        description: 'Get personalized AI insights',
        icon: '🤖',
        points_required: 1000,
      },
      {
        id: 'priority_support',
        title: 'Priority Support',
        description: 'Get priority customer support',
        icon: '🎯',
        points_required: 2000,
      },
    ];

    // Get user's unlocked rewards
    const { data: userRewards, error } = await supabase
      .from('user_rewards')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error getting user rewards:', error);
      return rewards.map(reward => ({
        ...reward,
        unlocked: false,
      }));
    }

    // Merge with user progress
    return rewards.map(reward => {
      const userReward = userRewards?.find(ur => ur.reward_id === reward.id);
      return {
        ...reward,
        unlocked: userReward?.unlocked || false,
        unlocked_at: userReward?.unlocked_at,
      };
    });
  },

  // Award points
  async awardPoints(userId: string, points: number, reason: string): Promise<void> {
    try {
      const { data: stats, error: statsError } = await supabase
        .from('user_stats')
        .select('total_points, level, experience_points')
        .eq('user_id', userId)
        .single();

      if (statsError) throw statsError;

      const newTotalPoints = (stats.total_points || 0) + points;
      const newExperience = (stats.experience_points || 0) + points;
      const currentLevel = stats.level || 1;
      const newLevel = this.calculateLevel(newExperience);

      // Update stats
      const { error: updateError } = await supabase
        .from('user_stats')
        .update({
          total_points: newTotalPoints,
          experience_points: newExperience,
          level: newLevel,
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // Log points transaction
      await supabase
        .from('point_transactions')
        .insert({
          user_id: userId,
          points: points,
          transaction_type: 'award',
          description: reason,
        });

      console.log(`Awarded ${points} points for: ${reason}`);
    } catch (error) {
      console.error('Error awarding points:', error);
    }
  },

  // Check and update achievements
  async checkAchievements(userId: string): Promise<Achievement[]> {
    try {
      const achievements = await this.getAchievements(userId);
      const stats = await this.getUserStats(userId);
      const updatedAchievements: Achievement[] = [];

      for (const achievement of achievements) {
        if (achievement.completed) {
          updatedAchievements.push(achievement);
          continue;
        }

        let currentProgress = 0;
        let shouldAward = false;

        // Calculate progress based on achievement type
        switch (achievement.id) {
          case 'first_mood':
            currentProgress = stats.total_points > 0 ? 1 : 0;
            break;
          case 'mood_streak_7':
          case 'mood_streak_30':
          case 'mood_streak_100':
            const moodStreak = stats.current_streaks.find(s => s.type === 'mood');
            currentProgress = moodStreak?.current_streak || 0;
            break;
          case 'first_journal':
            currentProgress = stats.achievements_earned > 0 ? 1 : 0;
            break;
          case 'journal_streak_7':
          case 'journal_streak_30':
            const journalStreak = stats.current_streaks.find(s => s.type === 'journal');
            currentProgress = journalStreak?.current_streak || 0;
            break;
          case 'level_5':
          case 'level_10':
          case 'level_20':
            currentProgress = stats.level;
            break;
          case 'points_1000':
          case 'points_5000':
            currentProgress = stats.total_points;
            break;
          default:
            currentProgress = achievement.current_progress;
        }

        const completed = currentProgress >= achievement.requirement;
        if (completed && !achievement.completed) {
          shouldAward = true;
        }

        updatedAchievements.push({
          ...achievement,
          current_progress: currentProgress,
          completed,
        });

        // Award points for newly completed achievement
        if (shouldAward) {
          await this.awardPoints(userId, achievement.points, `Achievement: ${achievement.title}`);
          
          // Update achievement in database
          await supabase
            .from('user_achievements')
            .upsert({
              user_id: userId,
              achievement_id: achievement.id,
              progress: currentProgress,
              completed: true,
              completed_at: new Date().toISOString(),
              points_awarded: achievement.points,
            });
        }
      }

      return updatedAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  },

  // Update streaks
  async updateStreaks(userId: string, activityType: 'mood' | 'journal'): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get current stats
      const { data: stats, error: statsError } = await supabase
        .from('user_stats')
        .select('mood_streak, journal_streak, combined_streak, last_mood_date, last_journal_date')
        .eq('user_id', userId)
        .single();

      if (statsError) throw statsError;

      let moodStreak = stats.mood_streak || 0;
      let journalStreak = stats.journal_streak || 0;
      let combinedStreak = stats.combined_streak || 0;
      let lastMoodDate = stats.last_mood_date;
      let lastJournalDate = stats.last_journal_date;

      // Update mood streak
      if (activityType === 'mood') {
        if (!lastMoodDate || lastMoodDate !== today) {
          const lastActivity = lastMoodDate ? new Date(lastMoodDate) : null;
          const todayDate = new Date(today);

          if (!lastActivity) {
            moodStreak = 1;
          } else {
            const diffDays = Math.floor((todayDate.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
              moodStreak += 1;
            } else if (diffDays > 1) {
              moodStreak = 1;
            }
          }
          lastMoodDate = today;
        }
      }

      // Update journal streak
      if (activityType === 'journal') {
        if (!lastJournalDate || lastJournalDate !== today) {
          const lastActivity = lastJournalDate ? new Date(lastJournalDate) : null;
          const todayDate = new Date(today);

          if (!lastActivity) {
            journalStreak = 1;
          } else {
            const diffDays = Math.floor((todayDate.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
              journalStreak += 1;
            } else if (diffDays > 1) {
              journalStreak = 1;
            }
          }
          lastJournalDate = today;
        }
      }

      // Update combined streak (both mood and journal on same day)
      if (lastMoodDate === today && lastJournalDate === today) {
        combinedStreak += 1;
      } else {
        combinedStreak = 1;
      }

      // Update streaks in database
      await supabase
        .from('user_stats')
        .update({
          mood_streak: moodStreak,
          journal_streak: journalStreak,
          combined_streak: combinedStreak,
          last_mood_date: lastMoodDate,
          last_journal_date: lastJournalDate,
        })
        .eq('user_id', userId);

    } catch (error) {
      console.error('Error updating streaks:', error);
    }
  },

  // Helper functions
  calculateLevel(experience: number): number {
    return Math.floor(experience / 100) + 1;
  },

  calculateExperienceToNextLevel(level: number): number {
    return level * 100;
  },

  getDefaultUserStats(): UserStats {
    return {
      total_points: 0,
      level: 1,
      experience: 0,
      experience_to_next_level: 100,
      achievements_earned: 0,
      total_achievements: 20,
      current_streaks: [],
      rewards_unlocked: 0,
    };
  },
};
