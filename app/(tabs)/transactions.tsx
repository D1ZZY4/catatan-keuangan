import React, { useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../src/shared/components/AppText';
import { AppIcon } from '../../src/shared/components/AppIcon';
import { FAB } from '../../src/shared/components/FAB';
import { EmptyState } from '../../src/shared/components/EmptyState';
import { useTheme } from '../../src/shared/theme/ThemeContext';
import { AppLabels } from '../../src/shared/config/labels';
import type { TransactionType } from '../../src/shared/types';
import type { PeriodKey } from '../../src/shared/config/periods';
import { AppConfig } from '../../src/shared/config/periods';

export default function TransactionsScreen(): React.ReactElement {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [activePeriod, setActivePeriod] = useState<PeriodKey>('thisMonth');

  function handleFabSelect(type: TransactionType): void {
    router.push({
      pathname: '/(modals)/transaction-form',
      params: { type },
    });
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPage }}>
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 16,
          paddingBottom: 12,
          gap: 12,
          backgroundColor: colors.bgPage,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <AppText variant="headingLarge" color={colors.textPrimary}>
            {AppLabels.tabs.transaction}
          </AppText>
          <TouchableOpacity
            onPress={() => router.push('/(modals)/filter')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: colors.bgSurface,
            }}
          >
            <AppIcon name="filter" size={16} color={colors.textMuted} />
            <AppText variant="labelSmall" color={colors.textMuted}>
              Filter
            </AppText>
          </TouchableOpacity>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: colors.bgInput,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <AppIcon name="search" size={16} color={colors.textMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Cari transaksi..."
            placeholderTextColor={colors.textPlaceholder}
            style={{
              flex: 1,
              fontFamily: 'DMSans-Regular',
              fontSize: 14,
              color: colors.textPrimary,
            }}
          />
        </View>

        <FlatList
          data={AppConfig.periods.filter((p) => p.key !== 'all' && p.key !== 'custom')}
          keyExtractor={(item) => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setActivePeriod(item.key)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 20,
                backgroundColor:
                  activePeriod === item.key
                    ? colors.accentPrimary
                    : colors.bgSurface,
              }}
            >
              <AppText
                variant="labelSmall"
                color={
                  activePeriod === item.key
                    ? colors.textPrimary
                    : colors.textMuted
                }
                style={{
                  fontFamily:
                    activePeriod === item.key
                      ? 'DMSans-SemiBold'
                      : 'DMSans-Regular',
                }}
              >
                {item.label}
              </AppText>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={[]}
        keyExtractor={(item) => (item as { id: string }).id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 120,
          flexGrow: 1,
        }}
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: 'center', marginTop: 40 }}>
            <EmptyState
              icon="activity"
              title={AppLabels.emptyState.transactions.title}
              body={AppLabels.emptyState.transactions.body}
            />
          </View>
        }
        renderItem={() => null}
      />

      <FAB onSelect={handleFabSelect} />
    </View>
  );
}
