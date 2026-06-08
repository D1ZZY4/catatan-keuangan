import React from "react";
import * as LucideIcons from "lucide-react";
import * as IsaxIcons from "iconsax-react";
import type { LucideIcon } from "lucide-react";
import type { Icon as IsaxIconType } from "iconsax-react";

const lucideMap = LucideIcons as unknown as Record<string, LucideIcon | undefined>;
const isaxMap = IsaxIcons as unknown as Record<string, IsaxIconType | undefined>;

type IsaxVariant = "Linear" | "Outline" | "Broken" | "Bold" | "Bulk" | "TwoTone";

export interface DynamicIconProps {
  name: string;
  size?: number | string;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  strokeWidth?: number;
  isaxVariant?: IsaxVariant;
}

export function DynamicIcon({
  name,
  size = 20,
  color,
  className,
  style,
  strokeWidth,
  isaxVariant = "Linear",
}: DynamicIconProps) {
  if (name.startsWith("isax:")) {
    const isaxName = name.slice(5);
    const IsaxIconComponent = isaxMap[isaxName];
    if (IsaxIconComponent !== undefined) {
      const isaxColor =
        color ??
        (typeof style?.color === "string" ? style.color : undefined) ??
        "currentColor";
      return (
        <IsaxIconComponent
          size={typeof size === "number" ? String(size) : size}
          color={isaxColor}
          variant={isaxVariant}
          className={className}
        />
      );
    }
  }

  const LucideIconComponent = lucideMap[name] ?? lucideMap["CircleHelp"];
  if (!LucideIconComponent) return null;
  return (
    <LucideIconComponent
      size={size}
      color={color}
      className={className}
      style={style}
      strokeWidth={strokeWidth}
    />
  );
}

export function getIconNames(): string[] {
  return Object.keys(LucideIcons).filter((k) => {
    const val = (LucideIcons as unknown as Record<string, unknown>)[k];
    return (
      typeof val === "function" &&
      k[0] !== undefined &&
      k[0] === k[0].toUpperCase() &&
      k !== "createLucideIcon"
    );
  });
}

export function getIsaxIconNames(): string[] {
  return Object.keys(IsaxIcons).filter((k) => {
    const val = (IsaxIcons as unknown as Record<string, unknown>)[k];
    return typeof val === "function" && k[0] !== undefined && k[0] === k[0].toUpperCase();
  });
}

export const CURATED_ISAX_ICONS = [
  "Wallet", "Wallet1", "Wallet2", "Wallet3",
  "EmptyWallet", "EmptyWalletAdd", "EmptyWalletChange", "EmptyWalletTick",
  "Card", "CardAdd", "CardCoin", "CardEdit", "CardPos", "CardReceive", "CardSend", "CardTick",
  "Coin", "Coin1", "DollarCircle", "DollarSquare",
  "Bank", "MoneyRecive", "MoneySend", "MoneyAdd", "MoneyRemove", "Moneys",
  "ReceiptItem", "ReceiptSquare", "Bill",
  "Chart", "Chart1", "Chart2", "Graph", "TrendUp", "TrendDown",
  "Bitcoin", "BitcoinCard",
  "Bag", "Bag2", "BagHappy", "BagTick",
  "ShoppingCart",
  "Tag", "Gift",
  "Airplane", "AirplaneSquare", "Bus", "Car", "TruckFast",
  "Building", "Buildings", "Buildings2",
  "Book", "Book1", "BookSaved", "BookSquare",
  "Hospital", "Heart",
  "Laptop", "Monitor", "Mobile", "Keyboard",
  "MusicPlay", "Video", "Game", "Gameboy",
  "Man", "Woman",
  "Star1", "Award", "Crown", "Diamond",
  "ArrowSwapHorizontal", "DirectSend",
  "Setting2", "Refresh2", "Edit", "Edit2",
  "HomeTrendUp", "HomeTrendDown",
];
