import React, { useRef, useState, useCallback } from 'react';
import {
  View, Pressable, StyleSheet, Animated, Text, Modal, Platform,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlignJustify, TrendingDown, TrendingUp, ArrowLeftRight, ScanLine, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/shared/hooks/useTheme';
import { useRouter } from 'expo-router';

const ND = Platform.OS !== 'web';

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
}

export function FAB() {
  const { colors, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const itemAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const openFAB = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setOpen(true);
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: ND }),
      Animated.timing(backdropAnim, { toValue: 1, duration: 200, useNativeDriver: ND }),
      ...itemAnims.map((anim, i) =>
        Animated.spring(anim, {
          toValue: 1,
          delay: i * 60,
          useNativeDriver: ND,
        })
      ),
    ]).start();
  }, []);

  const closeFAB = useCallback((cb?: () => void) => {
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 0, duration: 200, useNativeDriver: ND }),
      Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: ND }),
      ...itemAnims.map(anim =>
        Animated.timing(anim, { toValue: 0, duration: 150, useNativeDriver: ND })
      ),
    ]).start(() => {
      setOpen(false);
      cb?.();
    });
  }, []);

  const handleAction = useCallback((action: () => void) => {
    closeFAB(action);
  }, [closeFAB]);

  const quickActions: QuickAction[] = [
    {
      label: 'Pengeluaran',
      icon: <TrendingDown size={20} color={colors.danger} />,
      onPress: () => handleAction(() => router.push('/(modals)/form-transaksi?type=expense')),
    },
    {
      label: 'Pemasukan',
      icon: <TrendingUp size={20} color={colors.success} />,
      onPress: () => handleAction(() => router.push('/(modals)/form-transaksi?type=income')),
    },
    {
      label: 'Transfer',
      icon: <ArrowLeftRight size={20} color={colors.accentPrimary} />,
      onPress: () => handleAction(() => router.push('/(modals)/form-transaksi?type=transfer_internal')),
    },
    {
      label: 'Scan Struk',
      icon: <ScanLine size={20} color={colors.accentWarm} />,
      onPress: () => handleAction(() => router.push('/(modals)/scanner')),
    },
  ];

  const fabBottom = insets.bottom + 92;

  return (
    <>
      {open && (
        <Modal transparent animationType="none" statusBarTranslucent>
          <Animated.View
            style={[styles.backdrop, { opacity: backdropAnim, backgroundColor: colors.overlay }]}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={() => closeFAB()} accessibilityLabel="Tutup menu" />
          </Animated.View>

          <View style={[styles.actionsContainer, { bottom: fabBottom + 68, pointerEvents: 'box-none' }]}>
            {[...quickActions].reverse().map((action, reverseIndex) => {
              const index = quickActions.length - 1 - reverseIndex;
              const anim = itemAnims[index];
              if (!anim) return null;
              return (
                <Animated.View
                  key={action.label}
                  style={[
                    styles.actionRow,
                    {
                      opacity: anim,
                      transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
                    },
                  ]}
                >
                  <Text style={[styles.actionLabel, { color: colors.textPrimary, fontFamily: 'DMSans-Medium' }]}>
                    {action.label}
                  </Text>
                  <Pressable
                    onPress={action.onPress}
                    style={[styles.actionBtn, { backgroundColor: colors.bgCard }, shadows.md]}
                    accessibilityLabel={action.label}
                  >
                    {action.icon}
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        </Modal>
      )}

      <View style={[styles.fabWrapper, { bottom: fabBottom, right: 20, pointerEvents: 'box-none' }]}>
        <Pressable
          onPress={open ? () => closeFAB() : openFAB}
          style={({ pressed }) => [
            styles.fab,
            { backgroundColor: colors.accentPrimary },
            shadows.float,
            pressed && { transform: [{ scale: 0.95 }] },
          ]}
          accessibilityLabel="Menu aksi cepat"
          accessibilityRole="button"
        >
          <Animated.View style={{ transform: [{ rotate: open ? '45deg' : '0deg' }] }}>
            {open
              ? <X size={24} color={colors.white} />
              : <AlignJustify size={24} color={colors.white} />
            }
          </Animated.View>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 100,
  },
  fabWrapper: {
    position: 'absolute',
    zIndex: 200,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsContainer: {
    position: 'absolute',
    right: 20,
    zIndex: 200,
    alignItems: 'flex-end',
    gap: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionLabel: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
