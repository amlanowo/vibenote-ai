import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "VibeNoteAI",
  slug: "vibenoteai",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    supportsTablet: true
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    package: "com.vibenoteai.mentalwellness"
  },
  web: {
    favicon: "./assets/favicon.png"
  },
  scheme: "vibenoteai",
  plugins: [
    "expo-dev-client"
  ],
  extra: {
    supabaseUrl: "https://fowwqwnxlslrwyiomojl.supabase.co",
    supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvd3dxd254bHNscnd5aW9tb2psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2Mzc1ODAsImV4cCI6MjA3MDIxMzU4MH0.wAgc4JcZXPmLBfoX31obgnNCkyiusoN77sBy5tWO4T4",
    deepseekApiKey: "sk-a48ed3803966441c9a05f28de779b078",
    deepseekApiUrl: "https://api.deepseek.com/v1",
    router: {},
    eas: {
      projectId: "2df9cdc5-c9c5-4aff-b5e7-4c08a6f2fa18"
    }
  }
});

