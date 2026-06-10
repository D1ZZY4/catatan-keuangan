import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { AppIcon } from './AppIcon';
import { useTheme } from '../theme/ThemeContext';

const PALETTE = [
  '#8CC0EB', '#6AADD8', '#F4A35A', '#4CAF50', '#E53935',
  '#AB47BC', '#F9A825', '#00ACC1', '#6D4C41', '#546E7A',
  '#EC407A', '#26A69A',
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  style?: ViewStyle;
}

export function ColorPicker({
  value,
  onChange,
  style,
}: ColorPickerProps): React.ReactElement {
  const { colors } = useTheme();

  return (
    <View style={[styles.grid, style]}>
      {PALETTE.map((c) => {
        const selected = c.toLowerCase() === value.toLowerCase();
        return (
          <TouchableOpacity
            key={c}
            onPress={() => onChange(c)}
            style={[
              styles.swatch,
              {
                backgroundColor: c,
                borderWidth: selected ? 3 : 0,
                borderColor: colors.bgCard,
              },
            ]}
            accessibilityLabel={`Warna ${c}`}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
          >
            {selected && (
              <AppIcon name="check" size={14} color="#fff" />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
});
