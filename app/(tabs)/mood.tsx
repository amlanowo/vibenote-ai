import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, TextInput } from 'react-native';
import Slider from '@react-native-community/slider';
import { Text, Button, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { moodService } from '../../src/services/moodService';
import { router } from 'expo-router';

const moodOptions = [
  { score: 1, label: 'Awful', emoji: '😡', color: '#EF4444' },
  { score: 2, label: 'Bad', emoji: '😔', color: '#F97316' },
  { score: 3, label: 'Okay', emoji: '😐', color: '#FCD34D' },
  { score: 4, label: 'Good', emoji: '🙂', color: '#10B981' },
  { score: 5, label: 'Great', emoji: '😊', color: '#6366F1' },
];

export default function MoodScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<number>(3); // Default to middle
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSliderChange = (value: number) => {
    setSelectedMood(value);
  };

  const handleSaveMood = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const moodData = {
        mood_score: selectedMood,
        mood_emoji: moodOptions.find(m => m.score === selectedMood)?.emoji || '',
        notes: notes.trim(),
      };

      await moodService.saveMoodEntry(moodData);
      Alert.alert('Success', 'Your mood has been recorded!');
      // Navigate to journal after saving
      router.push('/journal');
    } catch (error) {
      console.error('Error saving mood:', error);
      Alert.alert('Error', 'Failed to save your mood. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentMood = () => {
    return moodOptions.find(m => m.score === selectedMood);
  };

  const getMoodColor = () => {
    return getCurrentMood()?.color || '#6366F1';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons 
          name="arrow-left" 
          size={24} 
          color="#1e293b" 
          style={styles.backButton}
        />
        <Text variant="headlineMedium" style={styles.title}>
          How are you feeling?
        </Text>
      </View>

      {/* Main Mood Display */}
      <View style={styles.moodDisplay}>
        <Text style={[styles.mainEmoji, { color: getMoodColor() }]}>
          {getCurrentMood()?.emoji}
        </Text>
      </View>

      {/* Mood Slider */}
      <View style={styles.sliderContainer}>
        <Slider
          style={{ width: '100%', height: 40 }}
          minimumValue={1}
          maximumValue={5}
          step={1}
          value={selectedMood}
          onValueChange={setSelectedMood}
          minimumTrackTintColor={getMoodColor()}
          maximumTrackTintColor="#E5E7EB"
          thumbTintColor={getMoodColor()}
        />
        
        {/* Mood Scale Emojis */}
        <View style={styles.moodScale}>
          {moodOptions.map((mood) => (
            <View key={mood.score} style={styles.moodScaleItem}>
              <Text style={[
                styles.moodScaleEmoji,
                selectedMood === mood.score && { transform: [{ scale: 1.2 }] }
              ]}>
                {mood.emoji}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Notes Section */}
      <View style={styles.notesSection}>
        <Text style={styles.notesLabel}>Add a note (optional)</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="How's your day going? Any specific thoughts?"
          placeholderTextColor="#9CA3AF"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Save Button */}
      <View style={styles.saveSection}>
        <Button
          mode="contained"
          onPress={handleSaveMood}
          loading={loading}
          disabled={loading}
          style={[styles.saveButton, { backgroundColor: getMoodColor() }]}
          contentStyle={styles.saveButtonContent}
        >
          <Text style={styles.saveButtonText}>Save & Continue to Journal</Text>
        </Button>
      </View>
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
    paddingBottom: 20,
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    color: '#1e293b',
    fontWeight: 'bold',
    flex: 1,
  },
  moodDisplay: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mainEmoji: {
    fontSize: 80,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  sliderContainer: {
    marginBottom: 20,
  },
  moodScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  moodScaleItem: {
    alignItems: 'center',
  },
  moodScaleEmoji: {
    fontSize: 24,
  },
  notesSection: {
    marginBottom: 20,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  notesInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  saveSection: {
    marginTop: 'auto',
  },
  saveButton: {
    borderRadius: 12,
    paddingVertical: 4,
  },
  saveButtonContent: {
    paddingVertical: 12,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
