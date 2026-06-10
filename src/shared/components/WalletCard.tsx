import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatCurrency } from '@/shared/utils/formatters';
import { getLucideIcon } from '@/shared/utils/lucideIcons';

interface WalletCardProps {
  wallet: { id: string; name: string; icon?: string; color: string; currency: string; type: string; balance: number };
  onPress?: () => void;
}

export const WalletCard = memo(function WalletCard({ wallet, onPress }: WalletCardProps) {
  const { colors, shadows } = useTheme();
  const accentColor = wallet.color || colors.accentPrimary;
  const IconComp = getLucideIcon(wallet.icon ?? '');

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
      <View style={styles.body}>
        {/* Header row: icon badge + currency badge */}
        <View style={styles.header}>
          <View style={[styles.iconBadge, { backgroundColor: `${accentColor}22` }]}>
            <IconComp size={18} color={accentColor} strokeWidth={1.8} />
          </View>
          <View style={[styles.currencyBadge, { backgroundColor: colors.bgPage }]}>
            <Text style={[styles.currencyBadgeText, { color: colors.textMuted, fontFamily: 'DMSans-SemiBold' }]}>
              {wallet.currency}
            </Text>
          </View>
        </View>

        {/* Wallet name */}
        <Text
          style={[styles.walletName, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}
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
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    minWidth: 150,
  },
  pressed: { opacity: 0.8, transform: [{ scale: 0.97 }] },
  body: { padding: 14, gap: 3 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  currencyBadgeText: { fontSize: 10, letterSpacing: 0.5 },
  walletName: { fontSize: 12, lineHeight: 16 },
  balance: { fontSize: 20, lineHeight: 26 },
});
