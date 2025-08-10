import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, TextInput, Card, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { journalService } from '../../src/services/journalService';
import { moodService } from '../../src/services/moodService';
import { aiService } from '../../src/services/aiService';
import { router } from 'expo-router';

export default function JournalScreen() {
  const { user } = useAuth();
  const [journalEntry, setJournalEntry] = useState('');
  const [loading, setLoading] = useState(false);
  const [todayMood, setTodayMood] = useState<any>(null);
  const [wordCount, setWordCount] = useState(0);
  const [instantInsights, setInstantInsights] = useState<any>(null);
  const [showInsights, setShowInsights] = useState(false);

  useEffect(() => {
    loadTodayMood();
  }, []);

  useEffect(() => {
    // Calculate word count
    const words = journalEntry.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [journalEntry]);

  const loadTodayMood = async () => {
    try {
      const mood = await moodService.getTodayMoodEntry();
      setTodayMood(mood);
    } catch (error) {
      console.error('Error loading today\'s mood:', error);
    }
  };

  const handleSave = async () => {
    if (!journalEntry.trim()) {
      Alert.alert('Error', 'Please write something in your journal');
      return;
    }

    setLoading(true);
    setInstantInsights(null);
    setShowInsights(false);
    
    try {
      const journalData = {
        content: journalEntry.trim(),
        is_private: true,
      };

      // Save journal entry
      const savedJournal = await journalService.saveJournalEntry(journalData);
      
      if (savedJournal) {
        // Generate instant AI insights
        try {
          const analysis = await aiService.analyzeJournalEntry(journalEntry.trim());
          if (analysis) {
            setInstantInsights(analysis);
            setShowInsights(true);
          }
        } catch (aiError) {
          console.error('Error generating instant insights:', aiError);
          // Continue even if AI fails
        }

        // Show success message
        Alert.alert(
          'Journal Saved!', 
          'Your thoughts have been recorded and AI insights are ready!',
          [
            {
              text: 'Continue',
              style: 'cancel'
            }
          ]
        );
        
        // Don't reset form yet - let user see insights
      } else {
        Alert.alert('Error', 'Failed to save journal entry. Please try again.');
      }
    } catch (error) {
      console.error('Error saving journal entry:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewEntry = () => {
    setJournalEntry('');
    setInstantInsights(null);
    setShowInsights(false);
  };

  const getMoodColor = () => {
    if (!todayMood) return '#6366F1';
    
    const moodColors = {
      1: '#EF4444', // Awful - Red
      2: '#F97316', // Bad - Orange
      3: '#FCD34D', // Okay - Yellow
      4: '#10B981', // Good - Green
      5: '#6366F1', // Great - Blue
    };
    
    return moodColors[todayMood.mood_score as keyof typeof moodColors] || '#6366F1';
  };

  const getMoodEmoji = () => {
    if (!todayMood) return '📝';
    
    const moodEmojis = {
      1: '😡', // Awful
      2: '😔', // Bad
      3: '😐', // Okay
      4: '🙂', // Good
      5: '😊', // Great
    };
    
    return moodEmojis[todayMood.mood_score as keyof typeof moodEmojis] || '📝';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons 
          name="book-open-variant" 
          size={24} 
          color="#1e293b" 
          style={styles.headerIcon}
        />
        <Text variant="headlineMedium" style={styles.title}>
          Journal Entry
        </Text>
      </View>

      {/* Today's Mood Display */}
      {todayMood && (
        <View style={styles.moodSection}>
          <Text style={styles.moodLabel}>Today's Mood</Text>
          <View style={[styles.moodDisplay, { backgroundColor: getMoodColor() + '20' }]}>
            <Text style={styles.moodEmoji}>{getMoodEmoji()}</Text>
            <Text style={[styles.moodText, { color: getMoodColor() }]}>
              {todayMood.mood_emoji || 'Mood recorded'}
            </Text>
          </View>
        </View>
      )}

      {/* Journal Input */}
      <View style={styles.journalSection}>
        <Text style={styles.journalLabel}>What's on your mind?</Text>
        <TextInput
          style={styles.journalInput}
          placeholder="Write about your day, thoughts, feelings, or anything that's on your mind..."
          placeholderTextColor="#9CA3AF"
          value={journalEntry}
          onChangeText={setJournalEntry}
          multiline
          numberOfLines={8}
          textAlignVertical="top"
        />
        
        {/* Stats Bar */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="format-text" size={16} color="#6B7280" />
            <Text style={styles.statText}>{wordCount} words</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="alphabetical" size={16} color="#6B7280" />
            <Text style={styles.statText}>{journalEntry.length} characters</Text>
          </View>
        </View>
      </View>

      {/* Writing Prompts */}
      <View style={styles.promptsSection}>
        <Text style={styles.promptsLabel}>Need inspiration?</Text>
        <View style={styles.promptsGrid}>
          {[
            "What made you smile today?",
            "What's challenging you right now?",
            "What are you grateful for?",
            "What would you like to improve?"
          ].map((prompt, index) => (
            <Button
              key={index}
              mode="outlined"
              onPress={() => setJournalEntry(prev => prev + (prev ? '\n\n' : '') + prompt)}
              style={styles.promptButton}
              contentStyle={styles.promptButtonContent}
            >
              <Text style={styles.promptText}>{prompt}</Text>
            </Button>
          ))}
        </View>
      </View>

      {/* Save Button */}
      <View style={styles.saveSection}>
        <Button
          mode="contained"
          onPress={handleSave}
          loading={loading}
          disabled={loading || !journalEntry.trim()}
          style={[styles.saveButton, { backgroundColor: getMoodColor() }]}
          contentStyle={styles.saveButtonContent}
        >
          <MaterialCommunityIcons name="content-save" size={20} color="white" />
          <Text style={styles.saveButtonText}>Save & Get AI Insights</Text>
        </Button>
      </View>

      {/* Instant AI Insights */}
      {showInsights && instantInsights && (
        <View style={styles.insightsSection}>
          <Card style={styles.insightsCard}>
            <Card.Content>
              <View style={styles.insightsHeader}>
                <MaterialCommunityIcons name="lightbulb" size={20} color="#6366f1" />
                <Text style={styles.insightsTitle}>AI Insights</Text>
              </View>
              
              {/* Sentiment */}
              <View style={styles.insightItem}>
                <View style={styles.insightHeader}>
                  <MaterialCommunityIcons 
                    name={instantInsights.overall_sentiment === 'positive' ? 'emoticon-happy' :
                          instantInsights.overall_sentiment === 'negative' ? 'emoticon-sad' : 'emoticon-neutral'} 
                    size={16} 
                    color={instantInsights.overall_sentiment === 'positive' ? '#10b981' :
                           instantInsights.overall_sentiment === 'negative' ? '#ef4444' : '#6366f1'} 
                  />
                  <Text style={styles.insightLabel}>Sentiment</Text>
                </View>
                <Text style={styles.insightText}>
                  {instantInsights.overall_sentiment.charAt(0).toUpperCase() + instantInsights.overall_sentiment.slice(1)}
                </Text>
              </View>

              {/* Emotions */}
              {instantInsights.emotions && instantInsights.emotions.length > 0 && (
                <View style={styles.insightItem}>
                  <View style={styles.insightHeader}>
                    <MaterialCommunityIcons name="heart" size={16} color="#ec4899" />
                    <Text style={styles.insightLabel}>Emotions Detected</Text>
                  </View>
                  <View style={styles.emotionsList}>
                    {instantInsights.emotions.slice(0, 3).map((emotion: string, index: number) => (
                      <Chip key={index} style={styles.emotionChip} textStyle={styles.emotionChipText}>
                        {emotion}
                      </Chip>
                    ))}
                  </View>
                </View>
              )}

              {/* Key Themes */}
              {instantInsights.key_themes && instantInsights.key_themes.length > 0 && (
                <View style={styles.insightItem}>
                  <View style={styles.insightHeader}>
                    <MaterialCommunityIcons name="tag" size={16} color="#f59e0b" />
                    <Text style={styles.insightLabel}>Key Themes</Text>
                  </View>
                  <View style={styles.themesList}>
                    {instantInsights.key_themes.slice(0, 3).map((theme: string, index: number) => (
                      <Chip key={index} style={styles.themeChip} textStyle={styles.themeChipText}>
                        {theme}
                      </Chip>
                    ))}
                  </View>
                </View>
              )}

              {/* Suggestions */}
              {instantInsights.suggestions && instantInsights.suggestions.length > 0 && (
                <View style={styles.insightItem}>
                  <View style={styles.insightHeader}>
                    <MaterialCommunityIcons name="lightbulb-outline" size={16} color="#10b981" />
                    <Text style={styles.insightLabel}>Suggestions</Text>
                  </View>
                  {instantInsights.suggestions.slice(0, 2).map((suggestion: string, index: number) => (
                    <Text key={index} style={styles.suggestionText}>
                      • {suggestion}
                    </Text>
                  ))}
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.insightsActions}>
                <Button
                  mode="outlined"
                  onPress={() => router.push('/insights')}
                  style={styles.insightActionButton}
                  icon="chart-line"
                >
                  View Full Analysis
                </Button>
                <Button
                  mode="contained"
                  onPress={handleNewEntry}
                  style={[styles.insightActionButton, { backgroundColor: getMoodColor() }]}
                  icon="plus"
                >
                  New Entry
                </Button>
              </View>
            </Card.Content>
          </Card>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFEFE',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIcon: {
    marginRight: 12,
  },
  title: {
    color: '#1e293b',
    fontWeight: 'bold',
    flex: 1,
  },
  moodSection: {
    marginBottom: 24,
  },
  moodLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  moodDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  moodEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  moodText: {
    fontSize: 16,
    fontWeight: '500',
  },
  journalSection: {
    marginBottom: 24,
  },
  journalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  journalInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  promptsSection: {
    marginBottom: 24,
  },
  promptsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  promptsGrid: {
    gap: 8,
  },
  promptButton: {
    borderColor: '#E5E7EB',
    borderRadius: 8,
  },
  promptButtonContent: {
    paddingVertical: 8,
  },
  promptText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'left',
  },
  saveSection: {
    marginTop: 20,
  },
  saveButton: {
    borderRadius: 12,
    paddingVertical: 4,
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  insightsSection: {
    marginTop: 20,
  },
  insightsCard: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 8,
  },
  insightItem: {
    marginBottom: 16,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  insightLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  insightText: {
    fontSize: 14,
    color: '#1e293b',
    marginLeft: 24,
  },
  emotionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginLeft: 24,
  },
  emotionChip: {
    backgroundColor: '#fce7f3',
  },
  emotionChipText: {
    fontSize: 12,
    color: '#be185d',
  },
  themesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginLeft: 24,
  },
  themeChip: {
    backgroundColor: '#fef3c7',
  },
  themeChipText: {
    fontSize: 12,
    color: '#92400e',
  },
  suggestionText: {
    fontSize: 14,
    color: '#1e293b',
    marginLeft: 24,
    marginBottom: 4,
    lineHeight: 20,
  },
  insightsActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  insightActionButton: {
    flex: 1,
    borderRadius: 8,
  },
});
