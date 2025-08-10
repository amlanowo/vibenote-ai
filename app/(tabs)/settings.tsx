import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Switch, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const theme = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);

  const settingsItems = [
    {
      title: 'Push Notifications',
      subtitle: 'Receive reminders and updates',
      icon: 'bell',
      type: 'switch',
      value: notificationsEnabled,
      onValueChange: setNotificationsEnabled,
    },
    {
      title: 'Dark Mode',
      subtitle: 'Use dark theme',
      icon: 'theme-light-dark',
      type: 'switch',
      value: darkModeEnabled,
      onValueChange: setDarkModeEnabled,
    },
    {
      title: 'Privacy Policy',
      subtitle: 'Read our privacy policy',
      icon: 'shield-account',
      type: 'link',
    },
    {
      title: 'Terms of Service',
      subtitle: 'Read our terms of service',
      icon: 'file-document',
      type: 'link',
    },
    {
      title: 'About',
      subtitle: 'App version and information',
      icon: 'information',
      type: 'link',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text variant="headlineMedium" style={styles.title}>
        Settings
      </Text>

      {settingsItems.map((item, index) => (
        <Card key={item.title} style={styles.settingCard}>
          <Card.Content style={styles.settingContent}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                <MaterialCommunityIcons 
                  name={item.icon as any} 
                  size={24} 
                  color={theme.colors.primary} 
                />
              </View>
              <View style={styles.settingText}>
                <Text variant="titleMedium" style={styles.settingTitle}>
                  {item.title}
                </Text>
                <Text variant="bodySmall" style={styles.settingSubtitle}>
                  {item.subtitle}
                </Text>
              </View>
            </View>
            {item.type === 'switch' && (
              <Switch
                value={item.value}
                onValueChange={item.onValueChange}
                color={theme.colors.primary}
              />
            )}
            {item.type === 'link' && (
              <MaterialCommunityIcons 
                name="chevron-right" 
                size={24} 
                color={theme.colors.onSurfaceDisabled} 
              />
            )}
          </Card.Content>
        </Card>
      ))}
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
    paddingTop: 16,
    paddingBottom: 20, // Normal padding
  },
  title: {
    marginBottom: 24,
    color: '#1e293b',
    fontWeight: 'bold',
  },
  settingCard: {
    marginBottom: 12,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLeft: {
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
  settingText: {
    flex: 1,
  },
  settingTitle: {
    marginBottom: 2,
    color: '#1e293b',
  },
  settingSubtitle: {
    color: '#64748b',
  },
});
