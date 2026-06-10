import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../src/shared/components/AppText';
import { AppButton } from '../../src/shared/components/AppButton';
import { AppIcon } from '../../src/shared/components/AppIcon';
import { Divider } from '../../src/shared/components/Divider';
import { ColorPicker } from '../../src/shared/components/ColorPicker';
import { IconPicker } from '../../src/shared/components/IconPicker';
import { useTheme } from '../../src/shared/theme/ThemeContext';
import { database, wallets } from '../../src/shared/db/database';
import type { WalletModel } from '../../src/shared/db/models/Wallet';
import { useSettings } from '../../src/shared/hooks/useSettings';
import { useWallets } from '../../src/shared/hooks/useWallets';

type Tab = 'basic' | 'icon' | 'color';

export default function WalletFormModal(): React.ReactElement {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { settings } = useSettings();
  const params = useLocalSearchParams<{ walletId?: string }>();
  const { data: walletList } = useWallets();

  const editWallet = params.walletId
    ? walletList.find((w) => w.id === params.walletId)
    : undefined;

  const [tab, setTab] = useState<Tab>('basic');
  const [name, setName] = useState(editWallet?.name ?? '');
  const [icon, setIcon] = useState(editWallet?.icon ?? 'wallet');
  const [color, setColor] = useState(editWallet?.color ?? '#8CC0EB');
  const [currency, setCurrency] = useState(editWallet?.currency ?? settings.baseCurrency);
  const [initialBalance, setInitialBalance] = useState(
    editWallet ? String(editWallet.initialBalance) : '0',
  );
  const [includeInTotal, setIncludeInTotal] = useState(editWallet?.includeInTotal ?? true);
  const [showInDashboard, setShowInDashboard] = useState(editWallet?.showInDashboard ?? true);
  const [saving, setSaving] = useState(false);

  const CURRENCIES = ['IDR', 'USD', 'EUR', 'SGD', 'MYR', 'JPY', 'GBP'];

  async function handleSave(): Promise<void> {
    if (!name.trim()) {
      Alert.alert('Nama dompet tidak boleh kosong');
      return;
    }
    setSaving(true);
    try {
      await database.write(async () => {
        if (editWallet) {
          const record = await wallets.find(editWallet.id) as WalletModel;
          await record.update((r: WalletModel) => {
            r.name = name.trim();
            r.icon = icon;
            r.color = color;
            r.currency = currency;
            r.initialBalance = parseFloat(initialBalance.replace(/[^\d.]/g, '')) || 0;
            r.includeInTotal = includeInTotal;
            r.showInDashboard = showInDashboard;
          });
        } else {
          await wallets.create((record: WalletModel) => {
            record.name = name.trim();
            record.icon = icon;
            record.color = color;
            record.currency = currency;
            record.initialBalance = parseFloat(initialBalance.replace(/[^\d.]/g, '')) || 0;
            record.isArchived = false;
            record.showInDashboard = showInDashboard;
            record.includeInTotal = includeInTotal;
            record.createdAt = Date.now();
          });
        }
      });
      router.back();
    } catch (e) {
      console.error('Save wallet failed', e);
      Alert.alert('Gagal menyimpan dompet');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPage }}>
      {/* Header */}
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
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Tutup">
          <AppIcon name="x" size={22} color={colors.textMuted} />
        </TouchableOpacity>
        <AppText variant="headingMedium" color={colors.textPrimary}>
          {editWallet ? 'Edit Dompet' : 'Dompet Baru'}
        </AppText>
        <AppButton
          label="Simpan"
          onPress={() => void handleSave()}
          size="sm"
          loading={saving}
          disabled={!name.trim()}
        />
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border }}>
        {(['basic', 'icon', 'color'] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: 'center',
              borderBottomWidth: 2,
              borderBottomColor: tab === t ? colors.accentPrimary : 'transparent',
            }}
          >
            <AppText
              variant="bodyMedium"
              color={tab === t ? colors.accentPrimary : colors.textMuted}
            >
              {t === 'basic' ? 'Dasar' : t === 'icon' ? 'Ikon' : 'Warna'}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {tab === 'basic' && (
          <>
            {/* Preview */}
            <View style={{ alignItems: 'center', gap: 8 }}>
              <View
                style={{
                  width: 64, height: 64, borderRadius: 20,
                  backgroundColor: color + '33',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <AppIcon name={icon} size={30} color={color} />
              </View>
              <AppText variant="bodyMedium" color={colors.textPrimary} style={{ fontFamily: 'DMSans-SemiBold' }}>
                {name || 'Nama Dompet'}
              </AppText>
            </View>

            <Divider />

            {/* Nama */}
            <View style={{ gap: 8 }}>
              <AppText variant="labelMedium" color={colors.textMuted}>Nama Dompet</AppText>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="mis. Tunai, BCA, GoPay"
                placeholderTextColor={colors.textPlaceholder}
                maxLength={40}
                autoFocus={!editWallet}
                style={{
                  backgroundColor: colors.bgInput,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  color: colors.textPrimary,
                  fontSize: 16,
                  fontFamily: 'DMSans-Regular',
                }}
              />
            </View>

            {/* Saldo awal (only on create) */}
            {!editWallet && (
              <View style={{ gap: 8 }}>
                <AppText variant="labelMedium" color={colors.textMuted}>Saldo Awal</AppText>
                <View
                  style={{
                    backgroundColor: colors.bgInput,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: colors.border,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <AppText variant="bodyMedium" color={colors.textMuted}>{currency}</AppText>
                  <TextInput
                    value={initialBalance}
                    onChangeText={setInitialBalance}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={colors.textPlaceholder}
                    style={{
                      flex: 1,
                      color: colors.textPrimary,
                      fontSize: 16,
                      fontFamily: 'DMSans-Regular',
                    }}
                  />
                </View>
              </View>
            )}

            <Divider />

            {/* Mata uang */}
            <View style={{ gap: 8 }}>
              <AppText variant="labelMedium" color={colors.textMuted}>Mata Uang</AppText>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {CURRENCIES.map((cur) => (
                  <TouchableOpacity
                    key={cur}
                    onPress={() => setCurrency(cur)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 20,
                      borderWidth: 1.5,
                      borderColor: currency === cur ? colors.accentPrimary : colors.border,
                      backgroundColor: currency === cur ? colors.accentPrimary + '22' : colors.bgCard,
                    }}
                  >
                    <AppText
                      variant="bodySmall"
                      color={currency === cur ? colors.accentPrimary : colors.textMuted}
                    >
                      {cur}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Divider />

            {/* Toggle options */}
            <View style={{ gap: 12 }}>
              {([
                ['includeInTotal', 'Hitung ke total kekayaan', includeInTotal, setIncludeInTotal],
                ['showInDashboard', 'Tampilkan di beranda', showInDashboard, setShowInDashboard],
              ] as [string, string, boolean, (v: boolean) => void][]).map(([key, label, value, setter]) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => setter(!value)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 4,
                  }}
                >
                  <AppText variant="bodyMedium" color={colors.textPrimary}>{label}</AppText>
                  <View
                    style={{
                      width: 48,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: value ? colors.accentPrimary : colors.bgSurface,
                      padding: 3,
                      justifyContent: 'center',
                      alignItems: value ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <View
                      style={{
                        width: 22, height: 22, borderRadius: 11,
                        backgroundColor: colors.bgPage,
                      }}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {tab === 'icon' && (
          <IconPicker value={icon} onChange={setIcon} />
        )}

        {tab === 'color' && (
          <ColorPicker value={color} onChange={setColor} />
        )}
      </ScrollView>
    </View>
  );
}
