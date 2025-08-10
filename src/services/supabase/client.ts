import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 'https://fowwqwnxlslrwyiomojl.supabase.co';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvd3dxd254bHNscnd5aW9tb2psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2Mzc1ODAsImV4cCI6MjA3MDIxMzU4MH0.wAgc4JcZXPmLBfoX31obgnNCkyiusoN77sBy5tWO4T4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});

// Handle deep links for email confirmation
Linking.addEventListener('url', (event) => {
  const url = event.url;
  if (url.includes('access_token') || url.includes('refresh_token')) {
    // Handle auth callback
    console.log('Auth callback received:', url);
  }
});
