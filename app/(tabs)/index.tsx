import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Text, Card, Button, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { moodService } from '../../src/services/moodService';
import { journalService } from '../../src/services/journalService';
import { gamificationService } from '../../src/services/gamificationService';
import { userService } from '../../src/services/userService';

export default function DashboardScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    recentMood: null,
    recentJournal: null,
    userStats: null,
  });
  const [userProfile, setUserProfile] = useState<any>(null);

  const loadDashboardData = async () => {
    try {
      if (!user?.id) return;

      const [recentMood, recentJournal, userStats, profile] = await Promise.all([
        moodService.getMoodEntries(1).then(entries => entries[0] || null),
        journalService.getJournalEntries(1).then(entries => entries[0] || null),
        gamificationService.getUserStats(user.id),
        userService.getCurrentUserProfile(),
      ]);

      setStats({ recentMood, recentJournal, userStats });
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const getMoodEmoji = (score: number) => {
    if (score >= 8) return '😊';
    if (score >= 6) return '🙂';
    if (score >= 4) return '😐';
    if (score >= 2) return '😔';
    return '😢';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your dashboard...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>
          {new Date().getHours() < 12 ? 'Good morning' : 
           new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}
        </Text>
        <Text style={styles.userName}>
          {userProfile?.nickname || user?.email?.split('@')[0] || 'User'}
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Button
          mode="contained"
          onPress={() => router.push('/mood')}
          style={styles.actionButton}
          icon="emoticon-outline"
        >
          Log Mood
        </Button>
        <Button
          mode="outlined"
          onPress={() => router.push('/journal')}
          style={styles.actionButton}
          icon="pencil-outline"
        >
          Write Journal
        </Button>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Card.Content>
            <Text variant="titleMedium">Current Level</Text>
            <Text variant="displaySmall" style={styles.statValue}>
              {stats.userStats?.level || 1}
            </Text>
            <Text variant="bodySmall">Keep going!</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <Text variant="titleMedium">Total Points</Text>
            <Text variant="displaySmall" style={styles.statValue}>
              {stats.userStats?.total_points || 0}
            </Text>
            <Text variant="bodySmall">XP earned</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>Recent Activity</Text>
        
        {stats.recentMood && (
          <Card style={styles.activityCard}>
            <Card.Content>
              <View style={styles.activityHeader}>
                <Text style={styles.moodEmoji}>
                  {getMoodEmoji(stats.recentMood.mood_score)}
                </Text>
                <View style={styles.activityContent}>
                  <Text variant="titleMedium">Recent Mood</Text>
                  <Text variant="bodyMedium">
                    {stats.recentMood.mood_label} • {new Date(stats.recentMood.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.moodScore}>
                  <Text style={styles.moodScoreText}>{stats.recentMood.mood_score}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {stats.recentJournal && (
          <Card style={styles.activityCard}>
            <Card.Content>
              <View style={styles.activityHeader}>
                <MaterialCommunityIcons name="book-open-variant" size={24} color={theme.colors.primary} />
                <View style={styles.activityContent}>
                  <Text variant="titleMedium">Recent Journal</Text>
                  <Text variant="bodyMedium">
                    {stats.recentJournal.title || 'Untitled'} • {new Date(stats.recentJournal.created_at).toLocaleDateString()}
                  </Text>
                  <Text variant="bodySmall" numberOfLines={2}>
                    {stats.recentJournal.content}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
      </View>

      {/* Quick Access Cards */}
      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>Quick Access</Text>
        
        <View style={styles.quickAccessGrid}>
          <Card style={styles.quickAccessCard} onPress={() => router.push('/analytics')}>
            <Card.Content style={styles.quickAccessContent}>
              <MaterialCommunityIcons name="chart-line" size={32} color={theme.colors.primary} />
              <Text variant="titleMedium">Analytics</Text>
              <Text variant="bodySmall">View your insights</Text>
            </Card.Content>
          </Card>

          <Card style={styles.quickAccessCard} onPress={() => router.push('/insights')}>
            <Card.Content style={styles.quickAccessContent}>
              <MaterialCommunityIcons name="lightbulb" size={32} color={theme.colors.secondary} />
              <Text variant="titleMedium">AI Insights</Text>
              <Text variant="bodySmall">Get personalized tips</Text>
            </Card.Content>
          </Card>



          <Card style={styles.quickAccessCard} onPress={() => router.push('/gamification')}>
            <Card.Content style={styles.quickAccessContent}>
              <MaterialCommunityIcons name="trophy" size={32} color={theme.colors.tertiary} />
              <Text variant="titleMedium">Gamification</Text>
              <Text variant="bodySmall">Track progress</Text>
            </Card.Content>
          </Card>

          <Card style={styles.quickAccessCard} onPress={() => router.push('/notifications')}>
            <Card.Content style={styles.quickAccessContent}>
              <MaterialCommunityIcons name="bell" size={32} color={theme.colors.onSurface} />
              <Text variant="titleMedium">Notifications</Text>
              <Text variant="bodySmall">Manage reminders</Text>
            </Card.Content>
          </Card>

          <Card style={styles.quickAccessCard} onPress={() => router.push('/profile')}>
            <Card.Content style={styles.quickAccessContent}>
              <MaterialCommunityIcons name="account" size={32} color={theme.colors.onSurface} />
              <Text variant="titleMedium">Profile</Text>
              <Text variant="bodySmall">Settings & preferences</Text>
            </Card.Content>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 16, // Reduced top padding to avoid status bar overlap
    paddingBottom: 20, // Normal padding
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#64748b',
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 18,
    color: '#64748b',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
  },
  statValue: {
    color: '#6366f1',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    color: '#1e293b',
  },
  activityCard: {
    marginBottom: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
    marginLeft: 12,
  },
  moodEmoji: {
    fontSize: 24,
  },
  moodScore: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodScoreText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAccessCard: {
    width: '47%',
  },
  quickAccessContent: {
    alignItems: 'center',
    padding: 16,
  },
});
