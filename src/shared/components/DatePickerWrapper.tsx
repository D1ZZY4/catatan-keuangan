import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, type ViewStyle } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AppText } from './AppText';
import { AppIcon } from './AppIcon';
import { useTheme } from '../theme/ThemeContext';
import { formatDate } from '../utils/formatters';

interface DatePickerWrapperProps {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
  style?: ViewStyle;
}

export function DatePickerWrapper({
  value,
  onChange,
  label,
  style,
}: DatePickerWrapperProps): React.ReactElement {
  const { colors, isDark } = useTheme();
  const [show, setShow] = useState(false);

  const handleChange = (_: unknown, selectedDate?: Date) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate !== undefined) onChange(selectedDate);
  };

  return (
    <View style={style}>
      {label !== undefined && (
        <AppText
          variant="labelSmall"
          color={colors.textMuted}
          style={styles.label}
        >
          {label}
        </AppText>
      )}

      <TouchableOpacity
        onPress={() => setShow(true)}
        style={[
          styles.trigger,
          {
            backgroundColor: colors.bgInput,
            borderColor: show ? colors.accentPrimary : colors.border,
            borderWidth: show ? 1.5 : StyleSheet.hairlineWidth,
          },
        ]}
        accessibilityLabel={`Pilih tanggal: ${formatDate(value)}`}
        accessibilityRole="button"
      >
        <AppIcon name="calendar" size={18} color={colors.textMuted} />
        <AppText variant="bodyMedium" color={colors.textPrimary} style={styles.dateText}>
          {formatDate(value)}
        </AppText>
        <AppIcon name="chevron-down" size={16} color={colors.textMuted} />
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={value}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleChange}
          themeVariant={isDark ? 'dark' : 'light'}
          maximumDate={new Date()}
          locale="id-ID"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: 6,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  dateText: {
    flex: 1,
    fontSize: 15,
  },
});
