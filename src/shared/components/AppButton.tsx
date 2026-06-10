import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { AppText } from './AppText';
import { AppIcon } from './AppIcon';
import { useTheme } from '../theme/ThemeContext';
import { springPresets } from '../theme/animation';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
}: AppButtonProps): React.ReactElement {
  const { colors, radius } = useTheme();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePressIn(): void {
    scale.value = withSpring(0.96, springPresets.snappy);
  }
  function handlePressOut(): void {
    scale.value = withSpring(1, springPresets.snappy);
  }

  const sizeMap: Record<ButtonSize, { height: number; fontSize: number; paddingH: number; iconSize: number }> = {
    sm: { height: 36, fontSize: 13, paddingH: 16, iconSize: 14 },
    md: { height: 44, fontSize: 15, paddingH: 20, iconSize: 18 },
    lg: { height: 52, fontSize: 16, paddingH: 24, iconSize: 20 },
  };

  const sizeConfig = sizeMap[size];

  const bg: Record<ButtonVariant, string> = {
    primary: colors.accentPrimary,
    secondary: colors.bgSurface,
    ghost: 'transparent',
    danger: colors.danger,
  };

  const textColor: Record<ButtonVariant, string> = {
    primary: '#1A1814',
    secondary: colors.textPrimary,
    ghost: colors.accentPrimary,
    danger: '#FFF',
  };

  const containerStyle: ViewStyle = {
    height: sizeConfig.height,
    paddingHorizontal: sizeConfig.paddingH,
    backgroundColor: disabled ? colors.bgSurface : bg[variant],
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...(fullWidth ? { width: '100%' } : {}),
    ...(variant === 'secondary'
      ? { borderWidth: 1, borderColor: colors.border }
      : {}),
    ...style,
  };

  const labelStyle: TextStyle = {
    fontSize: sizeConfig.fontSize,
    color: disabled ? colors.textMuted : textColor[variant],
    fontFamily: 'DMSans-SemiBold',
  };

  const iconColor = disabled ? colors.textMuted : textColor[variant];

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={1}
      style={[animStyle, containerStyle]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : (
        <>
          {icon !== undefined && iconPosition === 'left' && (
            <AppIcon name={icon} size={sizeConfig.iconSize} color={iconColor} />
          )}
          <AppText style={labelStyle}>{label}</AppText>
          {icon !== undefined && iconPosition === 'right' && (
            <AppIcon name={icon} size={sizeConfig.iconSize} color={iconColor} />
          )}
        </>
      )}
    </AnimatedTouchable>
  );
}
