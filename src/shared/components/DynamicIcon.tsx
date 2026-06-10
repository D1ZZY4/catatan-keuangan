import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { getLucideIcon } from '@/shared/utils/lucideIcons';
import { getIsaxIcon } from '@/shared/utils/isaxIcons';
import { findBrandIcon } from '@/shared/components/BrandIcons';

interface DynamicIconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function DynamicIcon({ name, size = 20, color = '#666', strokeWidth = 1.8 }: DynamicIconProps) {
  if (name.startsWith('isax:')) {
    const isaxName = name.slice(5);
    const IsaxComp = getIsaxIcon(isaxName);
    if (IsaxComp) {
      return <IsaxComp size={size} color={color} variant="Linear" />;
    }
    const Fallback = getLucideIcon('HelpCircle');
    return <Fallback size={size} color={color} strokeWidth={strokeWidth} />;
  }

  if (name.startsWith('fab:')) {
    const brandKey = name.slice(4);
    const entry = findBrandIcon(brandKey);
    if (entry) {
      if (entry.iconType === 'fa') {
        return <FontAwesomeIcon icon={entry.icon} size={size} color={color} />;
      }
      const LucideComp = getLucideIcon(entry.lucideName);
      return <LucideComp size={size} color={color} strokeWidth={strokeWidth} />;
    }
    const Fallback = getLucideIcon('HelpCircle');
    return <Fallback size={size} color={color} strokeWidth={strokeWidth} />;
  }

  const LucideComp = getLucideIcon(name);
  return <LucideComp size={size} color={color} strokeWidth={strokeWidth} />;
}
