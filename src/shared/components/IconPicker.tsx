import React, { useState, useMemo, useCallback, memo } from 'react';
import {
  View, Text, TextInput, FlatList, Pressable, StyleSheet, Modal,
} from 'react-native';
import { Search, Check, X } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { getLucideIcon, ALL_LUCIDE_ICON_NAMES } from '@/shared/utils/lucideIcons';

const NUM_COLUMNS = 5;

interface IconPickerProps {
  value: string;
  color: string;
  onSelect: (iconName: string) => void;
}

interface IconItemProps {
  name: string;
  isSelected: boolean;
  color: string;
  onPress: () => void;
  bgCard: string;
  textMuted: string;
}

const IconItem = memo(function IconItem({
  name, isSelected, color, onPress, bgCard, textMuted,
}: IconItemProps) {
  const IconComp = getLucideIcon(name);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconItem,
        { backgroundColor: isSelected ? `${color}22` : bgCard },
        isSelected && { borderColor: color, borderWidth: 1.5 },
        pressed && { opacity: 0.7 },
      ]}
      accessibilityLabel={`Pilih ikon ${name}`}
      accessibilityRole="button"
    >
      <IconComp size={22} color={isSelected ? color : textMuted} strokeWidth={1.8} />
      {isSelected && (
        <View style={[styles.checkBadge, { backgroundColor: color }]}>
          <Check size={8} color="#fff" strokeWidth={3} />
        </View>
      )}
    </Pressable>
  );
});

export function IconPicker({ value, color, onSelect }: IconPickerProps) {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return ALL_LUCIDE_ICON_NAMES;
    const q = search.toLowerCase();
    return ALL_LUCIDE_ICON_NAMES.filter(n => n.toLowerCase().includes(q));
  }, [search]);

  const handleSelect = useCallback((name: string) => {
    onSelect(name);
    setVisible(false);
    setSearch('');
  }, [onSelect]);

  const SelectedIcon = getLucideIcon(value);

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        style={({ pressed }) => [
          styles.trigger,
          { backgroundColor: colors.bgCard, borderColor: colors.border },
          pressed && { opacity: 0.8 },
        ]}
        accessibilityLabel="Pilih ikon"
        accessibilityRole="button"
      >
        <View style={[styles.triggerIconWrap, { backgroundColor: `${color}22` }]}>
          <SelectedIcon size={22} color={color} strokeWidth={1.8} />
        </View>
        <Text style={[styles.triggerLabel, { color: colors.textPrimary, fontFamily: 'DMSans-Medium' }]}>
          {value || 'Pilih Ikon'}
        </Text>
        <Text style={[styles.triggerHint, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
          Ketuk untuk ganti
        </Text>
      </Pressable>

      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => { setVisible(false); setSearch(''); }}
      >
        <View style={[styles.sheet, { backgroundColor: colors.bgPage }]}>
          {/* Header */}
          <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.sheetTitle, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
              Pilih Ikon
            </Text>
            <Pressable
              onPress={() => { setVisible(false); setSearch(''); }}
              style={[styles.closeBtn, { backgroundColor: colors.bgCard }]}
              accessibilityLabel="Tutup pemilih ikon"
              accessibilityRole="button"
            >
              <X size={18} color={colors.textMuted} />
            </Pressable>
          </View>

          {/* Search */}
          <View style={[styles.searchWrap, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Search size={16} color={colors.textMuted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Cari ikon..."
              placeholderTextColor={colors.textPlaceholder}
              style={[styles.searchInput, { color: colors.textPrimary, fontFamily: 'DMSans-Regular' }]}
              autoCorrect={false}
              autoCapitalize="none"
              accessibilityLabel="Cari ikon"
            />
          </View>

          {/* Grid */}
          <FlatList
            data={filtered}
            numColumns={NUM_COLUMNS}
            keyExtractor={item => item}
            contentContainerStyle={styles.grid}
            renderItem={({ item }) => (
              <IconItem
                name={item}
                isSelected={item === value}
                color={color}
                onPress={() => handleSelect(item)}
                bgCard={colors.bgCard}
                textMuted={colors.textMuted}
              />
            )}
            windowSize={5}
            maxToRenderPerBatch={25}
            initialNumToRender={25}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={[styles.emptyText, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                  Tidak ada ikon ditemukan
                </Text>
              </View>
            }
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  triggerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerLabel: { fontSize: 15, flex: 1 },
  triggerHint: { fontSize: 12 },
  sheet: { flex: 1 },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetTitle: { fontSize: 17 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 15, height: 24 },
  grid: { paddingHorizontal: 12, paddingBottom: 40 },
  iconItem: {
    flex: 1,
    margin: 4,
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    position: 'relative',
    borderWidth: 0,
  },
  checkBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { flex: 1, alignItems: 'center', paddingTop: 40 },
  emptyText: { fontSize: 14 },
});
