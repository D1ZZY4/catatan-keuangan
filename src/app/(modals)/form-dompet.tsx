import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppBar } from '@/shared/components/AppBar';
import { Button } from '@/shared/components/Button';
import { ColorPicker } from '@/shared/components/ColorPicker';
import { ChipGroup } from '@/shared/components/ChipGroup';
import { CurrencyInput } from '@/shared/components/CurrencyInput';
import { IconPicker } from '@/shared/components/IconPicker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { database } from '@/shared/db';
import { useToast } from '@/shared/components/Toast';
import type { WalletType } from '@/shared/types';

const WALLET_TYPES: { value: WalletType; label: string }[] = [
  { value: 'cash', label: 'Tunai' },
  { value: 'bank', label: 'Bank' },
  { value: 'e-wallet', label: 'E-Wallet' },
  { value: 'savings', label: 'Tabungan' },
  { value: 'investment', label: 'Investasi' },
  { value: 'credit', label: 'Kredit' },
  { value: 'crypto', label: 'Kripto' },
  { value: 'other', label: 'Lainnya' },
];

const CURRENCY_OPTIONS = [
  { value: 'IDR', label: 'IDR' },
  { value: 'USD', label: 'USD' },
  { value: 'SGD', label: 'SGD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'MYR', label: 'MYR' },
];

export default function FormDompetScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showToast } = useToast();
  const params = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!params.id;

  const [name, setName] = useState('');
  const [type, setType] = useState<WalletType>('cash');
  const [currency, setCurrency] = useState('IDR');
  const [customCurrency, setCustomCurrency] = useState('');
  const [color, setColor] = useState('#8CC0EB');
  const [icon, setIcon] = useState('Wallet');
  const [initialBalanceStr, setInitialBalanceStr] = useState('');
  const [initialBalanceNum, setInitialBalanceNum] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit && params.id) void loadExisting(params.id);
  }, []);

  async function loadExisting(id: string) {
    try {
      const record = await database.get<import('@/shared/db').WalletModel>('wallets').find(id);
      setName(record.name);
      setType(record.type as WalletType);
      setCurrency(record.currency);
      setColor(record.color);
      setIcon(record.icon || 'Wallet');
      setInitialBalanceStr(String(record.balance));
      setInitialBalanceNum(record.balance);
    } catch {
      showToast('Dompet tidak ditemukan', 'error');
      router.back();
    } finally {
      setInitialLoading(false);
    }
  }

  const finalCurrency = CURRENCY_OPTIONS.some(o => o.value === currency) ? currency : (customCurrency || currency);

  const handleSave = async () => {
    if (!name.trim()) { showToast('Nama dompet tidak boleh kosong', 'error'); return; }
    setLoading(true);
    try {
      const bal = initialBalanceNum;
      await database.write(async () => {
        if (isEdit && params.id) {
          const record = await database.get<import('@/shared/db').WalletModel>('wallets').find(params.id);
          await record.update(() => {
            record.name = name.trim();
            record.icon = icon;
            record.color = color;
            record.currency = finalCurrency;
            record.type = type;
          });
        } else {
          await database.get<import('@/shared/db').WalletModel>('wallets').create((record) => {
            record.name = name.trim();
            record.icon = icon;
            record.color = color;
            record.currency = finalCurrency;
            record.balance = bal;
            record.initialBalance = bal;
            record.type = type;
            record.isArchived = false;
            record.showInDashboard = true;
            record.includeInTotal = true;
            record.sortOrder = Date.now();
            // @ts-expect-error WatermelonDB sets created_at automatically
            record._raw.created_at = Date.now();
          });
        }
      });
      showToast(isEdit ? 'Dompet diperbarui' : 'Dompet berhasil dibuat', 'success');
      router.back();
    } catch {
      showToast('Gagal menyimpan dompet. Coba lagi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
      <AppBar title={isEdit ? 'Edit Dompet' : 'Buat Dompet Baru'} showBack />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Nama */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Nama Dompet</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="cth. Dompet Utama, BCA, GoPay..."
            placeholderTextColor={colors.textPlaceholder}
            style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.bgInput, fontFamily: 'DMSans-Regular' }]}
            maxLength={50}
            accessibilityLabel="Nama dompet"
          />
        </View>

        {/* Jenis */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Jenis Dompet</Text>
          <ChipGroup options={WALLET_TYPES} value={type} onChange={v => setType(v as WalletType)} />
        </View>

        {/* Mata Uang */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Mata Uang</Text>
          <ChipGroup options={CURRENCY_OPTIONS} value={currency} onChange={setCurrency} />
          <TextInput
            value={customCurrency}
            onChangeText={v => setCustomCurrency(v.toUpperCase().slice(0, 3))}
            placeholder="Lainnya (cth. JPY)"
            placeholderTextColor={colors.textPlaceholder}
            style={[styles.currencyInput, { color: colors.textPrimary, backgroundColor: colors.bgInput, borderColor: colors.border, fontFamily: 'JetBrainsMono-Regular' }]}
            maxLength={3}
            autoCapitalize="characters"
            accessibilityLabel="Mata uang lainnya"
          />
        </View>

        {/* Saldo Awal */}
        {!isEdit && (
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Saldo Awal</Text>
            <CurrencyInput
              value={initialBalanceStr}
              onChangeText={(raw, num) => { setInitialBalanceStr(raw); setInitialBalanceNum(num); }}
              currency={finalCurrency}
            />
          </View>
        )}

        {/* Ikon */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Ikon</Text>
          <IconPicker value={icon} color={color} onSelect={setIcon} />
        </View>

        {/* Warna */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Warna</Text>
          <ColorPicker value={color} onChange={setColor} />
        </View>

        <Button
          label={isEdit ? 'Simpan Perubahan' : 'Simpan Dompet'}
          onPress={() => void handleSave()}
          loading={loading}
          disabled={!name.trim() || loading}
          fullWidth
          style={styles.saveBtn}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 20 },
  field: { gap: 8 },
  label: { fontSize: 13, lineHeight: 18 },
  input: { height: 48, borderRadius: 12, paddingHorizontal: 14, fontSize: 16, lineHeight: 24 },
  currencyInput: { height: 40, borderRadius: 10, paddingHorizontal: 12, fontSize: 14, lineHeight: 20, borderWidth: 1 },
  saveBtn: { marginTop: 8 },
});
