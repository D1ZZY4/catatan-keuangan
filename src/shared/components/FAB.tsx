import React, { useCallback, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Pressable,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AppIcon } from './AppIcon';
import { AppText } from './AppText';
import { useTheme } from '../theme/ThemeContext';
import { springPresets, timingPresets } from '../theme/animation';
import type { TransactionType } from '../types';
import { AppLabels } from '../config/labels';

const FAB_ACTIONS: Array<{
  type: TransactionType;
  icon: string;
  color: string;
}> = [
  { type: 'expense', icon: 'arrow-down-circle', color: '#C62828' },
  { type: 'income', icon: 'arrow-up-circle', color: '#2E7D32' },
  { type: 'transfer_internal', icon: 'arrow-left-right', color: '#8CC0EB' },
  { type: 'debt_given', icon: 'trending-up', color: '#E65100' },
  { type: 'debt_received', icon: 'trending-down', color: '#6A1B9A' },
  { type: 'savings_deposit', icon: 'piggy-bank', color: '#00838F' },
];

interface FABProps {
  onSelect: (type: TransactionType) => void;
  style?: ViewStyle;
}

export function FAB({ onSelect, style }: FABProps): React.ReactElement {
  const { colors, shadows } = useTheme();
  const [open, setOpen] = useState(false);
  const rotation = useSharedValue(0);
  const backdropOpacity = useSharedValue(0);

  const mainAnimStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  function toggle(): void {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const next = !open;
    setOpen(next);
    rotation.value = withSpring(next ? 45 : 0, springPresets.snappy);
    backdropOpacity.value = withTiming(
      next ? 0.4 : 0,
      timingPresets.backdrop,
    );
  }

  const handleSelect = useCallback(
    (type: TransactionType) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setOpen(false);
      rotation.value = withSpring(0, springPresets.snappy);
      backdropOpacity.value = withTiming(0, timingPresets.backdrop);
      onSelect(type);
    },
    [onSelect, rotation, backdropOpacity],
  );

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  return (
    <>
      {open && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={[
            backdropStyle,
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#000',
              zIndex: 10,
            },
          ]}
        >
          <Pressable style={{ flex: 1 }} onPress={toggle} />
        </Animated.View>
      )}

      <View
        style={[
          { position: 'absolute', bottom: 24, right: 20, zIndex: 11, alignItems: 'flex-end', gap: 10 },
          style,
        ]}
      >
        {open &&
          FAB_ACTIONS.map((action, i) => (
            <Animated.View
              key={action.type}
              entering={FadeIn.delay(i * 40).springify().damping(20).stiffness(300)}
              exiting={FadeOut.duration(100)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
            >
              <AppText
                variant="labelSmall"
                style={{
                  backgroundColor: colors.bgCard,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 8,
                  overflow: 'hidden',
                  fontFamily: 'DMSans-Medium',
                }}
                color={colors.textPrimary}
              >
                {AppLabels.transactionType[action.type]}
              </AppText>
              <TouchableOpacity
                onPress={() => handleSelect(action.type)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: action.color,
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...(shadows.md as ViewStyle),
                }}
              >
                <AppIcon name={action.icon} size={20} color="#FFF" />
              </TouchableOpacity>
            </Animated.View>
          ))}

        <TouchableOpacity
          onPress={toggle}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: colors.accentPrimary,
            alignItems: 'center',
            justifyContent: 'center',
            ...(shadows.float as ViewStyle),
          }}
        >
          <Animated.View style={mainAnimStyle}>
            <AppIcon name="plus" size={28} color="#1A1814" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </>
  );
}
