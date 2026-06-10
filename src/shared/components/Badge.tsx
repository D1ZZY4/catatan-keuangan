import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { useTheme } from '../theme/ThemeContext';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export function Badge({
  label,
  variant = 'default',
  style,
}: BadgeProps): React.ReactElement {
  const { colors } = useTheme();

  const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
    default: { bg: colors.bgSurface, text: colors.textMuted },
    success: { bg: `${colors.success}1A`, text: colors.success },
    warning: { bg: `${colors.warning}1A`, text: colors.warning },
    danger: { bg: `${colors.danger}1A`, text: colors.danger },
    info: { bg: `${colors.accentPrimary}1A`, text: colors.accentPrimary },
  };

  const { bg, text } = variantStyles[variant];

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <AppText variant="labelSmall" color={text} style={styles.text}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});
