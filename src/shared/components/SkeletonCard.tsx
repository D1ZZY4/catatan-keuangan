import React, { useEffect } from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';

interface SkeletonLineProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

function SkeletonLine({
  width = '100%',
  height = 14,
  borderRadius = 6,
  style,
}: SkeletonLineProps): React.ReactElement {
  const { colors } = useTheme();
  const translateX = useSharedValue(-200);

  useEffect(() => {
    const loop = () => {
      translateX.value = withSequence(
        withTiming(400, { duration: 1200, easing: Easing.linear }),
        withTiming(-200, { duration: 0 }),
      );
    };
    loop();
    const interval = setInterval(loop, 1500);
    return () => clearInterval(interval);
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      style={[
        styles.line,
        { width: width as number, height, borderRadius, backgroundColor: colors.bgSurface },
        style,
      ]}
    >
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.shimmer, shimmerStyle]}
      />
    </View>
  );
}

interface SkeletonCardProps {
  rows?: number;
  style?: ViewStyle;
}

export function SkeletonCard({ rows = 3, style }: SkeletonCardProps): React.ReactElement {
  const { colors, shadows } = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.bgCard },
        shadows.card,
        style,
      ]}
    >
      <View style={styles.headerRow}>
        <SkeletonLine width={40} height={40} borderRadius={20} />
        <View style={styles.headerLines}>
          <SkeletonLine width="60%" height={14} />
          <SkeletonLine width="40%" height={10} />
        </View>
      </View>
      {Array.from({ length: rows - 1 }).map((_, i) => (
        <SkeletonLine key={i} width={i % 2 === 0 ? '80%' : '60%'} height={12} style={{ marginTop: 10 }} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  headerLines: {
    flex: 1,
    gap: 6,
  },
  line: {
    overflow: 'hidden',
  },
  shimmer: {
    width: 120,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
});
