# 🧘‍♀️ VibeNote - Mental Wellbeing App

> **Track your mood. Know yourself better.**

## 📋 Table of Contents

- [Overview](#-overview)
- [App Flow](#-app-flow)
- [Core Features](#-core-features)
- [Technical Architecture](#-technical-architecture)
- [Optional Enhancements](#-optional-enhancements)
- [Project Structure](#-project-structure)

---

## 🎯 Overview

**VibeNote** is a mobile application designed to promote mental wellbeing through intelligent mood tracking, reflective journaling, and AI-powered insights. The app encourages emotional awareness, self-reflection, and healthier habits through a clean, focused user experience.

### Tech Stack
- **Frontend**: React Native with TypeScript, Expo, and Expo Router
- **Backend/Database**: Supabase (PostgreSQL)
- **UI Framework**: React Native Paper
- **AI Processing**: DeepSeek API
- **State Management**: Zustand or Redux Toolkit
- **Navigation**: Expo Router (file-based routing)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime subscriptions
- **Storage**: Supabase Storage for media files
- **Push Notifications**: Expo Notifications

### Key Objectives
- **Mood Awareness**: Help users track and understand their emotional patterns
- **Reflective Journaling**: Provide a safe space for daily reflection and self-expression
- **AI-Powered Insights**: Offer personalized wellness suggestions and trend analysis
- **Mindful Living**: Encourage healthy habits and stress management

---

## 🧭 App Flow

### 1. 🚀 Welcome & Onboarding

#### Welcome Screen
- Clean, minimalist UI with app logo and tagline
- **Primary Actions**:
  - Sign Up (email-based registration)
  - Log In (existing user authentication)
- **Optional**: Brief feature introduction carousel

#### Authentication Flow
- Email-based authentication (Supabase Auth)
- Secure password requirements
- Social login options (Google, Apple)

#### Onboarding Experience
- **Privacy Policy**: Clear data usage and privacy information
- **Feature Introduction**: Quick overview of core capabilities
- **Permission Requests**: Notifications, storage access
- **Initial Setup**: First mood check-in and journal entry

### 2. 🏠 Main Dashboard

The central hub for daily interactions and quick access to all features.

#### Dashboard Components
- **Today's Mood Status**: Current mood display or check-in prompt
- **Quick Actions**: 
  - New Journal Entry
  - Mood Check-in
  - View Calendar
- **Mood Trends Preview**: Mini chart showing recent mood patterns
- **Wellness Tip of the Day**: Curated advice based on user patterns
- **Navigation Menu**: Bottom tab bar or drawer navigation

#### Dashboard States
- **First Visit**: Guided tour and initial setup
- **Daily Return**: Quick mood check-in prompt
- **Regular Use**: Overview of recent activity and insights

---

## 🌤️ Core Features

### 3. 😌 Daily Mood Check-In

#### Purpose
Capture daily emotional state with minimal friction and maximum insight.

#### Implementation
- **Emoji-Based Scale**: 5-point mood scale (😞 😐 🙂 😃 😍)
- **Optional Context**: Brief notes field for mood triggers
- **Smart Triggers**: 
  - App launch (if no check-in today)
  - Manual "New Check-In" button
  - Custom reminder notifications

#### User Experience
1. Select mood emoji
2. Add optional context notes
3. Save → automatically opens journal entry screen
4. View mood history and patterns

### 4. 📓 Smart Journal (AI-Powered)

#### Purpose
Transform daily reflections into actionable insights through intelligent analysis.

#### Core Functionality
- **Text Input**: Rich text editor for journal entries
- **AI Analysis**: Post-submission processing
- **Insight Generation**: Personalized feedback and suggestions

#### AI-Powered Features
- **Emotional Analysis**: Sentiment detection and mood correlation
- **Theme Detection**: Identify recurring topics (work stress, relationships, etc.)
- **Personalized Suggestions**: Context-aware wellness recommendations
- **Pattern Recognition**: Long-term emotional trend analysis

#### Example AI Responses
```
"Based on your recent entries, you've been feeling stressed about work deadlines. 
Consider trying a 5-minute breathing exercise before starting your day."
```

### 5. 📊 Mood Analytics & Trends

#### Purpose
Visualize emotional patterns and provide data-driven insights.

#### Features
- **Calendar View**: Monthly mood overview with color-coded indicators
- **Trend Charts**: Line graphs showing mood progression over time
- **Pattern Analysis**: Identify recurring low/high mood periods
- **Correlation Insights**: Link mood patterns to activities or events

#### Data Visualization
- **Daily View**: Individual day mood and journal summary
- **Weekly Trends**: 7-day mood patterns
- **Monthly Overview**: Long-term emotional journey
- **Custom Date Ranges**: Flexible time period analysis

### 6. 🌿 Wellness Tips & Resources

#### Purpose
Provide personalized wellness guidance and educational content.

#### Content Categories
- **Breathing Exercises**: Guided breathing techniques
- **Mindfulness Practices**: Meditation and awareness exercises
- **Stress Management**: Coping strategies and relaxation techniques
- **Productivity Tips**: Focus and time management advice
- **Positive Affirmations**: Daily encouragement and motivation

#### Personalization
- **Mood-Based Recommendations**: Content tailored to current emotional state
- **Pattern Recognition**: Suggestions based on recurring themes
- **Progress Tracking**: Wellness goal setting and achievement monitoring

---

## 🛠️ Technical Architecture

### Technology Stack
- **Frontend**: React Native with TypeScript, Expo, and Expo Router
- **Backend**: Supabase (PostgreSQL database, authentication, real-time)
- **AI Services**: DeepSeek API for intelligent insights
- **Storage**: Supabase Storage + AsyncStorage for offline support
- **Analytics**: Supabase Analytics + custom event tracking

### Security & Privacy
- **Data Encryption**: End-to-end encryption for journal entries
- **Local Storage**: Sensitive data stored on-device
- **Privacy Controls**: User-configurable data sharing preferences
- **GDPR Compliance**: Full data portability and deletion rights

### Performance Considerations
- **Offline Support**: Core functionality available without internet
- **Data Sync**: Background synchronization when online
- **Battery Optimization**: Efficient background processing
- **Storage Management**: Automatic cleanup of old data

---

## 🚀 Optional Enhancements

### 🎙️ Voice Journal Input
- **Speech-to-Text**: Native platform APIs for voice input
- **Voice Commands**: Hands-free journal entry creation
- **Audio Playback**: Review past voice entries

### 💬 Smart Notifications
- **Daily Affirmations**: Personalized positive messages
- **Journaling Prompts**: Thought-provoking questions
- **Mood Check Reminders**: Gentle nudges for emotional awareness
- **Wellness Alerts**: Stress detection and intervention suggestions

### ⏰ Custom Reminders & Scheduling
- **Flexible Scheduling**: Custom reminder times and frequencies
- **Smart Timing**: AI-suggested optimal check-in times
- **Goal Setting**: Wellness milestone tracking and celebration

### 🌙 Theme & Accessibility
- **Dark/Light Mode**: Automatic and manual theme switching
- **Accessibility Features**: Screen reader support, high contrast modes
- **Customization**: Personalized color schemes and layouts

### 🔒 Advanced Privacy Features
- **Biometric Lock**: Secure app access with fingerprint/face ID
- **Data Export**: Complete data portability
- **Selective Sync**: Choose what data to sync to cloud
- **Incognito Mode**: Temporary private journaling sessions

---

## 📊 Database Schema

### Core Tables

#### 1. `users` Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  timezone VARCHAR(50) DEFAULT 'UTC',
  notification_preferences JSONB DEFAULT '{}',
  privacy_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);
```

#### 2. `mood_entries` Table
```sql
CREATE TABLE mood_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 5),
  mood_emoji VARCHAR(10) NOT NULL,
  context_notes TEXT,
  location_data JSONB,
  weather_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, DATE(created_at))
);
```

#### 3. `journal_entries` Table
```sql
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mood_entry_id UUID REFERENCES mood_entries(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  word_count INTEGER DEFAULT 0,
  sentiment_score DECIMAL(3,2),
  themes JSONB DEFAULT '[]',
  tags TEXT[],
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 4. `ai_insights` Table
```sql
CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
  insight_type VARCHAR(50) NOT NULL, -- 'sentiment', 'theme', 'suggestion', 'pattern'
  content TEXT NOT NULL,
  confidence_score DECIMAL(3,2),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 5. `wellness_tips` Table
```sql
CREATE TABLE wellness_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'breathing', 'mindfulness', 'stress', 'productivity', 'affirmations'
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  duration_minutes INTEGER,
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 6. `user_wellness_activities` Table
```sql
CREATE TABLE user_wellness_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  wellness_tip_id UUID REFERENCES wellness_tips(id) ON DELETE SET NULL,
  activity_type VARCHAR(50) NOT NULL,
  duration_minutes INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  mood_before INTEGER CHECK (mood_before >= 1 AND mood_before <= 5),
  mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 5)
);
```

#### 7. `reminders` Table
```sql
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  reminder_type VARCHAR(50) NOT NULL, -- 'mood_check', 'journal', 'wellness', 'custom'
  frequency VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'custom'
  time_of_day TIME,
  days_of_week INTEGER[], -- 0=Sunday, 1=Monday, etc.
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 8. `mood_patterns` Table
```sql
CREATE TABLE mood_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  pattern_type VARCHAR(50) NOT NULL, -- 'weekly', 'monthly', 'seasonal', 'trigger_based'
  pattern_data JSONB NOT NULL,
  confidence_score DECIMAL(3,2),
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);
```

### Database Functions & Triggers

#### Update Timestamp Trigger
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mood_entries_updated_at BEFORE UPDATE ON mood_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON journal_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON reminders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### Word Count Function
```sql
CREATE OR REPLACE FUNCTION calculate_word_count(text_content TEXT)
RETURNS INTEGER AS $$
BEGIN
    RETURN array_length(regexp_split_to_array(trim(text_content), '\s+'), 1);
END;
$$ LANGUAGE plpgsql;
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wellness_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_patterns ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage own mood entries" ON mood_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own journal entries" ON journal_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own ai insights" ON ai_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own wellness activities" ON user_wellness_activities FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own reminders" ON reminders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own mood patterns" ON mood_patterns FOR SELECT USING (auth.uid() = user_id);

-- Wellness tips are public (read-only)
CREATE POLICY "Anyone can view wellness tips" ON wellness_tips FOR SELECT USING (is_active = true);
```

---

## 📁 Project Structure

```plaintext
vibenote-ai/
├── app/                                    # Expo Router (file-based routing)
│   ├── (auth)/                             # Authentication routes
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   ├── forgot-password.tsx
│   │   └── _layout.tsx
│   ├── (tabs)/                             # Main app tabs
│   │   ├── index.tsx                       # Dashboard
│   │   ├── mood/                           # Mood tracking
│   │   │   ├── index.tsx
│   │   │   ├── checkin.tsx
│   │   │   └── history.tsx
│   │   ├── journal/                        # Journaling
│   │   │   ├── index.tsx
│   │   │   ├── [id].tsx                    # Individual entry
│   │   │   └── new.tsx
│   │   ├── analytics/                      # Mood analytics
│   │   │   ├── index.tsx
│   │   │   └── trends.tsx
│   │   ├── wellness/                       # Wellness tips
│   │   │   ├── index.tsx
│   │   │   ├── [id].tsx
│   │   │   └── breathing.tsx
│   │   └── settings/                       # App settings
│   │       ├── index.tsx
│   │       ├── profile.tsx
│   │       ├── privacy.tsx
│   │       └── notifications.tsx
│   ├── _layout.tsx                         # Root layout
│   ├── index.tsx                           # Entry point
│   └── +not-found.tsx                      # 404 page
│
├── src/
│   ├── components/                         # Reusable Components
│   │   ├── ui/                             # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Loading.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── mood/                           # Mood-related components
│   │   │   ├── MoodSelector.tsx
│   │   │   ├── MoodChart.tsx
│   │   │   ├── MoodCalendar.tsx
│   │   │   └── MoodCard.tsx
│   │   ├── journal/                        # Journal components
│   │   │   ├── JournalInput.tsx
│   │   │   ├── JournalCard.tsx
│   │   │   ├── JournalList.tsx
│   │   │   └── AIInsightCard.tsx
│   │   ├── wellness/                       # Wellness components
│   │   │   ├── WellnessTipCard.tsx
│   │   │   ├── BreathingTimer.tsx
│   │   │   └── ActivityTracker.tsx
│   │   └── analytics/                      # Analytics components
│   │       ├── TrendChart.tsx
│   │       ├── MoodHeatmap.tsx
│   │       └── StatsCard.tsx
│   │
│   ├── hooks/                              # Custom React Hooks
│   │   ├── useAuth.ts
│   │   ├── useMood.ts
│   │   ├── useJournal.ts
│   │   ├── useWellness.ts
│   │   ├── useSupabase.ts
│   │   └── useNotifications.ts
│   │
│   ├── services/                           # Business Logic & API
│   │   ├── supabase/                       # Supabase client & config
│   │   │   ├── client.ts
│   │   │   ├── auth.ts
│   │   │   └── database.ts
│   │   ├── api/                            # API services
│   │   │   ├── mood.ts
│   │   │   ├── journal.ts
│   │   │   ├── wellness.ts
│   │   │   └── ai.ts
│   │   ├── storage/                        # Local storage
│   │   │   ├── asyncStorage.ts
│   │   │   └── secureStore.ts
│   │   └── notifications/                  # Push notifications
│   │       ├── expoNotifications.ts
│   │       └── reminderService.ts
│   │
│   ├── stores/                             # State Management (Zustand)
│   │   ├── authStore.ts
│   │   ├── moodStore.ts
│   │   ├── journalStore.ts
│   │   ├── wellnessStore.ts
│   │   └── settingsStore.ts
│   │
│   ├── types/                              # TypeScript Types
│   │   ├── database.ts                     # Generated from Supabase
│   │   ├── api.ts
│   │   ├── navigation.ts
│   │   └── common.ts
│   │
│   ├── utils/                              # Utility Functions
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   ├── validators.ts
│   │   ├── dateUtils.ts
│   │   ├── encryption.ts
│   │   └── analytics.ts
│   │
│   ├── theme/                              # Design System
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── index.ts
│   │
│   └── config/                             # App Configuration
│       ├── app.config.ts
│       ├── supabase.config.ts
│       └── deepseek.config.ts
│
├── assets/                                 # Static Assets
│   ├── images/
│   │   ├── logo.png
│   │   ├── onboarding/
│   │   └── wellness/
│   ├── icons/
│   │   ├── mood/
│   │   └── wellness/
│   ├── fonts/
│   │   └── custom-fonts/
│   └── animations/
│       └── lottie/
│
├── docs/                                   # Documentation
│   ├── api/
│   ├── deployment/
│   └── CONTEXT.md
│
├── tests/                                  # Test Files
│   ├── unit/
│   │   ├── services/
│   │   ├── utils/
│   │   └── stores/
│   ├── integration/
│   │   ├── api/
│   │   └── navigation/
│   └── e2e/
│       └── cypress/
│
├── scripts/                                # Build & Deployment Scripts
│   ├── build.ts
│   ├── deploy.ts
│   └── generate-types.ts
│
├── .env.example                            # Environment variables template
├── app.json                               # Expo configuration
├── package.json                           # Dependencies
├── tsconfig.json                          # TypeScript configuration
├── babel.config.js                        # Babel configuration
├── metro.config.js                        # Metro bundler configuration
├── tailwind.config.js                     # Tailwind CSS configuration (if using)
├── supabase/                              # Supabase configuration
│   ├── config.toml
│   ├── migrations/
│   └── seed.sql
├── README.md                              # Project Documentation
└── CONTEXT.md                             # This File
```

---

## 🎨 Design Principles

### User Experience
- **Minimalist Design**: Clean, uncluttered interface
- **Intuitive Navigation**: Logical flow and clear call-to-actions
- **Emotional Safety**: Non-judgmental, supportive tone
- **Accessibility**: Inclusive design for all users

### Visual Design
- **Color Psychology**: Calming, therapeutic color palette
- **Typography**: Readable, friendly font choices
- **Micro-interactions**: Subtle animations for engagement
- **Responsive Design**: Adapts to different screen sizes

### Content Strategy
- **Positive Framing**: Encouraging, supportive language
- **Educational Value**: Evidence-based wellness information
- **Personalization**: Tailored content based on user patterns
- **Cultural Sensitivity**: Inclusive and diverse perspectives

---

## 📈 Success Metrics

### User Engagement
- Daily active users (DAU)
- Mood check-in completion rate
- Journal entry frequency
- Feature adoption rates

### User Satisfaction
- App store ratings and reviews
- User feedback and surveys
- Retention rates (7-day, 30-day, 90-day)
- Feature usage analytics

### Mental Health Impact
- User-reported mood improvements
- Stress reduction indicators
- Wellness goal achievement rates
- Positive behavioral changes

---

## 🔮 Future Roadmap

### Phase 1: Core Features (MVP)
- Basic mood tracking and journaling
- Simple analytics and trends
- Essential wellness tips
- User authentication and data storage

### Phase 2: AI Integration
- Smart journal analysis
- Personalized insights
- Pattern recognition
- Predictive mood forecasting

### Phase 3: Advanced Features
- Voice journaling
- Social features (optional)
- Integration with health apps
- Professional therapist connections

### Phase 4: Platform Expansion
- Web application
- Smartwatch integration
- API for third-party integrations
- Enterprise wellness solutions

---

## 📞 Support & Resources

### Development Team
- **Product Manager**: [Name]
- **Lead Developer**: [Name]
- **UI/UX Designer**: [Name]
- **AI/ML Engineer**: [Name]

### Documentation
- [API Documentation](./api/README.md)
- [Design System](./design/README.md)
- [Testing Guide](./test/README.md)
- [Deployment Guide](./deploy/README.md)

### External Resources
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router Documentation](https://expo.github.io/router/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Native Paper Documentation](https://callstack.github.io/react-native-paper/)
- [DeepSeek API Documentation](https://platform.deepseek.com/docs)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Mental Health Guidelines](https://www.who.int/health-topics/mental-health)

---

*Last updated: [Current Date]*
*Version: 1.0.0*
