import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { AppText } from './AppText';
import { AppIcon } from './AppIcon';
import { useTheme } from '../theme/ThemeContext';
import { springPresets, timingPresets } from '../theme/animation';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (ctx === null) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

interface ToastItemProps {
  item: ToastMessage;
  onDone: (id: string) => void;
}

function ToastItem({ item, onDone }: ToastItemProps): React.ReactElement {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const translateY = useSharedValue(80);
  const opacity = useSharedValue(0);

  const config: Record<ToastType, { bg: string; icon: string; color: string }> = {
    success: { bg: colors.success, icon: 'check', color: '#fff' },
    error: { bg: colors.danger, icon: 'alert', color: '#fff' },
    warning: { bg: colors.warning, icon: 'alert', color: '#fff' },
    info: { bg: colors.accentPrimary, icon: 'info', color: '#fff' },
  };

  const { bg, icon, color } = config[item.type];

  React.useEffect(() => {
    translateY.value = withSpring(0, springPresets.smooth);
    opacity.value = withTiming(1, timingPresets.fast);

    const timer = setTimeout(() => {
      opacity.value = withTiming(0, timingPresets.fast);
      translateY.value = withSpring(80, springPresets.snappy, () => {
        runOnJS(onDone)(item.id);
      });
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: bg, marginBottom: insets.bottom + 80 },
        animStyle,
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <AppIcon name={icon} size={16} color={color} />
      <AppText variant="bodyMedium" color={color} style={styles.toastText}>
        {item.message}
      </AppText>
    </Animated.View>
  );
}

export function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const counter = useRef(0);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = `toast-${counter.current++}`;
    void Haptics.notificationAsync(
      type === 'error'
        ? Haptics.NotificationFeedbackType.Error
        : type === 'warning'
        ? Haptics.NotificationFeedbackType.Warning
        : Haptics.NotificationFeedbackType.Success
    );
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]);
  }, []);

  const handleDone = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View style={styles.container} pointerEvents="none">
        {toasts.map((t) => (
          <ToastItem key={t.id} item={t} onDone={handleDone} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
    gap: 8,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  toastText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
});
