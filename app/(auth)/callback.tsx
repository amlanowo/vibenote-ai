import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '../../src/services/supabase/client';

export default function AuthCallback() {
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.replace('/(auth)/login');
          return;
        }

        if (data.session) {
          // User is authenticated, redirect to main app
          router.replace('/(tabs)');
        } else {
          // No session, redirect to login
          router.replace('/(auth)/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        router.replace('/(auth)/login');
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text variant="bodyLarge" style={styles.text}>
          Confirming your email...
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    marginTop: 16,
    color: '#64748b',
  },
});
