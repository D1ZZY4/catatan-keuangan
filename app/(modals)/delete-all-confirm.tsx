import React, { useState } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
// delete-all-confirm v2
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../src/shared/components/AppText';
import { AppIcon } from '../../src/shared/components/AppIcon';
import { AppButton } from '../../src/shared/components/AppButton';
import { useTheme } from '../../src/shared/theme/ThemeContext';
import { AppLabels } from '../../src/shared/config/labels';
import { database } from '../../src/shared/db/database';
import { wipeDeviceKey } from '../../src/shared/crypto/deviceKey';
import { deletePin } from '../../src/shared/crypto/pinStore';
import { clearSettingsCache } from '../../src/shared/services/settingsStore';
import { useSettings } from '../../src/shared/hooks/useSettings';

export default function DeleteAllConfirmModal(): React.ReactElement {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { updateSettings } = useSettings();
  const [deleting, setDeleting] = useState(false);

  async function handleDeleteAll(): Promise<void> {
    Alert.alert(
      'Hapus Semua Data',
      'Ini akan menghapus SEMUA data secara permanen termasuk transaksi, dompet, dan PIN. Tindakan ini tidak dapat dibatalkan.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus Permanen',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await database.write(async () => {
                await database.unsafeResetDatabase();
              });
              await wipeDeviceKey();
              await deletePin();
              clearSettingsCache();
              await updateSettings({ onboardingCompleted: false, tourCompleted: false });
              router.replace('/(onboarding)');
            } catch (e) {
              Alert.alert('Gagal', AppLabels.errors.saveFailed);
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
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
          {AppLabels.settings.deleteAll}
        </AppText>
      </View>

      <View
        style={{
          flex: 1,
          paddingHorizontal: 32,
          justifyContent: 'center',
          alignItems: 'center',
          gap: 20,
        }}
      >
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: 'rgba(198,40,40,0.12)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AppIcon name="trash" size={32} color={colors.danger} />
        </View>

        <AppText variant="headingLarge" color={colors.danger} center>
          Hapus Semua Data
        </AppText>

        <AppText variant="bodyMedium" color={colors.textMuted} center style={{ lineHeight: 24 }}>
          Semua transaksi, dompet, anggaran, pengingat, dan PIN akan dihapus secara permanen. Aplikasi akan kembali ke pengaturan awal.
        </AppText>

        <View style={{ width: '100%', gap: 12 }}>
          <AppButton
            label="Hapus Semua Data"
            variant="danger"
            fullWidth
            onPress={() => void handleDeleteAll()}
            loading={deleting}
            icon="trash"
          />
          <AppButton
            label="Batal"
            variant="ghost"
            fullWidth
            onPress={() => router.back()}
          />
        </View>
      </View>
    </View>
  );
}
