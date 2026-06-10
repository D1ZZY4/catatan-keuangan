import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AppText } from './AppText';
import { AppIcon } from './AppIcon';
import { useTheme } from '../theme/ThemeContext';
import { springPresets } from '../theme/animation';

interface AppBarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
  transparent?: boolean;
  hideCalculator?: boolean;
  onCalculatorPress?: () => void;
  style?: ViewStyle;
}

function ActionButton({
  onPress,
  accessibilityLabel,
  children,
}: {
  onPress: () => void;
  accessibilityLabel: string;
  children: React.ReactNode;
}): React.ReactElement {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.9, springPresets.snappy);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, springPresets.snappy);
        }}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        style={styles.iconBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

export function AppBar({
  title,
  showBack = false,
  onBack,
  actions,
  transparent = false,
  hideCalculator = false,
  onCalculatorPress,
  style,
}: AppBarProps): React.ReactElement {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBack = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onBack) onBack();
    else router.back();
  };

  const handleCalculator = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCalculatorPress?.();
  };

  const containerStyle: ViewStyle = {
    paddingTop: insets.top + 8,
    backgroundColor: transparent ? 'transparent' : colors.bgCard,
    borderBottomWidth: transparent ? 0 : StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  };

  return (
    <View
      style={[styles.container, containerStyle, style]}
      accessibilityRole="header"
    >
      <View style={styles.row}>
        {showBack ? (
          <ActionButton onPress={handleBack} accessibilityLabel="Kembali">
            <AppIcon name="chevron-left" size={22} color={colors.textPrimary} />
          </ActionButton>
        ) : (
          <View style={styles.iconBtn} />
        )}

        <AppText
          variant="headingSmall"
          color={colors.textPrimary}
          style={styles.title}
          numberOfLines={1}
        >
          {title}
        </AppText>

        <View style={styles.rightSlot}>
          {actions}
          {!hideCalculator && (
            <ActionButton
              onPress={handleCalculator}
              accessibilityLabel="Kalkulator"
            >
              <View
                style={[
                  styles.calcBtn,
                  {
                    backgroundColor: colors.bgSurface,
                    borderColor: colors.border,
                  },
                ]}
                data-tour="calculator"
              >
                <AppIcon
                  name="calculator"
                  size={15}
                  color={colors.textMuted}
                />
              </View>
            </ActionButton>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 8,
    paddingHorizontal: 16,
    zIndex: 30,
    ...Platform.select({
      android: { elevation: 2 },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
    }),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    gap: 4,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  title: {
    flex: 1,
    fontSize: 15,
    textAlign: 'left',
  },
  rightSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  calcBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
