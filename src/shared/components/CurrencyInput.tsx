import React, { useRef, useState } from 'react';
import {
  TextInput,
  View,
  TouchableOpacity,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { evaluate } from 'mathjs';
import { AppText } from './AppText';
import { AppIcon } from './AppIcon';
import { useTheme } from '../theme/ThemeContext';
import { formatCurrency } from '../utils/formatters';

interface CurrencyInputProps {
  value: string;
  onChangeText: (text: string) => void;
  currency?: string;
  placeholder?: string;
  style?: ViewStyle;
  accessibilityLabel?: string;
  autoFocus?: boolean;
}

function tryEval(expr: string): number | null {
  if (!expr.trim()) return null;
  try {
    const cleaned = expr.replace(/,/g, '.');
    const result = evaluate(cleaned) as unknown;
    if (typeof result === 'number' && isFinite(result)) return result;
    return null;
  } catch {
    return null;
  }
}

export function CurrencyInput({
  value,
  onChangeText,
  currency = 'IDR',
  placeholder = '0',
  style,
  accessibilityLabel,
  autoFocus = false,
}: CurrencyInputProps): React.ReactElement {
  const { colors } = useTheme();
  const ref = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const [evalResult, setEvalResult] = useState<number | null>(null);

  const handleChange = (text: string) => {
    const cleaned = text.replace(/[^0-9+\-*/().]/g, '');
    onChangeText(cleaned);
    const isExpr = /[+\-*/]/.test(cleaned);
    setEvalResult(isExpr ? tryEval(cleaned) : null);
  };

  const handleBlur = () => {
    setFocused(false);
    if (evalResult !== null) {
      onChangeText(String(evalResult));
      setEvalResult(null);
    }
  };

  const handleClear = () => {
    onChangeText('');
    setEvalResult(null);
    ref.current?.focus();
  };

  const numericValue = parseFloat(value) || 0;
  const displayPreview =
    evalResult !== null
      ? formatCurrency(evalResult, currency)
      : value.length > 0 && !isNaN(numericValue)
      ? formatCurrency(numericValue, currency)
      : null;

  return (
    <View style={[styles.wrapper, style]}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.bgInput,
            borderColor: focused ? colors.accentPrimary : colors.border,
            borderWidth: focused ? 1.5 : StyleSheet.hairlineWidth,
          },
        ]}
      >
        <AppText variant="headingSmall" color={colors.textMuted} style={styles.currencySymbol}>
          {currency === 'IDR' ? 'Rp' : currency}
        </AppText>

        <TextInput
          ref={ref}
          value={value}
          onChangeText={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={colors.textPlaceholder}
          keyboardType="decimal-pad"
          style={[styles.input, { color: colors.textPrimary }]}
          returnKeyType="done"
          autoFocus={autoFocus}
          accessibilityLabel={accessibilityLabel ?? 'Nominal'}
          accessibilityRole="adjustable"
          maxLength={20}
        />

        {value.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Hapus nominal"
          >
            <AppIcon name="x" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {displayPreview !== null && (
        <AppText
          variant="labelSmall"
          color={evalResult !== null ? colors.accentPrimary : colors.textMuted}
          style={styles.preview}
        >
          {evalResult !== null ? `= ${displayPreview}` : displayPreview}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 4,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'DMSans-Bold',
    padding: 0,
    margin: 0,
    fontVariant: ['tabular-nums'],
  },
  preview: {
    paddingHorizontal: 4,
  },
});
