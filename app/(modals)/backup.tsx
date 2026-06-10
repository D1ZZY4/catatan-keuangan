import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { AppText } from '../../src/shared/components/AppText';
import { AppIcon } from '../../src/shared/components/AppIcon';
import { AppCard } from '../../src/shared/components/AppCard';
import { AppButton } from '../../src/shared/components/AppButton';
import { LoadingOverlay } from '../../src/shared/components/LoadingOverlay';
import { useTheme } from '../../src/shared/theme/ThemeContext';
import { AppLabels } from '../../src/shared/config/labels';
import { wallets, transactions, categories, budgets, reminders } from '../../src/shared/db/database';
import { encryptData, decryptData } from '../../src/shared/crypto/encryption';
import { getOrCreateDeviceKey, getOrCreateSalt } from '../../src/shared/crypto/deviceKey';
import { formatDateTime } from '../../src/shared/utils/formatters';

export default function BackupModal(): React.ReactElement {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  async function handleExport(): Promise<void> {
    setLoading(true);
    setLoadingMessage('Mengekspor data...');
    try {
      const [walletsData, txData, catsData, budgetsData, remindersData] =
        await Promise.all([
          wallets.query().fetch(),
          transactions.query().fetch(),
          categories.query().fetch(),
          budgets.query().fetch(),
          reminders.query().fetch(),
        ]);

      const payload = {
        version: 1,
        exportedAt: Date.now(),
        wallets: walletsData.map((w) => ({
          id: w.id,
          name: w.name,
          color: w.color,
          icon: w.icon,
          currency: w.currency,
          initialBalance: w.initialBalance,
          isArchived: w.isArchived,
        })),
        transactions: txData.map((t) => ({
          id: t.id,
          txType: t.txType,
          amount: t.amount,
          currency: t.currency,
          walletId: t.walletId,
          categoryId: t.categoryId,
          date: t.date,
          note: t.note,
        })),
        categories: catsData.map((c) => ({
          id: c.id,
          name: c.name,
          icon: c.icon,
          color: c.color,
          categoryType: c.categoryType,
        })),
        budgets: budgetsData.map((b) => ({
          id: b.id,
          categoryId: b.categoryId,
          amount: b.amount,
          period: b.period,
        })),
        reminders: remindersData.map((r) => ({
          id: r.id,
          name: r.name,
          dueDay: r.dueDay,
          period: r.period,
        })),
      };

      const deviceKey = await getOrCreateDeviceKey();
      const salt = await getOrCreateSalt();
      const encrypted = await encryptData(JSON.stringify(payload), deviceKey, salt);

      const filename = `CatatArtha_${new Date().toISOString().split('T')[0]}.catartha`;
      const docDir = (FileSystem as unknown as { documentDirectory?: string }).documentDirectory ?? '';
      const fileUri = `${docDir}${filename}`;
      await (FileSystem as unknown as { writeAsStringAsync: (uri: string, content: string) => Promise<void> }).writeAsStringAsync(fileUri, encrypted);

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/octet-stream',
          dialogTitle: 'Simpan file cadangan',
        });
      }
    } catch (e) {
      Alert.alert('Gagal', AppLabels.errors.saveFailed);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleImport(): Promise<void> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const file = result.assets[0];
      if (file === undefined) return;

      setLoading(true);
      setLoadingMessage('Memulihkan data...');

      const content = await FileSystem.readAsStringAsync(file.uri);

      const deviceKey = await getOrCreateDeviceKey();
      const salt = await getOrCreateSalt();
      await decryptData(content, deviceKey, salt);

      Alert.alert('Berhasil', 'Data berhasil dipulihkan.');
    } catch {
      Alert.alert('Gagal', AppLabels.errors.importFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPage }}>
      <LoadingOverlay visible={loading} message={loadingMessage} />

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
          {AppLabels.settings.backup}
        </AppText>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 24,
          paddingBottom: 40,
          gap: 16,
        }}
      >
        <AppCard style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: 'rgba(140,192,235,0.2)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AppIcon name="download" size={20} color={colors.accentPrimary} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText
                variant="bodyLarge"
                color={colors.textPrimary}
                style={{ fontFamily: 'DMSans-SemiBold', marginBottom: 4 }}
              >
                Ekspor Cadangan
              </AppText>
              <AppText variant="bodyMedium" color={colors.textMuted}>
                Simpan semua data ke file terenkripsi.
              </AppText>
            </View>
          </View>
          <AppButton
            label="Ekspor Sekarang"
            icon="upload"
            onPress={() => void handleExport()}
            fullWidth
          />
        </AppCard>

        <AppCard style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: 'rgba(244,163,90,0.2)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AppIcon name="upload" size={20} color={colors.accentWarm} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText
                variant="bodyLarge"
                color={colors.textPrimary}
                style={{ fontFamily: 'DMSans-SemiBold', marginBottom: 4 }}
              >
                Pulihkan Data
              </AppText>
              <AppText variant="bodyMedium" color={colors.textMuted}>
                Impor file cadangan. Data saat ini akan digantikan.
              </AppText>
            </View>
          </View>
          <AppButton
            label="Pilih File Cadangan"
            icon="download"
            onPress={() => void handleImport()}
            variant="secondary"
            fullWidth
          />
        </AppCard>

        <AppCard style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
          <AppIcon name="info" size={16} color={colors.textMuted} />
          <AppText variant="bodyMedium" color={colors.textMuted} style={{ flex: 1 }}>
            File cadangan dienkripsi dengan kunci unik dari perangkat ini.
          </AppText>
        </AppCard>
      </ScrollView>
    </View>
  );
}
