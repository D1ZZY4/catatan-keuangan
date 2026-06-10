import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../src/shared/components/AppText';
import { AppIcon } from '../../src/shared/components/AppIcon';
import { AppCard } from '../../src/shared/components/AppCard';
import { AppButton } from '../../src/shared/components/AppButton';
import { Badge } from '../../src/shared/components/Badge';
import { ProgressBar } from '../../src/shared/components/ProgressBar';
import { SkeletonCard } from '../../src/shared/components/SkeletonCard';
import { ChipGroup } from '../../src/shared/components/ChipGroup';
import { SearchBar } from '../../src/shared/components/SearchBar';
import { Divider } from '../../src/shared/components/Divider';
import { useTheme } from '../../src/shared/theme/ThemeContext';

declare const __DEV__: boolean;

if (!__DEV__) {
  throw new Error('ui-check is only available in development mode');
}

export default function UICheckScreen(): React.ReactElement {
  const { colors, toggleDark, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [selectedChips, setSelectedChips] = useState<string[]>(['today']);

  const chips = [
    { key: 'today', label: 'Hari Ini' },
    { key: 'thisMonth', label: 'Bulan Ini' },
    { key: 'all', label: 'Semua' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPage }}>
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 16,
          paddingBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <AppIcon name="arrow-left" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <AppText variant="headingMedium" color={colors.textPrimary} style={{ flex: 1 }}>
          UI Check (Dev Only)
        </AppText>
        <TouchableOpacity onPress={toggleDark}>
          <AppIcon name={isDark ? 'sun' : 'moon'} size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 24, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        <Section title="Typography">
          <AppText variant="displayLarge" color={colors.textPrimary}>Display Large</AppText>
          <AppText variant="displayMedium" color={colors.textPrimary}>Display Medium</AppText>
          <AppText variant="headingLarge" color={colors.textPrimary}>Heading Large</AppText>
          <AppText variant="headingMedium" color={colors.textPrimary}>Heading Medium</AppText>
          <AppText variant="headingSmall" color={colors.textPrimary}>Heading Small</AppText>
          <AppText variant="bodyLarge" color={colors.textPrimary}>Body Large</AppText>
          <AppText variant="bodyMedium" color={colors.textPrimary}>Body Medium</AppText>
          <AppText variant="bodySmall" color={colors.textMuted}>Body Small (Muted)</AppText>
          <AppText variant="labelMedium" color={colors.textMuted}>Label Medium</AppText>
          <AppText variant="labelSmall" color={colors.textMuted}>Label Small</AppText>
        </Section>

        <Section title="Colors">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {([
              ['accentPrimary', colors.accentPrimary],
              ['accentSecondary', colors.accentSecondary],
              ['success', colors.success],
              ['warning', colors.warning],
              ['danger', colors.danger],
            ] as [string, string][]).map(([name, color]) => (
              <View key={name} style={{ alignItems: 'center', gap: 4 }}>
                <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: color }} />
                <AppText variant="labelSmall" color={colors.textMuted}>{name}</AppText>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Buttons">
          <AppButton label="Primary" onPress={() => Alert.alert('Primary')} />
          <AppButton label="Secondary" variant="secondary" onPress={() => Alert.alert('Secondary')} />
          <AppButton label="Ghost" variant="ghost" onPress={() => Alert.alert('Ghost')} />
          <AppButton label="Danger" variant="danger" onPress={() => Alert.alert('Danger')} />
          <AppButton label="Loading..." loading onPress={() => undefined} />
          <AppButton label="Disabled" disabled onPress={() => undefined} />
        </Section>

        <Section title="Cards">
          <AppCard>
            <AppText variant="bodyMedium" color={colors.textPrimary}>Default Card</AppText>
            <AppText variant="bodySmall" color={colors.textMuted}>Card with content inside</AppText>
          </AppCard>
        </Section>

        <Section title="Badge">
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <Badge label="Default" />
            <Badge label="Success" variant="success" />
            <Badge label="Warning" variant="warning" />
            <Badge label="Danger" variant="danger" />
          </View>
        </Section>

        <Section title="Progress Bars">
          <AppText variant="labelSmall" color={colors.textMuted}>30% (hijau)</AppText>
          <ProgressBar value={30} max={100} />
          <AppText variant="labelSmall" color={colors.textMuted}>70% (kuning)</AppText>
          <ProgressBar value={70} max={100} />
          <AppText variant="labelSmall" color={colors.textMuted}>90% (merah)</AppText>
          <ProgressBar value={90} max={100} />
        </Section>

        <Section title="Skeleton Cards">
          <SkeletonCard />
          <SkeletonCard />
        </Section>

        <Section title="Chips">
          <ChipGroup
            items={chips}
            selected={selectedChips}
            onToggle={(key) => setSelectedChips([key])}
          />
        </Section>

        <Section title="Search Bar">
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Cari transaksi..."
          />
        </Section>

        <Section title="Icons">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
            {['home', 'wallet', 'bar-chart-2', 'settings', 'plus', 'minus', 'repeat', 'trash-2', 'edit-2', 'chevron-right', 'check', 'x'].map((name) => (
              <View key={name} style={{ alignItems: 'center', gap: 4 }}>
                <AppIcon name={name} size={24} color={colors.textPrimary} />
                <AppText variant="labelSmall" color={colors.textMuted}>{name}</AppText>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Navigation">
          <AppButton
            label="→ Home"
            variant="ghost"
            onPress={() => router.push('/(tabs)/')}
          />
          <AppButton
            label="→ Transaction Form"
            variant="ghost"
            onPress={() => router.push({ pathname: '/(modals)/transaction-form', params: { type: 'expense' } })}
          />
          <AppButton
            label="→ Wallet Form"
            variant="ghost"
            onPress={() => router.push('/(modals)/wallet-form')}
          />
        </Section>

        <Divider />
        <AppText variant="labelSmall" color={colors.textMuted} style={{ textAlign: 'center' }}>
          DEV ONLY — tidak tampil di production build
        </AppText>
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }): React.ReactElement {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 8 }}>
      <AppText variant="headingSmall" color={colors.textPrimary}>{title}</AppText>
      <Divider />
      <View style={{ gap: 8 }}>{children}</View>
    </View>
  );
}
