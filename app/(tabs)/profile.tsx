import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Button, Divider, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { userService } from '../../src/services/userService';

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, signOut } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await userService.getCurrentUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      console.log('Signed out successfully');
      router.replace('/');
    } catch (error) {
      console.error('Sign out error:', error);
      // Force clear session even if signOut fails
      router.replace('/');
    }
  };

  const menuItems = [
    {
      title: 'Gamification',
      subtitle: 'Track your progress and achievements',
      icon: 'trophy',
      color: theme.colors.secondary,
      onPress: () => router.push('/gamification'),
    },
    {
      title: 'Notifications',
      subtitle: 'Manage your reminders and alerts',
      icon: 'bell',
      color: theme.colors.tertiary,
      onPress: () => router.push('/notifications'),
    },
    {
      title: 'AI Insights',
      subtitle: 'View personalized recommendations',
      icon: 'lightbulb',
      color: theme.colors.primary,
      onPress: () => router.push('/insights'),
    },
    {
      title: 'Settings',
      subtitle: 'App preferences and account settings',
      icon: 'cog',
      color: theme.colors.onSurface,
      onPress: () => router.push('/settings'),
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* User Profile Section */}
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <View style={styles.avatarContainer}>
            <MaterialCommunityIcons 
              name="account-circle" 
              size={64} 
              color={theme.colors.primary} 
            />
          </View>
          <Text variant="titleLarge" style={styles.userName}>
            {userProfile?.nickname || user?.email?.split('@')[0] || 'User'}
          </Text>
          <Text variant="bodyMedium" style={styles.userEmail}>
            {user?.email}
          </Text>
        </Card.Content>
      </Card>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Features
        </Text>
        
        {menuItems.map((item, index) => (
          <Card
            key={item.title}
            style={styles.menuCard}
            onPress={item.onPress}
          >
            <Card.Content style={styles.menuCardContent}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                  <MaterialCommunityIcons 
                    name={item.icon as any} 
                    size={24} 
                    color={item.color} 
                  />
                </View>
                <View style={styles.menuItemText}>
                  <Text variant="titleMedium" style={styles.menuItemTitle}>
                    {item.title}
                  </Text>
                  <Text variant="bodySmall" style={styles.menuItemSubtitle}>
                    {item.subtitle}
                  </Text>
                </View>
              </View>
              <MaterialCommunityIcons 
                name="chevron-right" 
                size={24} 
                color={theme.colors.onSurfaceDisabled} 
              />
            </Card.Content>
          </Card>
        ))}
      </View>

      <Divider style={styles.divider} />

      {/* Account Actions */}
      <View style={styles.accountSection}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Account
        </Text>
        
        <Card style={styles.menuCard} onPress={() => router.push('/nickname-setup')}>
          <Card.Content style={styles.menuCardContent}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                <MaterialCommunityIcons 
                  name="account-edit" 
                  size={24} 
                  color={theme.colors.primary} 
                />
              </View>
              <View style={styles.menuItemText}>
                <Text variant="titleMedium" style={styles.menuItemTitle}>
                  Edit Nickname
                </Text>
                <Text variant="bodySmall" style={styles.menuItemSubtitle}>
                  {userProfile?.nickname ? `Current: ${userProfile.nickname}` : 'Set your preferred name'}
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={24} 
              color={theme.colors.onSurfaceDisabled} 
            />
          </Card.Content>
        </Card>
        
        <Card style={styles.menuCard} onPress={handleSignOut}>
          <Card.Content style={styles.menuCardContent}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.error + '20' }]}>
                <MaterialCommunityIcons 
                  name="logout" 
                  size={24} 
                  color={theme.colors.error} 
                />
              </View>
              <View style={styles.menuItemText}>
                <Text variant="titleMedium" style={[styles.menuItemTitle, { color: theme.colors.error }]}>
                  Sign Out
                </Text>
                <Text variant="bodySmall" style={styles.menuItemSubtitle}>
                  Sign out of your account
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={24} 
              color={theme.colors.onSurfaceDisabled} 
            />
          </Card.Content>
        </Card>
      </View>

      {/* App Info */}
      <View style={styles.infoSection}>
        <Text variant="bodySmall" style={styles.appVersion}>
          VibeNote AI v1.0.0
        </Text>
        <Text variant="bodySmall" style={styles.appDescription}>
          Your personal mental wellbeing companion
        </Text>
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
  profileCard: {
    marginBottom: 24,
  },
  profileContent: {
    alignItems: 'center',
    padding: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  userName: {
    marginBottom: 4,
    color: '#1e293b',
  },
  userEmail: {
    color: '#64748b',
  },
  menuSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    color: '#1e293b',
    fontWeight: 'bold',
  },
  menuCard: {
    marginBottom: 12,
  },
  menuCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    marginBottom: 2,
    color: '#1e293b',
  },
  menuItemSubtitle: {
    color: '#64748b',
  },
  divider: {
    marginVertical: 24,
  },
  accountSection: {
    marginBottom: 24,
  },
  infoSection: {
    alignItems: 'center',
    marginTop: 24,
  },
  appVersion: {
    color: '#64748b',
    marginBottom: 4,
  },
  appDescription: {
    color: '#94a3b8',
    textAlign: 'center',
  },
});
