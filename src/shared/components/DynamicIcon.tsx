import React from "react";
import * as LucideIcons from "lucide-react";
import * as IsaxIcons from "iconsax-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { LucideIcon } from "lucide-react";
import type { Icon as IsaxIconType } from "iconsax-react";
import { findBrandIcon } from "./BrandIcons";

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
  const numSize = typeof size === "number" ? size : 20;

  // FontAwesome brand icons — prefix: "fab:"
  if (name.startsWith("fab:")) {
    const key = name.slice(4);
    const entry = findBrandIcon(key);
    if (entry !== undefined) {
      const faColor = color ?? (typeof style?.color === "string" ? style.color : undefined) ?? "currentColor";
      return (
        <FontAwesomeIcon
          icon={entry.icon}
          className={className}
          style={{ width: numSize, height: numSize, color: faColor, flexShrink: 0, ...style }}
        />
      );
    }
  }

  // Iconsax icons — prefix: "isax:"
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

  // Lucide icons (default — no prefix)
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

