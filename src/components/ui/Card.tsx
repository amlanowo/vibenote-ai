import React from 'react';
import { View, ViewStyle, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, borderRadius, shadows, spacing } from '../../theme/designSystem';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  backgroundColor?: string;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = 'lg',
  backgroundColor,
  onPress,
}) => {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: backgroundColor || colors.white,
      borderRadius: borderRadius.lg,
      padding: spacing[padding],
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          ...shadows.lg,
        };
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: colors.gray200,
        };
      default:
        return {
          ...baseStyle,
          ...shadows.md,
        };
    }
  };

  if (onPress) {
    return (
      <TouchableOpacity style={[getCardStyle(), style]} onPress={onPress} activeOpacity={0.8}>
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[getCardStyle(), style]}>
      {children}
    </View>
  );
};

// Specialized Card Components
export const StatusCard: React.FC<{
  children: React.ReactNode;
  status: 'success' | 'warning' | 'error' | 'info';
  style?: ViewStyle;
}> = ({ children, status, style }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success': return colors.success;
      case 'warning': return colors.warning;
      case 'error': return colors.error;
      case 'info': return colors.primary;
      default: return colors.gray200;
    }
  };

  return (
    <Card
      style={[
        {
          borderLeftWidth: 4,
          borderLeftColor: getStatusColor(),
        },
        style,
      ]}
    >
      {children}
    </Card>
  );
};

export const InteractiveCard: React.FC<{
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  active?: boolean;
}> = ({ children, onPress, style, active = false }) => {
  return (
    <Card
      style={[
        {
          backgroundColor: active ? colors.gray50 : colors.white,
          borderWidth: active ? 2 : 0,
          borderColor: colors.primary,
        },
        style,
      ]}
    >
      {children}
    </Card>
  );
};
