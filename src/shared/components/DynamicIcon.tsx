import React from "react";
import * as LucideIcons from "lucide-react";
import type { LucideIcon, LucideProps } from "lucide-react";

const iconMap = LucideIcons as unknown as Record<string, LucideIcon>;

interface DynamicIconProps extends LucideProps {
  name: string;
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const Icon = iconMap[name] ?? iconMap["CircleHelp"];
  if (!Icon) return null;
  return <Icon {...props} />;
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
