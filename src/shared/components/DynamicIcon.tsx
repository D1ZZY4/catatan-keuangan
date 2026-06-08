import React from "react";
import * as LucideIcons from "lucide-react";
import * as IsaxIcons from "iconsax-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { LucideIcon } from "lucide-react";
import type { Icon as IsaxIconType } from "iconsax-react";
import { findBrandIcon } from "./BrandIcons";

const allLucide = LucideIcons as Record<string, unknown>;
const allIsax = IsaxIcons as Record<string, unknown>;

function asLucideIcon(val: unknown): LucideIcon | undefined {
  return typeof val === "function" ? (val as LucideIcon) : undefined;
}

function asIsaxIcon(val: unknown): IsaxIconType | undefined {
  return typeof val === "function" ? (val as IsaxIconType) : undefined;
}

function lookupLucide(name: string): LucideIcon | undefined {
  return asLucideIcon(allLucide[name]);
}

function lookupIsax(name: string): IsaxIconType | undefined {
  return asIsaxIcon(allIsax[name]);
}

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
      const resolvedColor =
        color ?? (typeof style?.color === "string" ? style.color : undefined) ?? "currentColor";

      // Lucide-backed platform entry
      if (entry.iconType === "lucide") {
        const LucideComp = lookupLucide(entry.lucideName) ?? lookupLucide("CircleHelp");
        if (!LucideComp) return null;
        return (
          <LucideComp
            size={size}
            color={resolvedColor}
            className={className}
            style={style}
            strokeWidth={strokeWidth}
          />
        );
      }

      // FA-backed brand entry
      return (
        <FontAwesomeIcon
          icon={entry.icon}
          className={className}
          style={{ width: numSize, height: numSize, color: resolvedColor, flexShrink: 0, ...style }}
        />
      );
    }
  }

  // Iconsax icons — prefix: "isax:"
  if (name.startsWith("isax:")) {
    const isaxName = name.slice(5);
    const IsaxIconComponent = lookupIsax(isaxName);
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
  const LucideIconComponent = lookupLucide(name) ?? lookupLucide("CircleHelp");
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
    const val = allLucide[k];
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
    const val = allIsax[k];
    return typeof val === "function" && k[0] !== undefined && k[0] === k[0].toUpperCase();
  });
}
