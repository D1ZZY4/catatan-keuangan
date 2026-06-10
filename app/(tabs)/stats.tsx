import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../src/shared/components/AppText';
import { AppCard } from '../../src/shared/components/AppCard';
import { EmptyState } from '../../src/shared/components/EmptyState';
import { useTheme } from '../../src/shared/theme/ThemeContext';
import { AppLabels } from '../../src/shared/config/labels';
import type { PeriodKey } from '../../src/shared/config/periods';
import { AppConfig } from '../../src/shared/config/periods';

export default function StatsScreen(): React.ReactElement {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [activePeriod, setActivePeriod] = useState<PeriodKey>('thisMonth');
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPage }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 16,
          paddingBottom: 32,
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <AppText variant="headingLarge" color={colors.textPrimary}>
          {AppLabels.tabs.stats}
        </AppText>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['expense', 'income'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor:
                  activeTab === tab ? colors.accentPrimary : colors.bgSurface,
                alignItems: 'center',
              }}
            >
              <AppText
                variant="labelSmall"
                color={
                  activeTab === tab ? colors.textPrimary : colors.textMuted
                }
                style={{
                  fontFamily:
                    activeTab === tab ? 'DMSans-SemiBold' : 'DMSans-Regular',
                }}
              >
                {tab === 'expense'
                  ? AppLabels.transactionType.expense
                  : AppLabels.transactionType.income}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {AppConfig.periods
            .filter((p) => p.key !== 'all' && p.key !== 'custom')
            .map((period) => (
              <TouchableOpacity
                key={period.key}
                onPress={() => setActivePeriod(period.key)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 20,
                  backgroundColor:
                    activePeriod === period.key
                      ? colors.accentPrimary
                      : colors.bgSurface,
                }}
              >
                <AppText
                  variant="labelSmall"
                  color={
                    activePeriod === period.key
                      ? colors.textPrimary
                      : colors.textMuted
                  }
                  style={{
                    fontFamily:
                      activePeriod === period.key
                        ? 'DMSans-SemiBold'
                        : 'DMSans-Regular',
                  }}
                >
                  {period.label}
                </AppText>
              </TouchableOpacity>
            ))}
        </View>

        <AppCard>
          <AppText
            variant="headingMedium"
            color={colors.textPrimary}
            style={{ marginBottom: 12 }}
          >
            Grafik Tren
          </AppText>
          <EmptyState
            icon="bar-chart"
            title={AppLabels.emptyState.stats.title}
            body={AppLabels.emptyState.stats.body}
          />
        </AppCard>

        <AppCard>
          <AppText
            variant="headingMedium"
            color={colors.textPrimary}
            style={{ marginBottom: 12 }}
          >
            Per Kategori
          </AppText>
          <EmptyState
            icon="pie-chart"
            title={AppLabels.emptyState.stats.title}
          />
        </AppCard>
      </ScrollView>
    </View>
  );
}
