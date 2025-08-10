import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { colors, borderRadius, spacing, typography } from '../../theme/designSystem';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: borderRadius.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: disabled ? 0.6 : 1,
    };

    // Size styles
    const sizeStyles: Record<string, ViewStyle> = {
      sm: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        minHeight: 36,
      },
      md: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        minHeight: 44,
      },
      lg: {
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl,
        minHeight: 52,
      },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: colors.primary,
      },
      secondary: {
        backgroundColor: colors.gray100,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.gray300,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      textAlign: 'center',
    };

    const variantTextStyles: Record<string, TextStyle> = {
      primary: {
        color: colors.white,
      },
      secondary: {
        color: colors.gray700,
      },
      outline: {
        color: colors.gray700,
      },
      ghost: {
        color: colors.primary,
      },
    };

    return {
      ...baseTextStyle,
      ...variantTextStyles[variant],
    };
  };

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <ActivityIndicator 
            size="small" 
            color={variant === 'primary' ? colors.white : colors.gray600} 
          />
          <Text style={[getTextStyle(), { marginLeft: spacing.sm }, textStyle]}>
            Loading...
          </Text>
        </>
      );
    }

    return (
      <>
        {icon && iconPosition === 'left' && (
          <Text style={{ marginRight: spacing.sm }}>{icon}</Text>
        )}
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        {icon && iconPosition === 'right' && (
          <Text style={{ marginLeft: spacing.sm }}>{icon}</Text>
        )}
      </>
    );
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

// Specialized Button Components
export const IconButton: React.FC<{
  icon: React.ReactNode;
  onPress?: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
}> = ({ icon, onPress, size = 'md', variant = 'ghost', disabled, style }) => {
  const getIconButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: borderRadius.full,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: disabled ? 0.6 : 1,
    };

    const sizeStyles: Record<string, ViewStyle> = {
      sm: { width: 32, height: 32 },
      md: { width: 40, height: 40 },
      lg: { width: 48, height: 48 },
    };

    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: colors.primary,
      },
      secondary: {
        backgroundColor: colors.gray100,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  return (
    <TouchableOpacity
      style={[getIconButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {icon}
    </TouchableOpacity>
  );
};

export const ChipButton: React.FC<{
  title: string;
  onPress?: () => void;
  selected?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}> = ({ title, onPress, selected = false, disabled, style }) => {
  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: selected ? colors.primary : colors.gray100,
          borderRadius: borderRadius.full,
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.md,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text
        style={{
          color: selected ? colors.white : colors.gray700,
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

