import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface NotificationPreferences {
  moodReminders: boolean;
  journalReminders: boolean;
  wellnessTips: boolean;
  moodReminderTime: string;
  journalReminderTime: string;
  wellnessTipTime: string;
}

export const notificationService = {
  // Request permissions
  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log('Notifications only work on physical devices');
      return false;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      return finalStatus === 'granted';
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  },

  // Send immediate notification (for testing)
  async sendTestNotification(): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🧪 Test Notification",
          body: "This is a test notification from VibeNote!",
          data: { type: 'test' },
        },
        trigger: null, // Send immediately
      });
      console.log('Test notification sent');
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  },

  // Schedule simple daily reminder
  async scheduleDailyReminder(type: 'mood' | 'journal' | 'wellness', time: string): Promise<string | null> {
    try {
      const [hours, minutes] = time.split(':').map(Number);
      
      const content = {
        mood: {
          title: "🌤️ How are you feeling today?",
          body: "Take a moment to check in with your mood and track your emotional wellbeing.",
          data: { type: 'mood_reminder' },
        },
        journal: {
          title: "📝 Time to reflect",
          body: "Write about your day and get AI insights to understand your patterns better.",
          data: { type: 'journal_reminder' },
        },
        wellness: {
          title: "💡 Wellness Tip",
          body: "Take 3 deep breaths to center yourself",
          data: { type: 'wellness_tip' },
        },
      };

      const identifier = await Notifications.scheduleNotificationAsync({
        content: content[type],
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
        },
      });

      console.log(`${type} reminder scheduled:`, identifier);
      return identifier;
    } catch (error) {
      console.error(`Error scheduling ${type} reminder:`, error);
      return null;
    }
  },

  // Setup all notifications
  async setupNotifications(preferences: NotificationPreferences): Promise<void> {
    try {
      await this.cancelAllNotifications();

      if (preferences.moodReminders) {
        await this.scheduleDailyReminder('mood', preferences.moodReminderTime);
      }

      if (preferences.journalReminders) {
        await this.scheduleDailyReminder('journal', preferences.journalReminderTime);
      }

      if (preferences.wellnessTips) {
        await this.scheduleDailyReminder('wellness', preferences.wellnessTipTime);
      }

      console.log('All notifications setup complete');
    } catch (error) {
      console.error('Error setting up notifications:', error);
      throw error;
    }
  },

  // Cancel all notifications
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  },

  // Get scheduled notifications
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log('Scheduled notifications:', notifications.length);
      return notifications;
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  },

  // Get default preferences
  getDefaultPreferences(): NotificationPreferences {
    return {
      moodReminders: true,
      journalReminders: true,
      wellnessTips: true,
      moodReminderTime: "09:00",
      journalReminderTime: "20:00",
      wellnessTipTime: "12:00",
    };
  },

  // Check if running in Expo Go
  isExpoGo(): boolean {
    return Constants.appOwnership === 'expo';
  },

  // Get notification status
  async getNotificationStatus(): Promise<{
    permissionsGranted: boolean;
    isExpoGo: boolean;
    scheduledCount: number;
  }> {
    const permissionsGranted = await this.requestPermissions();
    const isExpoGo = this.isExpoGo();
    const scheduledNotifications = await this.getScheduledNotifications();
    
    return {
      permissionsGranted,
      isExpoGo,
      scheduledCount: scheduledNotifications.length,
    };
  }
};
