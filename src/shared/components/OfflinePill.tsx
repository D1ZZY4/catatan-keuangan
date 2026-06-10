import React from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { AppText } from './AppText';
import { AppIcon } from './AppIcon';
import { AppLabels } from '../config/labels';

interface OfflinePillProps {
  visible: boolean;
  offlineDate: string;
}

export function OfflinePill({
  visible,
  offlineDate,
}: OfflinePillProps): React.ReactElement | null {
  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(244,163,90,0.15)',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 5,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: 'rgba(244,163,90,0.3)',
      }}
    >
      <AppIcon name="alert" size={12} color="#E65100" />
      <AppText variant="labelSmall" color="#E65100">
        {AppLabels.offlinePill.label(offlineDate)}
      </AppText>
    </Animated.View>
  );
}
