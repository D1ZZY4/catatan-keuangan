import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { verifyPin, isBiometricEnabled } from '../crypto/pinStore';
import { AppLabels } from '../config/labels';

interface AppLockContextValue {
  isLocked: boolean;
  unlock: (pin: string) => Promise<boolean>;
  unlockWithBiometric: () => Promise<boolean>;
  lock: () => void;
  failedAttempts: number;
  cooldownSeconds: number;
}

const AppLockContext = createContext<AppLockContextValue | null>(null);
const MAX_ATTEMPTS = 5;
const COOLDOWN_SECS = 30;

export function AppLockProvider({
  children,
  autoLockSeconds,
}: {
  children: React.ReactNode;
  autoLockSeconds: number;
}): React.ReactElement {
  const [isLocked, setIsLocked] = useState(true);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const lastActiveRef = useRef<number>(Date.now());
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const sub = AppState.addEventListener(
      'change',
      (next: AppStateStatus) => {
        if (next === 'active') {
          const elapsed = (Date.now() - lastActiveRef.current) / 1000;
          if (elapsed > autoLockSeconds) setIsLocked(true);
          lastActiveRef.current = Date.now();
        } else if (next === 'background') {
          lastActiveRef.current = Date.now();
        }
      },
    );
    return () => sub.remove();
  }, [autoLockSeconds]);

  const startCooldown = useCallback(() => {
    setCooldownSeconds(COOLDOWN_SECS);
    if (cooldownRef.current !== null) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current !== null) clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const unlock = useCallback(
    async (pin: string): Promise<boolean> => {
      if (cooldownSeconds > 0) return false;
      const ok = await verifyPin(pin);
      if (ok) {
        setIsLocked(false);
        setFailedAttempts(0);
        return true;
      }
      const next = failedAttempts + 1;
      setFailedAttempts(next);
      if (next >= MAX_ATTEMPTS) startCooldown();
      return false;
    },
    [failedAttempts, cooldownSeconds, startCooldown],
  );

  const unlockWithBiometric = useCallback(async (): Promise<boolean> => {
    const enabled = await isBiometricEnabled();
    if (!enabled) return false;
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: AppLabels.lock.biometricPrompt,
      fallbackLabel: AppLabels.lock.title,
    });
    if (result.success) {
      setIsLocked(false);
      setFailedAttempts(0);
      return true;
    }
    return false;
  }, []);

  const lock = useCallback(() => setIsLocked(true), []);

  const value = useMemo<AppLockContextValue>(
    () => ({
      isLocked,
      unlock,
      unlockWithBiometric,
      lock,
      failedAttempts,
      cooldownSeconds,
    }),
    [isLocked, unlock, unlockWithBiometric, lock, failedAttempts, cooldownSeconds],
  );

  return (
    <AppLockContext.Provider value={value}>{children}</AppLockContext.Provider>
  );
}

export function useAppLock(): AppLockContextValue {
  const ctx = useContext(AppLockContext);
  if (ctx === null)
    throw new Error('useAppLock must be used inside AppLockProvider');
  return ctx;
}
