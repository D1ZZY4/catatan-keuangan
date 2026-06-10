import React, { useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AppText } from './AppText';
import { AppIcon } from './AppIcon';
import { SparklineChart } from './SparklineChart';
import { useTheme } from '../theme/ThemeContext';
import { formatCurrency } from '../utils/formatters';
import { springPresets } from '../theme/animation';

interface WalletCardProps {
  id: string;
  name: string;
  icon: string;
  color: string;
  currency: string;
  balance: number;
  isArchived?: boolean;
  sparkline?: number[];
  convertedLabel?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
}

export function WalletCard({
  name,
  icon,
  color,
  currency,
  balance,
  isArchived = false,
  sparkline,
  convertedLabel,
  onPress,
  onLongPress,
  style,
}: WalletCardProps): React.ReactElement {
  const { colors, shadows } = useTheme();
  const scale = useSharedValue(1);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, springPresets.snappy);
    didLongPress.current = false;
    if (onLongPress !== undefined) {
      longPressTimer.current = setTimeout(() => {
        didLongPress.current = true;
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress();
      }, 500);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springPresets.snappy);
    if (longPressTimer.current !== null) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handlePress = () => {
    if (didLongPress.current) return;
    onPress?.();
  };

  const iconBg = `${color}22`;

  return (
    <Animated.View style={[animStyle, style]}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={`Dompet ${name}: ${formatCurrency(balance, currency)}`}
        style={[
          styles.card,
          {
            backgroundColor: colors.bgCard,
            opacity: isArchived ? 0.6 : 1,
          },
          shadows.card,
        ]}
      >
        <View style={styles.topRow}>
          <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
            <AppIcon name={icon} size={18} color={color} />
          </View>
          <View style={[styles.currencyBadge, { backgroundColor: colors.bgPage }]}>
            <AppText
              variant="labelSmall"
              color={colors.textMuted}
              style={styles.currencyText}
            >
              {currency}
            </AppText>
          </View>
        </View>

        <AppText
          variant="labelSmall"
          color={colors.textMuted}
          numberOfLines={1}
          style={styles.walletName}
        >
          {name}
        </AppText>

        <AppText
          variant="headingSmall"
          color={colors.textPrimary}
          numberOfLines={1}
          style={styles.balance}
        >
          {formatCurrency(balance, currency)}
        </AppText>

        {convertedLabel !== undefined && (
          <AppText variant="labelSmall" color={colors.textMuted} style={styles.converted}>
            {convertedLabel}
          </AppText>
        )}

        {sparkline !== undefined && sparkline.length >= 2 && (
          <View style={styles.sparklineWrap}>
            <SparklineChart data={sparkline} color={color} width={80} height={32} />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencyBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  currencyText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  walletName: {
    marginBottom: 2,
  },
  balance: {
    fontSize: 18,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
  },
  converted: {
    marginTop: 2,
  },
  sparklineWrap: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
});
