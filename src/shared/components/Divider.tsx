import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface DividerProps {
  style?: ViewStyle;
  indent?: number;
}

export function Divider({ style, indent = 0 }: DividerProps): React.ReactElement {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.divider,
        {
          backgroundColor: colors.border,
          marginLeft: indent,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
});
