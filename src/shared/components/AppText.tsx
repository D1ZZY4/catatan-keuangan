import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';

type VariantKey = keyof typeof typography;

interface AppTextProps extends TextProps {
  variant?: VariantKey;
  color?: string;
  center?: boolean;
  weight?: 'regular' | 'medium' | 'semibold';
  mono?: boolean;
}

export function AppText({
  variant = 'bodyMedium',
  color,
  center,
  style,
  children,
  ...rest
}: AppTextProps): React.ReactElement {
  const { colors } = useTheme();
  const variantStyle = typography[variant] as TextStyle;

  const composed: TextStyle = {
    ...variantStyle,
    color: color ?? colors.textPrimary,
    ...(center === true ? { textAlign: 'center' } : {}),
    ...(style as TextStyle | undefined),
  };

  return (
    <Text style={composed} {...rest}>
      {children}
    </Text>
  );
}
