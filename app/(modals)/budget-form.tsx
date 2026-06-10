import React, { useState, useEffect } from 'react';
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
import { AppCard } from '../../src/shared/components/AppCard';
import { Divider } from '../../src/shared/components/Divider';
import { useTheme } from '../../src/shared/theme/ThemeContext';
import { AppLabels } from '../../src/shared/config/labels';
import { useBudgets } from '../../src/shared/hooks/useBudgets';
import { useCategories } from '../../src/shared/hooks/useCategories';
import { useSettings } from '../../src/shared/hooks/useSettings';
import { formatCurrency } from '../../src/shared/utils/formatters';
import type { Category } from '../../src/shared/types';

export default function BudgetFormModal(): React.ReactElement {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { settings } = useSettings();
  const params = useLocalSearchParams<{ budgetId?: string }>();
  const { data: allBudgets, createBudget, updateBudget } = useBudgets();
  const { data: allCategories } = useCategories('expense');

  const editBudget = params.budgetId
    ? allBudgets.find((b) => b.id === params.budgetId)
    : undefined;

  const [categoryId, setCategoryId] = useState(editBudget?.categoryId ?? '');
  const [amount, setAmount] = useState(
    editBudget ? String(editBudget.amount) : '',
  );
  const [period, setPeriod] = useState<'monthly' | 'weekly'>(
    editBudget?.period ?? 'monthly',
  );
  const [notifyAt, setNotifyAt] = useState(
    editBudget?.notifyAt ?? 80,
  );
  const [saving, setSaving] = useState(false);

  const existingCategoryIds = new Set(
    allBudgets
      .filter((b) => b.id !== editBudget?.id)
      .map((b) => b.categoryId),
  );

  const availableCategories = allCategories.filter(
    (c) => !existingCategoryIds.has(c.id),
  );

  async function handleSave(): Promise<void> {
    if (!categoryId) {
      Alert.alert('Pilih kategori terlebih dahulu');
      return;
    }
    const num = parseFloat(amount.replace(/[^\d.]/g, ''));
    if (!num || num <= 0) {
      Alert.alert('Masukkan nominal anggaran');
      return;
    }
    setSaving(true);
    try {
      if (editBudget) {
        await updateBudget(editBudget.id, { categoryId, amount: num, period, notifyAt });
      } else {
        await createBudget({
          categoryId,
          amount: num,
          currency: settings.baseCurrency,
          period,
          notifyAt,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        });
      }
      router.back();
    } catch {
      Alert.alert('Gagal menyimpan anggaran');
    } finally {
      setSaving(false);
    }
  }

  const selectedCategory = allCategories.find((c) => c.id === categoryId);

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
          {editBudget ? 'Edit Anggaran' : 'Tambah Anggaran'}
        </AppText>
        <AppButton
          label={AppLabels.transactionForm.saveButton}
          onPress={() => void handleSave()}
          loading={saving}
          size="sm"
        />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 8 }}>
          <AppText variant="labelMedium" color={colors.textMuted}>
            Kategori
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {availableCategories.map((cat: Category) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setCategoryId(cat.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 20,
                  borderWidth: 1.5,
                  borderColor: categoryId === cat.id ? cat.color : colors.border,
                  backgroundColor:
                    categoryId === cat.id ? cat.color + '22' : colors.bgCard,
                }}
              >
                <AppIcon name={cat.icon} size={14} color={cat.color} />
                <AppText
                  variant="bodySmall"
                  color={categoryId === cat.id ? cat.color : colors.textPrimary}
                >
                  {cat.name}
                </AppText>
              </TouchableOpacity>
            ))}
            {editBudget && selectedCategory && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 20,
                  borderWidth: 1.5,
                  borderColor: selectedCategory.color,
                  backgroundColor: selectedCategory.color + '22',
                }}
              >
                <AppIcon name={selectedCategory.icon} size={14} color={selectedCategory.color} />
                <AppText variant="bodySmall" color={selectedCategory.color}>
                  {selectedCategory.name}
                </AppText>
              </View>
            )}
          </View>
        </View>

        <Divider />

        <View style={{ gap: 8 }}>
          <AppText variant="labelMedium" color={colors.textMuted}>
            Nominal Anggaran ({settings.baseCurrency})
          </AppText>
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
            <AppText variant="bodyMedium" color={colors.textMuted}>Rp</AppText>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.textPlaceholder}
              style={{
                flex: 1,
                color: colors.textPrimary,
                fontSize: 18,
                fontFamily: 'DMSans-Medium',
              }}
            />
          </View>
        </View>

        <Divider />

        <View style={{ gap: 8 }}>
          <AppText variant="labelMedium" color={colors.textMuted}>Periode</AppText>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {(['monthly', 'weekly'] as const).map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => setPeriod(p)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor:
                    period === p ? colors.accentPrimary : colors.border,
                  backgroundColor:
                    period === p ? colors.accentPrimary + '22' : colors.bgCard,
                  alignItems: 'center',
                }}
              >
                <AppText
                  variant="bodyMedium"
                  color={period === p ? colors.accentPrimary : colors.textMuted}
                >
                  {p === 'monthly' ? 'Bulanan' : 'Mingguan'}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Divider />

        <View style={{ gap: 8 }}>
          <AppText variant="labelMedium" color={colors.textMuted}>
            Notifikasi saat {notifyAt}% tercapai
          </AppText>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {[50, 60, 70, 80, 90, 100].map((pct) => (
              <TouchableOpacity
                key={pct}
                onPress={() => setNotifyAt(pct)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 20,
                  borderWidth: 1.5,
                  borderColor:
                    notifyAt === pct ? colors.accentPrimary : colors.border,
                  backgroundColor:
                    notifyAt === pct ? colors.accentPrimary + '22' : colors.bgCard,
                }}
              >
                <AppText
                  variant="bodySmall"
                  color={notifyAt === pct ? colors.accentPrimary : colors.textMuted}
                >
                  {pct}%
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
