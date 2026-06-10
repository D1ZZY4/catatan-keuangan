import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../src/shared/components/AppText';
import { AppIcon } from '../../src/shared/components/AppIcon';
import { AppButton } from '../../src/shared/components/AppButton';
import { useTheme } from '../../src/shared/theme/ThemeContext';
import { useSettings } from '../../src/shared/hooks/useSettings';
import { AppLabels } from '../../src/shared/config/labels';

const CURRENCIES = [
  { code: 'IDR', label: 'Rupiah (IDR)' },
  { code: 'USD', label: 'Dolar AS (USD)' },
  { code: 'EUR', label: 'Euro (EUR)' },
  { code: 'SGD', label: 'Dolar Singapura (SGD)' },
  { code: 'MYR', label: 'Ringgit (MYR)' },
];

export default function ProfileEditModal(): React.ReactElement {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useSettings();

  const [name, setName] = useState(settings.userName);
  const [currency, setCurrency] = useState(settings.baseCurrency);
  const [saving, setSaving] = useState(false);

  async function handleSave(): Promise<void> {
    setSaving(true);
    await updateSettings({ userName: name.trim(), baseCurrency: currency });
    setSaving(false);
    router.back();
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPage }}>
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <AppIcon name="x" size={22} color={colors.textMuted} />
        </TouchableOpacity>
        <AppText variant="headingMedium" color={colors.textPrimary}>
          {AppLabels.settings.profile}
        </AppText>
        <AppButton
          label="Simpan"
          size="sm"
          onPress={() => void handleSave()}
          loading={saving}
        />
      </View>

      <View style={{ padding: 20, gap: 20 }}>
        <View style={{ gap: 8 }}>
          <AppText variant="labelSmall" color={colors.textMuted}>Nama</AppText>
          <View
            style={{
              backgroundColor: colors.bgInput,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}
          >
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Nama Anda"
              placeholderTextColor={colors.textPlaceholder}
              style={{ fontFamily: 'DMSans-Regular', fontSize: 16, color: colors.textPrimary }}
            />
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <AppText variant="labelSmall" color={colors.textMuted}>Mata Uang Utama</AppText>
          {CURRENCIES.map((cur) => (
            <TouchableOpacity
              key={cur.code}
              onPress={() => setCurrency(cur.code)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 16,
                backgroundColor: currency === cur.code ? colors.bgSurface : colors.bgInput,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: currency === cur.code ? colors.accentPrimary : colors.border,
                gap: 12,
              }}
            >
              <AppText variant="bodyMedium" color={colors.textPrimary} style={{ flex: 1 }}>
                {cur.label}
              </AppText>
              {currency === cur.code && (
                <AppIcon name="check" size={16} color={colors.accentPrimary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}
