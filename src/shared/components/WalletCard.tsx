import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatCurrency } from '@/shared/utils/formatters';

const WALLET_TYPE_LABELS: Record<string, string> = {
  cash: 'Tunai',
  bank: 'Bank',
  'e-wallet': 'E-Wallet',
  investment: 'Investasi',
  savings: 'Tabungan',
  credit: 'Kredit',
  crypto: 'Kripto',
  other: 'Lainnya',
};

interface WalletCardProps {
  wallet: { id: string; name: string; color: string; currency: string; type: string; balance: number };
  onPress?: () => void;
}

export const WalletCard = memo(function WalletCard({ wallet, onPress }: WalletCardProps) {
  const { colors, shadows } = useTheme();
  const accentColor = wallet.color || colors.accentPrimary;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.bgCard },
        shadows.md,
        pressed && styles.pressed,
      ]}
      accessibilityLabel={`Dompet ${wallet.name}, saldo ${formatCurrency(wallet.balance, wallet.currency)}`}
      accessibilityRole="button"
    >
      {/* Color accent stripe at top */}
      <View style={[styles.accentBar, { backgroundColor: `${accentColor}30` }]} />

      <View style={styles.body}>
        {/* Header row: icon + type badge */}
        <View style={styles.header}>
          <View style={[styles.iconBadge, { backgroundColor: `${accentColor}25` }]}>
            <View style={[styles.colorDot, { backgroundColor: accentColor }]} />
          </View>
          <View style={[styles.typePill, { backgroundColor: `${accentColor}15` }]}>
            <Text style={[styles.typePillText, { color: accentColor, fontFamily: 'DMSans-SemiBold' }]}>
              {WALLET_TYPE_LABELS[wallet.type] ?? wallet.type}
            </Text>
          </View>
        </View>

        {/* Wallet name */}
        <Text
          style={[styles.walletName, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}
          numberOfLines={1}
        >
          {wallet.name}
        </Text>

        {/* Balance */}
        <Text
          style={[styles.balance, { color: colors.textPrimary, fontFamily: 'InstrumentSerif-Regular' }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {formatCurrency(wallet.balance, wallet.currency)}
        </Text>

        {/* Currency */}
        <Text style={[styles.currency, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
          {wallet.currency}
        </Text>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    minWidth: 150,
  },
  pressed: { opacity: 0.8, transform: [{ scale: 0.97 }] },
  accentBar: { height: 5, width: '100%' },
  body: { padding: 14, gap: 5 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorDot: { width: 14, height: 14, borderRadius: 7 },
  typePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  typePillText: { fontSize: 10 },
  walletName: { fontSize: 14, lineHeight: 20 },
  balance: { fontSize: 22, lineHeight: 28 },
  currency: { fontSize: 11, lineHeight: 16 },
});
