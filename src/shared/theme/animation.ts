import { Easing } from 'react-native';

export const springPresets = {
  snappy: {
    damping: 20,
    mass: 0.8,
    stiffness: 300,
    overshootClamping: false,
  },
  gentle: {
    damping: 15,
    mass: 1.0,
    stiffness: 180,
    overshootClamping: false,
  },
  smooth: {
    damping: 25,
    mass: 1.0,
    stiffness: 200,
    overshootClamping: true,
  },
  float: {
    damping: 12,
    mass: 0.9,
    stiffness: 150,
    overshootClamping: false,
  },
} as const;

export const timingPresets = {
  instant: { duration: 100, easing: Easing.out(Easing.quad) },
  fast: { duration: 200, easing: Easing.bezier(0.25, 0.46, 0.45, 0.94) },
  normal: { duration: 300, easing: Easing.bezier(0.25, 0.46, 0.45, 0.94) },
  slow: { duration: 500, easing: Easing.bezier(0.25, 0.46, 0.45, 0.94) },
  backdrop: { duration: 250, easing: Easing.out(Easing.cubic) },
} as const;

export const STAGGER_DELAY_MS = 60;
export const TOUR_ADVANCE_MS = 4000;
