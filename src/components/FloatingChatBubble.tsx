import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Dimensions, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { router, usePathname } from 'expo-router';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface FloatingChatBubbleProps {
  isVisible?: boolean;
}

export default function FloatingChatBubble({ isVisible = true }: FloatingChatBubbleProps) {
  const theme = useTheme();
  const pathname = usePathname();
  const [isPressed, setIsPressed] = useState(false);
  const pulseAnim = new Animated.Value(1);

  // Only show bubble when on dashboard
  const isOnDashboard = pathname === '/';
  const isInChatTab = pathname === '/chat';

  const handlePress = () => {
    router.push('/chat');
  };

  const handlePressIn = () => {
    setIsPressed(true);
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  if (!isVisible || !isOnDashboard || isInChatTab) return null;

  return (
    <Animated.View
      style={[
        styles.floatingBubble,
        {
          backgroundColor: isPressed ? theme.colors.primary + 'CC' : theme.colors.primary,
          shadowColor: theme.colors.primary,
          transform: [{ scale: pulseAnim }],
        },
        isPressed && styles.pressedBubble
      ]}
    >
      <TouchableOpacity
        style={styles.touchable}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons 
          name="message-text" 
          size={28} 
          color="white" 
        />
        <View style={styles.notificationBadge}>
          <MaterialCommunityIcons 
            name="circle" 
            size={8} 
            color="#ef4444" 
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  floatingBubble: {
    position: 'absolute',
    bottom: 120, // Position above the tab bar
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    zIndex: 9999,
  },
  touchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  pressedBubble: {
    transform: [{ scale: 0.95 }],
  },
});
