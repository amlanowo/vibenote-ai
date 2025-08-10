import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Card, ActivityIndicator, Chip, Button } from 'react-native-paper';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { moodService } from '../../src/services/moodService';
import { journalService } from '../../src/services/journalService';

const screenWidth = Dimensions.get('window').width;

interface MoodStats {
  average: number;
  count: number;
  trend: string;
  data: Array<{ date: string; score: number }>;
}

interface JournalStats {
  totalEntries: number;
  averageWords: number;
  mostActiveDay: string;
  totalWords: number;
}

export default function AnalyticsScreen() {
  const [weeklyStats, setWeeklyStats] = useState<MoodStats | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<MoodStats | null>(null);
  const [journalStats, setJournalStats] = useState<JournalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [weekly, monthly, journal] = await Promise.all([
        moodService.getMoodStats(7),
        moodService.getMoodStats(30),
        journalService.getJournalStats()
      ]);
      
      setWeeklyStats(weekly);
      setMonthlyStats(monthly);
      setJournalStats(journal);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendEmoji = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return '#10b981';
      case 'declining': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getMoodEmoji = (score: number) => {
    if (score >= 4.5) return '😍';
    if (score >= 3.5) return '😊';
    if (score >= 2.5) return '😐';
    if (score >= 1.5) return '😔';
    return '😞';
  };

  const getMoodColor = (score: number) => {
    if (score >= 4.5) return '#10b981';
    if (score >= 3.5) return '#6366f1';
    if (score >= 2.5) return '#f59e0b';
    if (score >= 1.5) return '#f97316';
    return '#ef4444';
  };

  const formatChartData = (stats: MoodStats | null) => {
    if (!stats || !stats.data || stats.data.length === 0) {
      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{ data: [0, 0, 0, 0, 0, 0, 0] }]
      };
    }

    const labels = stats.data.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    });

    const data = stats.data.map(item => item.score);

    return {
      labels,
      datasets: [{ data }]
    };
  };

  const getMoodDistribution = (stats: MoodStats | null) => {
    if (!stats || !stats.data || stats.data.length === 0) {
      return [
        { name: 'No Data', population: 1, color: '#64748b', legendFontColor: '#7F7F7F' }
      ];
    }

    const distribution = {
      excellent: 0, // 4.5-5
      good: 0,      // 3.5-4.4
      okay: 0,      // 2.5-3.4
      poor: 0,      // 1.5-2.4
      bad: 0        // 1-1.4
    };

    stats.data.forEach(item => {
      if (item.score >= 4.5) distribution.excellent++;
      else if (item.score >= 3.5) distribution.good++;
      else if (item.score >= 2.5) distribution.okay++;
      else if (item.score >= 1.5) distribution.poor++;
      else distribution.bad++;
    });

    return [
      { name: 'Excellent', population: distribution.excellent, color: '#10b981', legendFontColor: '#7F7F7F' },
      { name: 'Good', population: distribution.good, color: '#6366f1', legendFontColor: '#7F7F7F' },
      { name: 'Okay', population: distribution.okay, color: '#f59e0b', legendFontColor: '#7F7F7F' },
      { name: 'Poor', population: distribution.poor, color: '#f97316', legendFontColor: '#7F7F7F' },
      { name: 'Bad', population: distribution.bad, color: '#ef4444', legendFontColor: '#7F7F7F' }
    ].filter(item => item.population > 0);
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(30, 41, 59, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#6366f1',
    },
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>
            Loading your analytics...
          </Text>
        </View>
      </View>
    );
  }

  const currentStats = selectedPeriod === 'week' ? weeklyStats : monthlyStats;
  const chartData = formatChartData(currentStats);
  const moodDistribution = getMoodDistribution(currentStats);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons 
          name="chart-line" 
          size={24} 
          color="#1e293b" 
          style={styles.headerIcon}
        />
        <Text style={styles.title}>
          Analytics & Insights
        </Text>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        <Button
          mode={selectedPeriod === 'week' ? 'contained' : 'outlined'}
          onPress={() => setSelectedPeriod('week')}
          style={[
            styles.periodButton,
            selectedPeriod === 'week' && { backgroundColor: '#6366f1' }
          ]}
          labelStyle={[
            styles.periodButtonLabel,
            selectedPeriod === 'week' && { color: 'white' }
          ]}
        >
          This Week
        </Button>
        <Button
          mode={selectedPeriod === 'month' ? 'contained' : 'outlined'}
          onPress={() => setSelectedPeriod('month')}
          style={[
            styles.periodButton,
            selectedPeriod === 'month' && { backgroundColor: '#6366f1' }
          ]}
          labelStyle={[
            styles.periodButtonLabel,
            selectedPeriod === 'month' && { color: 'white' }
          ]}
        >
          This Month
        </Button>
      </View>

      {/* Mood Overview Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="emoticon-outline" size={20} color="#6366f1" />
          <Text style={styles.cardTitle}>Mood Overview</Text>
        </View>
        {currentStats && currentStats.count > 0 ? (
          <View style={styles.overviewContainer}>
            <View style={styles.overviewStats}>
              <Text style={[styles.averageScore, { color: getMoodColor(currentStats.average) }]}>
                {currentStats.average.toFixed(1)}/5
              </Text>
              <Text style={styles.moodEmoji}>
                {getMoodEmoji(currentStats.average)}
              </Text>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {currentStats.count}
                </Text>
                <Text style={styles.statLabel}>
                  Entries
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {getTrendEmoji(currentStats.trend)}
                </Text>
                <Text style={[styles.statLabel, { color: getTrendColor(currentStats.trend) }]}>
                  {currentStats.trend.charAt(0).toUpperCase() + currentStats.trend.slice(1)}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.placeholder}>
            <MaterialCommunityIcons name="chart-line" size={48} color="#64748b" />
            <Text style={styles.placeholderText}>No mood data yet</Text>
            <Text style={styles.placeholderSubtext}>Start tracking your mood to see trends</Text>
          </View>
        )}
      </View>

      {/* Mood Trend Chart */}
      {currentStats && currentStats.count > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="trending-up" size={20} color="#6366f1" />
            <Text style={styles.cardTitle}>Mood Trend</Text>
          </View>
          <LineChart
            data={chartData}
            width={screenWidth - 80}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>
      )}

      {/* Mood Distribution */}
      {currentStats && currentStats.count > 0 && moodDistribution.length > 1 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="chart-pie" size={20} color="#6366f1" />
            <Text style={styles.cardTitle}>Mood Distribution</Text>
          </View>
          <PieChart
            data={moodDistribution}
            width={screenWidth - 80}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />
        </View>
      )}

      {/* Journal Statistics */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="book-open-variant" size={20} color="#6366f1" />
          <Text style={styles.cardTitle}>Journal Statistics</Text>
        </View>
        {journalStats && journalStats.totalEntries > 0 ? (
          <View style={styles.journalStats}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="book-open" size={24} color="#6366f1" />
                <Text style={styles.statNumber}>
                  {journalStats.totalEntries}
                </Text>
                <Text style={styles.statLabel}>
                  Total Entries
                </Text>
              </View>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="format-text" size={24} color="#10b981" />
                <Text style={styles.statNumber}>
                  {journalStats.totalWords}
                </Text>
                <Text style={styles.statLabel}>
                  Total Words
                </Text>
              </View>
            </View>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="text" size={24} color="#f59e0b" />
                <Text style={styles.statNumber}>
                  {journalStats.averageWords}
                </Text>
                <Text style={styles.statLabel}>
                  Avg. Words/Entry
                </Text>
              </View>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="calendar" size={24} color="#ec4899" />
                <Text style={styles.statNumber}>
                  {journalStats.mostActiveDay}
                </Text>
                <Text style={styles.statLabel}>
                  Most Active Day
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.placeholder}>
            <MaterialCommunityIcons name="book-open-outline" size={48} color="#64748b" />
            <Text style={styles.placeholderText}>No journal entries yet</Text>
            <Text style={styles.placeholderSubtext}>Start writing to see your statistics</Text>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="lightning-bolt" size={20} color="#6366f1" />
          <Text style={styles.cardTitle}>Quick Actions</Text>
        </View>
        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={() => router.push('/mood')}
            style={styles.actionButton}
            icon="emoticon-outline"
            labelStyle={styles.actionButtonLabel}
          >
            Add Mood
          </Button>
          <Button
            mode="outlined"
            onPress={() => router.push('/journal')}
            style={styles.actionButton}
            icon="book-open-outline"
            labelStyle={styles.actionButtonLabel}
          >
            Write Journal
          </Button>
          <Button
            mode="outlined"
            onPress={() => router.push('/insights')}
            style={styles.actionButton}
            icon="lightbulb"
            labelStyle={styles.actionButtonLabel}
          >
            AI Insights
          </Button>
        </View>
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
  periodSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  periodButton: {
    flex: 1,
    borderRadius: 8,
    borderColor: '#E5E7EB',
  },
  periodButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 8,
  },
  overviewContainer: {
    alignItems: 'center',
  },
  overviewStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  averageScore: {
    fontSize: 32,
    fontWeight: 'bold',
    marginRight: 12,
  },
  moodEmoji: {
    fontSize: 32,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  journalStats: {
    gap: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    borderColor: '#E5E7EB',
  },
  actionButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  placeholder: {
    height: 120,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#64748b',
    fontSize: 16,
    marginTop: 8,
    marginBottom: 4,
    fontWeight: '500',
  },
  placeholderSubtext: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
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
});
