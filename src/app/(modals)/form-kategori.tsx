import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppBar } from '@/shared/components/AppBar';
import { Button } from '@/shared/components/Button';
import { ColorPicker } from '@/shared/components/ColorPicker';
import { IconPicker } from '@/shared/components/IconPicker';
import { DynamicIcon } from '@/shared/components/DynamicIcon';
import { useToast } from '@/shared/components/Toast';
import { database } from '@/shared/db';
import type { CategoryType } from '@/shared/types';

type FormTab = 'dasar' | 'ikon' | 'warna';

const TYPE_OPTIONS: { value: CategoryType; label: string }[] = [
  { value: 'expense', label: 'Pengeluaran' },
  { value: 'income', label: 'Pemasukan' },
  { value: 'both', label: 'Keduanya' },
];

export default function FormKategoriScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showToast } = useToast();
  const params = useLocalSearchParams<{ id?: string; type?: string }>();
  const isEdit = !!params.id;

  const [activeTab, setActiveTab] = useState<FormTab>('dasar');
  const [name, setName] = useState('');
  const [type, setType] = useState<CategoryType>((params.type as CategoryType) ?? 'expense');
  const [color, setColor] = useState('#4CAF50');
  const [icon, setIcon] = useState('Tag');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit && params.id) void loadExisting(params.id);
  }, []);

  async function loadExisting(id: string) {
    try {
      const record = await database.get<import('@/shared/db').CategoryModel>('categories').find(id);
      setName(record.name);
      setType(record.type as CategoryType);
      setColor(record.color);
      setIcon(record.icon || 'Tag');
    } catch {
      showToast('Kategori tidak ditemukan', 'error');
      router.back();
    } finally {
      setInitialLoading(false);
    }
  }

  async function handleSave() {
    if (!name.trim()) { showToast('Nama kategori tidak boleh kosong', 'error'); return; }
    setLoading(true);
    try {
      await database.write(async () => {
        if (isEdit && params.id) {
          const record = await database.get<import('@/shared/db').CategoryModel>('categories').find(params.id);
          await record.update(() => {
            record.name = name.trim();
            record.icon = icon;
            record.color = color;
            record.type = type;
          });
        } else {
          await database.get<import('@/shared/db').CategoryModel>('categories').create((record) => {
            record.name = name.trim();
            record.icon = icon;
            record.color = color;
            record.type = type;
            record.isDefault = false;
          });
        }
      });
      showToast(isEdit ? 'Kategori diperbarui' : 'Kategori berhasil dibuat', 'success');
      router.back();
    } catch {
      showToast('Gagal menyimpan kategori', 'error');
    } finally {
      setLoading(false);
    }
  }

  if (initialLoading) return null;

  const accentColor = colors.accentPrimary ?? '#8CC0EB';
  const TABS: { id: FormTab; label: string }[] = [
    { id: 'dasar', label: 'Dasar' },
    { id: 'ikon', label: 'Ikon' },
    { id: 'warna', label: 'Warna' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
      <AppBar title={isEdit ? 'Edit Kategori' : 'Tambah Kategori'} showBack />

      {/* Form tabs */}
      <View style={[styles.tabRow, { borderBottomColor: colors.border }]}>
        {TABS.map(t => (
          <Pressable
            key={t.id}
            onPress={() => setActiveTab(t.id)}
            style={[
              styles.tab,
              activeTab === t.id && { borderBottomColor: accentColor, borderBottomWidth: 2 },
            ]}
            accessibilityLabel={`Tab ${t.label}`}
            accessibilityRole="tab"
          >
            <Text style={[
              styles.tabLabel,
              {
                color: activeTab === t.id ? accentColor : colors.textMuted,
                fontFamily: 'DMSans-Medium',
              },
            ]}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ──── Dasar tab ──── */}
        {activeTab === 'dasar' && (
          <>
            {/* Preview */}
            <View style={[styles.preview, { backgroundColor: colors.bgCard }]}>
              <View style={[styles.previewIcon, { backgroundColor: `${color}22` }]}>
                <DynamicIcon name={icon} size={22} color={color} />
              </View>
              <Text style={[styles.previewName, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
                {name || 'Nama Kategori'}
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Nama Kategori</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="cth. Makan, Transportasi, Gaji…"
                placeholderTextColor={colors.textPlaceholder}
                style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.bgInput, fontFamily: 'DMSans-Regular' }]}
                maxLength={40}
                autoFocus
                accessibilityLabel="Nama kategori"
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Jenis</Text>
              <View style={styles.typeRow}>
                {TYPE_OPTIONS.map(opt => (
                  <Pressable
                    key={opt.value}
                    onPress={() => setType(opt.value)}
                    style={[
                      styles.typeChip,
                      { backgroundColor: type === opt.value ? accentColor : colors.bgCard },
                    ]}
                    accessibilityLabel={`Jenis ${opt.label}`}
                    accessibilityRole="button"
                  >
                    <Text style={[
                      styles.typeChipLabel,
                      { color: type === opt.value ? '#fff' : colors.textMuted, fontFamily: 'DMSans-Medium' },
                    ]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </>
        )}

        {/* ──── Ikon tab ──── */}
        {activeTab === 'ikon' && (
          <IconPicker value={icon} onChange={setIcon} color={color} />
        )}

        {/* ──── Warna tab ──── */}
        {activeTab === 'warna' && (
          <ColorPicker value={color} onChange={setColor} />
        )}

        <Button
          label={isEdit ? 'Simpan Perubahan' : 'Buat Kategori'}
          onPress={() => void handleSave()}
          loading={loading}
          disabled={!name.trim() || loading}
          fullWidth
          style={styles.saveBtn}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 0,
  },
  tabLabel: { fontSize: 14 },
  content: { padding: 16, gap: 20 },
  field: { gap: 8 },
  label: { fontSize: 13, lineHeight: 18 },
  input: { height: 48, borderRadius: 12, paddingHorizontal: 14, fontSize: 16, lineHeight: 24 },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
  },
  previewIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  previewName: { fontSize: 17, lineHeight: 24, flex: 1 },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    minHeight: 40,
    justifyContent: 'center',
  },
  typeChipLabel: { fontSize: 13 },
  saveBtn: { marginTop: 8 },
});
