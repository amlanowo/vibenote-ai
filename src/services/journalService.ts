import { supabase } from './supabase/client';
import { userService } from './userService';
import { aiService } from './aiService';

export interface JournalEntry {
  id?: string;
  user_id?: string;
  title?: string;
  content: string;
  word_count?: number;
  mood_entry_id?: string;
  tags?: string[];
  is_private?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AIInsight {
  id?: string;
  user_id?: string;
  journal_entry_id?: string;
  insight_type: 'emotion' | 'pattern' | 'suggestion' | 'summary';
  content: string;
  confidence_score?: number;
  metadata?: any;
  created_at?: string;
}

export const journalService = {
  // Save a new journal entry with AI insights
  async saveJournalEntry(journalData: Omit<JournalEntry, 'id' | 'user_id' | 'word_count' | 'created_at' | 'updated_at'>): Promise<JournalEntry | null> {
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

      // Save the journal entry first
      const { data, error } = await supabase
        .from('journal_entries')
        .insert([{
          ...journalData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error saving journal entry:', error);
        return null;
      }

      // Generate AI insights asynchronously (don't block the save)
      if (data && journalData.content.length > 3) { // Analyze if content has at least 3 characters
        this.generateAndSaveInsights(data.id, journalData.content).catch(error => {
          console.error('Error generating AI insights:', error);
        });
      }

      // Award points and update streaks
      try {
        const { gamificationService } = await import('./gamificationService');
        await gamificationService.awardPoints(user.id, 10, 'Journal entry written');
        await gamificationService.updateStreaks(user.id, 'journal');
        await gamificationService.checkAchievements(user.id);
      } catch (gamificationError) {
        console.error('Error updating gamification:', gamificationError);
      }

      return data;
    } catch (error) {
      console.error('Error saving journal entry:', error);
      return null;
    }
  },

  // Generate and save AI insights for a journal entry
  async generateAndSaveInsights(journalEntryId: string, content: string): Promise<void> {
    try {
      console.log('🔍 Starting AI analysis for journal entry:', journalEntryId);
      console.log('📝 Content length:', content.length);
      
      // Analyze the journal entry
      const analysis = await aiService.analyzeJournalEntry(content);
      
      if (!analysis) {
        console.log('❌ No analysis generated for journal entry');
        return;
      }

      console.log('✅ Analysis generated:', analysis);

      // Generate insights from the analysis
      const insights = await aiService.generateInsights(analysis, journalEntryId);
      
      if (insights.length === 0) {
        console.log('❌ No insights generated for journal entry');
        return;
      }

      console.log('✅ Insights generated:', insights.length, 'insights');

      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('❌ User not authenticated for saving insights');
        return;
      }

      console.log('👤 User authenticated:', user.id);

      // Save each insight to the database
      const insightPromises = insights.map(insight => 
        supabase
          .from('ai_insights')
          .insert([{
            user_id: user.id,
            journal_entry_id: journalEntryId,
            insight_type: insight.insight_type,
            content: insight.content,
            confidence_score: insight.confidence_score,
            metadata: insight.metadata
          }])
      );

      const results = await Promise.all(insightPromises);
      
      // Check for errors in the results
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error('❌ Errors saving insights:', errors);
      } else {
        console.log(`✅ Successfully saved ${insights.length} AI insights for journal entry`);
      }
    } catch (error) {
      console.error('❌ Error in generateAndSaveInsights:', error);
    }
  },

  // Get journal entries for a user
  async getJournalEntries(limit: number = 20): Promise<JournalEntry[]> {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching journal entries:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      return [];
    }
  },

  // Get a specific journal entry
  async getJournalEntry(id: string): Promise<JournalEntry | null> {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching journal entry:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching journal entry:', error);
      return null;
    }
  },

  // Update a journal entry
  async updateJournalEntry(id: string, updates: Partial<JournalEntry>): Promise<JournalEntry | null> {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating journal entry:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating journal entry:', error);
      return null;
    }
  },

  // Delete a journal entry
  async deleteJournalEntry(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting journal entry:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      return false;
    }
  },

  // Save AI insight
  async saveAIInsight(insightData: Omit<AIInsight, 'id' | 'user_id' | 'created_at'>): Promise<AIInsight | null> {
    try {
      const { data, error } = await supabase
        .from('ai_insights')
        .insert([insightData])
        .select()
        .single();

      if (error) {
        console.error('Error saving AI insight:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error saving AI insight:', error);
      return null;
    }
  },

  // Get AI insights for a journal entry
  async getAIInsights(journalEntryId: string): Promise<AIInsight[]> {
    try {
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('journal_entry_id', journalEntryId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching AI insights:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      return [];
    }
  },

  // Get recent journal entries with insights
  async getRecentEntriesWithInsights(limit: number = 5): Promise<(JournalEntry & { insights?: AIInsight[] })[]> {
    try {
      console.log('🔍 Fetching recent entries with insights...');
      
      // First, get the journal entries
      const { data: entries, error: entriesError } = await supabase
        .from('journal_entries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (entriesError) {
        console.error('❌ Error fetching journal entries:', entriesError);
        return [];
      }

      console.log('✅ Fetched entries:', entries?.length || 0);

      // Then, get insights for each entry
      const entriesWithInsights = await Promise.all(
        (entries || []).map(async (entry) => {
          const { data: insights, error: insightsError } = await supabase
            .from('ai_insights')
            .select('*')
            .eq('journal_entry_id', entry.id)
            .order('created_at', { ascending: false });

          if (insightsError) {
            console.error(`❌ Error fetching insights for entry ${entry.id}:`, insightsError);
            return { ...entry, insights: [] };
          }

          console.log(`📝 Entry ${entry.id}: ${insights?.length || 0} insights`);
          return { ...entry, insights: insights || [] };
        })
      );

      return entriesWithInsights;
    } catch (error) {
      console.error('❌ Error fetching recent entries with insights:', error);
      return [];
    }
  },

  // Manually generate insights for existing entries without insights
  async generateInsightsForExistingEntries(): Promise<void> {
    try {
      console.log('🔄 Generating insights for existing entries...');
      
      // Get entries without insights
      const { data: entries, error: entriesError } = await supabase
        .from('journal_entries')
        .select(`
          *,
          ai_insights (id)
        `)
        .order('created_at', { ascending: false });

      if (entriesError) {
        console.error('❌ Error fetching entries:', entriesError);
        return;
      }

      const entriesWithoutInsights = entries?.filter(entry => 
        !entry.ai_insights || entry.ai_insights.length === 0
      ) || [];

      console.log(`📝 Found ${entriesWithoutInsights.length} entries without insights`);

      // Generate insights for each entry
      for (const entry of entriesWithoutInsights) {
        if (entry.content && entry.content.length > 5) {
          console.log(`🔍 Generating insights for entry: ${entry.id}`);
          await this.generateAndSaveInsights(entry.id!, entry.content);
          // Add a small delay to avoid overwhelming the system
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.log('✅ Finished generating insights for existing entries');
    } catch (error) {
      console.error('❌ Error generating insights for existing entries:', error);
    }
  },

  // Debug function to check what's in the database
  async debugInsights(): Promise<void> {
    try {
      console.log('🔍 Debugging insights...');
      
      // Check all journal entries
      const { data: entries, error: entriesError } = await supabase
        .from('journal_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (entriesError) {
        console.error('❌ Error fetching entries:', entriesError);
        return;
      }

      console.log(`📝 Total journal entries: ${entries?.length || 0}`);

      // Check all AI insights
      const { data: insights, error: insightsError } = await supabase
        .from('ai_insights')
        .select('*')
        .order('created_at', { ascending: false });

      if (insightsError) {
        console.error('❌ Error fetching insights:', insightsError);
        return;
      }

      console.log(`💡 Total AI insights: ${insights?.length || 0}`);

      // Show insights by journal entry
      if (insights && insights.length > 0) {
        const insightsByEntry = insights.reduce((acc, insight) => {
          const entryId = insight.journal_entry_id;
          if (!acc[entryId]) acc[entryId] = [];
          acc[entryId].push(insight);
          return acc;
        }, {} as Record<string, any[]>);

        console.log('📊 Insights by journal entry:');
        Object.entries(insightsByEntry).forEach(([entryId, entryInsights]) => {
          console.log(`  Entry ${entryId}: ${entryInsights.length} insights`);
          entryInsights.forEach(insight => {
            console.log(`    - ${insight.insight_type}: ${insight.content.substring(0, 50)}...`);
          });
        });
      }
    } catch (error) {
      console.error('❌ Error debugging insights:', error);
    }
  },

  // Get journal statistics for analytics
  async getJournalStats(): Promise<{
    totalEntries: number;
    averageWords: number;
    mostActiveDay: string;
    totalWords: number;
  }> {
    try {
      const { data: entries, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching journal entries for stats:', error);
        return {
          totalEntries: 0,
          averageWords: 0,
          mostActiveDay: 'None',
          totalWords: 0
        };
      }

      if (!entries || entries.length === 0) {
        return {
          totalEntries: 0,
          averageWords: 0,
          mostActiveDay: 'None',
          totalWords: 0
        };
      }

      const totalEntries = entries.length;
      const totalWords = entries.reduce((sum, entry) => sum + (entry.word_count || 0), 0);
      const averageWords = Math.round(totalWords / totalEntries);

      // Find most active day
      const dayCounts: Record<string, number> = {};
      entries.forEach(entry => {
        const day = new Date(entry.created_at!).toLocaleDateString('en-US', { weekday: 'long' });
        dayCounts[day] = (dayCounts[day] || 0) + 1;
      });

      const mostActiveDay = Object.entries(dayCounts)
        .sort(([,a], [,b]) => b - a)[0][0];

      return {
        totalEntries,
        averageWords,
        mostActiveDay,
        totalWords
      };
    } catch (error) {
      console.error('Error getting journal stats:', error);
      return {
        totalEntries: 0,
        averageWords: 0,
        mostActiveDay: 'None',
        totalWords: 0
      };
    }
  }
};
