import React from 'react';
import { View, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AppText } from '../../src/shared/components/AppText';
import { AppCard } from '../../src/shared/components/AppCard';
import { AppIcon } from '../../src/shared/components/AppIcon';
import { useTheme } from '../../src/shared/theme/ThemeContext';
import { useSettings } from '../../src/shared/hooks/useSettings';
import { AppLabels } from '../../src/shared/config/labels';

interface SettingsItemProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
}

function SettingsItem({
  icon,
  label,
  value,
  onPress,
  rightElement,
  danger = false,
}: SettingsItemProps): React.ReactElement {
  const { colors } = useTheme();
  const textColor = danger ? colors.danger : colors.textPrimary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={onPress === undefined}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        gap: 12,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: danger
            ? 'rgba(198,40,40,0.1)'
            : colors.bgSurface,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AppIcon
          name={icon}
          size={18}
          color={danger ? colors.danger : colors.textMuted}
        />
      </View>
      <View style={{ flex: 1 }}>
        <AppText
          variant="bodyMedium"
          color={textColor}
          style={{ fontFamily: 'DMSans-Medium' }}
        >
          {label}
        </AppText>
        {value !== undefined && (
          <AppText variant="labelSmall" color={colors.textMuted}>
            {value}
          </AppText>
        )}
      </View>
      {rightElement !== undefined ? (
        rightElement
      ) : onPress !== undefined ? (
        <AppIcon name="chevron-right" size={16} color={colors.textMuted} />
      ) : null}
    </TouchableOpacity>
  );
}

function Divider(): React.ReactElement {
  const { colors } = useTheme();
  return (
    <View
      style={{ height: 1, backgroundColor: colors.border, marginLeft: 48 }}
    />
  );
}

export default function SettingsScreen(): React.ReactElement {
  const { colors, toggleDark, isDark } = useTheme();
  const { settings, updateSettings } = useSettings();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPage }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 16,
          paddingBottom: 48,
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <AppText variant="headingLarge" color={colors.textPrimary}>
          {AppLabels.tabs.settings}
        </AppText>

        <AppCard>
          <SettingsItem
            icon="users"
            label={AppLabels.settings.profile}
            value={settings.userName || 'Belum diatur'}
            onPress={() => router.push('/(modals)/profile-edit')}
          />
          <Divider />
          <SettingsItem
            icon="lock"
            label={AppLabels.settings.security}
            onPress={() => router.push('/(modals)/security-settings')}
          />
          <Divider />
          <SettingsItem
            icon="sparkles"
            label={AppLabels.settings.appearance}
            rightElement={
              <Switch
                value={isDark}
                onValueChange={toggleDark}
                trackColor={{
                  false: colors.bgSurface,
                  true: colors.accentPrimary,
                }}
                thumbColor={colors.bgPage}
              />
            }
          />
        </AppCard>

        <AppCard>
          <SettingsItem
            icon="bell"
            label={AppLabels.settings.notification}
            rightElement={
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={(v) =>
                  void updateSettings({ notificationsEnabled: v })
                }
                trackColor={{
                  false: colors.bgSurface,
                  true: colors.accentPrimary,
                }}
                thumbColor={colors.bgPage}
              />
            }
          />
          <Divider />
          <SettingsItem
            icon="download"
            label={AppLabels.settings.backup}
            onPress={() => router.push('/(modals)/backup')}
          />
        </AppCard>

        <AppCard>
          <SettingsItem
            icon="info"
            label={AppLabels.settings.about}
            value={`v1.0.0 · ${AppLabels.settings.developer}`}
            onPress={() => router.push('/(modals)/about')}
          />
        </AppCard>

        <AppCard>
          <SettingsItem
            icon="trash"
            label={AppLabels.settings.deleteAll}
            danger
            onPress={() => router.push('/(modals)/delete-all-confirm')}
          />
        </AppCard>
      </ScrollView>
    </View>
  );
}
