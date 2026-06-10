import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppBar } from '@/shared/components/AppBar';
import { Button } from '@/shared/components/Button';
import { ColorPicker } from '@/shared/components/ColorPicker';
import { ChipGroup } from '@/shared/components/ChipGroup';
import { IconPicker } from '@/shared/components/IconPicker';
import { useToast } from '@/shared/components/Toast';
import { getLucideIcon } from '@/shared/utils/lucideIcons';
import { database } from '@/shared/db';
import type { CategoryType } from '@/shared/types';

const TYPE_OPTIONS = [
  { value: 'expense' as CategoryType, label: 'Pengeluaran' },
  { value: 'income' as CategoryType, label: 'Pemasukan' },
];

export default function FormKategoriScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showToast } = useToast();
  const params = useLocalSearchParams<{ id?: string; type?: string }>();
  const isEdit = !!params.id;

  const [name, setName] = useState('');
  const [type, setType] = useState<CategoryType>((params.type as CategoryType) ?? 'expense');
  const [color, setColor] = useState('#4CAF50');
  const [icon, setIcon] = useState('Tag');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit && params.id) {
      void loadExisting(params.id);
    }
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
    if (!name.trim()) {
      showToast('Nama kategori tidak boleh kosong', 'error');
      return;
    }
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

  const IconComp = getLucideIcon(icon);

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
      <AppBar title={isEdit ? 'Edit Kategori' : 'Kategori Baru'} showBack />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Nama Kategori</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="cth. Makan, Transportasi, Gaji..."
            placeholderTextColor={colors.textPlaceholder}
            style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.bgInput, fontFamily: 'DMSans-Regular' }]}
            maxLength={40}
            autoFocus
            accessibilityLabel="Nama kategori"
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Tipe Kategori</Text>
          <ChipGroup options={TYPE_OPTIONS} value={type} onChange={setType} />
        </View>

        {/* Ikon */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Ikon</Text>
          <IconPicker value={icon} color={color} onSelect={setIcon} />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Warna</Text>
          <ColorPicker value={color} onChange={setColor} />
        </View>

        {/* Preview */}
        <View style={styles.preview}>
          <View style={[styles.previewIcon, { backgroundColor: `${color}22` }]}>
            <IconComp size={22} color={color} strokeWidth={1.8} />
          </View>
          <Text style={[styles.previewName, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
            {name || 'Nama Kategori'}
          </Text>
        </View>

        <Button
          label={isEdit ? 'Simpan Perubahan' : 'Buat Kategori'}
          onPress={() => void handleSave()}
          loading={loading}
          disabled={!name.trim() || loading}
          fullWidth
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 20 },
  field: { gap: 8 },
  label: { fontSize: 13, lineHeight: 18 },
  input: { height: 48, borderRadius: 12, paddingHorizontal: 14, fontSize: 16, lineHeight: 24 },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  previewIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  previewName: { fontSize: 18, lineHeight: 26 },
});
