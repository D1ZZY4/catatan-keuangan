import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../src/shared/components/AppText';
import { AppIcon } from '../../src/shared/components/AppIcon';
import { AppCard } from '../../src/shared/components/AppCard';
import { TransactionTypeChip } from '../../src/shared/components/TransactionTypeChip';
import { BalanceText } from '../../src/shared/components/BalanceText';
import { AppButton } from '../../src/shared/components/AppButton';
import { useTheme } from '../../src/shared/theme/ThemeContext';
import { AppLabels } from '../../src/shared/config/labels';
import { formatDateTime } from '../../src/shared/utils/formatters';
import { database, transactions } from '../../src/shared/db/database';
import type { TransactionType } from '../../src/shared/types';

export default function TransactionDetailModal(): React.ReactElement {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    id?: string;
    type?: string;
    amount?: string;
    currency?: string;
    note?: string;
    date?: string;
    categoryId?: string;
    walletId?: string;
  }>();

  const [deleting, setDeleting] = useState(false);

  const txType = (params.type ?? 'expense') as TransactionType;
  const amount = parseFloat(params.amount ?? '0');
  const currency = params.currency ?? 'IDR';
  const note = params.note ?? '';
  const date = parseInt(params.date ?? Date.now().toString(), 10);

  async function handleDelete(): Promise<void> {
    if (params.id === undefined) return;
    Alert.alert(
      'Hapus Transaksi',
      'Yakin ingin menghapus transaksi ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await database.write(async () => {
                const record = await transactions.find(params.id!);
                await record.destroyPermanently();
              });
              router.back();
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
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
          <AppIcon name="chevron-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <AppText variant="headingMedium" color={colors.textPrimary}>
          Detail Transaksi
        </AppText>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: '/(modals)/transaction-form',
              params: { type: txType, transactionId: params.id },
            })
          }
        >
          <AppIcon name="edit" size={20} color={colors.accentPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 24,
          paddingBottom: 40,
          gap: 16,
          alignItems: 'center',
        }}
      >
        <TransactionTypeChip type={txType} size="md" />

        <BalanceText
          amount={amount}
          currency={currency}
          variant="displayLarge"
        />

        <AppCard style={{ width: '100%', gap: 16 }}>
          <DetailRow
            icon="calendar"
            label="Tanggal"
            value={formatDateTime(date)}
            colors={colors}
          />
          {note.length > 0 && (
            <DetailRow
              icon="edit"
              label="Catatan"
              value={note}
              colors={colors}
            />
          )}
          <DetailRow
            icon="wallet"
            label="Dompet"
            value={params.walletId ?? '—'}
            colors={colors}
          />
          <DetailRow
            icon="tag"
            label="Kategori"
            value={params.categoryId ?? '—'}
            colors={colors}
          />
        </AppCard>

        {params.id !== undefined && (
          <AppButton
            label="Hapus Transaksi"
            variant="danger"
            icon="trash"
            fullWidth
            onPress={() => void handleDelete()}
            loading={deleting}
          />
        )}
      </ScrollView>
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
  colors,
}: {
  icon: string;
  label: string;
  value: string;
  colors: ReturnType<typeof useTheme>['colors'];
}): React.ReactElement {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          backgroundColor: colors.bgSurface,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AppIcon name={icon} size={15} color={colors.textMuted} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText variant="labelSmall" color={colors.textMuted}>
          {label}
        </AppText>
        <AppText variant="bodyMedium" color={colors.textPrimary}>
          {value}
        </AppText>
      </View>
    </View>
  );
}
