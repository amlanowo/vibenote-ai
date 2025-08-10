import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Card, Chip, Button, ProgressBar, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { gamificationService, UserStats, Achievement, Reward, Streak } from '../../src/services/gamificationService';

const screenWidth = Dimensions.get('window').width;

export default function GamificationScreen() {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'rewards'>('overview');

  useEffect(() => {
    if (user) {
      loadGamificationData();
    }
  }, [user]);

  const loadGamificationData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [stats, achievementsData, rewardsData] = await Promise.all([
        gamificationService.getUserStats(user.id),
        gamificationService.getAchievements(user.id),
        gamificationService.getRewards(user.id),
      ]);

      setUserStats(stats);
      setAchievements(achievementsData);
      setRewards(rewardsData);
    } catch (error) {
      console.error('Error loading gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelProgress = () => {
    if (!userStats) return 0;
    const currentLevelExp = userStats.experience - ((userStats.level - 1) * 100);
    const levelExpNeeded = userStats.experience_to_next_level - ((userStats.level - 1) * 100);
    return currentLevelExp / levelExpNeeded;
  };

  const getStreakIcon = (type: string) => {
    switch (type) {
      case 'mood': return '😊';
      case 'journal': return '📝';
      case 'combined': return '⚖️';
      default: return '🔥';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'mood': return '#6366f1';
      case 'journal': return '#10b981';
      case 'insights': return '#f59e0b';
      case 'wellness': return '#ec4899';
      case 'streak': return '#ef4444';
      default: return '#64748b';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text variant="bodyLarge" style={styles.loadingText}>
            Loading your progress...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            🎮 Gamification
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Track your progress and earn rewards
          </Text>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <Button
            mode={activeTab === 'overview' ? 'contained' : 'outlined'}
            onPress={() => setActiveTab('overview')}
            style={styles.tabButton}
            compact
          >
            Overview
          </Button>
          <Button
            mode={activeTab === 'achievements' ? 'contained' : 'outlined'}
            onPress={() => setActiveTab('achievements')}
            style={styles.tabButton}
            compact
          >
            Achievements
          </Button>
          <Button
            mode={activeTab === 'rewards' ? 'contained' : 'outlined'}
            onPress={() => setActiveTab('rewards')}
            style={styles.tabButton}
            compact
          >
            Rewards
          </Button>
        </View>

        {activeTab === 'overview' && (
          <>
            {/* Level Progress */}
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.levelContainer}>
                  <Text variant="displaySmall" style={styles.levelText}>
                    Level {userStats?.level || 1}
                  </Text>
                  <Text variant="bodyMedium" style={styles.experienceText}>
                    {userStats?.experience || 0} / {userStats?.experience_to_next_level || 100} XP
                  </Text>
                </View>
                <ProgressBar
                  progress={getLevelProgress()}
                  color="#6366f1"
                  style={styles.progressBar}
                />
                <Text variant="bodySmall" style={styles.progressText}>
                  {userStats?.experience_to_next_level - (userStats?.experience || 0)} XP to next level
                </Text>
              </Card.Content>
            </Card>

            {/* Stats Overview */}
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.cardTitle}>
                  Your Stats
                </Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text variant="headlineSmall" style={styles.statNumber}>
                      {userStats?.total_points || 0}
                    </Text>
                    <Text variant="bodySmall" style={styles.statLabel}>
                      Total Points
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text variant="headlineSmall" style={styles.statNumber}>
                      {userStats?.achievements_earned || 0}
                    </Text>
                    <Text variant="bodySmall" style={styles.statLabel}>
                      Achievements
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text variant="headlineSmall" style={styles.statNumber}>
                      {userStats?.rewards_unlocked || 0}
                    </Text>
                    <Text variant="bodySmall" style={styles.statLabel}>
                      Rewards
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Current Streaks */}
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.cardTitle}>
                  🔥 Current Streaks
                </Text>
                {userStats?.current_streaks && userStats.current_streaks.length > 0 ? (
                  userStats.current_streaks.map((streak: Streak) => (
                    <View key={streak.id} style={styles.streakItem}>
                      <View style={styles.streakHeader}>
                        <Text style={styles.streakIcon}>
                          {getStreakIcon(streak.type)}
                        </Text>
                        <Text variant="titleMedium" style={styles.streakTitle}>
                          {streak.type.charAt(0).toUpperCase() + streak.type.slice(1)} Streak
                        </Text>
                      </View>
                      <View style={styles.streakStats}>
                        <Text variant="headlineSmall" style={styles.streakNumber}>
                          {streak.current_streak}
                        </Text>
                        <Text variant="bodySmall" style={styles.streakLabel}>
                          days
                        </Text>
                      </View>
                      <Text variant="bodySmall" style={styles.streakBest}>
                        Best: {streak.longest_streak} days
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text variant="bodyMedium" style={styles.emptyText}>
                    Start logging your mood and journal entries to build streaks!
                  </Text>
                )}
              </Card.Content>
            </Card>
          </>
        )}

        {activeTab === 'achievements' && (
          <>
            {/* Achievements Progress */}
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.cardTitle}>
                  Achievements Progress
                </Text>
                <View style={styles.achievementProgress}>
                  <Text variant="headlineSmall" style={styles.progressNumber}>
                    {achievements.filter(a => a.completed).length} / {achievements.length}
                  </Text>
                  <Text variant="bodyMedium" style={styles.progressLabel}>
                    Achievements Unlocked
                  </Text>
                </View>
                <ProgressBar
                  progress={achievements.filter(a => a.completed).length / achievements.length}
                  color="#10b981"
                  style={styles.progressBar}
                />
              </Card.Content>
            </Card>

            {/* Achievements List */}
            <View style={styles.achievementsContainer}>
              {achievements.map((achievement) => (
                <Card key={achievement.id} style={styles.achievementCard}>
                  <Card.Content>
                    <View style={styles.achievementHeader}>
                      <Text style={styles.achievementIcon}>
                        {achievement.icon}
                      </Text>
                      <View style={styles.achievementInfo}>
                        <Text variant="titleMedium" style={styles.achievementTitle}>
                          {achievement.title}
                        </Text>
                        <Text variant="bodySmall" style={styles.achievementDescription}>
                          {achievement.description}
                        </Text>
                      </View>
                      <View style={styles.achievementStatus}>
                        {achievement.completed ? (
                          <MaterialCommunityIcons name="check-circle" size={24} color="#10b981" />
                        ) : (
                          <Text variant="bodySmall" style={styles.achievementPoints}>
                            +{achievement.points}
                          </Text>
                        )}
                      </View>
                    </View>
                    {!achievement.completed && (
                      <View style={styles.achievementProgress}>
                        <ProgressBar
                          progress={achievement.current_progress / achievement.requirement}
                          color={getCategoryColor(achievement.category)}
                          style={styles.achievementProgressBar}
                        />
                        <Text variant="bodySmall" style={styles.achievementProgressText}>
                          {achievement.current_progress} / {achievement.requirement}
                        </Text>
                      </View>
                    )}
                    <Chip
                      mode="outlined"
                      textStyle={{ fontSize: 12 }}
                      style={[styles.categoryChip, { borderColor: getCategoryColor(achievement.category) }]}
                    >
                      {achievement.category}
                    </Chip>
                  </Card.Content>
                </Card>
              ))}
            </View>
          </>
        )}

        {activeTab === 'rewards' && (
          <>
            {/* Rewards Progress */}
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.cardTitle}>
                  Rewards Progress
                </Text>
                <View style={styles.rewardProgress}>
                  <Text variant="headlineSmall" style={styles.progressNumber}>
                    {rewards.filter(r => r.unlocked).length} / {rewards.length}
                  </Text>
                  <Text variant="bodyMedium" style={styles.progressLabel}>
                    Rewards Unlocked
                  </Text>
                </View>
                <ProgressBar
                  progress={rewards.filter(r => r.unlocked).length / rewards.length}
                  color="#f59e0b"
                  style={styles.progressBar}
                />
              </Card.Content>
            </Card>

            {/* Rewards List */}
            <View style={styles.rewardsContainer}>
              {rewards.map((reward) => (
                <Card key={reward.id} style={styles.rewardCard}>
                  <Card.Content>
                    <View style={styles.rewardHeader}>
                      <Text style={styles.rewardIcon}>
                        {reward.icon}
                      </Text>
                      <View style={styles.rewardInfo}>
                        <Text variant="titleMedium" style={styles.rewardTitle}>
                          {reward.title}
                        </Text>
                        <Text variant="bodySmall" style={styles.rewardDescription}>
                          {reward.description}
                        </Text>
                      </View>
                      <View style={styles.rewardStatus}>
                        {reward.unlocked ? (
                          <MaterialCommunityIcons name="lock-open" size={24} color="#10b981" />
                        ) : (
                          <MaterialCommunityIcons name="lock" size={24} color="#64748b" />
                        )}
                      </View>
                    </View>
                    <View style={styles.rewardRequirements}>
                      <Text variant="bodySmall" style={styles.rewardPoints}>
                        {reward.points_required} points required
                      </Text>
                      {!reward.unlocked && (
                        <Text variant="bodySmall" style={styles.rewardProgress}>
                          {userStats?.total_points || 0} / {reward.points_required} points
                        </Text>
                      )}
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    color: '#6366f1',
    marginBottom: 4,
  },
  subtitle: {
    color: '#64748b',
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
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
  },
  card: {
    margin: 20,
    marginTop: 10,
    elevation: 2,
    borderRadius: 12,
  },
  cardTitle: {
    color: '#1e293b',
    marginBottom: 16,
    fontWeight: '600',
  },
  levelContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  levelText: {
    color: '#6366f1',
    fontWeight: 'bold',
  },
  experienceText: {
    color: '#64748b',
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    color: '#64748b',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    color: '#1e293b',
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#64748b',
    marginTop: 4,
  },
  streakItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  streakIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  streakTitle: {
    color: '#1e293b',
    fontWeight: '600',
  },
  streakStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  streakNumber: {
    color: '#ef4444',
    fontWeight: 'bold',
    marginRight: 4,
  },
  streakLabel: {
    color: '#64748b',
  },
  streakBest: {
    color: '#64748b',
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748b',
    fontStyle: 'italic',
  },
  achievementProgress: {
    alignItems: 'center',
    marginBottom: 16,
  },
  progressNumber: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  progressLabel: {
    color: '#64748b',
    marginTop: 4,
  },
  achievementsContainer: {
    paddingHorizontal: 20,
  },
  achievementCard: {
    marginBottom: 12,
    elevation: 1,
    borderRadius: 8,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    color: '#1e293b',
    fontWeight: '600',
  },
  achievementDescription: {
    color: '#64748b',
    marginTop: 2,
  },
  achievementStatus: {
    alignItems: 'center',
  },
  achievementPoints: {
    color: '#f59e0b',
    fontWeight: 'bold',
  },
  achievementProgress: {
    marginBottom: 8,
  },
  achievementProgressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  achievementProgressText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 12,
  },
  categoryChip: {
    alignSelf: 'flex-start',
  },
  rewardProgress: {
    alignItems: 'center',
    marginBottom: 16,
  },
  rewardsContainer: {
    paddingHorizontal: 20,
  },
  rewardCard: {
    marginBottom: 12,
    elevation: 1,
    borderRadius: 8,
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rewardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    color: '#1e293b',
    fontWeight: '600',
  },
  rewardDescription: {
    color: '#64748b',
    marginTop: 2,
  },
  rewardStatus: {
    alignItems: 'center',
  },
  rewardRequirements: {
    alignItems: 'center',
  },
  rewardPoints: {
    color: '#f59e0b',
    fontWeight: 'bold',
  },
  rewardProgress: {
    color: '#64748b',
    marginTop: 2,
  },
});

