const HAPTIC_KEY = "haptic_enabled";

export function isHapticEnabled(): boolean {
  const val = localStorage.getItem(HAPTIC_KEY);
  return val === null ? true : val === "true";
}

export function setHapticEnabled(enabled: boolean): void {
  localStorage.setItem(HAPTIC_KEY, String(enabled));
}

export function hapticTap(): void {
  if (!isHapticEnabled()) return;
  if (navigator.vibrate) navigator.vibrate(50);
}

export function hapticSwipeDelete(): void {
  if (!isHapticEnabled()) return;
  if (navigator.vibrate) navigator.vibrate(100);
}

export function hapticError(): void {
  if (!isHapticEnabled()) return;
  if (navigator.vibrate) navigator.vibrate([100, 30, 100]);
}
