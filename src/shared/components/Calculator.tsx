import React, { useState } from 'react';
import { View, TouchableOpacity, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AppText } from './AppText';
import { useTheme } from '../theme/ThemeContext';
import {
  calcInput,
  createCalcState,
  formatCalcDisplay,
} from '../services/calculatorEngine';
import { springPresets } from '../theme/animation';

const BUTTONS = [
  ['C', '±', '%', '/'],
  ['7', '8', '9', '*'],
  ['4', '5', '6', '-'],
  ['1', '2', '3', '+'],
  ['0', '.', '⌫', '='],
];

interface CalculatorProps {
  onValueCommit?: (value: number) => void;
  style?: ViewStyle;
}

export function Calculator({
  onValueCommit,
  style,
}: CalculatorProps): React.ReactElement {
  const { colors } = useTheme();
  const [calc, setCalc] = useState(createCalcState);

  function handleKey(key: string): void {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = calcInput(calc, key);
    setCalc(next);

    if (key === '=' && next.lastResult !== null && onValueCommit !== undefined) {
      onValueCommit(next.lastResult);
    }
  }

  const isOp = (k: string) => ['+', '-', '*', '/'].includes(k);
  const isSpecial = (k: string) => ['C', '±', '%'].includes(k);
  const isEqual = (k: string) => k === '=';

  return (
    <View
      style={[
        {
          backgroundColor: colors.bgCard,
          borderRadius: 16,
          padding: 12,
          gap: 8,
        },
        style,
      ]}
    >
      <View
        style={{
          backgroundColor: colors.bgPage,
          borderRadius: 12,
          padding: 16,
          alignItems: 'flex-end',
          minHeight: 70,
          justifyContent: 'flex-end',
          gap: 4,
        }}
      >
        {calc.expression.length > 0 && (
          <AppText variant="labelSmall" color={colors.textMuted} numberOfLines={1}>
            {calc.expression}
          </AppText>
        )}
        <AppText
          variant="displayMedium"
          color={colors.textPrimary}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {formatCalcDisplay(calc.display)}
        </AppText>
      </View>

      {BUTTONS.map((row, ri) => (
        <View key={ri} style={{ flexDirection: 'row', gap: 8 }}>
          {row.map((key) => {
            const flex = key === '0' ? 2 : 1;
            const bg = isOp(key) || isEqual(key)
              ? colors.accentPrimary
              : isSpecial(key)
              ? colors.bgSurface
              : colors.bgInput;
            const textColor =
              isOp(key) || isEqual(key)
                ? colors.textPrimary
                : colors.textPrimary;

            return (
              <CalcButton
                key={key}
                label={key}
                onPress={() => handleKey(key)}
                flex={flex}
                bg={bg}
                textColor={textColor}
                colors={colors}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

function CalcButton({
  label,
  onPress,
  flex,
  bg,
  textColor,
  colors: _colors,
}: {
  label: string;
  onPress: () => void;
  flex: number;
  bg: string;
  textColor: string;
  colors: ReturnType<typeof useTheme>['colors'];
}): React.ReactElement {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animStyle, { flex }]}>
      <TouchableOpacity
        onPress={() => {
          scale.value = withSequence(
            withSpring(0.9, springPresets.snappy),
            withSpring(1, springPresets.snappy),
          );
          onPress();
        }}
        activeOpacity={1}
        style={{
          height: 52,
          borderRadius: 12,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
        } as ViewStyle}
      >
        <AppText
          variant="headingMedium"
          color={textColor}
          style={{ fontFamily: 'DMSans-Regular', fontSize: 20 }}
        >
          {label}
        </AppText>
      </TouchableOpacity>
    </Animated.View>
  );
}
