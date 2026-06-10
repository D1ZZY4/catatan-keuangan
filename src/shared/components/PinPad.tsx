import React, { useCallback } from 'react';
import { View, TouchableOpacity, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AppText } from './AppText';
import { AppIcon } from './AppIcon';
import { useTheme } from '../theme/ThemeContext';
import { springPresets } from '../theme/animation';

interface PinPadProps {
  value: string;
  onChange: (pin: string) => void;
  maxLength?: number;
  error?: boolean;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

export function PinPad({
  value,
  onChange,
  maxLength = 6,
  error = false,
}: PinPadProps): React.ReactElement {
  const { colors } = useTheme();
  const shakeX = useSharedValue(0);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const shake = useCallback(() => {
    shakeX.value = withSequence(
      withSpring(-8, springPresets.snappy),
      withSpring(8, springPresets.snappy),
      withSpring(-6, springPresets.snappy),
      withSpring(6, springPresets.snappy),
      withSpring(0, springPresets.snappy),
    );
  }, [shakeX]);

  React.useEffect(() => {
    if (error) shake();
  }, [error, shake]);

  const handleKey = useCallback(
    (key: string) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (key === 'del') {
        onChange(value.slice(0, -1));
      } else if (value.length < maxLength) {
        onChange(value + key);
      }
    },
    [value, onChange, maxLength],
  );

  return (
    <View style={{ alignItems: 'center', gap: 24 }}>
      <Animated.View
        style={[{ flexDirection: 'row', gap: 14 }, shakeStyle]}
      >
        {Array.from({ length: maxLength }).map((_, i) => (
          <View
            key={i}
            style={{
              width: 14,
              height: 14,
              borderRadius: 7,
              backgroundColor:
                i < value.length
                  ? error
                    ? colors.danger
                    : colors.accentPrimary
                  : colors.bgSurface,
              borderWidth: 1.5,
              borderColor:
                i < value.length
                  ? error
                    ? colors.danger
                    : colors.accentPrimary
                  : colors.border,
            }}
          />
        ))}
      </Animated.View>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          width: 240,
          gap: 0,
          justifyContent: 'space-between',
        }}
      >
        {KEYS.map((key, i) => (
          <KeyButton
            key={i}
            keyValue={key}
            onPress={handleKey}
            colors={colors}
          />
        ))}
      </View>
    </View>
  );
}

function KeyButton({
  keyValue,
  onPress,
  colors,
}: {
  keyValue: string;
  onPress: (k: string) => void;
  colors: ReturnType<typeof useTheme>['colors'];
}): React.ReactElement {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (keyValue === '') {
    return <View style={{ width: 72, height: 72, margin: 4 }} />;
  }

  return (
    <Animated.View style={[animStyle, { margin: 4 }]}>
      <TouchableOpacity
        onPress={() => {
          scale.value = withSequence(
            withSpring(0.88, springPresets.snappy),
            withSpring(1, springPresets.snappy),
          );
          onPress(keyValue);
        }}
        activeOpacity={1}
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: colors.bgCard,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: colors.border,
        } as ViewStyle}
      >
        {keyValue === 'del' ? (
          <AppIcon name="chevron-left" size={22} color={colors.textPrimary} />
        ) : (
          <AppText
            variant="headingLarge"
            color={colors.textPrimary}
            style={{ fontFamily: 'DMSans-Regular' }}
          >
            {keyValue}
          </AppText>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}
