import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../src/shared/components/AppText';
import { AppIcon } from '../../src/shared/components/AppIcon';
import { Calculator } from '../../src/shared/components/Calculator';
import { useTheme } from '../../src/shared/theme/ThemeContext';
import { AppLabels } from '../../src/shared/config/labels';

export default function CalculatorModal(): React.ReactElement {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  function handleValueCommit(value: number): void {
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
          <AppIcon name="x" size={22} color={colors.textMuted} />
        </TouchableOpacity>
        <AppText variant="headingMedium" color={colors.textPrimary}>
          {AppLabels.actions.scanReceipt.replace('Scan', 'Kalkulator').replace('Struk', '')}
        </AppText>
      </View>

      <View style={{ flex: 1, padding: 16, justifyContent: 'flex-end' }}>
        <Calculator onValueCommit={handleValueCommit} />
        <View style={{ height: insets.bottom + 12 }} />
      </View>
    </View>
  );
}
