import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { AppText } from '../../src/shared/components/AppText';
import { AppCard } from '../../src/shared/components/AppCard';
import { AppIcon } from '../../src/shared/components/AppIcon';
import { Divider } from '../../src/shared/components/Divider';
import { useTheme } from '../../src/shared/theme/ThemeContext';
import { useSettings } from '../../src/shared/hooks/useSettings';
import { AppLabels } from '../../src/shared/config/labels';
import { DEV_FLAGS } from '../../src/shared/utils/devFlags';

interface SettingsItemProps {
  icon: string;
  iconColor?: string;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
}

function SettingsItem({
  icon,
  iconColor,
  label,
  value,
  onPress,
  rightElement,
  danger = false,
}: SettingsItemProps): React.ReactElement {
  const { colors } = useTheme();
  const textColor = danger ? colors.danger : colors.textPrimary;
  const resolvedIconColor = iconColor ?? (danger ? colors.danger : colors.textMuted);

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
      accessibilityRole="button"
    >
      <View
        style={{
          width: 36, height: 36, borderRadius: 10,
          backgroundColor: danger
            ? 'rgba(198,40,40,0.1)'
            : (iconColor ? iconColor + '22' : colors.bgSurface),
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        <AppIcon name={icon} size={18} color={resolvedIconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText variant="bodyMedium" color={textColor} style={{ fontFamily: 'DMSans-Medium' }}>
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

function SectionHeader({ title }: { title: string }): React.ReactElement {
  const { colors } = useTheme();
  return (
    <AppText variant="labelMedium" color={colors.textMuted} style={{ paddingLeft: 4, marginBottom: -4 }}>
      {title.toUpperCase()}
    </AppText>
  );
}

export default function SettingsScreen(): React.ReactElement {
  const { colors, toggleDark, isDark } = useTheme();
  const { settings, updateSettings } = useSettings();
  const insets = useSafeAreaInsets();

  const appVersion =
    (Constants.expoConfig?.version ?? '1.0.0');
  const buildDate =
    (Constants.expoConfig?.extra as Record<string, string> | undefined)?.buildDate ?? '';

  function handleAutoLockSelect(): void {
    Alert.alert(
      'Kunci Otomatis',
      'Pilih durasi inaktif sebelum layar dikunci',
      [
        { text: '30 detik', onPress: () => void updateSettings({ autoLockSeconds: 30 }) },
        { text: '1 menit', onPress: () => void updateSettings({ autoLockSeconds: 60 }) },
        { text: '5 menit', onPress: () => void updateSettings({ autoLockSeconds: 300 }) },
        { text: 'Tidak pernah', onPress: () => void updateSettings({ autoLockSeconds: 0 }) },
        { text: 'Batal', style: 'cancel' },
      ],
    );
  }

  function getAutoLockLabel(): string {
    const s = settings.autoLockSeconds;
    if (s === 0) return 'Tidak pernah';
    if (s < 60) return `${s} detik`;
    return `${Math.round(s / 60)} menit`;
  }

  function handleFontSizeSelect(): void {
    Alert.alert(
      'Ukuran Teks',
      'Pilih ukuran teks aplikasi',
      [
        { text: 'Kecil', onPress: () => void updateSettings({ fontSize: 'small' }) },
        { text: 'Normal', onPress: () => void updateSettings({ fontSize: 'medium' }) },
        { text: 'Besar', onPress: () => void updateSettings({ fontSize: 'large' }) },
        { text: 'Batal', style: 'cancel' },
      ],
    );
  }

  function getFontSizeLabel(): string {
    return settings.fontSize === 'small' ? 'Kecil' : settings.fontSize === 'large' ? 'Besar' : 'Normal';
  }

  function handleCurrencySelect(): void {
    Alert.alert(
      'Mata Uang Dasar',
      'Pilih mata uang dasar',
      [
        { text: 'IDR (Rupiah)', onPress: () => void updateSettings({ baseCurrency: 'IDR' }) },
        { text: 'USD (Dollar)', onPress: () => void updateSettings({ baseCurrency: 'USD' }) },
        { text: 'EUR (Euro)', onPress: () => void updateSettings({ baseCurrency: 'EUR' }) },
        { text: 'SGD', onPress: () => void updateSettings({ baseCurrency: 'SGD' }) },
        { text: 'MYR', onPress: () => void updateSettings({ baseCurrency: 'MYR' }) },
        { text: 'Batal', style: 'cancel' },
      ],
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPage }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 16,
          paddingBottom: 60,
          gap: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <AppText variant="headingLarge" color={colors.textPrimary}>
          {AppLabels.tabs.settings}
        </AppText>

        {/* Profil */}
        <View style={{ gap: 8 }}>
          <SectionHeader title="Akun" />
          <AppCard>
            <SettingsItem
              icon="user"
              iconColor={colors.accentPrimary}
              label={AppLabels.settings.profile}
              value={settings.userName || 'Belum diatur'}
              onPress={() => router.push('/(modals)/profile-edit')}
            />
          </AppCard>
        </View>

        {/* Keamanan */}
        <View style={{ gap: 8 }}>
          <SectionHeader title="Keamanan" />
          <AppCard>
            <SettingsItem
              icon="lock"
              iconColor={colors.warning}
              label="PIN Aplikasi"
              value="Ubah atau atur PIN"
              onPress={() => router.push('/(modals)/security-settings')}
            />
            <Divider />
            <SettingsItem
              icon="clock"
              iconColor={colors.textMuted}
              label="Kunci Otomatis"
              value={getAutoLockLabel()}
              onPress={handleAutoLockSelect}
            />
          </AppCard>
        </View>

        {/* Tampilan */}
        <View style={{ gap: 8 }}>
          <SectionHeader title="Tampilan" />
          <AppCard>
            <SettingsItem
              icon="moon"
              iconColor={colors.accentSecondary}
              label="Mode Gelap"
              rightElement={
                <Switch
                  value={isDark}
                  onValueChange={toggleDark}
                  trackColor={{ false: colors.bgSurface, true: colors.accentPrimary }}
                  thumbColor={colors.bgPage}
                />
              }
            />
            <Divider />
            <SettingsItem
              icon="type"
              iconColor={colors.textMuted}
              label="Ukuran Teks"
              value={getFontSizeLabel()}
              onPress={handleFontSizeSelect}
            />
            <Divider />
            <SettingsItem
              icon="dollar-sign"
              iconColor={colors.success}
              label="Mata Uang Dasar"
              value={settings.baseCurrency}
              onPress={handleCurrencySelect}
            />
            <Divider />
            <SettingsItem
              icon="eye-off"
              iconColor={colors.textMuted}
              label="Sembunyikan Saldo"
              rightElement={
                <Switch
                  value={settings.hideBalance}
                  onValueChange={(v) => void updateSettings({ hideBalance: v })}
                  trackColor={{ false: colors.bgSurface, true: colors.accentPrimary }}
                  thumbColor={colors.bgPage}
                />
              }
            />
          </AppCard>
        </View>

        {/* Pengelolaan */}
        <View style={{ gap: 8 }}>
          <SectionHeader title="Pengelolaan" />
          <AppCard>
            <SettingsItem
              icon="tag"
              iconColor={colors.accentPrimary}
              label="Kategori"
              value="Kelola kategori transaksi"
              onPress={() => router.push('/(modals)/category-form')}
            />
            <Divider />
            <SettingsItem
              icon="pie-chart"
              iconColor={colors.accentSecondary}
              label="Anggaran"
              value="Atur anggaran per kategori"
              onPress={() => router.push('/(modals)/budget-form')}
            />
            <Divider />
            <SettingsItem
              icon="bell"
              iconColor={colors.warning}
              label="Pengingat Tagihan"
              value="Atur tagihan berulang"
              onPress={() => router.push('/(modals)/reminder-form')}
            />
          </AppCard>
        </View>

        {/* Notifikasi */}
        <View style={{ gap: 8 }}>
          <SectionHeader title="Notifikasi" />
          <AppCard>
            <SettingsItem
              icon="bell"
              iconColor={colors.accentPrimary}
              label={AppLabels.settings.notification}
              rightElement={
                <Switch
                  value={settings.notificationsEnabled}
                  onValueChange={(v) => void updateSettings({ notificationsEnabled: v })}
                  trackColor={{ false: colors.bgSurface, true: colors.accentPrimary }}
                  thumbColor={colors.bgPage}
                />
              }
            />
          </AppCard>
        </View>

        {/* Cadangan */}
        <View style={{ gap: 8 }}>
          <SectionHeader title="Data" />
          <AppCard>
            <SettingsItem
              icon="download"
              iconColor={colors.success}
              label={AppLabels.settings.backup}
              value="Ekspor dan impor data"
              onPress={() => router.push('/(modals)/backup')}
            />
          </AppCard>
        </View>

        {/* Tentang */}
        <View style={{ gap: 8 }}>
          <SectionHeader title="Tentang" />
          <AppCard>
            <SettingsItem
              icon="info"
              iconColor={colors.accentPrimary}
              label={AppLabels.settings.about}
              value={`v${appVersion}${buildDate ? ` · ${buildDate}` : ''}`}
              onPress={() => router.push('/(modals)/about')}
            />
            <Divider />
            <SettingsItem
              icon="code"
              iconColor={colors.textMuted}
              label="Developer"
              value={AppLabels.settings.developer}
            />
            <Divider />
            <SettingsItem
              icon="file-text"
              iconColor={colors.textMuted}
              label="Lisensi"
              value={AppLabels.settings.license}
            />
          </AppCard>
        </View>

        {/* Hapus Data */}
        <AppCard>
          <SettingsItem
            icon="trash-2"
            label={AppLabels.settings.deleteAll}
            danger
            onPress={() => router.push('/(modals)/delete-all-confirm')}
          />
        </AppCard>

        {/* Dev Tools (development only) */}
        {DEV_FLAGS.devMode && (
          <View style={{ gap: 8 }}>
            <SectionHeader title="Dev Tools" />
            <AppCard>
              <SettingsItem
                icon="code"
                iconColor={colors.accentPrimary}
                label="UI Check"
                value="Lihat semua komponen"
                onPress={() => router.push('/(dev)/ui-check')}
              />
            </AppCard>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
