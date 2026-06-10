import React from 'react';
import { View, type ViewStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { AppText } from './AppText';
import { AppIcon } from './AppIcon';
import { useTheme } from '../theme/ThemeContext';

interface EmptyStateProps {
  icon?: string;
  title: string;
  body?: string;
  action?: React.ReactNode;
  style?: ViewStyle;
}

export function EmptyState({
  icon = 'activity',
  title,
  body,
  action,
  style,
}: EmptyStateProps): React.ReactElement {
  const { colors } = useTheme();

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={[
        {
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 48,
          paddingHorizontal: 32,
        },
        style,
      ]}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: colors.bgSurface,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <AppIcon name={icon} size={28} color={colors.textMuted} />
      </View>
      <AppText
        variant="headingMedium"
        center
        color={colors.textPrimary}
        style={{ marginBottom: 8 }}
      >
        {title}
      </AppText>
      {body !== undefined && (
        <AppText
          variant="bodyMedium"
          center
          color={colors.textMuted}
          style={{ lineHeight: 22 }}
        >
          {body}
        </AppText>
      )}
      {action !== undefined && (
        <View style={{ marginTop: 20 }}>{action}</View>
      )}
    </Animated.View>
  );
}
