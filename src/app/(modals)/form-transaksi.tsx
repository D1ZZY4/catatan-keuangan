import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, KeyboardAvoidingView, Platform, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppBar } from '@/shared/components/AppBar';
import { Button } from '@/shared/components/Button';
import { CurrencyInput } from '@/shared/components/CurrencyInput';
import { DatePicker } from '@/shared/components/DatePicker';
import { useToast } from '@/shared/components/Toast';
import { database } from '@/shared/db';
import {
  TYPE_OPTIONS, requiresPersonFields, isExpenseType,
} from '@/shared/constants/transactionTypes';
import { useWalletList } from '@/features/wallets/useWalletList';
import { useAutoCategory } from '@/shared/hooks/useAutoCategory';
import type { TransactionType } from '@/shared/types';
import { Sparkles } from 'lucide-react-native';
import { DynamicIcon } from '@/shared/components/DynamicIcon';

export default function FormTransaksiScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showToast } = useToast();
  const params = useLocalSearchParams<{ type?: string; amount?: string; note?: string }>();

  const [txType, setTxType] = useState<TransactionType>(
    (params.type as TransactionType) ?? 'expense'
  );
  const [amountStr, setAmountStr] = useState(params.amount ?? '');
  const [amountNum, setAmountNum] = useState(0);
  const [walletId, setWalletId] = useState('');
  const [toWalletId, setToWalletId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState(params.note ?? '');
  const [personName, setPersonName] = useState('');
  const [txDate, setTxDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; icon: string; type: string; color: string }>>([]);
  const { wallets } = useWalletList();

  const suggestedCat = useAutoCategory(note, txType, categories);

  useEffect(() => {
    void loadCategories();
  }, []);

  useEffect(() => {
    if (wallets.length > 0 && !walletId) {
      setWalletId(wallets[0]?.id ?? '');
    }
  }, [wallets, walletId]);

  async function loadCategories() {
    try {
      const records = await database.get<import('@/shared/db').CategoryModel>('categories').query().fetch();
      setCategories(records.map(c => ({ id: c.id, name: c.name, icon: c.icon, type: c.type, color: c.color })));
    } catch {
      setCategories([]);
    }
  }

  const filteredCategories = categories.filter(c => {
    if (isExpenseType(txType)) return c.type === 'expense';
    return c.type === 'income';
  });

  const isValid = amountNum > 0 && walletId;

  const handleSave = async () => {
    if (!isValid) return;
    setLoading(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await database.write(async () => {
        await database.get<import('@/shared/db').TransactionModel>('transactions').create((record) => {
          record.type = txType;
          record.walletId = walletId;
          if (toWalletId && txType === 'transfer_internal') record.toWalletId = toWalletId;
          record.categoryId = categoryId || (filteredCategories[0]?.id ?? '');
          record.amount = amountNum;
          record.currency = wallets.find(w => w.id === walletId)?.currency ?? 'IDR';
          if (note) record.note = note;
          if (personName) record.personName = personName;
          record.date = txDate.getTime();
          // @ts-expect-error WatermelonDB handles this
          record._raw.created_at = Date.now();
        });

        const walletRecord = await database.get('wallets').find(walletId) as import('@/shared/db').WalletModel;
        await walletRecord.update(() => {
          const isDeduction = isExpenseType(txType);
          walletRecord.balance = isDeduction ? walletRecord.balance - amountNum : walletRecord.balance + amountNum;
        });

        if (txType === 'transfer_internal' && toWalletId) {
          const toWalletRecord = await database.get('wallets').find(toWalletId) as import('@/shared/db').WalletModel;
          await toWalletRecord.update(() => {
            toWalletRecord.balance = toWalletRecord.balance + amountNum;
          });
        }
      });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Transaksi berhasil disimpan', 'success');
      router.back();
    } catch {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast('Gagal menyimpan transaksi. Coba lagi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bgPage }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AppBar title="Transaksi Baru" showBack />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Tipe */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
          <View style={styles.typeRow}>
            {TYPE_OPTIONS.map(opt => (
              <Pressable
                key={opt.type}
                onPress={() => { setTxType(opt.type); setCategoryId(''); }}
                style={[
                  styles.typeChip,
                  { backgroundColor: txType === opt.type ? colors.accentPrimary : colors.bgSurface },
                ]}
                accessibilityLabel={opt.label}
              >
                <Text style={[styles.typeLabel, { color: txType === opt.type ? colors.white : colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Nominal */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Nominal</Text>
          <CurrencyInput
            value={amountStr}
            onChangeText={(raw, num) => { setAmountStr(raw); setAmountNum(num); }}
            currency={wallets.find(w => w.id === walletId)?.currency ?? 'IDR'}
            large
          />
        </View>

        {/* Tanggal */}
        <DatePicker
          value={txDate}
          onChange={setTxDate}
          label="Tanggal"
          mode="datetime"
        />

        {/* Dompet */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>
            {txType === 'transfer_internal' ? 'Dari Dompet' : 'Dompet'}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              {wallets.filter(w => !w.isArchived).map(w => {
                const active = walletId === w.id;
                return (
                  <Pressable
                    key={w.id}
                    onPress={() => setWalletId(w.id)}
                    style={[
                      styles.walletChip,
                      { backgroundColor: active ? w.color : colors.bgSurface, borderColor: w.color, borderWidth: 1.5 },
                    ]}
                    accessibilityLabel={`Pilih dompet ${w.name}`}
                  >
                    <DynamicIcon name={w.icon ?? 'Wallet'} size={13} color={active ? colors.white : w.color} />
                    <Text style={[styles.chipLabel, { color: active ? colors.white : colors.textMuted, fontFamily: 'DMSans-Medium' }]}>
                      {w.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Dompet Tujuan */}
        {txType === 'transfer_internal' && (
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Ke Dompet</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                {wallets.filter(w => !w.isArchived && w.id !== walletId).map(w => {
                  const active = toWalletId === w.id;
                  return (
                    <Pressable
                      key={w.id}
                      onPress={() => setToWalletId(w.id)}
                      style={[
                        styles.walletChip,
                        { backgroundColor: active ? w.color : colors.bgSurface, borderColor: w.color, borderWidth: 1.5 },
                      ]}
                      accessibilityLabel={`Pilih dompet tujuan ${w.name}`}
                    >
                      <DynamicIcon name={w.icon ?? 'Wallet'} size={13} color={active ? colors.white : w.color} />
                      <Text style={[styles.chipLabel, { color: active ? colors.white : colors.textMuted, fontFamily: 'DMSans-Medium' }]}>
                        {w.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Auto-kategori saran */}
        {suggestedCat && !categoryId && (
          <Pressable
            onPress={() => setCategoryId(suggestedCat.id)}
            style={[styles.autoSuggest, { backgroundColor: `${suggestedCat.color}18`, borderColor: suggestedCat.color }]}
            accessibilityLabel={`Saran kategori: ${suggestedCat.name}`}
          >
            <Sparkles size={13} color={suggestedCat.color} />
            <Text style={[styles.autoSuggestText, { color: suggestedCat.color, fontFamily: 'DMSans-Regular' }]}>
              Saran: {suggestedCat.name}
            </Text>
          </Pressable>
        )}

        {/* Kategori */}
        {filteredCategories.length > 0 && (
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Kategori</Text>
            <View style={styles.catGrid}>
              {filteredCategories.map(cat => {
                const active = categoryId === cat.id;
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => setCategoryId(cat.id)}
                    style={[
                      styles.catChip,
                      {
                        backgroundColor: active ? `${cat.color}28` : colors.bgSurface,
                        borderColor: active ? cat.color : colors.border,
                        borderWidth: 1,
                      },
                    ]}
                    accessibilityLabel={`Pilih kategori ${cat.name}`}
                  >
                    <DynamicIcon name={cat.icon} size={12} color={active ? cat.color : colors.textMuted} />
                    <Text style={[styles.catLabel, { color: active ? cat.color : colors.textMuted, fontFamily: active ? 'DMSans-Medium' : 'DMSans-Regular' }]} numberOfLines={1}>
                      {cat.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* Nama Orang */}
        {requiresPersonFields(txType) && (
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Nama Orang</Text>
            <TextInput
              value={personName}
              onChangeText={setPersonName}
              placeholder="Nama..."
              placeholderTextColor={colors.textPlaceholder}
              style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.bgInput, fontFamily: 'DMSans-Regular' }]}
              maxLength={50}
              accessibilityLabel="Nama orang terkait"
            />
          </View>
        )}

        {/* Catatan */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Catatan (opsional)</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Tambahkan catatan..."
            placeholderTextColor={colors.textPlaceholder}
            style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.bgInput, fontFamily: 'DMSans-Regular' }]}
            maxLength={200}
            multiline
            numberOfLines={2}
            accessibilityLabel="Catatan transaksi"
          />
        </View>

        <Button
          label="Simpan Transaksi"
          onPress={() => void handleSave()}
          loading={loading}
          disabled={!isValid || loading}
          fullWidth
          style={styles.saveBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16 },
  typeScroll: { marginHorizontal: -16 },
  typeRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16 },
  typeChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  typeLabel: { fontSize: 13, lineHeight: 18 },
  field: { gap: 8 },
  label: { fontSize: 13, lineHeight: 18 },
  input: { height: 48, borderRadius: 12, paddingHorizontal: 14, fontSize: 15, lineHeight: 22 },
  chipRow: { flexDirection: 'row', gap: 8 },
  walletChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 5 },
  chipLabel: { fontSize: 13, lineHeight: 18 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, maxWidth: '48%', flexDirection: 'row', alignItems: 'center', gap: 5 },
  catLabel: { fontSize: 12, lineHeight: 18, flexShrink: 1 },
  saveBtn: { marginTop: 8 },
  autoSuggest: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1, alignSelf: 'flex-start' },
  autoSuggestText: { fontSize: 13, lineHeight: 18 },
});
