import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../src/shared/components/AppText';
import { AppButton } from '../../src/shared/components/AppButton';
import { AppIcon } from '../../src/shared/components/AppIcon';
import { useTheme } from '../../src/shared/theme/ThemeContext';
import { AppLabels } from '../../src/shared/config/labels';
import { database, wallets } from '../../src/shared/db/database';
import type { WalletModel } from '../../src/shared/db/models/Wallet';
import { useSettings } from '../../src/shared/hooks/useSettings';

const WALLET_COLORS = [
  '#8CC0EB', '#2E7D32', '#E65100', '#C62828', '#6A1B9A',
  '#00838F', '#F57F17', '#AD1457', '#1565C0', '#4E342E',
];

export default function WalletFormModal(): React.ReactElement {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { settings } = useSettings();

  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(WALLET_COLORS[0] ?? '#8CC0EB');
  const [initialBalance, setInitialBalance] = useState('0');
  const [saving, setSaving] = useState(false);

  async function handleSave(): Promise<void> {
    if (name.trim().length === 0) return;
    setSaving(true);
    try {
      await database.write(async () => {
        await wallets.create((record: WalletModel) => {
          record.name = name.trim();
          record.icon = 'wallet';
          record.color = selectedColor;
          record.currency = settings.baseCurrency;
          record.initialBalance = parseFloat(initialBalance) || 0;
          record.isArchived = false;
          record.showInDashboard = true;
          record.includeInTotal = true;
          record.createdAt = Date.now();
        });
      });
      router.back();
    } catch (e) {
      console.error('Save wallet failed', e);
    } finally {
      setSaving(false);
    }
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
          Dompet Baru
        </AppText>
        <AppButton
          label="Simpan"
          onPress={() => void handleSave()}
          size="sm"
          loading={saving}
          disabled={name.trim().length === 0}
        />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 40,
          gap: 20,
        }}
      >
        <View style={{ gap: 8 }}>
          <AppText variant="labelSmall" color={colors.textMuted}>
            Nama Dompet
          </AppText>
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
              placeholder="mis. Tunai, BCA, GoPay"
              placeholderTextColor={colors.textPlaceholder}
              style={{
                fontFamily: 'DMSans-Regular',
                fontSize: 16,
                color: colors.textPrimary,
              }}
            />
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <AppText variant="labelSmall" color={colors.textMuted}>
            Saldo Awal
          </AppText>
          <View
            style={{
              backgroundColor: colors.bgInput,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 16,
              paddingVertical: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <AppText variant="bodyMedium" color={colors.textMuted}>
              Rp
            </AppText>
            <TextInput
              value={initialBalance}
              onChangeText={setInitialBalance}
              keyboardType="numeric"
              style={{
                flex: 1,
                fontFamily: 'DMSans-Regular',
                fontSize: 16,
                color: colors.textPrimary,
              }}
            />
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <AppText variant="labelSmall" color={colors.textMuted}>
            Warna
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {WALLET_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => setSelectedColor(color)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: color,
                  borderWidth: selectedColor === color ? 3 : 0,
                  borderColor: colors.textPrimary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {selectedColor === color && (
                  <AppIcon name="check" size={16} color="#FFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
