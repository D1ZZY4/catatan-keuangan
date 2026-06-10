import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  AccessibilityInfo,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Haptics from 'expo-haptics';
import { AppText } from './AppText';
import { AppIcon } from './AppIcon';
import { useTheme } from '../theme/ThemeContext';
import { springPresets, timingPresets, TOUR_ADVANCE_MS } from '../theme/animation';
import { AppLabels } from '../config/labels';

interface TourStep {
  dataTag: string;
  title: string;
  body: string;
  route: string;
}

const STEPS: TourStep[] = [
  { dataTag: 'greeting', title: AppLabels.tour.step1.title, body: AppLabels.tour.step1.body, route: '/' },
  { dataTag: 'wallets', title: AppLabels.tour.step2.title, body: AppLabels.tour.step2.body, route: '/' },
  { dataTag: 'fab', title: AppLabels.tour.step3.title, body: AppLabels.tour.step3.body, route: '/' },
  { dataTag: 'navbar', title: AppLabels.tour.step4.title, body: AppLabels.tour.step4.body, route: '/' },
  { dataTag: 'budget', title: AppLabels.tour.step5.title, body: AppLabels.tour.step5.body, route: '/' },
  { dataTag: 'calculator', title: AppLabels.tour.step6.title, body: AppLabels.tour.step6.body, route: '/' },
];

export interface GuidedHomeTourRef {
  start: () => void;
}

interface SpotRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface GuidedHomeTourProps {
  onComplete?: () => void;
}

export function GuidedHomeTour({ onComplete }: GuidedHomeTourProps): React.ReactElement | null {
  const { colors } = useTheme();
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confettiRef = useRef<ConfettiCannon | null>(null);

  const bubbleOpacity = useSharedValue(0);
  const bubbleY = useSharedValue(20);
  const overlayOpacity = useSharedValue(0);

  const bubbleStyle = useAnimatedStyle(() => ({
    opacity: bubbleOpacity.value,
    transform: [{ translateY: bubbleY.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  const showBubble = () => {
    if (reduceMotion) {
      bubbleOpacity.value = 1;
      bubbleY.value = 0;
      return;
    }
    bubbleOpacity.value = withTiming(1, timingPresets.fast);
    bubbleY.value = withSpring(0, springPresets.gentle);
  };

  const hideBubble = (cb?: () => void) => {
    if (reduceMotion) {
      bubbleOpacity.value = 0;
      bubbleY.value = 20;
      cb?.();
      return;
    }
    bubbleOpacity.value = withTiming(0, timingPresets.fast);
    bubbleY.value = withTiming(20, timingPresets.fast);
    setTimeout(() => cb?.(), 200);
  };

  const startTour = useCallback(() => {
    setStep(0);
    setActive(true);
    overlayOpacity.value = withTiming(1, timingPresets.backdrop);
    setTimeout(() => showBubble(), 300);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const finishTour = useCallback(() => {
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    overlayOpacity.value = withTiming(0, timingPresets.fast);
    hideBubble(() => {
      setActive(false);
      setShowConfetti(true);
      onComplete?.();
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        confettiRef.current?.start();
        setTimeout(() => setShowConfetti(false), 3000);
      }, 100);
    });
  }, [onComplete]);

  const advanceStep = useCallback(() => {
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    const nextStep = step + 1;
    if (nextStep >= STEPS.length) {
      void finishTour();
      return;
    }
    hideBubble(() => {
      setStep(nextStep);
      bubbleY.value = 20;
      showBubble();
    });
  }, [step, finishTour]);

  const prevStep = useCallback(() => {
    if (step <= 0) return;
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    hideBubble(() => {
      setStep((s) => s - 1);
      bubbleY.value = 20;
      showBubble();
    });
  }, [step]);

  useEffect(() => {
    if (!active) return;
    timerRef.current = setTimeout(() => advanceStep(), TOUR_ADVANCE_MS);
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, [active, step]);

  const current = STEPS[step];
  const { width: screenW, height: screenH } = Dimensions.get('window');

  if (!active && !showConfetti) return null;

  return (
    <>
      {showConfetti && (
        <View style={styles.confettiContainer} pointerEvents="none">
          <ConfettiCannon
            ref={confettiRef}
            count={80}
            origin={{ x: screenW / 2, y: 0 }}
            autoStart={false}
            fadeOut
            colors={[colors.accentPrimary, colors.accentWarm, colors.success, '#F4D06F']}
          />
        </View>
      )}

      {active && current !== undefined && (
        <>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              styles.overlay,
              overlayStyle,
            ]}
            pointerEvents="box-none"
          />

          <Animated.View
            style={[
              styles.bubble,
              {
                backgroundColor: colors.bgCard,
                bottom: 120,
                left: 16,
                right: 16,
              },
              bubbleStyle,
            ]}
            accessibilityRole="dialog"
            accessibilityLabel={`Tur panduan: langkah ${step + 1} dari ${STEPS.length}`}
          >
            <View style={styles.bubbleHeader}>
              <View style={styles.dots}>
                {STEPS.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      {
                        width: i === step ? 20 : 6,
                        backgroundColor: i === step ? colors.accentPrimary : colors.bgSurface,
                      },
                    ]}
                  />
                ))}
              </View>
              <TouchableOpacity
                onPress={finishTour}
                style={[styles.closeBtn, { backgroundColor: colors.bgSurface }]}
                accessibilityLabel={AppLabels.actions.skipTour}
              >
                <AppIcon name="x" size={12} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <AppText variant="labelSmall" color={colors.textMuted} style={styles.stepLabel}>
              Langkah {step + 1} dari {STEPS.length}
            </AppText>

            <AppText
              variant="headingSmall"
              color={colors.textPrimary}
              style={styles.tourTitle}
            >
              {current.title}
            </AppText>
            <AppText
              variant="bodySmall"
              color={colors.textMuted}
              style={styles.tourBody}
            >
              {current.body}
            </AppText>

            <View style={styles.bubbleActions}>
              {step > 0 && (
                <TouchableOpacity
                  onPress={prevStep}
                  style={[styles.prevBtn, { backgroundColor: colors.bgSurface }]}
                  accessibilityLabel="Kembali"
                >
                  <AppText variant="labelMedium" color={colors.textMuted}>
                    Kembali
                  </AppText>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={advanceStep}
                style={[styles.nextBtn, { backgroundColor: colors.accentPrimary }]}
                accessibilityLabel={step < STEPS.length - 1 ? 'Lanjut' : 'Selesai!'}
              >
                <AppText variant="labelMedium" color="#fff">
                  {step < STEPS.length - 1 ? 'Lanjut' : 'Selesai!'}
                </AppText>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    zIndex: 150,
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
  },
  bubble: {
    position: 'absolute',
    zIndex: 151,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  bubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  dots: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    marginBottom: 4,
  },
  tourTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  tourBody: {
    lineHeight: 20,
    marginBottom: 14,
  },
  bubbleActions: {
    flexDirection: 'row',
    gap: 10,
  },
  prevBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
});
