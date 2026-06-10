import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../src/shared/components/AppText';
import { AppButton } from '../../src/shared/components/AppButton';
import { AppIcon } from '../../src/shared/components/AppIcon';
import { TransactionTypeChip } from '../../src/shared/components/TransactionTypeChip';
import { useTheme } from '../../src/shared/theme/ThemeContext';
import { AppLabels } from '../../src/shared/config/labels';
import type { TransactionType } from '../../src/shared/types';
import { database, transactions, wallets, categories } from '../../src/shared/db/database';
import type { TransactionModel } from '../../src/shared/db/models/Transaction';
import { useSettings } from '../../src/shared/hooks/useSettings';
import { newId } from '../../src/shared/utils/misc';
import { formatCurrency } from '../../src/shared/utils/formatters';

export default function TransactionFormModal(): React.ReactElement {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { settings } = useSettings();
  const params = useLocalSearchParams<{ type?: string; transactionId?: string }>();

  const txType = (params.type ?? 'expense') as TransactionType;

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [saving, setSaving] = useState(false);

  function handleClose(): void {
    router.back();
  }

  async function handleSave(): Promise<void> {
    const numAmount = parseFloat(amount.replace(/[^\d.]/g, ''));
    if (numAmount <= 0 || isNaN(numAmount)) return;

    setSaving(true);
    try {
      await database.write(async () => {
        await transactions.create((record: TransactionModel) => {
          record.txType = txType;
          record.amount = numAmount;
          record.currency = settings.baseCurrency;
          record.walletId = '';
          record.categoryId = '';
          record.date = selectedDate.getTime();
          record.note = note;
          record.createdAt = Date.now();
          record.updatedAt = Date.now();
        });
      });
      router.back();
    } catch (e) {
      console.error('Save transaction failed', e);
    } finally {
      setSaving(false);
    }
  }

  const title = AppLabels.transactionForm.addTitle(txType);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bgPage,
        }}
      >
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
          <TouchableOpacity onPress={handleClose}>
            <AppIcon name="x" size={22} color={colors.textMuted} />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TransactionTypeChip type={txType} showLabel={false} />
            <AppText
              variant="headingMedium"
              color={colors.textPrimary}
            >
              {title}
            </AppText>
          </View>
          <AppButton
            label="Simpan"
            onPress={() => void handleSave()}
            size="sm"
            loading={saving}
            disabled={!amount || parseFloat(amount) <= 0}
          />
        </View>

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 24,
            paddingBottom: 40,
            gap: 20,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ alignItems: 'center', gap: 8 }}>
            <AppText variant="labelSmall" color={colors.textMuted} center>
              Jumlah ({settings.baseCurrency})
            </AppText>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <AppText
                variant="displayMedium"
                color={colors.textMuted}
                style={{ marginRight: 4 }}
              >
                Rp
              </AppText>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
                placeholderTextColor={colors.textPlaceholder}
                keyboardType="numeric"
                style={{
                  fontFamily: 'InstrumentSerif-Regular',
                  fontSize: 48,
                  color: colors.textPrimary,
                  minWidth: 80,
                  textAlign: 'center',
                }}
              />
            </View>
          </View>

          <View
            style={{
              backgroundColor: colors.bgInput,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 16,
              paddingVertical: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <AppIcon name="tag" size={18} color={colors.textMuted} />
            <AppText variant="bodyMedium" color={colors.textPlaceholder}>
              Pilih kategori
            </AppText>
          </View>

          <View
            style={{
              backgroundColor: colors.bgInput,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 16,
              paddingVertical: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <AppIcon name="wallet" size={18} color={colors.textMuted} />
            <AppText variant="bodyMedium" color={colors.textPlaceholder}>
              Pilih dompet
            </AppText>
          </View>

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
              gap: 10,
            }}
          >
            <AppIcon name="edit" size={18} color={colors.textMuted} />
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder={AppLabels.transactionForm.notePlaceholder}
              placeholderTextColor={colors.textPlaceholder}
              style={{
                flex: 1,
                fontFamily: 'DMSans-Regular',
                fontSize: 14,
                color: colors.textPrimary,
              }}
              multiline
            />
          </View>

          <View
            style={{
              backgroundColor: colors.bgInput,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 16,
              paddingVertical: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <AppIcon name="calendar" size={18} color={colors.textMuted} />
            <AppText variant="bodyMedium" color={colors.textPrimary}>
              {selectedDate.toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </AppText>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
