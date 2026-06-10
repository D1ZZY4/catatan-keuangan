import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  loadSettings,
  patchSettings,
} from '../services/settingsStore';
import type { AppSettings } from '../types';

interface SettingsContextValue {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const [settings, setSettings] = useState<AppSettings>({
    userName: '',
    baseCurrency: 'IDR',
    autoLockSeconds: 60,
    onboardingCompleted: false,
    tourCompleted: false,
    darkMode: 'auto',
    fontSize: 'medium',
    dateFormat: 'id',
    hideBalance: false,
    notificationsEnabled: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void loadSettings().then((s) => {
      setSettings(s);
      setIsLoading(false);
    });
  }, []);

  const updateSettings = useCallback(async (patch: Partial<AppSettings>) => {
    const updated = await patchSettings(patch);
    setSettings(updated);
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({ settings, updateSettings, isLoading }),
    [settings, updateSettings, isLoading],
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (ctx === null)
    throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
