import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '../../src/services/supabase/client';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'vibenoteai://auth/callback',
        },
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setEmailSent(true);
        Alert.alert(
          'Success!', 
          'Please check your email and click the confirmation link. You can then sign in to your account.',
          [
            {
              text: 'OK',
              onPress: () => router.push('/(auth)/login')
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Text variant="headlineMedium" style={styles.title}>
                Check Your Email
              </Text>
              <Text variant="bodyLarge" style={styles.subtitle}>
                We've sent a confirmation link to:
              </Text>
              <Text variant="bodyMedium" style={styles.email}>
                {email}
              </Text>
              <Text variant="bodyMedium" style={styles.instructions}>
                Click the link in your email to confirm your account, then you can sign in.
              </Text>
              
              <Button
                mode="contained"
                onPress={() => router.push('/(auth)/login')}
                style={styles.button}
              >
                Go to Sign In
              </Button>
              
              <Button
                mode="text"
                onPress={() => setEmailSent(false)}
                style={styles.linkButton}
              >
                Try a different email
              </Button>
            </Card.Content>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Text variant="headlineMedium" style={styles.title}>
              Create Account
            </Text>
            
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              style={styles.input}
              secureTextEntry
            />
            
            <Button
              mode="contained"
              onPress={handleSignup}
              loading={loading}
              disabled={loading}
              style={styles.button}
            >
              Sign Up
            </Button>
            
            <Button
              mode="text"
              onPress={() => router.push('/(auth)/login')}
              style={styles.linkButton}
            >
              Already have an account? Sign In
            </Button>
          </Card.Content>
        </Card>
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
    padding: 20,
  },
  card: {
    elevation: 4,
    borderRadius: 16,
  },
  cardContent: {
    padding: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#6366f1',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#64748b',
  },
  email: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#1e293b',
    fontWeight: 'bold',
  },
  instructions: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#64748b',
    lineHeight: 20,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
  },
  linkButton: {
    marginTop: 16,
  },
});
