import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  View,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AppText } from './AppText';
import { useTheme } from '../theme/ThemeContext';
import { springPresets } from '../theme/animation';

interface ChipItem {
  key: string;
  label: string;
  icon?: string;
}

interface ChipGroupProps {
  items: ChipItem[];
  selected: string[];
  onToggle: (key: string) => void;
  multiSelect?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

interface ChipProps {
  item: ChipItem;
  isSelected: boolean;
  onToggle: (key: string) => void;
}

function Chip({ item, isSelected, onToggle }: ChipProps): React.ReactElement {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.93, springPresets.snappy, () => {
      scale.value = withSpring(1, springPresets.snappy);
    });
    void Haptics.selectionAsync();
    onToggle(item.key);
  };

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
        accessibilityLabel={item.label}
        style={[
          styles.chip,
          {
            backgroundColor: isSelected ? colors.accentPrimary : colors.bgSurface,
            borderColor: isSelected ? colors.accentPrimary : colors.border,
          },
        ]}
      >
        <AppText
          variant="labelSmall"
          color={isSelected ? '#fff' : colors.textPrimary}
          style={styles.chipLabel}
        >
          {item.label}
        </AppText>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function ChipGroup({
  items,
  selected,
  onToggle,
  multiSelect = true,
  style,
  contentStyle,
}: ChipGroupProps): React.ReactElement {
  const handleToggle = (key: string) => {
    if (!multiSelect) {
      if (!selected.includes(key)) onToggle(key);
      return;
    }
    onToggle(key);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={style}
      contentContainerStyle={[styles.content, contentStyle]}
    >
      {items.map((item) => (
        <Chip
          key={item.key}
          item={item}
          isSelected={selected.includes(item.key)}
          onToggle={handleToggle}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
});
