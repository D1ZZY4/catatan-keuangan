import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../src/shared/components/AppText';
import { AppIcon } from '../../src/shared/components/AppIcon';
import { useTheme } from '../../src/shared/theme/ThemeContext';
import type { Category } from '../../src/shared/types';

export default function CategoryPickerModal(): React.ReactElement {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ txType?: string }>();
  const [search, setSearch] = useState('');

  function handleSelect(category: Category): void {
    router.back();
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
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <AppIcon name="chevron-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <AppText variant="headingMedium" color={colors.textPrimary}>
          Pilih Kategori
        </AppText>
      </View>

      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.bgInput,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderWidth: 1,
            borderColor: colors.border,
            gap: 8,
          }}
        >
          <AppIcon name="search" size={16} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Cari kategori..."
            placeholderTextColor={colors.textPlaceholder}
            style={{
              flex: 1,
              fontFamily: 'DMSans-Regular',
              fontSize: 14,
              color: colors.textPrimary,
            }}
          />
        </View>
      </View>

      <FlatList
        data={[]}
        keyExtractor={(item) => (item as Category).id}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 40 }}>
            <AppText variant="bodyMedium" color={colors.textMuted} center>
              Belum ada kategori. Buat transaksi pertama untuk mengisi.
            </AppText>
          </View>
        }
        renderItem={({ item }) => {
          const cat = item as Category;
          return (
            <TouchableOpacity
              onPress={() => handleSelect(cat)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 14,
                backgroundColor: colors.bgCard,
                borderRadius: 12,
                gap: 12,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: cat.color + '22',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AppIcon name={cat.icon} size={20} color={cat.color} />
              </View>
              <AppText variant="bodyMedium" color={colors.textPrimary} style={{ flex: 1 }}>
                {cat.name}
              </AppText>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
