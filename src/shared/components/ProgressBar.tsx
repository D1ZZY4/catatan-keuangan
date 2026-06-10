import React, { useEffect } from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { AppText } from './AppText';
import { useTheme } from '../theme/ThemeContext';
import { timingPresets } from '../theme/animation';

type ProgressHeight = 'sm' | 'md' | 'lg';

interface ProgressBarProps {
  value: number;
  max: number;
  height?: ProgressHeight;
  showPercentage?: boolean;
  label?: string;
  style?: ViewStyle;
  className?: string;
}

const HEIGHT_MAP: Record<ProgressHeight, number> = {
  sm: 4,
  md: 8,
  lg: 12,
};

export function ProgressBar({
  value,
  max,
  height = 'md',
  showPercentage = false,
  label,
  style,
}: ProgressBarProps): React.ReactElement {
  const { colors } = useTheme();
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const isOver = max > 0 && value > max;
  const isWarning = pct >= 80 && !isOver;

  const barColor = isOver
    ? colors.danger
    : isWarning
    ? colors.warning
    : colors.accentPrimary;

  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(pct, timingPresets.normal);
  }, [pct]);

  const animStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  const h = HEIGHT_MAP[height];

  return (
    <View style={[styles.wrapper, style]}>
      {(label !== undefined || showPercentage) && (
        <View style={styles.labelRow}>
          {label !== undefined && (
            <AppText variant="labelSmall" color={colors.textMuted}>
              {label}
            </AppText>
          )}
          {showPercentage && (
            <AppText
              variant="labelSmall"
              color={isOver ? colors.danger : isWarning ? colors.warning : colors.textMuted}
              style={styles.pctText}
            >
              {Math.round(pct)}%
            </AppText>
          )}
        </View>
      )}
      <View
        style={[
          styles.track,
          {
            height: h,
            borderRadius: h / 2,
            backgroundColor: colors.bgSurface,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.fill,
            animStyle,
            {
              height: h,
              borderRadius: h / 2,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  track: {
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    minWidth: 4,
  },
  pctText: {
    fontVariant: ['tabular-nums'],
  },
});
