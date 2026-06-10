import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppBar } from '@/shared/components/AppBar';
import { Button } from '@/shared/components/Button';
import { ColorPicker } from '@/shared/components/ColorPicker';
import { IconPicker } from '@/shared/components/IconPicker';
import { CurrencyInput } from '@/shared/components/CurrencyInput';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { database } from '@/shared/db';
import { useToast } from '@/shared/components/Toast';
import type { WalletType } from '@/shared/types';

type FormTab = 'dasar' | 'ikon' | 'warna';

const WALLET_TYPES: { value: WalletType; label: string }[] = [
  { value: 'cash', label: 'Tunai' },
  { value: 'bank', label: 'Bank' },
  { value: 'savings', label: 'Tabungan' },
  { value: 'e-wallet', label: 'E-Wallet' },
  { value: 'investment', label: 'Investasi' },
  { value: 'credit', label: 'Kredit' },
  { value: 'crypto', label: 'Kripto' },
  { value: 'other', label: 'Lainnya' },
];

const CURRENCY_OPTIONS = ['IDR', 'USD', 'SGD', 'EUR', 'MYR', 'JPY', 'GBP', 'AUD'];

export default function FormDompetScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showToast } = useToast();
  const params = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!params.id;

  const [activeTab, setActiveTab] = useState<FormTab>('dasar');
  const [name, setName] = useState('');
  const [type, setType] = useState<WalletType>('cash');
  const [currency, setCurrency] = useState('IDR');
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

  const handleSave = async () => {
    if (!name.trim()) { showToast('Nama dompet tidak boleh kosong', 'error'); return; }
    setLoading(true);
    try {
      await database.write(async () => {
        if (isEdit && params.id) {
          const record = await database.get<import('@/shared/db').WalletModel>('wallets').find(params.id);
          await record.update(() => {
            record.name = name.trim();
            record.icon = icon;
            record.color = color;
            record.currency = currency;
            record.type = type;
          });
        } else {
          await database.get<import('@/shared/db').WalletModel>('wallets').create((record) => {
            record.name = name.trim();
            record.icon = icon;
            record.color = color;
            record.currency = currency;
            record.balance = initialBalanceNum;
            record.initialBalance = initialBalanceNum;
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

  const accentColor = colors.accentPrimary ?? '#8CC0EB';
  const TABS: { id: FormTab; label: string }[] = [
    { id: 'dasar', label: 'Dasar' },
    { id: 'ikon', label: 'Ikon' },
    { id: 'warna', label: 'Warna' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
      <AppBar title={isEdit ? 'Edit Dompet' : 'Tambah Dompet'} showBack />

      {/* Form tabs */}
      <View style={[styles.tabRow, { borderBottomColor: colors.border }]}>
        {TABS.map(t => (
          <Pressable
            key={t.id}
            onPress={() => setActiveTab(t.id)}
            style={[
              styles.tab,
              activeTab === t.id && { borderBottomColor: accentColor, borderBottomWidth: 2 },
            ]}
            accessibilityLabel={`Tab ${t.label}`}
            accessibilityRole="tab"
          >
            <Text style={[
              styles.tabLabel,
              {
                color: activeTab === t.id ? accentColor : colors.textMuted,
                fontFamily: 'DMSans-Medium',
              },
            ]}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ──── Dasar tab ──── */}
        {activeTab === 'dasar' && (
          <>
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Nama Dompet</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="cth. Dompet Tunai, BCA, GoPay…"
                placeholderTextColor={colors.textPlaceholder}
                style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.bgInput, fontFamily: 'DMSans-Regular' }]}
                maxLength={40}
                autoFocus
                accessibilityLabel="Nama dompet"
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Mata Uang</Text>
              <View style={styles.chipGrid}>
                {CURRENCY_OPTIONS.map(c => (
                  <Pressable
                    key={c}
                    onPress={() => setCurrency(c)}
                    style={[
                      styles.typeChip,
                      { backgroundColor: currency === c ? accentColor : colors.bgCard },
                    ]}
                    accessibilityLabel={`Mata uang ${c}`}
                    accessibilityRole="button"
                  >
                    <Text style={[
                      styles.typeChipLabel,
                      { color: currency === c ? '#fff' : colors.textMuted, fontFamily: 'DMSans-Medium' },
                    ]}>
                      {c}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Jenis Dompet</Text>
              <View style={styles.chipGrid}>
                {WALLET_TYPES.map(opt => (
                  <Pressable
                    key={opt.value}
                    onPress={() => setType(opt.value)}
                    style={[
                      styles.typeChip,
                      { backgroundColor: type === opt.value ? accentColor : colors.bgCard },
                    ]}
                    accessibilityLabel={`Jenis ${opt.label}`}
                    accessibilityRole="button"
                  >
                    <Text style={[
                      styles.typeChipLabel,
                      { color: type === opt.value ? '#fff' : colors.textMuted, fontFamily: 'DMSans-Medium' },
                    ]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {!isEdit && (
              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Saldo Awal</Text>
                <CurrencyInput
                  value={initialBalanceStr}
                  onChangeText={(raw, num) => { setInitialBalanceStr(raw); setInitialBalanceNum(num); }}
                  currency={currency}
                />
              </View>
            )}
          </>
        )}

        {/* ──── Ikon tab ──── */}
        {activeTab === 'ikon' && (
          <IconPicker value={icon} onChange={setIcon} color={color} />
        )}

        {/* ──── Warna tab ──── */}
        {activeTab === 'warna' && (
          <ColorPicker value={color} onChange={setColor} />
        )}

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
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 0,
  },
  tabLabel: { fontSize: 14 },
  content: { padding: 16, gap: 20 },
  field: { gap: 8 },
  label: { fontSize: 13, lineHeight: 18 },
  input: { height: 48, borderRadius: 12, paddingHorizontal: 14, fontSize: 16, lineHeight: 24 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeChipLabel: { fontSize: 13 },
  saveBtn: { marginTop: 8 },
});
