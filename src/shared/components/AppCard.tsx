import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface AppCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  elevated?: boolean;
}

export function AppCard({
  children,
  style,
  padding = 16,
  elevated = false,
}: AppCardProps): React.ReactElement {
  const { colors, radius, shadows } = useTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: colors.bgCard,
    borderRadius: radius.card,
    padding,
    ...(elevated ? (shadows.md as ViewStyle) : (shadows.sm as ViewStyle)),
    ...style,
  };

  return <View style={cardStyle}>{children}</View>;
}
