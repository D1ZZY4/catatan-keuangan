import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../src/shared/components/AppText';
import { AppIcon } from '../../src/shared/components/AppIcon';
import { AppCard } from '../../src/shared/components/AppCard';
import { useTheme } from '../../src/shared/theme/ThemeContext';
import { AppLabels } from '../../src/shared/config/labels';

export default function AboutModal(): React.ReactElement {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

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
          {AppLabels.settings.about}
        </AppText>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 24,
          paddingBottom: 40,
          gap: 16,
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            backgroundColor: colors.accentPrimary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AppIcon name="wallet" size={40} color={colors.textPrimary} />
        </View>

        <View style={{ alignItems: 'center', gap: 4 }}>
          <AppText variant="displayMedium" color={colors.textPrimary} center>
            {AppLabels.app.name}
          </AppText>
          <AppText variant="bodyMedium" color={colors.textMuted} center>
            {AppLabels.app.tagline}
          </AppText>
          <AppText variant="labelSmall" color={colors.textMuted} center>
            Versi 1.0.0
          </AppText>
        </View>

        <AppCard style={{ width: '100%', gap: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <AppText variant="bodyMedium" color={colors.textMuted}>Pengembang</AppText>
            <AppText variant="bodyMedium" color={colors.textPrimary}>
              {AppLabels.settings.developer}
            </AppText>
          </View>
          <View style={{ height: 1, backgroundColor: colors.border }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <AppText variant="bodyMedium" color={colors.textMuted}>Lisensi</AppText>
            <AppText variant="bodyMedium" color={colors.textPrimary}>
              {AppLabels.settings.license}
            </AppText>
          </View>
          <View style={{ height: 1, backgroundColor: colors.border }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <AppText variant="bodyMedium" color={colors.textMuted}>Data</AppText>
            <AppText variant="bodyMedium" color={colors.textPrimary}>100% Lokal</AppText>
          </View>
        </AppCard>
      </ScrollView>
    </View>
  );
}
