import type { Transaction, Wallet } from '../types';

export function computeWalletBalance(
  wallet: Wallet,
  transactions: Transaction[],
): number {
  return transactions.reduce((acc, tx) => {
    if (tx.walletId === wallet.id) {
      switch (tx.type) {
        case 'income':
        case 'debt_received':
        case 'savings_withdraw':
        case 'invest_sell':
          return acc + tx.amount;
        case 'expense':
        case 'transfer_external':
        case 'debt_given':
        case 'savings_deposit':
        case 'invest_buy':
        case 'debt_repay':
          return acc - tx.amount;
        case 'transfer_internal':
          return acc - tx.amount;
        default:
          return acc;
      }
    }
    if (tx.toWalletId === wallet.id && tx.type === 'transfer_internal') {
      return acc + tx.amount;
    }
    return acc;
  }, wallet.initialBalance);
}

export function isPositiveType(type: string): boolean {
  return ['income', 'debt_received', 'savings_withdraw', 'invest_sell'].includes(
    type,
  );
}

export function isNeutralType(type: string): boolean {
  return type === 'transfer_internal';
}

export function computeSparkline(
  walletId: string,
  transactions: Transaction[],
  initialBalance: number,
  days = 7,
): number[] {
  const now = Date.now();
  const points: number[] = [];
  for (let d = days - 1; d >= 0; d--) {
    const dayEnd = now - d * 86400000 + 86400000;
    const balance = transactions
      .filter(
        (tx) =>
          tx.date < dayEnd &&
          (tx.walletId === walletId || tx.toWalletId === walletId),
      )
      .reduce((acc, tx) => {
        if (tx.walletId === walletId) {
          switch (tx.type) {
            case 'income':
            case 'debt_received':
            case 'savings_withdraw':
            case 'invest_sell':
              return acc + tx.amount;
            case 'expense':
            case 'transfer_external':
            case 'debt_given':
            case 'savings_deposit':
            case 'invest_buy':
            case 'debt_repay':
              return acc - tx.amount;
            case 'transfer_internal':
              return acc - tx.amount;
            default:
              return acc;
          }
        }
        if (tx.toWalletId === walletId && tx.type === 'transfer_internal') {
          return acc + tx.amount;
        }
        return acc;
      }, initialBalance);
    points.push(balance);
  }
  return points;
}
