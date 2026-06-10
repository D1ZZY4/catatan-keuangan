import React from 'react';
import { View, type TextStyle, type ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { AppIcon } from './AppIcon';
import { useTheme } from '../theme/ThemeContext';
import {
  formatCurrency,
  formatCurrencyCompact,
} from '../utils/formatters';

interface BalanceTextProps {
  amount: number;
  currency?: string;
  hidden?: boolean;
  compact?: boolean;
  variant?: 'displayLarge' | 'displayMedium' | 'headingLarge' | 'bodyLarge' | 'bodyMedium';
  color?: string;
  style?: TextStyle;
  containerStyle?: ViewStyle;
}

export function BalanceText({
  amount,
  currency = 'IDR',
  hidden = false,
  compact = false,
  variant = 'displayMedium',
  color,
  style,
  containerStyle,
}: BalanceTextProps): React.ReactElement {
  const { colors } = useTheme();

  if (hidden) {
    return (
      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
          },
          containerStyle,
        ]}
      >
        <AppIcon name="eye-off" size={16} color={color ?? colors.textMuted} />
        <AppText
          variant={variant}
          color={color ?? colors.textMuted}
          style={style}
        >
          •••••
        </AppText>
      </View>
    );
  }

  const formatted = compact
    ? formatCurrencyCompact(amount, currency)
    : formatCurrency(amount, currency);

  const textColor =
    color ??
    (amount < 0 ? colors.danger : amount === 0 ? colors.textMuted : colors.textPrimary);

  return (
    <View style={containerStyle}>
      <AppText variant={variant} color={textColor} style={style}>
        {formatted}
      </AppText>
    </View>
  );
}
