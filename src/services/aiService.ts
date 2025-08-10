import Constants from 'expo-constants';

const DEEPSEEK_API_KEY = Constants.expoConfig?.extra?.deepseekApiKey || 'sk-a48ed3803966441c9a05f28de779b078';
const DEEPSEEK_API_URL = Constants.expoConfig?.extra?.deepseekApiUrl || 'https://api.deepseek.com/v1';

// Simple notification system
let fallbackNotificationShown = false;

export interface AIInsight {
  insight_type: 'emotion' | 'pattern' | 'suggestion' | 'summary';
  content: string;
  confidence_score: number;
  metadata?: any;
}

export interface JournalAnalysis {
  summary: string;
  emotions: string[];
  patterns: string[];
  suggestions: string[];
  overall_sentiment: 'positive' | 'negative' | 'neutral';
  key_themes: string[];
}

export const aiService = {
  // Show fallback notification once per session
  showFallbackNotification() {
    if (!fallbackNotificationShown) {
      console.log('💡 Using local AI analysis (API quota exceeded)');
      fallbackNotificationShown = true;
    }
  },

  // Analyze a single journal entry
  async analyzeJournalEntry(content: string): Promise<JournalAnalysis | null> {
    try {
      const prompt = `Analyze the following journal entry and provide insights in JSON format:

Journal Entry:
"${content}"

Please provide analysis in this exact JSON format:
{
  "summary": "A brief 2-3 sentence summary of the main points",
  "emotions": ["emotion1", "emotion2", "emotion3"],
  "patterns": ["pattern1", "pattern2"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "overall_sentiment": "positive|negative|neutral",
  "key_themes": ["theme1", "theme2", "theme3"]
}

Focus on:
- Emotional state and feelings expressed
- Recurring patterns or themes
- Practical suggestions for improvement
- Overall mood and sentiment
- Key topics or concerns mentioned

Keep suggestions supportive and actionable.`;

      const response = await fetch(`${DEEPSEEK_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 1000,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        if (response.status === 402) {
          this.showFallbackNotification();
          return this.generateFallbackAnalysis(content);
        }
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const analysisText = data.choices[0]?.message?.content;

      if (!analysisText) {
        throw new Error('No analysis received from API');
      }

      // Extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from API');
      }

      const analysis: JournalAnalysis = JSON.parse(jsonMatch[0]);
      return analysis;
    } catch (error) {
      console.error('Error analyzing journal entry:', error);
      return this.generateFallbackAnalysis(content);
    }
  },

  // Generate fallback analysis when API is unavailable
  generateFallbackAnalysis(content: string): JournalAnalysis {
    const words = content.toLowerCase().split(/\s+/);
    const emotions = this.detectEmotions(words);
    const sentiment = this.detectSentiment(words);
    const themes = this.detectThemes(words);
    
    return {
      summary: `You wrote about ${themes.length > 0 ? themes.join(', ') : 'your day'}. This reflection shows ${sentiment} feelings.`,
      emotions: emotions,
      patterns: this.generatePatterns(content),
      suggestions: this.generateSuggestions(sentiment, emotions),
      overall_sentiment: sentiment,
      key_themes: themes
    };
  },

  // Simple emotion detection
  detectEmotions(words: string[]): string[] {
    const emotionKeywords = {
      happy: ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'love', 'loved'],
      sad: ['sad', 'depressed', 'down', 'upset', 'crying', 'tears', 'lonely', 'miss'],
      anxious: ['anxious', 'worried', 'stress', 'stressed', 'nervous', 'fear', 'scared'],
      angry: ['angry', 'mad', 'frustrated', 'annoyed', 'irritated', 'hate'],
      calm: ['calm', 'peaceful', 'relaxed', 'content', 'satisfied', 'okay'],
      tired: ['tired', 'exhausted', 'drained', 'fatigued', 'sleepy']
    };

    const detectedEmotions: string[] = [];
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      if (keywords.some(keyword => words.includes(keyword))) {
        detectedEmotions.push(emotion);
      }
    }

    return detectedEmotions.length > 0 ? detectedEmotions : ['neutral'];
  },

  // Simple sentiment detection
  detectSentiment(words: string[]): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['good', 'great', 'amazing', 'wonderful', 'happy', 'love', 'excited', 'joy'];
    const negativeWords = ['bad', 'terrible', 'awful', 'sad', 'angry', 'hate', 'worried', 'stress'];
    
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  },

  // Simple theme detection
  detectThemes(words: string[]): string[] {
    const themeKeywords = {
      'work': ['work', 'job', 'office', 'meeting', 'project', 'boss', 'colleague'],
      'family': ['family', 'mom', 'dad', 'parent', 'child', 'son', 'daughter', 'sibling'],
      'health': ['health', 'sick', 'doctor', 'exercise', 'gym', 'diet', 'sleep'],
      'relationships': ['friend', 'partner', 'boyfriend', 'girlfriend', 'date', 'relationship'],
      'school': ['school', 'study', 'exam', 'test', 'homework', 'class', 'teacher'],
      'hobbies': ['hobby', 'game', 'music', 'art', 'sport', 'reading', 'cooking']
    };

    const detectedThemes: string[] = [];
    for (const [theme, keywords] of Object.entries(themeKeywords)) {
      if (keywords.some(keyword => words.includes(keyword))) {
        detectedThemes.push(theme);
      }
    }

    return detectedThemes;
  },

  // Generate simple patterns
  generatePatterns(content: string): string[] {
    const patterns: string[] = [];
    if (content.length > 100) patterns.push('detailed reflection');
    if (content.includes('?')) patterns.push('questioning thoughts');
    if (content.includes('!')) patterns.push('strong emotions');
    if (content.toLowerCase().includes('always') || content.toLowerCase().includes('never')) {
      patterns.push('absolute thinking');
    }
    return patterns;
  },

  // Generate suggestions based on sentiment and emotions
  generateSuggestions(sentiment: string, emotions: string[]): string[] {
    const suggestions: string[] = [];
    
    if (sentiment === 'negative' || emotions.includes('sad') || emotions.includes('anxious')) {
      suggestions.push('Take a few deep breaths');
      suggestions.push('Go for a short walk');
      suggestions.push('Talk to someone you trust');
    }
    
    if (emotions.includes('tired')) {
      suggestions.push('Get some rest');
      suggestions.push('Take a short nap');
    }
    
    if (sentiment === 'positive') {
      suggestions.push('Celebrate this moment');
      suggestions.push('Share your joy with others');
    }
    
    suggestions.push('Practice gratitude');
    suggestions.push('Stay hydrated');
    
    return suggestions.slice(0, 3); // Return max 3 suggestions
  },

  // Generate insights from analysis
  async generateInsights(analysis: JournalAnalysis, journalEntryId: string): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];

    try {
      // Summary insight
      if (analysis.summary) {
        insights.push({
          insight_type: 'summary',
          content: analysis.summary,
          confidence_score: 0.9,
          metadata: { source: 'ai_analysis' },
        });
      }

      // Emotion insights
      if (analysis.emotions && analysis.emotions.length > 0) {
        insights.push({
          insight_type: 'emotion',
          content: `You're experiencing: ${analysis.emotions.join(', ')}. This is a natural part of your emotional journey.`,
          confidence_score: 0.8,
          metadata: { emotions: analysis.emotions },
        });
      }

      // Pattern insights
      if (analysis.patterns && analysis.patterns.length > 0) {
        insights.push({
          insight_type: 'pattern',
          content: `I notice some patterns: ${analysis.patterns.join('; ')}. Being aware of these can help you understand yourself better.`,
          confidence_score: 0.7,
          metadata: { patterns: analysis.patterns },
        });
      }

      // Suggestion insights
      if (analysis.suggestions && analysis.suggestions.length > 0) {
        insights.push({
          insight_type: 'suggestion',
          content: `Consider trying: ${analysis.suggestions.join('; ')}. These might help improve your wellbeing.`,
          confidence_score: 0.6,
          metadata: { suggestions: analysis.suggestions },
        });
      }

      return insights;
    } catch (error) {
      console.error('Error generating insights:', error);
      return [];
    }
  },

  // Analyze multiple journal entries for trends
  async analyzeTrends(journalEntries: Array<{ content: string; created_at: string }>): Promise<AIInsight[]> {
    try {
      if (journalEntries.length === 0) {
        return [];
      }

      const recentEntries = journalEntries.slice(0, 5); // Analyze last 5 entries
      const combinedContent = recentEntries.map(entry => entry.content).join('\n\n');

      const prompt = `Analyze these recent journal entries for overall trends and patterns:

${combinedContent}

Provide insights about:
1. Overall emotional trend (improving, declining, or stable)
2. Common themes or recurring topics
3. Potential areas for growth or improvement
4. Positive patterns to continue

Format as JSON:
{
  "trend": "improving|declining|stable",
  "common_themes": ["theme1", "theme2"],
  "growth_areas": ["area1", "area2"],
  "positive_patterns": ["pattern1", "pattern2"]
}`;

      const response = await fetch(`${DEEPSEEK_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 800,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        if (response.status === 402) {
          this.showFallbackNotification();
          return this.generateFallbackTrendInsights(journalEntries);
        }
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const analysisText = data.choices[0]?.message?.content;
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from API');
      }

      const trends = JSON.parse(jsonMatch[0]);
      const insights: AIInsight[] = [];

      // Trend insight
      insights.push({
        insight_type: 'pattern',
        content: `Your overall emotional trend appears to be ${trends.trend}. This suggests your current patterns are ${trends.trend === 'improving' ? 'beneficial' : trends.trend === 'declining' ? 'challenging' : 'stable'}.`,
        confidence_score: 0.7,
        metadata: { trend: trends.trend },
      });

      // Common themes insight
      if (trends.common_themes && trends.common_themes.length > 0) {
        insights.push({
          insight_type: 'pattern',
          content: `You frequently write about: ${trends.common_themes.join(', ')}. These topics seem important to you right now.`,
          confidence_score: 0.8,
          metadata: { themes: trends.common_themes },
        });
      }

      // Growth areas insight
      if (trends.growth_areas && trends.growth_areas.length > 0) {
        insights.push({
          insight_type: 'suggestion',
          content: `Areas you might explore: ${trends.growth_areas.join(', ')}. These could be opportunities for personal development.`,
          confidence_score: 0.6,
          metadata: { growth_areas: trends.growth_areas },
        });
      }

      return insights;
    } catch (error) {
      console.error('Error analyzing trends:', error);
      return this.generateFallbackTrendInsights(journalEntries);
    }
  },

  // Generate fallback trend insights
  generateFallbackTrendInsights(journalEntries: Array<{ content: string; created_at: string }>): AIInsight[] {
    const insights: AIInsight[] = [];
    
    // Analyze all entries for common themes
    const allWords = journalEntries.flatMap(entry => 
      entry.content.toLowerCase().split(/\s+/)
    );
    
    const themes = this.detectThemes(allWords);
    const emotions = this.detectEmotions(allWords);
    const sentiment = this.detectSentiment(allWords);
    
    // Generate trend insight
    insights.push({
      insight_type: 'pattern',
      content: `Based on your recent entries, your emotional state appears ${sentiment}. You've been writing about ${themes.length > 0 ? themes.join(', ') : 'various topics'}.`,
      confidence_score: 0.6,
      metadata: { sentiment, themes },
    });
    
    // Generate theme insight
    if (themes.length > 0) {
      insights.push({
        insight_type: 'pattern',
        content: `You frequently write about: ${themes.join(', ')}. These topics seem important to you right now.`,
        confidence_score: 0.7,
        metadata: { themes },
      });
    }
    
    // Generate suggestion insight
    if (sentiment === 'negative' || emotions.includes('sad') || emotions.includes('anxious')) {
      insights.push({
        insight_type: 'suggestion',
        content: 'Consider practicing self-care activities like deep breathing, going for walks, or talking to someone you trust.',
        confidence_score: 0.5,
        metadata: { suggestion_type: 'self_care' },
      });
    }
    
    return insights;
  },

  // Generate personalized wellness suggestions
  async generateWellnessSuggestions(moodHistory: Array<{ mood_score: number; notes?: string }>, recentJournalContent: string): Promise<string[]> {
    try {
      const averageMood = moodHistory.reduce((sum, entry) => sum + entry.mood_score, 0) / moodHistory.length;
      const lowMoodDays = moodHistory.filter(entry => entry.mood_score <= 2).length;

      const prompt = `Based on this user data, suggest 3-5 personalized wellness activities:

Average mood score: ${averageMood.toFixed(1)}/5
Low mood days (score ≤2): ${lowMoodDays} out of ${moodHistory.length}
Recent journal themes: ${recentJournalContent.substring(0, 200)}...

Provide specific, actionable suggestions that could help improve their wellbeing. Consider their current emotional state and patterns.

Format as JSON array:
["suggestion1", "suggestion2", "suggestion3"]`;

      const response = await fetch(`${DEEPSEEK_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 500,
          temperature: 0.4,
        }),
      });

      if (!response.ok) {
        if (response.status === 402) {
          this.showFallbackNotification();
          return this.generateFallbackWellnessSuggestions(moodHistory, recentJournalContent);
        }
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const suggestionsText = data.choices[0]?.message?.content;
      const jsonMatch = suggestionsText.match(/\[[\s\S]*\]/);
      
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from API');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error generating wellness suggestions:', error);
      return this.generateFallbackWellnessSuggestions(moodHistory, recentJournalContent);
    }
  },

  // Generate fallback wellness suggestions
  generateFallbackWellnessSuggestions(moodHistory: Array<{ mood_score: number; notes?: string }>, recentJournalContent: string): string[] {
    const averageMood = moodHistory.reduce((sum, entry) => sum + entry.mood_score, 0) / moodHistory.length;
    const lowMoodDays = moodHistory.filter(entry => entry.mood_score <= 2).length;
    
    const suggestions: string[] = [];
    
    // Base suggestions
    suggestions.push('Take a 10-minute walk outside');
    suggestions.push('Practice deep breathing for 5 minutes');
    suggestions.push('Write down 3 things you\'re grateful for today');
    
    // Mood-based suggestions
    if (averageMood < 3) {
      suggestions.push('Listen to your favorite uplifting music');
      suggestions.push('Call a friend or family member');
    }
    
    if (lowMoodDays > moodHistory.length * 0.3) { // More than 30% low mood days
      suggestions.push('Consider talking to a mental health professional');
      suggestions.push('Try a new hobby or activity');
    }
    
    // Content-based suggestions
    const words = recentJournalContent.toLowerCase().split(/\s+/);
    if (words.includes('work') || words.includes('stress')) {
      suggestions.push('Take a short break from work');
      suggestions.push('Practice progressive muscle relaxation');
    }
    
    if (words.includes('sleep') || words.includes('tired')) {
      suggestions.push('Establish a consistent sleep schedule');
      suggestions.push('Avoid screens 1 hour before bedtime');
    }
    
    return suggestions.slice(0, 5); // Return max 5 suggestions
  },

  // Analyze mood patterns from notes
  async analyzeMoodPatterns(notes: string[]): Promise<{
    emotions: string[];
    triggers: string[];
    recommendations: string[];
  }> {
    try {
      // Ensure notes is an array and filter out invalid entries
      if (!Array.isArray(notes)) {
        return { emotions: [], triggers: [], recommendations: [] };
      }
      
      const combinedNotes = notes.filter(note => note && note.trim()).join('\n\n');
      if (!combinedNotes) {
        return { emotions: [], triggers: [], recommendations: [] };
      }

      const prompt = `Analyze these mood notes and provide insights:

Notes: ${combinedNotes}

Please provide:
1. Top 3 dominant emotions mentioned
2. Common triggers or causes mentioned
3. 2-3 personalized recommendations for improvement

Format as JSON:
{
  "emotions": ["emotion1", "emotion2", "emotion3"],
  "triggers": ["trigger1", "trigger2", "trigger3"],
  "recommendations": ["recommendation1", "recommendation2"]
}`;

      const response = await fetch(`${DEEPSEEK_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 500,
          temperature: 0.4,
        }),
      });

      if (!response.ok) {
        if (response.status === 402) {
          this.showFallbackNotification();
          return this.generateFallbackMoodAnalysis(notes);
        }
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const analysisText = data.choices[0]?.message?.content;
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from API');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error analyzing mood patterns:', error);
             return this.generateFallbackMoodAnalysis(notes);
     }
   },

   // Analyze journal sentiment comprehensively

  // Analyze journal sentiment comprehensively
  async analyzeJournalSentiment(entries: any[]): Promise<{
    overallSentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    emotions: Array<{ emotion: string; intensity: number }>;
    themes: string[];
  }> {
    try {
      // Ensure entries is an array and filter out invalid entries
      if (!Array.isArray(entries)) {
        return {
          overallSentiment: 'neutral',
          confidence: 0,
          emotions: [],
          themes: []
        };
      }
      
      const validEntries = entries.filter(entry => entry && entry.content);
      const combinedContent = validEntries.map(entry => entry.content).join('\n\n');
      if (!combinedContent) {
        return {
          overallSentiment: 'neutral',
          confidence: 0,
          emotions: [],
          themes: []
        };
      }

      const prompt = `Analyze the sentiment and emotional content of these journal entries:

Content: ${combinedContent}

Please provide:
1. Overall sentiment (positive/negative/neutral)
2. Confidence score (0-1)
3. Top emotions with intensity scores
4. Common themes

Format as JSON:
{
  "overallSentiment": "positive",
  "confidence": 0.85,
  "emotions": [
    {"emotion": "joy", "intensity": 0.8},
    {"emotion": "gratitude", "intensity": 0.6}
  ],
  "themes": ["work", "family", "health"]
}`;

      const response = await fetch(`${DEEPSEEK_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 800,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        if (response.status === 402) {
          this.showFallbackNotification();
          return this.generateFallbackSentimentAnalysis(entries);
        }
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const analysisText = data.choices[0]?.message?.content;
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from API');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error analyzing journal sentiment:', error);
      return this.generateFallbackSentimentAnalysis(entries);
    }
  },

  // Generate comprehensive wellness suggestions
  async generateComprehensiveWellnessSuggestions(): Promise<Array<{
    category: 'mindfulness' | 'exercise' | 'nutrition' | 'sleep' | 'social' | 'stress';
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
    reasoning: string;
  }>> {
    try {
      const prompt = `Generate personalized wellness suggestions based on common mental health best practices.

Please provide 3-4 wellness suggestions across different categories (mindfulness, exercise, nutrition, sleep, social, stress).

Format as JSON:
[
  {
    "category": "mindfulness",
    "suggestion": "Try a 5-minute breathing exercise each morning",
    "priority": "high",
    "reasoning": "Breathing exercises can help reduce stress and improve focus"
  }
]`;

      const response = await fetch(`${DEEPSEEK_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 500,
          temperature: 0.4,
        }),
      });

      if (!response.ok) {
        if (response.status === 402) {
          this.showFallbackNotification();
          return this.generateFallbackComprehensiveWellnessSuggestions();
        }
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const analysisText = data.choices[0]?.message?.content;
      const jsonMatch = analysisText.match(/\[[\s\S]*\]/);
      
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from API');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error generating wellness suggestions:', error);
      return this.generateFallbackComprehensiveWellnessSuggestions();
    }
  },

  // Fallback functions
  generateFallbackMoodAnalysis(notes: string[]): {
    emotions: string[];
    triggers: string[];
    recommendations: string[];
  } {
    // Ensure notes is an array
    if (!Array.isArray(notes)) {
      notes = [];
    }
    
    return {
      emotions: ['neutral', 'calm', 'focused'],
      triggers: ['work stress', 'daily routine', 'social interactions'],
      recommendations: [
        'Practice deep breathing when feeling overwhelmed',
        'Take regular breaks during work',
        'Connect with friends and family regularly'
      ]
    };
  },

  generateFallbackSentimentAnalysis(entries: any[]): {
    overallSentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    emotions: Array<{ emotion: string; intensity: number }>;
    themes: string[];
  } {
    // Ensure entries is an array
    if (!Array.isArray(entries)) {
      entries = [];
    }
    
    return {
      overallSentiment: 'neutral',
      confidence: 0.5,
      emotions: [
        { emotion: 'neutral', intensity: 0.5 },
        { emotion: 'calm', intensity: 0.3 }
      ],
      themes: ['daily life', 'reflection', 'personal growth']
    };
  },

  generateFallbackComprehensiveWellnessSuggestions(): Array<{
    category: 'mindfulness' | 'exercise' | 'nutrition' | 'sleep' | 'social' | 'stress';
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
    reasoning: string;
  }> {
    return [
      {
        category: 'mindfulness',
        suggestion: 'Practice 5 minutes of meditation daily',
        priority: 'high',
        reasoning: 'Meditation can help reduce stress and improve mental clarity'
      },
      {
        category: 'exercise',
        suggestion: 'Take a 20-minute walk outside',
        priority: 'medium',
        reasoning: 'Physical activity releases endorphins and improves mood'
      },
      {
        category: 'sleep',
        suggestion: 'Establish a consistent bedtime routine',
        priority: 'high',
        reasoning: 'Good sleep is essential for mental health and emotional regulation'
      },
      {
        category: 'social',
        suggestion: 'Reach out to a friend or family member',
        priority: 'medium',
        reasoning: 'Social connections provide emotional support and reduce feelings of isolation'
      }
    ];
  },

  // Get therapeutic response for chat
  async getTherapeuticResponse(userMessage: string, conversationHistory: any[]): Promise<{
    response: string;
    type: 'message' | 'suggestion' | 'crisis_warning';
    crisis_detected: boolean;
  }> {
    try {
      // Check for crisis indicators first
      const crisisKeywords = [
        'suicide', 'kill myself', 'want to die', 'end it all', 'no reason to live',
        'self-harm', 'hurt myself', 'cut myself', 'overdose', 'overdosing',
        'can\'t take it anymore', 'life is not worth living', 'better off dead'
      ];
      
      const lowerMessage = userMessage.toLowerCase();
      const crisisDetected = crisisKeywords.some(keyword => 
        lowerMessage.includes(keyword)
      );

      if (crisisDetected) {
        return {
          response: "I'm very concerned about what you're sharing. Your feelings are valid, and you deserve support. Please reach out to a mental health professional immediately. You can call the National Suicide Prevention Lifeline at 988 or text HOME to 741741 for the Crisis Text Line. You're not alone, and there are people who want to help you.",
          type: 'crisis_warning',
          crisis_detected: true
        };
      }

      // Prepare conversation context
      const recentMessages = conversationHistory.slice(-5).map(msg => 
        `${msg.sender}: ${msg.content}`
      ).join('\n');
      
      const prompt = `You are a warm, caring friend who happens to be really good at listening and offering emotional support. Think of yourself as someone who genuinely cares about the person you're talking to.

Previous conversation context:
${recentMessages}

User's current message: ${userMessage}

Respond like a real person would - with warmth, understanding, and genuine care. Be conversational and natural, not clinical or robotic. 

• Show you really hear and understand them
• Validate their feelings without being dismissive
• Offer gentle support and encouragement
• Ask thoughtful questions to help them explore their thoughts
• Be encouraging but realistic
• Use a warm, friendly tone

Remember: You're a supportive friend, not a medical professional. Keep responses under 200 words and focus on being genuinely caring and helpful.`;

      const response = await fetch(`${DEEPSEEK_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        if (response.status === 402) {
          this.showFallbackNotification();
          return this.generateFallbackTherapeuticResponse(userMessage);
        }
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content;

      return {
        response: aiResponse || this.generateFallbackTherapeuticResponse(userMessage).response,
        type: 'message',
        crisis_detected: false
      };
    } catch (error) {
      console.error('Error getting therapeutic response:', error);
      return this.generateFallbackTherapeuticResponse(userMessage);
    }
  },

  // Fallback therapeutic response
  generateFallbackTherapeuticResponse(userMessage: string): {
    response: string;
    type: 'message' | 'suggestion' | 'crisis_warning';
    crisis_detected: boolean;
  } {
    const lowerMessage = userMessage.toLowerCase();
    
    // More human, conversational responses
    if (lowerMessage.includes('sad') || lowerMessage.includes('depressed') || lowerMessage.includes('down')) {
      return {
        response: "Oh, I'm so sorry you're feeling this way. It really sucks when you're down, doesn't it? I want you to know that it's totally okay to feel sad - we all go through rough patches. Sometimes just talking about what's bothering us can help a little. What's been weighing on your mind? I'm here to listen, no judgment at all.",
        type: 'message',
        crisis_detected: false
      };
    }
    
    if (lowerMessage.includes('anxious') || lowerMessage.includes('worried') || lowerMessage.includes('stress')) {
      return {
        response: "Anxiety is the worst, isn't it? It can feel like your mind is running a million miles an hour. I totally get how overwhelming that can be. Have you tried taking a few slow, deep breaths? Sometimes that helps me when I'm feeling wound up. What's got you feeling so anxious right now?",
        type: 'suggestion',
        crisis_detected: false
      };
    }
    
    if (lowerMessage.includes('angry') || lowerMessage.includes('frustrated') || lowerMessage.includes('mad')) {
      return {
        response: "Ugh, I can hear how frustrated you are, and honestly? You have every right to feel that way. Anger is such a draining emotion to carry around. Have you found anything that helps you blow off steam? Sometimes I just need to vent to someone who gets it. What's got you so worked up?",
        type: 'message',
        crisis_detected: false
      };
    }
    
    if (lowerMessage.includes('tired') || lowerMessage.includes('exhausted') || lowerMessage.includes('overwhelmed')) {
      return {
        response: "You sound completely worn out, and honestly? That's totally understandable. Life can be so exhausting sometimes. Have you been able to get any rest? Sometimes we just need to give ourselves permission to slow down and take care of ourselves. What's been draining your energy lately?",
        type: 'message',
        crisis_detected: false
      };
    }
    
    if (lowerMessage.includes('lonely') || lowerMessage.includes('alone') || lowerMessage.includes('isolated')) {
      return {
        response: "I'm so sorry you're feeling lonely. That's such a heavy feeling to carry around. You know what? You're not alone in feeling alone - it's something so many of us struggle with. Have you been able to reach out to anyone lately? Sometimes just a quick text to a friend can help. What's been making you feel so isolated?",
        type: 'message',
        crisis_detected: false
      };
    }
    
    // Default warm, human response
    return {
      response: "Thanks for sharing that with me. I can tell you're going through something tough, and I want you to know I'm here for you. Sometimes just having someone to talk to can make a difference. What's on your mind? I'm all ears, and I promise - no judgment, just support.",
      type: 'message',
      crisis_detected: false
    };
  }
};
