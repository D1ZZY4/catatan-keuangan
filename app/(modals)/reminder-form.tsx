import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../src/shared/components/AppText';
import { AppButton } from '../../src/shared/components/AppButton';
import { AppIcon } from '../../src/shared/components/AppIcon';
import { Divider } from '../../src/shared/components/Divider';
import { useTheme } from '../../src/shared/theme/ThemeContext';
import { AppLabels } from '../../src/shared/config/labels';
import { AppConfig } from '../../src/shared/config/periods';
import { useReminders } from '../../src/shared/hooks/useReminders';
import { useSettings } from '../../src/shared/hooks/useSettings';

export default function ReminderFormModal(): React.ReactElement {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { settings } = useSettings();
  const params = useLocalSearchParams<{ reminderId?: string }>();
  const { data: allReminders, createReminder, updateReminder } = useReminders();

  const editReminder = params.reminderId
    ? allReminders.find((r) => r.id === params.reminderId)
    : undefined;

  const [name, setName] = useState(editReminder?.name ?? '');
  const [amount, setAmount] = useState(
    editReminder?.amount ? String(editReminder.amount) : '',
  );
  const [period, setPeriod] = useState<'monthly' | 'weekly'>(
    editReminder?.period ?? 'monthly',
  );
  const [dueDay, setDueDay] = useState(editReminder?.dueDay ?? 1);
  const [notifyDaysBefore, setNotifyDaysBefore] = useState(
    editReminder?.notifyDaysBefore ?? AppConfig.defaults.notifyDaysBefore,
  );
  const [saving, setSaving] = useState(false);

  const dayLabels =
    period === 'monthly'
      ? Array.from({ length: 31 }, (_, i) => ({ value: i + 1, label: `Tgl ${i + 1}` }))
      : [
          { value: 0, label: 'Minggu' },
          { value: 1, label: 'Senin' },
          { value: 2, label: 'Selasa' },
          { value: 3, label: 'Rabu' },
          { value: 4, label: 'Kamis' },
          { value: 5, label: "Jum'at" },
          { value: 6, label: 'Sabtu' },
        ];

  async function handleSave(): Promise<void> {
    if (!name.trim()) {
      Alert.alert('Nama pengingat tidak boleh kosong');
      return;
    }
    setSaving(true);
    try {
      const data = {
        name: name.trim(),
        amount: amount ? parseFloat(amount.replace(/[^\d.]/g, '')) : undefined,
        currency: settings.baseCurrency,
        dueDay,
        period,
        category: '',
        notifyDaysBefore,
        isActive: true,
      };
      if (editReminder) {
        await updateReminder(editReminder.id, data);
      } else {
        await createReminder(data);
      }
      router.back();
    } catch {
      Alert.alert('Gagal menyimpan pengingat');
    } finally {
      setSaving(false);
    }
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
          justifyContent: 'space-between',
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <AppIcon name="x" size={22} color={colors.textMuted} />
        </TouchableOpacity>
        <AppText variant="headingMedium" color={colors.textPrimary}>
          {editReminder ? 'Edit Pengingat' : 'Tambah Pengingat'}
        </AppText>
        <AppButton
          label={AppLabels.transactionForm.saveButton}
          onPress={() => void handleSave()}
          loading={saving}
          size="sm"
        />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 8 }}>
          <AppText variant="labelMedium" color={colors.textMuted}>
            Nama Tagihan / Pengingat
          </AppText>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="cth. Tagihan Listrik"
            placeholderTextColor={colors.textPlaceholder}
            maxLength={60}
            autoFocus
            style={{
              backgroundColor: colors.bgInput,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 16,
              paddingVertical: 14,
              color: colors.textPrimary,
              fontSize: 16,
              fontFamily: 'DMSans-Regular',
            }}
          />
        </View>

        <View style={{ gap: 8 }}>
          <AppText variant="labelMedium" color={colors.textMuted}>
            Nominal (opsional)
          </AppText>
          <View
            style={{
              backgroundColor: colors.bgInput,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 16,
              paddingVertical: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <AppText variant="bodyMedium" color={colors.textMuted}>Rp</AppText>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.textPlaceholder}
              style={{
                flex: 1,
                color: colors.textPrimary,
                fontSize: 16,
                fontFamily: 'DMSans-Regular',
              }}
            />
          </View>
        </View>

        <Divider />

        <View style={{ gap: 8 }}>
          <AppText variant="labelMedium" color={colors.textMuted}>Periode</AppText>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {(['monthly', 'weekly'] as const).map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => { setPeriod(p); setDueDay(p === 'weekly' ? 1 : 1); }}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: period === p ? colors.accentPrimary : colors.border,
                  backgroundColor: period === p ? colors.accentPrimary + '22' : colors.bgCard,
                  alignItems: 'center',
                }}
              >
                <AppText
                  variant="bodyMedium"
                  color={period === p ? colors.accentPrimary : colors.textMuted}
                >
                  {p === 'monthly' ? 'Bulanan' : 'Mingguan'}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <AppText variant="labelMedium" color={colors.textMuted}>
            {period === 'monthly' ? 'Tanggal Jatuh Tempo' : 'Hari Jatuh Tempo'}
          </AppText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {dayLabels.slice(0, period === 'monthly' ? 31 : 7).map((d) => (
              <TouchableOpacity
                key={d.value}
                onPress={() => setDueDay(d.value)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 20,
                  borderWidth: 1.5,
                  borderColor: dueDay === d.value ? colors.accentPrimary : colors.border,
                  backgroundColor: dueDay === d.value ? colors.accentPrimary + '22' : colors.bgCard,
                }}
              >
                <AppText
                  variant="bodySmall"
                  color={dueDay === d.value ? colors.accentPrimary : colors.textMuted}
                >
                  {d.label}
                </AppText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <Divider />

        <View style={{ gap: 8 }}>
          <AppText variant="labelMedium" color={colors.textMuted}>
            Ingatkan {notifyDaysBefore} hari sebelum jatuh tempo
          </AppText>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[1, 2, 3, 5, 7].map((d) => (
              <TouchableOpacity
                key={d}
                onPress={() => setNotifyDaysBefore(d)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: notifyDaysBefore === d ? colors.accentPrimary : colors.border,
                  backgroundColor: notifyDaysBefore === d ? colors.accentPrimary + '22' : colors.bgCard,
                  alignItems: 'center',
                }}
              >
                <AppText
                  variant="bodySmall"
                  color={notifyDaysBefore === d ? colors.accentPrimary : colors.textMuted}
                >
                  {d}H
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
