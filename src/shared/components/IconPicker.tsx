import React, { useState, useMemo, memo } from 'react';
import {
  View, Text, TextInput, ScrollView, Pressable, StyleSheet,
} from 'react-native';
import { Search } from 'lucide-react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useTheme } from '@/shared/hooks/useTheme';
import { getLucideIcon, ALL_LUCIDE_ICON_NAMES } from '@/shared/utils/lucideIcons';
import { getIsaxIcon, CURATED_ISAX_ICONS } from '@/shared/utils/isaxIcons';
import { BRAND_ICONS, BRAND_CATEGORIES } from '@/shared/components/BrandIcons';

type Tab = 'lucide' | 'iconsax' | 'merek';

const NUM_COLS = 6;

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  color?: string;
}

interface GridCellProps {
  isSelected: boolean;
  color: string;
  onPress: () => void;
  accessLabel: string;
  bgCard: string;
  accentPrimary: string;
  children: React.ReactNode;
}

const GridCell = memo(function GridCell({
  isSelected, color, onPress, accessLabel, bgCard, accentPrimary, children,
}: GridCellProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={accessLabel}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.cell,
        { backgroundColor: isSelected ? `${color}22` : bgCard },
        isSelected && { borderColor: accentPrimary, borderWidth: 1.5 },
        pressed && { opacity: 0.6 },
      ]}
    >
      {children}
    </Pressable>
  );
});

export function IconPicker({ value, onChange, color = '#8CC0EB' }: IconPickerProps) {
  const { colors } = useTheme();

  const [tab, setTab] = useState<Tab>(() => {
    if (value.startsWith('fab:')) return 'merek';
    if (value.startsWith('isax:')) return 'iconsax';
    return 'lucide';
  });
  const [search, setSearch] = useState('');
  const [brandCat, setBrandCat] = useState('Semua');

  const filteredLucide = useMemo(() => {
    if (!search.trim()) return ALL_LUCIDE_ICON_NAMES;
    const q = search.toLowerCase();
    return ALL_LUCIDE_ICON_NAMES.filter(n => n.toLowerCase().includes(q));
  }, [search]);

  const filteredIsax = useMemo(() => {
    if (!search.trim()) return CURATED_ISAX_ICONS;
    const q = search.toLowerCase();
    return CURATED_ISAX_ICONS.filter(n => n.toLowerCase().includes(q));
  }, [search]);

  const filteredBrands = useMemo(() => {
    const byCat = brandCat === 'Semua' ? BRAND_ICONS : BRAND_ICONS.filter(b => b.category === brandCat);
    if (!search.trim()) return byCat;
    const q = search.toLowerCase();
    return byCat.filter(b => b.label.toLowerCase().includes(q) || b.key.includes(q));
  }, [search, brandCat]);

  const TABS: { id: Tab; label: string }[] = [
    { id: 'lucide', label: 'Lucide' },
    { id: 'iconsax', label: 'Iconsax' },
    { id: 'merek', label: 'Merek' },
  ];

  const accentColor = colors.accentPrimary ?? '#8CC0EB';

  return (
    <View style={styles.root}>
      {/* Sub-tab pills */}
      <View style={[styles.tabBar, { backgroundColor: colors.bgInput }]}>
        {TABS.map(t => (
          <Pressable
            key={t.id}
            onPress={() => setTab(t.id)}
            style={[
              styles.tabBtn,
              tab === t.id && { backgroundColor: colors.bgCard },
            ]}
            accessibilityLabel={`Tab ${t.label}`}
            accessibilityRole="tab"
          >
            <Text style={[
              styles.tabLabel,
              { color: tab === t.id ? colors.textPrimary : colors.textMuted, fontFamily: 'DMSans-SemiBold' },
            ]}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Search */}
      <View style={[styles.searchRow, { backgroundColor: colors.bgCard }]}>
        <Search size={15} color={colors.textMuted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Cari ikon…"
          placeholderTextColor={colors.textPlaceholder}
          style={[styles.searchInput, { color: colors.textPrimary, fontFamily: 'DMSans-Regular' }]}
          autoCorrect={false}
          autoCapitalize="none"
          accessibilityLabel="Cari ikon"
          returnKeyType="search"
        />
      </View>

      {/* Brand category chips */}
      {tab === 'merek' && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipContent}>
          {['Semua', ...BRAND_CATEGORIES].map(cat => (
            <Pressable
              key={cat}
              onPress={() => setBrandCat(cat)}
              style={[
                styles.chip,
                { backgroundColor: brandCat === cat ? accentColor : colors.bgCard },
              ]}
              accessibilityLabel={`Filter ${cat}`}
              accessibilityRole="button"
            >
              <Text style={[
                styles.chipLabel,
                { color: brandCat === cat ? '#fff' : colors.textMuted, fontFamily: 'DMSans-SemiBold' },
              ]}>
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Grids */}
      <ScrollView
        style={styles.grid}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        {/* Lucide grid */}
        {tab === 'lucide' && (
          <View style={styles.gridWrap}>
            {filteredLucide.map(name => {
              const LucideComp = getLucideIcon(name);
              const selected = value === name;
              return (
                <GridCell
                  key={name}
                  isSelected={selected}
                  color={color}
                  onPress={() => onChange(name)}
                  accessLabel={`Pilih ikon ${name}`}
                  bgCard={colors.bgCard}
                  accentPrimary={accentColor}
                >
                  <LucideComp size={20} color={selected ? color : colors.textMuted} strokeWidth={1.8} />
                </GridCell>
              );
            })}
            {filteredLucide.length === 0 && (
              <Text style={[styles.emptyText, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                Ikon tidak ditemukan
              </Text>
            )}
          </View>
        )}

        {/* Iconsax grid */}
        {tab === 'iconsax' && (
          <View style={styles.gridWrap}>
            {filteredIsax.map(name => {
              const fullName = `isax:${name}`;
              const selected = value === fullName;
              const IsaxComp = getIsaxIcon(name);
              return (
                <GridCell
                  key={name}
                  isSelected={selected}
                  color={color}
                  onPress={() => onChange(fullName)}
                  accessLabel={`Pilih ikon ${name}`}
                  bgCard={colors.bgCard}
                  accentPrimary={accentColor}
                >
                  {IsaxComp ? (
                    <IsaxComp size={20} color={selected ? color : colors.textMuted} variant="Linear" />
                  ) : null}
                </GridCell>
              );
            })}
            {filteredIsax.length === 0 && (
              <Text style={[styles.emptyText, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                Ikon tidak ditemukan
              </Text>
            )}
          </View>
        )}

        {/* Brand grid */}
        {tab === 'merek' && (
          <View style={styles.gridWrap}>
            {filteredBrands.map(entry => {
              const fullName = `fab:${entry.key}`;
              const selected = value === fullName;
              const iconColor = selected ? color : colors.textMuted;
              return (
                <GridCell
                  key={entry.key}
                  isSelected={selected}
                  color={color}
                  onPress={() => onChange(fullName)}
                  accessLabel={`Pilih ikon ${entry.label}`}
                  bgCard={colors.bgCard}
                  accentPrimary={accentColor}
                >
                  {entry.iconType === 'fa' ? (
                    <FontAwesomeIcon icon={entry.icon} size={20} color={iconColor} />
                  ) : (
                    (() => {
                      const LucideComp = getLucideIcon(entry.lucideName);
                      return <LucideComp size={20} color={iconColor} strokeWidth={1.8} />;
                    })()
                  )}
                </GridCell>
              );
            })}
            {filteredBrands.length === 0 && (
              <Text style={[styles.emptyText, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                Ikon tidak ditemukan
              </Text>
            )}
          </View>
        )}

        {/* Footer hint */}
        <Text style={[styles.hint, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
          {tab === 'lucide' && 'Lucide — ikon antarmuka umum'}
          {tab === 'iconsax' && 'Iconsax — ikon premium'}
          {tab === 'merek' && `Merek — ${BRAND_ICONS.length} platform populer`}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 10 },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 9,
    alignItems: 'center',
  },
  tabLabel: { fontSize: 12 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
  },
  searchInput: { flex: 1, fontSize: 14, height: 20 },
  chipScroll: { flexGrow: 0 },
  chipContent: { gap: 6, paddingRight: 4 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  chipLabel: { fontSize: 10 },
  grid: { maxHeight: 260 },
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  cell: {
    width: `${100 / NUM_COLS - 1}%` as unknown as number,
    aspectRatio: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 20,
    width: '100%',
  },
  hint: {
    fontSize: 10,
    textAlign: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
});
