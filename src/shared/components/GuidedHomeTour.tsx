import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, Modal, Pressable, StyleSheet, Animated, Platform,
  type ViewStyle,
} from 'react-native';

import { X } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';

const ND = Platform.OS !== 'web';

export interface TourStep {
  targetLayout?: { x: number; y: number; width: number; height: number };
  bubble: { title: string; body: string; position: 'top' | 'bottom' | 'center' };
  pulse?: boolean;
  autoAdvanceMs?: number;
}

interface GuidedHomeTourProps {
  steps: TourStep[];
  onComplete: () => void;
  onSkip?: () => void;
}

export function GuidedHomeTour({ steps, onComplete, onSkip }: GuidedHomeTourProps) {
  const { colors } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bubbleAnim = useRef(new Animated.Value(0)).current;

  const step = steps[currentStep];

  useEffect(() => {
    Animated.spring(bubbleAnim, {
      toValue: 1,
      useNativeDriver: ND,
      tension: 80,
      friction: 6,
    }).start();

    return () => {
      bubbleAnim.setValue(0);
    };
  }, [currentStep]);

  useEffect(() => {
    if (!step?.pulse) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: ND }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: ND }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [currentStep]);

  useEffect(() => {
    const ms = step?.autoAdvanceMs ?? 4000;
    const timer = setTimeout(() => {
      advance();
    }, ms);
    return () => clearTimeout(timer);
  }, [currentStep]);

  function advance() {
    if (currentStep + 1 >= steps.length) {
      onComplete();
    } else {
      setCurrentStep(s => s + 1);
    }
  }

  function handleSkip() {
    if (onSkip) onSkip();
    else onComplete();
  }

  if (!step) return null;

  const bubblePos: ViewStyle = step.bubble.position === 'top'
    ? { top: 80 }
    : step.bubble.position === 'bottom'
    ? { bottom: 160 }
    : { top: '35%' };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={handleSkip}>
      <Pressable style={styles.backdrop} onPress={advance}>
        <Pressable onPress={handleSkip} style={[styles.skipBtn, { backgroundColor: colors.bgCard }]}>
          <X size={16} color={colors.textMuted} />
          <Text style={[styles.skipText, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>Lewati Tur</Text>
        </Pressable>

        <Animated.View
          style={[
            styles.bubble,
            bubblePos,
            { backgroundColor: colors.bgCard },
            {
              opacity: bubbleAnim,
              transform: [{ scale: bubbleAnim }],
            },
          ]}
        >
          <Text style={[styles.bubbleTitle, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
            {step.bubble.title}
          </Text>
          <Text style={[styles.bubbleBody, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
            {step.bubble.body}
          </Text>
          <View style={styles.bubbleProgress}>
            {steps.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  { backgroundColor: i === currentStep ? colors.accentPrimary : colors.border },
                ]}
              />
            ))}
          </View>
          <Pressable onPress={advance} style={[styles.nextBtn, { backgroundColor: colors.accentPrimary }]}>
            <Text style={[styles.nextText, { color: '#fff', fontFamily: 'DMSans-SemiBold' }]}>
              {currentStep + 1 >= steps.length ? 'Selesai' : 'Lanjut'}
            </Text>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
  },
  skipBtn: {
    position: 'absolute',
    top: 56,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skipText: { fontSize: 13, lineHeight: 18 },
  bubble: {
    position: 'absolute',
    marginHorizontal: 20,
    width: '88%',
    borderRadius: 20,
    padding: 20,
    gap: 10,
    elevation: 8,
    ...(require('react-native').Platform.OS === 'web'
      ? { boxShadow: '0px 4px 12px rgba(0,0,0,0.12)' }
      : { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12 }),
  },
  bubbleTitle: { fontSize: 17, lineHeight: 24 },
  bubbleBody: { fontSize: 14, lineHeight: 22 },
  bubbleProgress: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  nextBtn: {
    marginTop: 4,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextText: { fontSize: 15, lineHeight: 22 },
});
