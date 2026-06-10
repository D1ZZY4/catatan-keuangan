import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../src/shared/components/AppText';
import { AppIcon } from '../../src/shared/components/AppIcon';
import { AppButton } from '../../src/shared/components/AppButton';
import { useTheme } from '../../src/shared/theme/ThemeContext';
import { AppLabels } from '../../src/shared/config/labels';
import type { TransactionType } from '../../src/shared/types';
import type { PeriodKey } from '../../src/shared/config/periods';
import { AppConfig } from '../../src/shared/config/periods';

export default function FilterModal(): React.ReactElement {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>('thisMonth');
  const [selectedTypes, setSelectedTypes] = useState<Set<TransactionType>>(new Set());

  const ALL_TYPES: Array<{ type: TransactionType; label: string }> = [
    { type: 'expense', label: AppLabels.transactionType.expense },
    { type: 'income', label: AppLabels.transactionType.income },
    { type: 'transfer_internal', label: AppLabels.transactionType.transfer_internal },
    { type: 'debt_given', label: AppLabels.transactionType.debt_given },
    { type: 'debt_received', label: AppLabels.transactionType.debt_received },
    { type: 'savings_deposit', label: AppLabels.transactionType.savings_deposit },
    { type: 'invest_buy', label: AppLabels.transactionType.invest_buy },
  ];

  function toggleType(type: TransactionType): void {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  function handleApply(): void {
    router.back();
  }

  function handleReset(): void {
    setSelectedPeriod('thisMonth');
    setSelectedTypes(new Set());
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
        <AppText variant="headingMedium" color={colors.textPrimary}>Filter</AppText>
        <TouchableOpacity onPress={handleReset}>
          <AppText variant="labelSmall" color={colors.accentPrimary}>Reset</AppText>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32, gap: 20 }}
      >
        <View style={{ gap: 10 }}>
          <AppText variant="labelSmall" color={colors.textMuted}>Periode</AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {AppConfig.periods.map((period) => (
              <TouchableOpacity
                key={period.key}
                onPress={() => setSelectedPeriod(period.key)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 20,
                  backgroundColor:
                    selectedPeriod === period.key ? colors.accentPrimary : colors.bgSurface,
                  borderWidth: 1,
                  borderColor: selectedPeriod === period.key ? colors.accentPrimary : colors.border,
                }}
              >
                <AppText
                  variant="labelSmall"
                  color={selectedPeriod === period.key ? colors.textPrimary : colors.textMuted}
                  style={{ fontFamily: selectedPeriod === period.key ? 'DMSans-SemiBold' : 'DMSans-Regular' }}
                >
                  {period.label}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ gap: 10 }}>
          <AppText variant="labelSmall" color={colors.textMuted}>Jenis Transaksi</AppText>
          <View style={{ gap: 8 }}>
            {ALL_TYPES.map(({ type, label }) => {
              const active = selectedTypes.has(type);
              return (
                <TouchableOpacity
                  key={type}
                  onPress={() => toggleType(type)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: 12,
                    backgroundColor: active ? colors.bgSurface : colors.bgInput,
                    borderWidth: 1,
                    borderColor: active ? colors.accentPrimary : colors.border,
                    gap: 10,
                  }}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: active ? colors.accentPrimary : colors.textMuted,
                      backgroundColor: active ? colors.accentPrimary : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {active && <AppIcon name="check" size={12} color="#1A1814" />}
                  </View>
                  <AppText variant="bodyMedium" color={colors.textPrimary}>{label}</AppText>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 16 }}>
        <AppButton label="Terapkan Filter" onPress={handleApply} fullWidth size="lg" />
      </View>
    </View>
  );
}
