import React, { useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  PanResponder,
  Animated as RNAnimated,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { AppText } from './AppText';
import { AppIcon } from './AppIcon';
import { useTheme } from '../theme/ThemeContext';
import { formatCurrency, formatDateShort } from '../utils/formatters';
import { AppLabels } from '../config/labels';
import type { TransactionType } from '../types';

const DELETE_ZONE = 72;
const DUPE_ZONE = 64;
const COMMIT_THRESHOLD = 50;

interface TransactionListItemProps {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  date: number;
  note?: string;
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
  tags?: string[];
  selectMode?: boolean;
  selected?: boolean;
  onPress?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onLongPress?: () => void;
  onSelect?: (id: string) => void;
  style?: ViewStyle;
}

function isPositiveType(type: TransactionType): boolean {
  return (['income', 'debt_received', 'savings_withdraw', 'invest_sell'] as TransactionType[]).includes(type);
}

function isNeutralType(type: TransactionType): boolean {
  return type === 'transfer_internal';
}

export function TransactionListItem({
  id,
  type,
  amount,
  currency,
  date,
  note,
  categoryName,
  categoryIcon,
  categoryColor,
  tags,
  selectMode = false,
  selected = false,
  onPress,
  onDelete,
  onDuplicate,
  onLongPress,
  onSelect,
  style,
}: TransactionListItemProps): React.ReactElement {
  const { colors } = useTheme();
  const positive = isPositiveType(type);
  const neutral = isNeutralType(type);

  const amountColor = neutral
    ? colors.accentPrimary
    : positive
    ? colors.success
    : colors.danger;

  const amountPrefix = neutral ? '' : positive ? '+' : '-';
  const typeLabel = AppLabels.transactionType[type] ?? type;
  const label = note ?? categoryName ?? typeLabel;

  const translateX = useRef(new RNAnimated.Value(0)).current;
  const isDragging = useRef(false);
  const startX = useRef(0);
  const moved = useRef(false);
  const [swipeCommitted, setSwipeCommitted] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const swipeEnabled = !selectMode && (onDelete !== undefined || onDuplicate !== undefined);

  const clamp = (delta: number) => {
    const minX = onDelete !== undefined ? -DELETE_ZONE : 0;
    const maxX = onDuplicate !== undefined ? DUPE_ZONE : 0;
    return Math.max(minX, Math.min(maxX, delta));
  };

  const resetSwipe = () => {
    RNAnimated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
    setSwipeCommitted(false);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => swipeEnabled,
      onMoveShouldSetPanResponder: (_, { dx }) => swipeEnabled && Math.abs(dx) > 6,
      onPanResponderGrant: (_, { x0 }) => {
        startX.current = x0;
        moved.current = false;
        isDragging.current = true;
        if (onLongPress !== undefined) {
          longPressTimer.current = setTimeout(() => {
            if (!moved.current) {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onLongPress();
            }
          }, 500);
        }
      },
      onPanResponderMove: (_, { dx }) => {
        moved.current = Math.abs(dx) > 6;
        if (moved.current && longPressTimer.current !== null) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
        translateX.setValue(clamp(dx));
      },
      onPanResponderRelease: (_, { dx }) => {
        isDragging.current = false;
        if (longPressTimer.current !== null) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
        if (!moved.current) {
          resetSwipe();
          return;
        }
        if (dx <= -COMMIT_THRESHOLD && onDelete !== undefined) {
          RNAnimated.spring(translateX, { toValue: -DELETE_ZONE, useNativeDriver: true }).start();
          setSwipeCommitted(true);
        } else if (dx >= COMMIT_THRESHOLD && onDuplicate !== undefined) {
          onDuplicate();
          resetSwipe();
        } else {
          resetSwipe();
        }
      },
      onPanResponderTerminate: resetSwipe,
    })
  ).current;

  const handlePress = () => {
    if (selectMode) {
      onSelect?.(id);
      return;
    }
    if (moved.current) return;
    if (swipeCommitted) {
      resetSwipe();
      return;
    }
    onPress?.();
  };

  const iconBgColor = categoryColor != null ? `${categoryColor}22` : colors.bgSurface;

  return (
    <View style={[styles.wrapper, style]}>
      {!selectMode && onDuplicate !== undefined && (
        <View style={[styles.dupeZone, { backgroundColor: colors.accentPrimary }]}>
          <AppIcon name="copy" size={16} color="#fff" />
          <AppText variant="labelSmall" color="#fff" style={styles.actionLabel}>
            Salin
          </AppText>
        </View>
      )}

      {!selectMode && onDelete !== undefined && (
        <TouchableOpacity
          style={[styles.deleteZone, { backgroundColor: colors.danger }]}
          onPress={() => {
            resetSwipe();
            onDelete();
          }}
          accessibilityLabel="Hapus transaksi"
        >
          <AppIcon name="trash" size={16} color="#fff" />
          <AppText variant="labelSmall" color="#fff" style={styles.actionLabel}>
            Hapus
          </AppText>
        </TouchableOpacity>
      )}

      <RNAnimated.View
        style={[
          styles.content,
          {
            backgroundColor: selected ? `${colors.accentPrimary}0D` : colors.bgPage,
            transform: [{ translateX }],
          },
        ]}
        {...(swipeEnabled ? panResponder.panHandlers : {})}
      >
        <TouchableOpacity
          style={styles.touchable}
          onPress={handlePress}
          onLongPress={onLongPress}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={`${typeLabel}: ${formatCurrency(amount, currency)}`}
        >
          {selectMode && (
            <View style={styles.checkbox}>
              <AppIcon
                name={selected ? 'check' : 'circle'}
                size={20}
                color={selected ? colors.accentPrimary : `${colors.textMuted}66`}
              />
            </View>
          )}

          <View style={[styles.iconCircle, { backgroundColor: iconBgColor }]}>
            <AppIcon
              name={categoryIcon ?? 'more-horizontal'}
              size={18}
              color={categoryColor ?? colors.textMuted}
            />
          </View>

          <View style={styles.labelCol}>
            <AppText
              variant="bodyMedium"
              color={colors.textPrimary}
              numberOfLines={1}
              style={styles.labelText}
            >
              {label}
            </AppText>
            <AppText variant="labelSmall" color={colors.textMuted}>
              {formatDateShort(new Date(date))}
            </AppText>
          </View>

          <View style={styles.amountCol}>
            <AppText
              variant="bodyMedium"
              color={amountColor}
              style={styles.amountText}
              numberOfLines={1}
            >
              {amountPrefix}
              {formatCurrency(Math.abs(amount), currency)}
            </AppText>
            {tags !== undefined && tags.length > 0 && tags[0] !== undefined && (
              <AppText
                variant="labelSmall"
                color={colors.textMuted}
                numberOfLines={1}
                style={styles.tagText}
              >
                #{tags[0]}
              </AppText>
            )}
          </View>
        </TouchableOpacity>
      </RNAnimated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    overflow: 'hidden',
  },
  dupeZone: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DUPE_ZONE,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  deleteZone: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: DELETE_ZONE,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    flexDirection: 'row',
  },
  touchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  labelCol: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '500',
  },
  amountCol: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  amountText: {
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  tagText: {
    maxWidth: 80,
  },
});
