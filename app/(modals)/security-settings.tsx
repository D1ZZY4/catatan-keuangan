import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import { AppText } from '../../src/shared/components/AppText';
import { AppIcon } from '../../src/shared/components/AppIcon';
import { AppCard } from '../../src/shared/components/AppCard';
import { PinPad } from '../../src/shared/components/PinPad';
import { AppButton } from '../../src/shared/components/AppButton';
import { useTheme } from '../../src/shared/theme/ThemeContext';
import { AppLabels } from '../../src/shared/config/labels';
import { savePin, setBiometricEnabled, isBiometricEnabled } from '../../src/shared/crypto/pinStore';
import { useSettings } from '../../src/shared/hooks/useSettings';

export default function SecuritySettingsModal(): React.ReactElement {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useSettings();

  const [changingPin, setChangingPin] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinStep, setPinStep] = useState<'create' | 'confirm'>('create');
  const [pinError, setPinError] = useState(false);
  const [biometricEnabled, setBiometricEnabledState] = useState(false);

  React.useEffect(() => {
    void isBiometricEnabled().then(setBiometricEnabledState);
  }, []);

  async function handlePinSave(): Promise<void> {
    if (pinStep === 'create') {
      setPinStep('confirm');
      return;
    }
    if (pin !== confirmPin) {
      setPinError(true);
      setTimeout(() => { setConfirmPin(''); setPinError(false); }, 600);
      return;
    }
    await savePin(pin);
    setChangingPin(false);
    setPinStep('create');
    setPin('');
    setConfirmPin('');
    Alert.alert('Berhasil', 'PIN berhasil diperbarui.');
  }

  async function toggleBiometric(): Promise<void> {
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!enrolled) {
      Alert.alert('Tidak Tersedia', 'Tidak ada biometrik yang terdaftar di perangkat ini.');
      return;
    }
    const next = !biometricEnabled;
    await setBiometricEnabled(next);
    setBiometricEnabledState(next);
  }

  const autoLockOptions = [
    { label: 'Segera', seconds: 0 },
    { label: '30 detik', seconds: 30 },
    { label: '1 menit', seconds: 60 },
    { label: '5 menit', seconds: 300 },
    { label: 'Tidak pernah', seconds: -1 },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPage }}>
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <AppIcon name="chevron-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <AppText variant="headingMedium" color={colors.textPrimary}>
          {AppLabels.settings.security}
        </AppText>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 24,
          paddingBottom: 40,
          gap: 16,
        }}
      >
        {changingPin ? (
          <AppCard style={{ alignItems: 'center', gap: 20 }}>
            <AppText variant="headingMedium" color={colors.textPrimary} center>
              {pinStep === 'create' ? 'Buat PIN Baru' : 'Konfirmasi PIN'}
            </AppText>
            <PinPad
              value={pinStep === 'create' ? pin : confirmPin}
              onChange={pinStep === 'create' ? setPin : setConfirmPin}
              maxLength={6}
              error={pinError}
            />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <AppButton
                label="Batal"
                variant="ghost"
                onPress={() => { setChangingPin(false); setPin(''); setConfirmPin(''); setPinStep('create'); }}
              />
              <AppButton
                label={pinStep === 'create' ? 'Lanjut' : 'Simpan'}
                onPress={() => void handlePinSave()}
                disabled={pinStep === 'create' ? pin.length < 4 : confirmPin.length < 4}
              />
            </View>
          </AppCard>
        ) : (
          <AppCard style={{ gap: 4 }}>
            <TouchableOpacity
              onPress={() => setChangingPin(true)}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 }}
            >
              <AppIcon name="lock" size={20} color={colors.textMuted} />
              <View style={{ flex: 1 }}>
                <AppText variant="bodyMedium" color={colors.textPrimary} style={{ fontFamily: 'DMSans-Medium' }}>
                  Ganti PIN
                </AppText>
              </View>
              <AppIcon name="chevron-right" size={16} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 48 }} />

            <TouchableOpacity
              onPress={() => void toggleBiometric()}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 }}
            >
              <AppIcon name="fingerprint" size={20} color={colors.textMuted} />
              <View style={{ flex: 1 }}>
                <AppText variant="bodyMedium" color={colors.textPrimary} style={{ fontFamily: 'DMSans-Medium' }}>
                  Biometrik
                </AppText>
                <AppText variant="labelSmall" color={colors.textMuted}>
                  {biometricEnabled ? 'Aktif' : 'Nonaktif'}
                </AppText>
              </View>
              <AppIcon
                name={biometricEnabled ? 'check' : 'plus'}
                size={16}
                color={biometricEnabled ? colors.success : colors.textMuted}
              />
            </TouchableOpacity>
          </AppCard>
        )}

        <AppCard>
          <AppText variant="labelSmall" color={colors.textMuted} style={{ marginBottom: 12 }}>
            Kunci otomatis setelah
          </AppText>
          {autoLockOptions.map((opt, i) => (
            <React.Fragment key={opt.seconds}>
              <TouchableOpacity
                onPress={() => void updateSettings({ autoLockSeconds: opt.seconds })}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 }}
              >
                <View style={{ flex: 1 }}>
                  <AppText variant="bodyMedium" color={colors.textPrimary}>
                    {opt.label}
                  </AppText>
                </View>
                {settings.autoLockSeconds === opt.seconds && (
                  <AppIcon name="check" size={16} color={colors.accentPrimary} />
                )}
              </TouchableOpacity>
              {i < autoLockOptions.length - 1 && (
                <View style={{ height: 1, backgroundColor: colors.border }} />
              )}
            </React.Fragment>
          ))}
        </AppCard>
      </ScrollView>
    </View>
  );
}
