import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Switch, Button, Divider, List, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { notificationService, NotificationPreferences } from '../../src/services/notificationService';

export default function NotificationsScreen() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    notificationService.getDefaultPreferences()
  );
  const [loading, setLoading] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const granted = await notificationService.requestPermissions();
    setPermissionsGranted(granted);
    
    // Check if running in Expo Go
    if (notificationService.isExpoGo()) {
      console.log('Running in Expo Go - some notification features may be limited');
    }
  };

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleTimeChange = (key: keyof NotificationPreferences, time: string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: time
    }));
  };

  const savePreferences = async () => {
    setLoading(true);
    try {
      if (!permissionsGranted) {
        const granted = await notificationService.requestPermissions();
        if (!granted) {
          Alert.alert(
            'Permissions Required',
            'Please enable notifications in your device settings to receive reminders.',
            [{ text: 'OK' }]
          );
          setLoading(false);
          return;
        }
        setPermissionsGranted(true);
      }

      await notificationService.setupNotifications(preferences);
      Alert.alert('Success', 'Notification preferences saved!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Failed to save notification preferences.');
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = async () => {
    try {
      await notificationService.sendTestNotification();
      Alert.alert('Test Sent', 'Check your notifications!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification.');
    }
  };

  const clearAllNotifications = async () => {
    try {
      await notificationService.cancelAllNotifications();
      Alert.alert('Cleared', 'All notifications have been cancelled.');
    } catch (error) {
      Alert.alert('Error', 'Failed to clear notifications.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Notifications
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Manage your reminders and wellness tips
          </Text>
        </View>

                 {/* Permission Status */}
         <Card style={styles.card}>
           <Card.Content>
             <View style={styles.permissionStatus}>
               <MaterialCommunityIcons 
                 name={permissionsGranted ? "bell-check" : "bell-off"} 
                 size={24} 
                 color={permissionsGranted ? "#10b981" : "#ef4444"} 
               />
               <Text variant="titleMedium" style={styles.permissionText}>
                 {permissionsGranted ? 'Notifications Enabled' : 'Notifications Disabled'}
               </Text>
             </View>
             {!permissionsGranted && (
               <Text variant="bodySmall" style={styles.permissionSubtext}>
                 Enable notifications to receive daily reminders and wellness tips
               </Text>
             )}
             {notificationService.isExpoGo() && (
               <Text variant="bodySmall" style={styles.expoGoWarning}>
                 ⚠️ Running in Expo Go - some features may be limited. Use development build for full functionality.
               </Text>
             )}
           </Card.Content>
         </Card>

        {/* Notification Types */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Daily Reminders
            </Text>
            
            {/* Mood Reminders */}
            <List.Item
              title="🌤️ Mood Check-ins"
              description="Daily reminders to track your mood"
              left={() => <MaterialCommunityIcons name="emoticon-outline" size={24} color="#6366f1" />}
              right={() => (
                <Switch
                  value={preferences.moodReminders}
                  onValueChange={() => handleToggle('moodReminders')}
                  color="#6366f1"
                />
              )}
            />
            
            <Divider />
            
            {/* Journal Reminders */}
            <List.Item
              title="📝 Journal Entries"
              description="Evening reminders to reflect on your day"
              left={() => <MaterialCommunityIcons name="book-open-outline" size={24} color="#10b981" />}
              right={() => (
                <Switch
                  value={preferences.journalReminders}
                  onValueChange={() => handleToggle('journalReminders')}
                  color="#10b981"
                />
              )}
            />
            
            <Divider />
            
            {/* Wellness Tips */}
            <List.Item
              title="💡 Wellness Tips"
              description="Daily mindfulness and wellness suggestions"
              left={() => <MaterialCommunityIcons name="lightbulb-outline" size={24} color="#f59e0b" />}
              right={() => (
                <Switch
                  value={preferences.wellnessTips}
                  onValueChange={() => handleToggle('wellnessTips')}
                  color="#f59e0b"
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Reminder Times */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Reminder Times
            </Text>
            
            <View style={styles.timeContainer}>
              <Text variant="bodyMedium" style={styles.timeLabel}>
                Mood Check-in:
              </Text>
              <Text variant="bodyLarge" style={styles.timeValue}>
                {preferences.moodReminderTime}
              </Text>
            </View>
            
            <View style={styles.timeContainer}>
              <Text variant="bodyMedium" style={styles.timeLabel}>
                Journal Entry:
              </Text>
              <Text variant="bodyLarge" style={styles.timeValue}>
                {preferences.journalReminderTime}
              </Text>
            </View>
            
            <View style={styles.timeContainer}>
              <Text variant="bodyMedium" style={styles.timeLabel}>
                Wellness Tip:
              </Text>
              <Text variant="bodyLarge" style={styles.timeValue}>
                {preferences.wellnessTipTime}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Actions
            </Text>
            
            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={savePreferences}
                loading={loading}
                style={styles.button}
                icon="save"
              >
                Save Preferences
              </Button>
              
              <Button
                mode="outlined"
                onPress={sendTestNotification}
                style={styles.button}
                icon="bell-ring"
              >
                Send Test Notification
              </Button>
              
              <Button
                mode="outlined"
                onPress={clearAllNotifications}
                style={styles.button}
                icon="bell-off"
                textColor="#ef4444"
              >
                Clear All Notifications
              </Button>
              
              <Button
                mode="outlined"
                onPress={async () => {
                  try {
                    const status = await notificationService.getNotificationStatus();
                    Alert.alert('Status', `Permissions: ${status.permissionsGranted}\nExpo Go: ${status.isExpoGo}\nScheduled: ${status.scheduledCount}`);
                  } catch (error) {
                    Alert.alert('Error', 'Failed to get status');
                  }
                }}
                style={styles.button}
                icon="information"
              >
                Check Status
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Info Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              About Notifications
            </Text>
            <Text variant="bodySmall" style={styles.infoText}>
              • Notifications help you maintain consistent mood tracking and journaling habits{'\n'}
              • Wellness tips provide daily mindfulness suggestions{'\n'}
              • You can customize reminder times to fit your schedule{'\n'}
              • Notifications work even when the app is closed{'\n'}
              • You can disable any notification type at any time
            </Text>
          </Card.Content>
        </Card>
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
  permissionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  permissionText: {
    marginLeft: 12,
    color: '#1e293b',
  },
  permissionSubtext: {
    color: '#64748b',
    marginTop: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  timeLabel: {
    color: '#64748b',
  },
  timeValue: {
    color: '#1e293b',
    fontWeight: '600',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    marginBottom: 8,
  },
     infoText: {
     color: '#64748b',
     lineHeight: 20,
   },
   expoGoWarning: {
     color: '#f59e0b',
     marginTop: 8,
     fontStyle: 'italic',
   },
});
