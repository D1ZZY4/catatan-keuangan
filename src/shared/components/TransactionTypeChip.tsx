import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { AppIcon } from './AppIcon';
import type { TransactionType } from '../types';
import { AppLabels } from '../config/labels';

const TYPE_CONFIG: Record<
  TransactionType,
  { icon: string; bg: string; textColor: string; iconColor: string }
> = {
  expense: {
    icon: 'arrow-down-circle',
    bg: 'rgba(198,40,40,0.12)',
    textColor: '#C62828',
    iconColor: '#C62828',
  },
  income: {
    icon: 'arrow-up-circle',
    bg: 'rgba(46,125,50,0.12)',
    textColor: '#2E7D32',
    iconColor: '#2E7D32',
  },
  transfer_internal: {
    icon: 'arrow-left-right',
    bg: 'rgba(140,192,235,0.15)',
    textColor: '#1A5276',
    iconColor: '#8CC0EB',
  },
  transfer_external: {
    icon: 'share',
    bg: 'rgba(140,192,235,0.15)',
    textColor: '#1A5276',
    iconColor: '#8CC0EB',
  },
  debt_given: {
    icon: 'trending-up',
    bg: 'rgba(230,81,0,0.1)',
    textColor: '#E65100',
    iconColor: '#E65100',
  },
  debt_received: {
    icon: 'trending-down',
    bg: 'rgba(106,27,154,0.1)',
    textColor: '#6A1B9A',
    iconColor: '#6A1B9A',
  },
  debt_repay: {
    icon: 'check',
    bg: 'rgba(46,125,50,0.08)',
    textColor: '#2E7D32',
    iconColor: '#2E7D32',
  },
  savings_deposit: {
    icon: 'piggy-bank',
    bg: 'rgba(0,131,143,0.1)',
    textColor: '#00838F',
    iconColor: '#00838F',
  },
  savings_withdraw: {
    icon: 'coins',
    bg: 'rgba(0,131,143,0.08)',
    textColor: '#00838F',
    iconColor: '#00838F',
  },
  invest_buy: {
    icon: 'trending-up',
    bg: 'rgba(25,118,210,0.1)',
    textColor: '#1565C0',
    iconColor: '#1565C0',
  },
  invest_sell: {
    icon: 'trending-down',
    bg: 'rgba(25,118,210,0.08)',
    textColor: '#1565C0',
    iconColor: '#1565C0',
  },
};

interface TransactionTypeChipProps {
  type: TransactionType;
  showLabel?: boolean;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function TransactionTypeChip({
  type,
  showLabel = true,
  size = 'sm',
  style,
}: TransactionTypeChipProps): React.ReactElement {
  const cfg = TYPE_CONFIG[type];
  const iconSize = size === 'sm' ? 13 : 16;
  const paddingH = size === 'sm' ? 8 : 12;
  const paddingV = size === 'sm' ? 4 : 6;

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          backgroundColor: cfg.bg,
          borderRadius: 20,
          paddingHorizontal: paddingH,
          paddingVertical: paddingV,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <AppIcon name={cfg.icon} size={iconSize} color={cfg.iconColor} />
      {showLabel && (
        <AppText
          variant="labelSmall"
          color={cfg.textColor}
          style={{ fontFamily: 'DMSans-Medium' }}
        >
          {AppLabels.transactionType[type]}
        </AppText>
      )}
    </View>
  );
}

export function getTypeColor(type: TransactionType): string {
  return TYPE_CONFIG[type]?.iconColor ?? '#6B6555';
}
