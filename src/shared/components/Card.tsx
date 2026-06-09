import React from 'react';
import { Pressable, View, StyleSheet, type ViewStyle, type StyleProp, type PressableProps } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';

interface CardProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  padding?: number;
  radius?: number;
}

export function Card({ children, style, onPress, padding = 16, radius = 16, ...props }: CardProps) {
  const { colors, shadows } = useTheme();

  const cardBase: ViewStyle = {
    backgroundColor: colors.bgCard,
    borderRadius: radius,
    padding,
    ...shadows.md,
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          cardBase,
          pressed && styles.pressed,
          style,
        ]}
        {...props}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[cardBase, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  pressed: {
    elevation: 1,
    transform: [{ scale: 0.99 }],
  },
});
