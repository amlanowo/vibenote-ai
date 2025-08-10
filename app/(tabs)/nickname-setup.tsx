import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { userService } from '../../src/services/userService';
import { router } from 'expo-router';

export default function NicknameSetupScreen() {
  const { user } = useAuth();
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSaveNickname = async () => {
    if (!nickname.trim()) {
      Alert.alert('Error', 'Please enter a nickname');
      return;
    }

    if (nickname.trim().length < 2) {
      Alert.alert('Error', 'Nickname must be at least 2 characters long');
      return;
    }

    if (nickname.trim().length > 20) {
      Alert.alert('Error', 'Nickname must be less than 20 characters');
      return;
    }

    setLoading(true);
    try {
      const updatedProfile = await userService.updateNickname(nickname.trim());
      
      if (updatedProfile) {
        Alert.alert(
          'Success!', 
          `Welcome, ${nickname.trim()}! Your nickname has been saved.`,
          [
            {
              text: 'Continue',
              onPress: () => router.push('/')
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to save nickname. Please try again.');
      }
    } catch (error) {
      console.error('Error saving nickname:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Nickname?',
      'You can always set your nickname later in the Profile section.',
      [
        {
          text: 'Set Later',
          onPress: () => router.push('/')
        },
        {
          text: 'Enter Now',
          style: 'cancel'
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons 
          name="account-plus" 
          size={24} 
          color="#1e293b" 
          style={styles.headerIcon}
        />
        <Text style={styles.title}>
          Welcome to VibeNote!
        </Text>
      </View>

      {/* Welcome Message */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>
          Let's personalize your experience
        </Text>
        <Text style={styles.subtitle}>
          What should we call you?
        </Text>
      </View>

      {/* Nickname Input */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Your Nickname</Text>
        <TextInput
          style={styles.nicknameInput}
          placeholder="Enter your preferred name"
          placeholderTextColor="#9CA3AF"
          value={nickname}
          onChangeText={setNickname}
          maxLength={20}
          autoFocus
        />
        <Text style={styles.inputHint}>
          {nickname.length}/20 characters
        </Text>
      </View>

      {/* Examples */}
      <View style={styles.examplesSection}>
        <Text style={styles.examplesLabel}>Examples:</Text>
        <View style={styles.examplesGrid}>
          {['Alex', 'Sam', 'Jordan', 'Taylor'].map((example) => (
            <Button
              key={example}
              mode="outlined"
              onPress={() => setNickname(example)}
              style={styles.exampleButton}
              labelStyle={styles.exampleButtonLabel}
            >
              {example}
            </Button>
          ))}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <Button
          mode="contained"
          onPress={handleSaveNickname}
          loading={loading}
          disabled={loading || !nickname.trim()}
          style={styles.saveButton}
          contentStyle={styles.saveButtonContent}
        >
          <MaterialCommunityIcons name="check" size={20} color="white" />
          <Text style={styles.saveButtonText}>Save & Continue</Text>
        </Button>
        
        <Button
          mode="text"
          onPress={handleSkip}
          style={styles.skipButton}
          labelStyle={styles.skipButtonLabel}
        >
          Skip for now
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  welcomeSection: {
    marginBottom: 32,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    color: '#64748b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  inputSection: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  nicknameInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    textAlign: 'center',
  },
  inputHint: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  examplesSection: {
    marginBottom: 32,
  },
  examplesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  examplesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  exampleButton: {
    borderColor: '#E5E7EB',
    borderRadius: 8,
  },
  exampleButtonLabel: {
    fontSize: 14,
    color: '#374151',
  },
  actionSection: {
    gap: 16,
  },
  saveButton: {
    borderRadius: 12,
    backgroundColor: '#6366f1',
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
  skipButton: {
    marginTop: 8,
  },
  skipButtonLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
});
