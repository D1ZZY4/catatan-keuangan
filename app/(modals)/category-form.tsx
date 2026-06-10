import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../src/shared/components/AppText';
import { AppButton } from '../../src/shared/components/AppButton';
import { AppIcon } from '../../src/shared/components/AppIcon';
import { ColorPicker } from '../../src/shared/components/ColorPicker';
import { IconPicker } from '../../src/shared/components/IconPicker';
import { Divider } from '../../src/shared/components/Divider';
import { useTheme } from '../../src/shared/theme/ThemeContext';
import { AppLabels } from '../../src/shared/config/labels';
import { useCategories } from '../../src/shared/hooks/useCategories';

type CategoryType = 'income' | 'expense' | 'both';

export default function CategoryFormModal(): React.ReactElement {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ categoryId?: string }>();
  const { data: allCategories, createCategory, updateCategory } = useCategories();

  const editCategory = params.categoryId
    ? allCategories.find((c) => c.id === params.categoryId)
    : undefined;

  const [name, setName] = useState(editCategory?.name ?? '');
  const [icon, setIcon] = useState(editCategory?.icon ?? 'tag');
  const [color, setColor] = useState(editCategory?.color ?? '#8CC0EB');
  const [type, setType] = useState<CategoryType>(editCategory?.type ?? 'expense');
  const [tab, setTab] = useState<'basic' | 'icon' | 'color'>('basic');
  const [saving, setSaving] = useState(false);

  async function handleSave(): Promise<void> {
    if (!name.trim()) {
      Alert.alert('Nama kategori tidak boleh kosong');
      return;
    }
    setSaving(true);
    try {
      if (editCategory) {
        await updateCategory(editCategory.id, { name: name.trim(), icon, color, type });
      } else {
        await createCategory({ name: name.trim(), icon, color, type });
      }
      router.back();
    } catch {
      Alert.alert('Gagal menyimpan kategori');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPage }}>
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <AppIcon name="x" size={22} color={colors.textMuted} />
        </TouchableOpacity>
        <AppText variant="headingMedium" color={colors.textPrimary}>
          {editCategory ? 'Edit Kategori' : 'Tambah Kategori'}
        </AppText>
        <AppButton
          label={AppLabels.transactionForm.saveButton}
          onPress={() => void handleSave()}
          loading={saving}
          size="sm"
        />
      </View>

      <View
        style={{
          flexDirection: 'row',
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        {(['basic', 'icon', 'color'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: 'center',
              borderBottomWidth: 2,
              borderBottomColor: tab === t ? colors.accentPrimary : 'transparent',
            }}
          >
            <AppText
              variant="bodyMedium"
              color={tab === t ? colors.accentPrimary : colors.textMuted}
            >
              {t === 'basic' ? 'Dasar' : t === 'icon' ? 'Ikon' : 'Warna'}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {tab === 'basic' && (
          <>
            <View style={{ gap: 8 }}>
              <AppText variant="labelMedium" color={colors.textMuted}>
                Nama Kategori
              </AppText>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="cth. Makan & Minum"
                placeholderTextColor={colors.textPlaceholder}
                maxLength={40}
                autoFocus
                style={{
                  backgroundColor: colors.bgInput,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  color: colors.textPrimary,
                  fontSize: 16,
                  fontFamily: 'DMSans-Regular',
                }}
              />
            </View>

            <Divider />

            <View style={{ gap: 8 }}>
              <AppText variant="labelMedium" color={colors.textMuted}>Jenis</AppText>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {([
                  ['expense', 'Pengeluaran'],
                  ['income', 'Pemasukan'],
                  ['both', 'Keduanya'],
                ] as [CategoryType, string][]).map(([val, label]) => (
                  <TouchableOpacity
                    key={val}
                    onPress={() => setType(val)}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 12,
                      borderWidth: 1.5,
                      borderColor: type === val ? colors.accentPrimary : colors.border,
                      backgroundColor: type === val ? colors.accentPrimary + '22' : colors.bgCard,
                      alignItems: 'center',
                    }}
                  >
                    <AppText
                      variant="bodySmall"
                      color={type === val ? colors.accentPrimary : colors.textMuted}
                    >
                      {label}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Divider />

            <View style={{ alignItems: 'center', gap: 12 }}>
              <AppText variant="labelMedium" color={colors.textMuted}>Preview</AppText>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 20,
                  backgroundColor: color + '33',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AppIcon name={icon} size={28} color={color} />
              </View>
              <AppText variant="bodyMedium" color={colors.textPrimary}>{name || 'Nama Kategori'}</AppText>
            </View>
          </>
        )}

        {tab === 'icon' && (
          <IconPicker value={icon} onChange={setIcon} />
        )}

        {tab === 'color' && (
          <ColorPicker value={color} onChange={setColor} />
        )}
      </ScrollView>
    </View>
  );
}
