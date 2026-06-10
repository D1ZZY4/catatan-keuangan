import React from 'react';
import { TouchableOpacity, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { springPresets } from '../theme/animation';

type HapticStyle = 'light' | 'medium' | 'heavy' | 'selection' | 'none';

interface HapticButtonProps {
  onPress: () => void;
  haptic?: HapticStyle;
  scale?: number;
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityRole?: 'button' | 'link' | 'tab';
  children: React.ReactNode;
}

export function HapticButton({
  onPress,
  haptic = 'light',
  scale: targetScale = 0.97,
  disabled = false,
  style,
  accessibilityLabel,
  accessibilityRole = 'button',
  children,
}: HapticButtonProps): React.ReactElement {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const triggerHaptic = async () => {
    if (haptic === 'none') return;
    if (haptic === 'selection') {
      await Haptics.selectionAsync();
    } else {
      const map = {
        light: Haptics.ImpactFeedbackStyle.Light,
        medium: Haptics.ImpactFeedbackStyle.Medium,
        heavy: Haptics.ImpactFeedbackStyle.Heavy,
      } as const;
      await Haptics.impactAsync(map[haptic]);
    }
  };

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        onPress={() => {
          void triggerHaptic();
          onPress();
        }}
        onPressIn={() => {
          if (!disabled) scale.value = withSpring(targetScale, springPresets.snappy);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, springPresets.snappy);
        }}
        disabled={disabled}
        style={[styles.btn, style]}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole}
        activeOpacity={1}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
