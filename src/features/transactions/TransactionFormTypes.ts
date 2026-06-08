export type Step = 1 | 2 | 3;

export interface FormState {
  type: import("@/shared/types").TransactionType;
  amountRaw: string;
  amount: number;
  categoryId: string;
  walletId: string;
  toWalletId: string;
  date: number;
  note: string;
  linkedPersonName: string;
  linkedPersonPhone: string;
}

export { TYPE_OPTIONS } from "@/shared/constants/transactionTypes";
export type { TransactionTypeOption } from "@/shared/constants/transactionTypes";
