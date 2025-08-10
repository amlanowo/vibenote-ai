import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { Text, Card, Chip, ActivityIndicator, Button, ProgressBar, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { journalService } from '../../src/services/journalService';
import { moodService } from '../../src/services/moodService';
import { aiService } from '../../src/services/aiService';
import { router } from 'expo-router';

const screenWidth = Dimensions.get('window').width;

interface AIInsight {
  id: string;
  insight_type: 'emotion' | 'pattern' | 'suggestion' | 'summary' | 'wellness' | 'trend';
  content: string;
  confidence_score: number;
  created_at: string;
}

interface MoodAnalysis {
  averageMood: number;
  moodTrend: 'improving' | 'declining' | 'stable';
  dominantEmotions: string[];
  triggers: string[];
  recommendations: string[];
}

interface SentimentAnalysis {
  overallSentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  emotions: Array<{ emotion: string; intensity: number }>;
  themes: string[];
}

interface WellnessInsight {
  category: 'mindfulness' | 'exercise' | 'nutrition' | 'sleep' | 'social' | 'stress';
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
  reasoning: string;
}

export default function InsightsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'mood' | 'journal' | 'wellness'>('overview');
  
  // Data states
  const [moodAnalysis, setMoodAnalysis] = useState<MoodAnalysis | null>(null);
  const [sentimentAnalysis, setSentimentAnalysis] = useState<SentimentAnalysis | null>(null);
  const [wellnessInsights, setWellnessInsights] = useState<WellnessInsight[]>([]);
  const [recentInsights, setRecentInsights] = useState<AIInsight[]>([]);
  const [stats, setStats] = useState({
    totalEntries: 0,
    averageMood: 0,
    insightsGenerated: 0,
    streakDays: 0
  });

  useEffect(() => {
    loadComprehensiveInsights();
  }, []);

  const loadComprehensiveInsights = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [moodData, journalData, wellnessData, statsData] = await Promise.all([
        loadMoodAnalysis(),
        loadSentimentAnalysis(),
        loadWellnessInsights(),
        loadStats()
      ]);

      setMoodAnalysis(moodData);
      setSentimentAnalysis(journalData);
      setWellnessInsights(wellnessData);
      setStats(statsData);
      
    } catch (error) {
      console.error('Error loading comprehensive insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoodAnalysis = async (): Promise<MoodAnalysis> => {
    try {
      const moodEntries = await moodService.getMoodEntries(30); // Last 30 days
      
      if (moodEntries.length === 0) {
        return {
          averageMood: 0,
          moodTrend: 'stable',
          dominantEmotions: [],
          triggers: [],
          recommendations: []
        };
      }

      const scores = moodEntries.map(entry => entry.mood_score).filter(score => score !== null && score !== undefined);
      const averageMood = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      
      // Calculate trend
      const recentScores = scores.slice(-7);
      const olderScores = scores.slice(-14, -7);
      const recentAvg = recentScores.length > 0 ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length : 0;
      const olderAvg = olderScores.length > 0 ? olderScores.reduce((a, b) => a + b, 0) / olderScores.length : 0;
      
      let moodTrend: 'improving' | 'declining' | 'stable' = 'stable';
      if (recentAvg > olderAvg + 0.5) moodTrend = 'improving';
      else if (recentAvg < olderAvg - 0.5) moodTrend = 'declining';

      // Analyze notes for emotions and triggers
      const notes = moodEntries.filter(entry => entry.notes).map(entry => entry.notes);
      const analysis = await aiService.analyzeMoodPatterns(notes);
      
      return {
        averageMood,
        moodTrend,
        dominantEmotions: analysis.emotions || [],
        triggers: analysis.triggers || [],
        recommendations: analysis.recommendations || []
      };
    } catch (error) {
      console.error('Error loading mood analysis:', error);
      return {
        averageMood: 0,
        moodTrend: 'stable',
        dominantEmotions: [],
        triggers: [],
        recommendations: []
      };
    }
  };

  const loadSentimentAnalysis = async (): Promise<SentimentAnalysis> => {
    try {
      const journalEntries = await journalService.getJournalEntries(10);
      
      if (journalEntries.length === 0) {
        return {
          overallSentiment: 'neutral',
          confidence: 0,
          emotions: [],
          themes: []
        };
      }

      const analysis = await aiService.analyzeJournalSentiment(journalEntries);
      return analysis;
    } catch (error) {
      console.error('Error loading sentiment analysis:', error);
      return {
        overallSentiment: 'neutral',
        confidence: 0,
        emotions: [],
        themes: []
      };
    }
  };

  const loadWellnessInsights = async (): Promise<WellnessInsight[]> => {
    try {
      const insights = await aiService.generateComprehensiveWellnessSuggestions();
      return insights;
    } catch (error) {
      console.error('Error loading wellness insights:', error);
      return [];
    }
  };

  const loadStats = async () => {
    try {
      const [moodEntries, journalEntries] = await Promise.all([
        moodService.getMoodEntries(100),
        journalService.getJournalEntries(100)
      ]);

      const validMoodEntries = moodEntries.filter(entry => entry.mood_score !== null && entry.mood_score !== undefined);
      const averageMood = validMoodEntries.length > 0 
        ? validMoodEntries.reduce((sum, entry) => sum + entry.mood_score, 0) / validMoodEntries.length 
        : 0;

      return {
        totalEntries: journalEntries.length,
        averageMood,
        insightsGenerated: journalEntries.filter(entry => (entry as any).ai_insights?.length > 0).length,
        streakDays: calculateStreakDays(moodEntries, journalEntries)
      };
    } catch (error) {
      console.error('Error loading stats:', error);
      return { totalEntries: 0, averageMood: 0, insightsGenerated: 0, streakDays: 0 };
    }
  };

  const calculateStreakDays = (moodEntries: any[], journalEntries: any[]) => {
    // Simple streak calculation - can be enhanced
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const hasTodayMood = moodEntries.some(entry => 
      new Date(entry.created_at).toDateString() === today.toDateString()
    );
    const hasTodayJournal = journalEntries.some(entry => 
      new Date(entry.created_at).toDateString() === today.toDateString()
    );
    
    return hasTodayMood || hasTodayJournal ? 1 : 0;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadComprehensiveInsights();
    setRefreshing(false);
  };

  const getMoodEmoji = (score: number) => {
    if (score >= 4.5) return '😊';
    if (score >= 3.5) return '🙂';
    if (score >= 2.5) return '😐';
    if (score >= 1.5) return '😔';
    return '😢';
  };

  const getMoodColor = (score: number) => {
    if (score >= 4.5) return '#10b981';
    if (score >= 3.5) return '#6366f1';
    if (score >= 2.5) return '#f59e0b';
    if (score >= 1.5) return '#f97316';
    return '#ef4444';
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '#10b981';
      case 'negative': return '#ef4444';
      default: return '#6366f1';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      default: return '#10b981';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Analyzing your data...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Insights</Text>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalEntries}</Text>
            <Text style={styles.statLabel}>Entries</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: getMoodColor(stats.averageMood) }]}>
              {stats.averageMood.toFixed(1)}
            </Text>
            <Text style={styles.statLabel}>Avg Mood</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.insightsGenerated}</Text>
            <Text style={styles.statLabel}>Insights</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.streakDays}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'mood', label: 'Mood' },
          { key: 'journal', label: 'Journal' },
          { key: 'wellness', label: 'Wellness' }
        ].map((tab) => (
          <Button
            key={tab.key}
            mode={activeTab === tab.key ? 'contained' : 'text'}
            onPress={() => setActiveTab(tab.key as any)}
            style={styles.tabButton}
            labelStyle={[styles.tabLabel, activeTab === tab.key && styles.activeTabLabel]}
            compact
          >
            {tab.label}
          </Button>
        ))}
      </View>

      <Divider style={styles.divider} />

      {/* Content Container */}
      <View style={styles.contentContainer}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <View>
            {/* Mood Summary */}
            {moodAnalysis && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Mood Summary</Text>
                
                <View style={styles.moodSummary}>
                  <View style={styles.moodDisplay}>
                    <Text style={styles.moodEmoji}>{getMoodEmoji(moodAnalysis.averageMood)}</Text>
                    <Text style={[styles.moodScore, { color: getMoodColor(moodAnalysis.averageMood) }]}>
                      {moodAnalysis.averageMood.toFixed(1)}/5
                    </Text>
                  </View>
                  
                  <View style={styles.trendIndicator}>
                    <MaterialCommunityIcons 
                      name={moodAnalysis.moodTrend === 'improving' ? 'trending-up' : 
                            moodAnalysis.moodTrend === 'declining' ? 'trending-down' : 'trending-neutral'} 
                      size={20} 
                      color={moodAnalysis.moodTrend === 'improving' ? '#10b981' : 
                             moodAnalysis.moodTrend === 'declining' ? '#ef4444' : '#6366f1'} 
                    />
                    <Text style={styles.trendText}>
                      {moodAnalysis.moodTrend.charAt(0).toUpperCase() + moodAnalysis.moodTrend.slice(1)}
                    </Text>
                  </View>
                </View>

                {moodAnalysis.dominantEmotions.length > 0 && (
                  <View style={styles.emotionsSection}>
                    <Text style={styles.subsectionTitle}>Dominant Emotions</Text>
                    <View style={styles.emotionsList}>
                      {moodAnalysis.dominantEmotions.slice(0, 3).map((emotion, index) => (
                        <Text key={index} style={styles.emotionTag}>{emotion}</Text>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Sentiment Overview */}
            {sentimentAnalysis && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Journal Sentiment</Text>
                
                <View style={styles.sentimentDisplay}>
                  <View style={styles.sentimentIndicator}>
                    <MaterialCommunityIcons 
                      name={sentimentAnalysis.overallSentiment === 'positive' ? 'emoticon-happy' :
                            sentimentAnalysis.overallSentiment === 'negative' ? 'emoticon-sad' : 'emoticon-neutral'} 
                      size={32} 
                      color={getSentimentColor(sentimentAnalysis.overallSentiment)} 
                    />
                    <Text style={[styles.sentimentText, { color: getSentimentColor(sentimentAnalysis.overallSentiment) }]}>
                      {sentimentAnalysis.overallSentiment.charAt(0).toUpperCase() + sentimentAnalysis.overallSentiment.slice(1)}
                    </Text>
                  </View>
                  
                  <ProgressBar 
                    progress={sentimentAnalysis.confidence} 
                    color={getSentimentColor(sentimentAnalysis.overallSentiment)}
                    style={styles.confidenceBar}
                  />
                  <Text style={styles.confidenceText}>
                    Confidence: {Math.round(sentimentAnalysis.confidence * 100)}%
                  </Text>
                </View>

                {sentimentAnalysis.themes.length > 0 && (
                  <View style={styles.themesSection}>
                    <Text style={styles.subsectionTitle}>Common Themes</Text>
                    <View style={styles.themesList}>
                      {sentimentAnalysis.themes.slice(0, 4).map((theme, index) => (
                        <Text key={index} style={styles.themeTag}>{theme}</Text>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              
              <View style={styles.actionButtons}>
                <Button 
                  mode="outlined" 
                  onPress={() => router.push('/mood')}
                  style={styles.actionButton}
                  labelStyle={styles.actionButtonLabel}
                >
                  Log Mood
                </Button>
                <Button 
                  mode="outlined" 
                  onPress={() => router.push('/journal')}
                  style={styles.actionButton}
                  labelStyle={styles.actionButtonLabel}
                >
                  Write Journal
                </Button>
                <Button 
                  mode="outlined" 
                  onPress={() => router.push('/chat')}
                  style={styles.actionButton}
                  labelStyle={styles.actionButtonLabel}
                >
                  AI Chat
                </Button>
              </View>
            </View>
          </View>
        )}

        {/* Mood Tab */}
        {activeTab === 'mood' && (
          <View>
            {moodAnalysis ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Mood Analysis</Text>
                
                {moodAnalysis.triggers.length > 0 && (
                  <View style={styles.analysisSection}>
                    <Text style={styles.subsectionTitle}>Common Triggers</Text>
                    {moodAnalysis.triggers.map((trigger, index) => (
                      <View key={index} style={styles.listItem}>
                        <Text style={styles.listItemText}>• {trigger}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {moodAnalysis.recommendations.length > 0 && (
                  <View style={styles.analysisSection}>
                    <Text style={styles.subsectionTitle}>Recommendations</Text>
                    {moodAnalysis.recommendations.map((rec, index) => (
                      <View key={index} style={styles.listItem}>
                        <Text style={styles.listItemText}>• {rec}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="emoticon-outline" size={48} color="#64748b" />
                <Text style={styles.emptyTitle}>No Mood Data</Text>
                <Text style={styles.emptyText}>Start logging your mood to get personalized insights</Text>
                <Button mode="contained" onPress={() => router.push('/mood')} style={styles.emptyButton}>
                  Log Your First Mood
                </Button>
              </View>
            )}
          </View>
        )}

        {/* Journal Tab */}
        {activeTab === 'journal' && (
          <View>
            {sentimentAnalysis ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Journal Analysis</Text>
                
                {sentimentAnalysis.emotions.length > 0 && (
                  <View style={styles.analysisSection}>
                    <Text style={styles.subsectionTitle}>Emotional Patterns</Text>
                    {sentimentAnalysis.emotions.map((emotion, index) => (
                      <View key={index} style={styles.emotionItem}>
                        <View style={styles.emotionHeader}>
                          <Text style={styles.emotionName}>{emotion.emotion}</Text>
                          <Text style={styles.emotionIntensity}>{Math.round(emotion.intensity * 100)}%</Text>
                        </View>
                        <ProgressBar 
                          progress={emotion.intensity} 
                          color="#6366f1"
                          style={styles.emotionBar}
                        />
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="book-open-variant" size={48} color="#64748b" />
                <Text style={styles.emptyTitle}>No Journal Entries</Text>
                <Text style={styles.emptyText}>Write your first journal entry to get sentiment analysis</Text>
                <Button mode="contained" onPress={() => router.push('/journal')} style={styles.emptyButton}>
                  Write Your First Entry
                </Button>
              </View>
            )}
          </View>
        )}

        {/* Wellness Tab */}
        {activeTab === 'wellness' && (
          <View>
            {wellnessInsights.length > 0 ? (
              wellnessInsights.map((insight, index) => (
                <View key={index} style={styles.section}>
                  <View style={styles.insightHeader}>
                    <Text style={styles.insightTitle}>{insight.category.charAt(0).toUpperCase() + insight.category.slice(1)}</Text>
                    <Text style={[styles.priorityTag, { color: getPriorityColor(insight.priority) }]}>
                      {insight.priority}
                    </Text>
                  </View>
                  
                  <Text style={styles.insightText}>{insight.suggestion}</Text>
                  <Text style={styles.reasoningText}>{insight.reasoning}</Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="heart-pulse" size={48} color="#64748b" />
                <Text style={styles.emptyTitle}>No Wellness Insights</Text>
                <Text style={styles.emptyText}>Continue using the app to receive personalized wellness recommendations</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    color: '#64748b',
    fontSize: 16,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    color: '#1e293b',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '300',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '400',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  tabButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#64748b',
  },
  activeTabLabel: {
    color: '#6366f1',
    fontWeight: '600',
  },
  divider: {
    marginVertical: 16,
    backgroundColor: '#f1f5f9',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
    marginTop: 16,
  },
  moodSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moodDisplay: {
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  moodScore: {
    fontSize: 24,
    fontWeight: '300',
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trendText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#374151',
  },
  emotionsSection: {
    marginTop: 20,
  },
  emotionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emotionTag: {
    fontSize: 14,
    color: '#6366f1',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontWeight: '400',
  },
  sentimentDisplay: {
    alignItems: 'center',
  },
  sentimentIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sentimentText: {
    fontSize: 18,
    fontWeight: '500',
  },
  confidenceBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
  },
  confidenceText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '400',
  },
  themesSection: {
    marginTop: 20,
  },
  themesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themeTag: {
    fontSize: 14,
    color: '#6366f1',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontWeight: '400',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    borderColor: '#e2e8f0',
  },
  actionButtonLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#374151',
  },
  analysisSection: {
    marginBottom: 24,
  },
  listItem: {
    marginBottom: 8,
  },
  listItemText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    fontWeight: '400',
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    fontWeight: '400',
  },
  emptyButton: {
    borderRadius: 8,
    backgroundColor: '#6366f1',
  },
  emotionItem: {
    marginBottom: 16,
  },
  emotionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  emotionName: {
    fontSize: 16,
    fontWeight: '400',
    color: '#374151',
  },
  emotionIntensity: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '400',
  },
  emotionBar: {
    height: 4,
    borderRadius: 2,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1e293b',
  },
  priorityTag: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  insightText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 8,
    fontWeight: '400',
  },
  reasoningText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    fontWeight: '400',
  },
});
