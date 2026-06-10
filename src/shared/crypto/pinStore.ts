import * as SecureStore from 'expo-secure-store';
import { hashPinAsync } from './encryption';

const PIN_HASH_KEY = 'catat_artha_pin_hash_v1';
const BIOMETRIC_KEY = 'catat_artha_biometric_enabled_v1';

export async function savePin(pin: string): Promise<void> {
  const hash = await hashPinAsync(pin);
  await SecureStore.setItemAsync(PIN_HASH_KEY, hash, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function verifyPin(pin: string): Promise<boolean> {
  const stored = await SecureStore.getItemAsync(PIN_HASH_KEY);
  if (stored === null) return false;
  const hash = await hashPinAsync(pin);
  return hash === stored;
}

export async function hasPin(): Promise<boolean> {
  const stored = await SecureStore.getItemAsync(PIN_HASH_KEY);
  return stored !== null;
}

export async function deletePin(): Promise<void> {
  await SecureStore.deleteItemAsync(PIN_HASH_KEY);
}

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  await SecureStore.setItemAsync(BIOMETRIC_KEY, enabled ? '1' : '0');
}

export async function isBiometricEnabled(): Promise<boolean> {
  const val = await SecureStore.getItemAsync(BIOMETRIC_KEY);
  return val === '1';
}
