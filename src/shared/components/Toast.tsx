import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, Animated, StyleSheet, Pressable, Platform } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import type { ToastType } from '@/shared/types';
import { generateId } from '@/shared/utils/helpers';

const ND = Platform.OS !== 'web';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

function ToastItemView({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(opacity, { toValue: 1, useNativeDriver: ND }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: ND }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: ND }),
        Animated.timing(translateY, { toValue: -20, duration: 250, useNativeDriver: ND }),
      ]).start(onDismiss);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const iconColor = {
    success: colors.success,
    error: colors.danger,
    warning: colors.warning,
    info: colors.accentPrimary,
  }[item.type];

  const Icon = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  }[item.type];

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: colors.bgCard, opacity, transform: [{ translateY }] },
      ]}
    >
      <Icon size={18} color={iconColor} />
      <Text style={[styles.message, { color: colors.textPrimary, fontFamily: 'DMSans-Regular' }]}>
        {item.message}
      </Text>
      <Pressable onPress={onDismiss} accessibilityLabel="Tutup notifikasi">
        <X size={16} color={colors.textMuted} />
      </Pressable>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const insets = useSafeAreaInsets();

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = generateId();
    setToasts(prev => [...prev.slice(-2), { id, message, type }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View style={[styles.container, { top: insets.top + 8, pointerEvents: 'box-none' }]}>
        {toasts.map(item => (
          <ToastItemView key={item.id} item={item} onDismiss={() => dismiss(item.id)} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast harus digunakan di dalam ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    gap: 8,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 10,
    elevation: 6,
    ...(require('react-native').Platform.OS === 'web'
      ? { boxShadow: '0px 4px 8px rgba(0,0,0,0.12)' }
      : { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8 }),
  },
  message: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
