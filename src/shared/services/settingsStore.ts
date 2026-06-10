import * as SecureStore from 'expo-secure-store';
import type { AppSettings } from '../types';

export type { AppSettings };

const SETTINGS_KEY = 'catat_artha_settings_v1';

const DEFAULT_SETTINGS: AppSettings = {
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
};

let _cached: AppSettings | null = null;

export async function loadSettings(): Promise<AppSettings> {
  if (_cached !== null) return _cached;
  try {
    const raw = await SecureStore.getItemAsync(SETTINGS_KEY);
    if (raw === null) {
      _cached = { ...DEFAULT_SETTINGS };
      return _cached;
    }
    _cached = { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<AppSettings>) };
    return _cached;
  } catch {
    _cached = { ...DEFAULT_SETTINGS };
    return _cached;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  _cached = settings;
  await SecureStore.setItemAsync(SETTINGS_KEY, JSON.stringify(settings));
}

export async function patchSettings(
  patch: Partial<AppSettings>,
): Promise<AppSettings> {
  const current = await loadSettings();
  const updated = { ...current, ...patch };
  await saveSettings(updated);
  return updated;
}

export function getCachedSettings(): AppSettings {
  return _cached ?? { ...DEFAULT_SETTINGS };
}

export function clearSettingsCache(): void {
  _cached = null;
}
