import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing, typography } from '../../theme/designSystem';

interface ProgressBarProps {
  progress: number; // 0-100
  total?: number;
  current?: number;
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  showLabel?: boolean;
  label?: string;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  total,
  current,
  height = 8,
  backgroundColor = colors.gray200,
  progressColor = colors.primary,
  showLabel = false,
  label,
  style,
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <View style={[{ marginVertical: spacing.sm }, style]}>
      {showLabel && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
          <Text style={{
            fontSize: typography.fontSize.sm,
            color: colors.gray600,
            fontWeight: typography.fontWeight.medium,
          }}>
            {label || 'Progress'}
          </Text>
          {total && current && (
            <Text style={{
              fontSize: typography.fontSize.sm,
              color: colors.gray600,
              fontWeight: typography.fontWeight.medium,
            }}>
              {current}/{total}
            </Text>
          )}
        </View>
      )}
      <View
        style={{
          height,
          backgroundColor,
          borderRadius: borderRadius.full,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${clampedProgress}%`,
            height: '100%',
            backgroundColor: progressColor,
            borderRadius: borderRadius.full,
          }}
        />
      </View>
    </View>
  );
};

interface CircularProgressProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  backgroundColor?: string;
  progressColor?: string;
  showPercentage?: boolean;
  label?: string;
  style?: ViewStyle;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 80,
  strokeWidth = 8,
  backgroundColor = colors.gray200,
  progressColor = colors.primary,
  showPercentage = false,
  label,
  style,
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  return (
    <View style={[{ alignItems: 'center' }, style]}>
      <View style={{ position: 'relative', width: size, height: size }}>
        {/* Background circle */}
        <View
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor,
          }}
        />
        
        {/* Progress circle */}
        <View
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: progressColor,
            borderTopColor: 'transparent',
            borderRightColor: 'transparent',
            transform: [{ rotate: '-90deg' }],
          }}
        />
        
        {/* Center content */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {showPercentage && (
            <Text style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.bold,
              color: colors.gray800,
            }}>
              {Math.round(clampedProgress)}%
            </Text>
          )}
        </View>
      </View>
      
      {label && (
        <Text style={{
          fontSize: typography.fontSize.sm,
          color: colors.gray600,
          marginTop: spacing.sm,
          textAlign: 'center',
        }}>
          {label}
        </Text>
      )}
    </View>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  backgroundColor = colors.white,
  style,
}) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return colors.success;
      case 'down': return colors.error;
      default: return colors.gray500;
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      default: return '→';
    }
  };

  return (
    <View
      style={[
        {
          backgroundColor,
          borderRadius: borderRadius.lg,
          padding: spacing.lg,
          ...style,
        },
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: typography.fontSize.sm,
            color: colors.gray600,
            fontWeight: typography.fontWeight.medium,
            marginBottom: spacing.xs,
          }}>
            {title}
          </Text>
          
          <Text style={{
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.gray900,
            marginBottom: spacing.xs,
          }}>
            {value}
          </Text>
          
          {subtitle && (
            <Text style={{
              fontSize: typography.fontSize.sm,
              color: colors.gray500,
            }}>
              {subtitle}
            </Text>
          )}
          
          {trend && trendValue && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs }}>
              <Text style={{ fontSize: typography.fontSize.xs, marginRight: spacing.xs }}>
                {getTrendIcon()}
              </Text>
              <Text style={{
                fontSize: typography.fontSize.xs,
                color: getTrendColor(),
                fontWeight: typography.fontWeight.medium,
              }}>
                {trendValue}
              </Text>
            </View>
          )}
        </View>
        
        {icon && (
          <View style={{ marginLeft: spacing.md }}>
            {icon}
          </View>
        )}
      </View>
    </View>
  );
};

