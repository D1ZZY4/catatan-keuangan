import React, { useRef, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { AppIcon } from './AppIcon';
import { useTheme } from '../theme/ThemeContext';
import { AppConfig } from '../config/periods';
import { springPresets, timingPresets } from '../theme/animation';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: ViewStyle;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Cari...',
  onFocus,
  onBlur,
  style,
}: SearchBarProps): React.ReactElement {
  const { colors } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  const borderOpacity = useSharedValue(0);
  const borderAnim = useAnimatedStyle(() => ({
    borderColor: `rgba(140,192,235,${borderOpacity.value})`,
    borderWidth: borderOpacity.value > 0 ? 1.5 : StyleSheet.hairlineWidth,
  }));

  const handleFocus = () => {
    setFocused(true);
    borderOpacity.value = withSpring(1, springPresets.snappy);
    onFocus?.();
  };

  const handleBlur = () => {
    setFocused(false);
    borderOpacity.value = withTiming(0, timingPresets.fast);
    onBlur?.();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.bgInput,
        },
        borderAnim,
        style,
      ]}
    >
      <AppIcon name="search" size={16} color={colors.textMuted} />
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textPlaceholder}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={[styles.input, { color: colors.textPrimary }]}
        returnKeyType="search"
        clearButtonMode="while-editing"
        accessibilityLabel="Cari"
        accessibilityRole="search"
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChangeText('')}
          accessibilityLabel="Hapus pencarian"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <View style={[styles.clearBtn, { backgroundColor: colors.textMuted }]}>
            <AppIcon name="x" size={10} color={colors.bgCard} />
          </View>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    padding: 0,
    margin: 0,
    fontFamily: 'DMSans-Regular',
  },
  clearBtn: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
