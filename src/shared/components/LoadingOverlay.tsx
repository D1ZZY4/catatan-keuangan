import React from 'react';
import { View, ActivityIndicator, Modal } from 'react-native';
import { AppText } from './AppText';
import { useTheme } from '../theme/ThemeContext';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({
  visible,
  message,
}: LoadingOverlayProps): React.ReactElement {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            backgroundColor: colors.bgCard,
            borderRadius: 16,
            padding: 28,
            alignItems: 'center',
            gap: 14,
            minWidth: 140,
          }}
        >
          <ActivityIndicator size="large" color={colors.accentPrimary} />
          {message !== undefined && (
            <AppText variant="bodyMedium" color={colors.textMuted} center>
              {message}
            </AppText>
          )}
        </View>
      </View>
    </Modal>
  );
}
