import type React from 'react';
import {
  Wallet, Wallet1, Wallet2, Wallet3,
  EmptyWallet, EmptyWalletAdd, EmptyWalletChange, EmptyWalletTick,
  Card, CardAdd, CardCoin, CardEdit, CardPos, CardReceive, CardSend, CardTick,
  Coin, Coin1, DollarCircle, DollarSquare,
  Bank, MoneyRecive, MoneySend, MoneyAdd, MoneyRemove, Moneys,
  ReceiptItem, ReceiptSquare, Bill,
  Chart, Chart1, Chart2, Graph, TrendUp, TrendDown,
  Bitcoin, BitcoinCard,
  Bag, Bag2, BagHappy, BagTick, ShoppingCart,
  Tag, Gift,
  Airplane, AirplaneSquare, Bus, Car, TruckFast,
  Building, Buildings, Buildings2,
  Book, Book1, BookSaved, BookSquare,
  Hospital, Heart,
  Monitor, Mobile, Keyboard,
  MusicPlay, Video, Game, Gameboy,
  Man, Woman,
  Star1, Award, Crown, Diamonds,
  ArrowSwapHorizontal, DirectSend,
  Setting2, Refresh2, Edit, Edit2,
  HomeTrendUp, HomeTrendDown,
} from 'iconsax-react-native';

export type IsaxVariant = 'Linear' | 'Outline' | 'Broken' | 'Bulk' | 'Bold' | 'TwoTone';

export type IsaxIconComponent = React.ComponentType<{
  size?: number;
  color?: string;
  variant?: IsaxVariant;
}>;

export const CURATED_ISAX_ICONS: string[] = [
  'Wallet', 'Wallet1', 'Wallet2', 'Wallet3',
  'EmptyWallet', 'EmptyWalletAdd', 'EmptyWalletChange', 'EmptyWalletTick',
  'Card', 'CardAdd', 'CardCoin', 'CardEdit', 'CardPos', 'CardReceive', 'CardSend', 'CardTick',
  'Coin', 'Coin1', 'DollarCircle', 'DollarSquare',
  'Bank', 'MoneyRecive', 'MoneySend', 'MoneyAdd', 'MoneyRemove', 'Moneys',
  'ReceiptItem', 'ReceiptSquare', 'Bill',
  'Chart', 'Chart1', 'Chart2', 'Graph', 'TrendUp', 'TrendDown',
  'Bitcoin', 'BitcoinCard',
  'Bag', 'Bag2', 'BagHappy', 'BagTick', 'ShoppingCart',
  'Tag', 'Gift',
  'Airplane', 'AirplaneSquare', 'Bus', 'Car', 'TruckFast',
  'Building', 'Buildings', 'Buildings2',
  'Book', 'Book1', 'BookSaved', 'BookSquare',
  'Hospital', 'Heart',
  'Monitor', 'Mobile', 'Keyboard',
  'MusicPlay', 'Video', 'Game', 'Gameboy',
  'Man', 'Woman',
  'Star1', 'Award', 'Crown', 'Diamonds',
  'ArrowSwapHorizontal', 'DirectSend',
  'Setting2', 'Refresh2', 'Edit', 'Edit2',
  'HomeTrendUp', 'HomeTrendDown',
];

const ISAX_MAP: Record<string, IsaxIconComponent> = {
  Wallet, Wallet1, Wallet2, Wallet3,
  EmptyWallet, EmptyWalletAdd, EmptyWalletChange, EmptyWalletTick,
  Card, CardAdd, CardCoin, CardEdit, CardPos, CardReceive, CardSend, CardTick,
  Coin, Coin1, DollarCircle, DollarSquare,
  Bank, MoneyRecive, MoneySend, MoneyAdd, MoneyRemove, Moneys,
  ReceiptItem, ReceiptSquare, Bill,
  Chart, Chart1, Chart2, Graph, TrendUp, TrendDown,
  Bitcoin, BitcoinCard,
  Bag, Bag2, BagHappy, BagTick, ShoppingCart,
  Tag, Gift,
  Airplane, AirplaneSquare, Bus, Car, TruckFast,
  Building, Buildings, Buildings2,
  Book, Book1, BookSaved, BookSquare,
  Hospital, Heart,
  Monitor, Mobile, Keyboard,
  MusicPlay, Video, Game, Gameboy,
  Man, Woman,
  Star1, Award, Crown, Diamonds,
  ArrowSwapHorizontal, DirectSend,
  Setting2, Refresh2, Edit, Edit2,
  HomeTrendUp, HomeTrendDown,
};

export function getIsaxIcon(name: string): IsaxIconComponent | undefined {
  return ISAX_MAP[name];
}
