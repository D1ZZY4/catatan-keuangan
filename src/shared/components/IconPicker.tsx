import React, { useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { AppText } from './AppText';
import { AppIcon, getIconNames } from './AppIcon';
import { SearchBar } from './SearchBar';
import { useTheme } from '../theme/ThemeContext';
import { AppConfig } from '../config/periods';

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  style?: ViewStyle;
}

export function IconPicker({ value, onChange, style }: IconPickerProps): React.ReactElement {
  const { colors } = useTheme();
  const [search, setSearch] = useState('');

  const allIcons = getIconNames();
  const filtered = search.trim().length > 0
    ? allIcons.filter((n) => n.includes(search.toLowerCase()))
    : allIcons;

  return (
    <View style={[styles.wrapper, style]}>
      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Cari ikon..."
        style={styles.search}
      />
      <FlatList
        data={filtered}
        numColumns={6}
        keyExtractor={(item) => item}
        renderItem={({ item }) => {
          const selected = item === value;
          return (
            <TouchableOpacity
              onPress={() => onChange(item)}
              style={[
                styles.iconBtn,
                {
                  backgroundColor: selected ? `${colors.accentPrimary}22` : 'transparent',
                  borderColor: selected ? colors.accentPrimary : 'transparent',
                },
              ]}
              accessibilityLabel={`Ikon ${item}`}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <AppIcon
                name={item}
                size={20}
                color={selected ? colors.accentPrimary : colors.textMuted}
              />
            </TouchableOpacity>
          );
        }}
        windowSize={AppConfig.defaults.listWindowSize}
        maxToRenderPerBatch={AppConfig.defaults.listMaxToRenderPerBatch}
        initialNumToRender={AppConfig.defaults.listInitialNumToRender}
        showsVerticalScrollIndicator={false}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  search: {
    marginBottom: 12,
  },
  list: {
    flex: 1,
  },
  iconBtn: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1.5,
    margin: 3,
  },
});
