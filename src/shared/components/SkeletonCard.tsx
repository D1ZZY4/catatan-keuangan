import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Platform, type ViewStyle } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';

const ND = Platform.OS !== 'web';

interface SkeletonCardProps {
  height?: number;
  width?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonCard({ height = 80, width, borderRadius = 12, style }: SkeletonCardProps) {
  const { colors } = useTheme();
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: ND }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: ND }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.8] });

  return (
    <Animated.View
      style={[
        styles.base,
        {
          height,
          width: width as number | `${number}%` | undefined,
          borderRadius,
          backgroundColor: colors.bgSurface,
          opacity,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: { overflow: 'hidden' },
});
