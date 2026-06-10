import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import { AppText } from '../../src/shared/components/AppText';
import { AppButton } from '../../src/shared/components/AppButton';
import { PinPad } from '../../src/shared/components/PinPad';
import { useTheme } from '../../src/shared/theme/ThemeContext';
import { useAppLock } from '../../src/shared/hooks/useAppLock';
import { AppLabels } from '../../src/shared/config/labels';
import { isBiometricEnabled } from '../../src/shared/crypto/pinStore';
import { AppIcon } from '../../src/shared/components/AppIcon';

export default function LockScreen(): React.ReactElement {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { unlock, unlockWithBiometric, failedAttempts, cooldownSeconds } = useAppLock();

  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    void (async () => {
      const [enrolled, enabled] = await Promise.all([
        LocalAuthentication.isEnrolledAsync(),
        isBiometricEnabled(),
      ]);
      setBiometricAvailable(enrolled && enabled);
    })();
  }, []);

  useEffect(() => {
    if (biometricAvailable) {
      void unlockWithBiometric();
    }
  }, [biometricAvailable, unlockWithBiometric]);

  async function handlePinChange(newPin: string): Promise<void> {
    setPin(newPin);
    if (newPin.length >= 4) {
      const ok = await unlock(newPin);
      if (!ok) {
        setError(true);
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 600);
      }
    }
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bgPage,
        paddingTop: insets.top + 32,
        paddingBottom: insets.bottom + 24,
        paddingHorizontal: 32,
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <View style={{ alignItems: 'center', gap: 8 }}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: colors.bgSurface,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
          }}
        >
          <AppIcon name="lock" size={28} color={colors.accentPrimary} />
        </View>
        <AppText variant="headingLarge" color={colors.textPrimary} center>
          {AppLabels.lock.title}
        </AppText>
        {failedAttempts > 0 && cooldownSeconds === 0 && (
          <AppText variant="bodyMedium" color={colors.danger} center>
            {AppLabels.lock.wrongPin}
          </AppText>
        )}
        {cooldownSeconds > 0 && (
          <AppText variant="bodyMedium" color={colors.warning} center>
            {AppLabels.lock.cooldown(cooldownSeconds)}
          </AppText>
        )}
      </View>

      <PinPad value={pin} onChange={(p) => void handlePinChange(p)} error={error} />

      {biometricAvailable && (
        <AppButton
          label={AppLabels.lock.biometricPrompt}
          icon="fingerprint"
          onPress={() => void unlockWithBiometric()}
          variant="ghost"
          size="md"
        />
      )}
    </View>
  );
}
