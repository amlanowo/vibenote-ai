import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert, Keyboard, TouchableOpacity, SafeAreaView } from 'react-native';
import { Text, Button, Card, Avatar, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { aiService } from '../../src/services/aiService';
import { chatService } from '../../src/services/chatService';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type: 'message' | 'suggestion' | 'crisis_warning';
}

export default function ChatScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
      // Auto-scroll to bottom when keyboard appears
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 300);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      setIsLoading(true);
      const chatHistory = await chatService.getChatHistory();
      setMessages(chatHistory);
      
      // If no previous messages, show welcome message
      if (chatHistory.length === 0) {
        const welcomeMessage: ChatMessage = {
          id: 'welcome',
          content: "Hello! I'm here to support you on your mental wellness journey. I'm trained to provide empathetic listening, emotional support, and helpful guidance. How are you feeling today?",
          sender: 'ai',
          timestamp: new Date(),
          type: 'message'
        };
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      // Show welcome message even if loading fails
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        content: "Hello! I'm here to support you on your mental wellness journey. I'm trained to provide empathetic listening, emotional support, and helpful guidance. How are you feeling today?",
        sender: 'ai',
        timestamp: new Date(),
        type: 'message'
      };
      setMessages([welcomeMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
      type: 'message'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Get AI response
      const aiResponse = await aiService.getTherapeuticResponse(inputMessage.trim(), messages);
      
      if (aiResponse) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: aiResponse.response,
          sender: 'ai',
          timestamp: new Date(),
          type: aiResponse.type || 'message'
        };

        setMessages(prev => [...prev, aiMessage]);

        // Save conversation to database
        await chatService.saveMessage(userMessage);
        await chatService.saveMessage(aiMessage);

        // Check for crisis indicators
        if (aiResponse.crisis_detected) {
          showCrisisWarning();
        }
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Fallback response
      const fallbackMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I'm here to listen and support you. Could you tell me more about what's on your mind?",
        sender: 'ai',
        timestamp: new Date(),
        type: 'message'
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const showCrisisWarning = () => {
    Alert.alert(
      'Important Notice',
      'If you\'re experiencing thoughts of self-harm or are in crisis, please reach out for professional help immediately:\n\n• National Suicide Prevention Lifeline: 988\n• Crisis Text Line: Text HOME to 741741\n\nI\'m here to support you, but professional help is important for crisis situations.',
      [
        { text: 'I understand', style: 'default' },
        { text: 'Get Help Now', style: 'destructive' }
      ]
    );
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.sender === 'user';
    
    return (
      <View key={message.id} style={[styles.messageContainer, isUser ? styles.userMessage : styles.aiMessage]}>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
          {!isUser && (
            <View style={styles.aiAvatar}>
              <MaterialCommunityIcons name="robot" size={20} color="#6366f1" />
            </View>
          )}
          
          <View style={styles.messageContent}>
            <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
              {message.content}
            </Text>
            
            {message.type === 'suggestion' && (
              <View style={styles.suggestionContainer}>
                <MaterialCommunityIcons name="lightbulb" size={16} color="#f59e0b" />
                <Text style={styles.suggestionText}>Therapeutic Suggestion</Text>
              </View>
            )}
            
            {message.type === 'crisis_warning' && (
              <View style={styles.crisisContainer}>
                <MaterialCommunityIcons name="alert-circle" size={16} color="#ef4444" />
                <Text style={styles.crisisText}>Crisis Support Available</Text>
              </View>
            )}
          </View>
          
          <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.aiTimestamp]}>
            {formatTime(message.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading conversation...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 100}
      >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.aiProfile}>
            <View style={styles.aiAvatarLarge}>
              <MaterialCommunityIcons name="robot" size={24} color="#6366f1" />
            </View>
            <View style={styles.aiInfo}>
              <Text style={styles.aiName}>AI Therapist</Text>
              <Text style={styles.aiStatus}>
                {isTyping ? 'Typing...' : 'Online'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(renderMessage)}
        
        {isTyping && (
          <View style={[styles.messageContainer, styles.aiMessage]}>
            <View style={[styles.messageBubble, styles.aiBubble]}>
              <View style={styles.aiAvatar}>
                <MaterialCommunityIcons name="robot" size={20} color="#6366f1" />
              </View>
              <View style={styles.typingIndicator}>
                <ActivityIndicator size="small" color="#6366f1" />
                <Text style={styles.typingText}>AI is thinking...</Text>
              </View>
            </View>
          </View>
        )}
        
        {/* Scroll to bottom button when keyboard is visible */}
        {isKeyboardVisible && (
          <TouchableOpacity
            style={styles.scrollToBottomButton}
            onPress={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            <MaterialCommunityIcons name="chevron-down" size={24} color="white" />
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Share what's on your mind..."
          placeholderTextColor="#9CA3AF"
          value={inputMessage}
          onChangeText={setInputMessage}
          multiline
          maxLength={500}
          editable={!isTyping}
          textAlignVertical="top"
          returnKeyType="default"
          blurOnSubmit={false}
        />
        <Button
          mode="contained"
          onPress={sendMessage}
          disabled={!inputMessage.trim() || isTyping}
          style={styles.sendButton}
          icon="send"
        >
          Send
        </Button>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFEFE',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEFEFE',
  },
  loadingText: {
    marginTop: 16,
    color: '#64748b',
    fontSize: 16,
  },
  header: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiAvatarLarge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  aiInfo: {
    flex: 1,
  },
  aiName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  aiStatus: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  userBubble: {
    backgroundColor: '#6366f1',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  aiAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageContent: {
    flex: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: 'white',
  },
  aiText: {
    color: '#1e293b',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  aiTimestamp: {
    color: '#64748b',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typingText: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
  },
  suggestionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    padding: 6,
    backgroundColor: '#fef3c7',
    borderRadius: 6,
  },
  suggestionText: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '500',
  },
  crisisContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    padding: 6,
    backgroundColor: '#fee2e2',
    borderRadius: 6,
  },
  crisisText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 40,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 48,
    maxHeight: 120,
    textAlignVertical: 'top',
  },
  sendButton: {
    borderRadius: 20,
    backgroundColor: '#6366f1',
  },
  scrollToBottomButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
