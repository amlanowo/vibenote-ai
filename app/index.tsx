import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (user) {
      // User is authenticated, redirect to main app
      router.replace('/(tabs)');
    } else {
      // User is not authenticated, redirect to login
      router.replace('/(auth)/login');
    }
  }, [user, loading, router]);

  // Show loading screen while checking auth status
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 16 }}>Loading...</Text>
    </View>
  );
}

