import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const DEVICE_KEY_STORAGE_KEY = 'catat_artha_device_key_v1';
const SALT_STORAGE_KEY = 'catat_artha_salt_v1';

let _cachedKey: string | null = null;

export async function getOrCreateDeviceKey(): Promise<string> {
  if (_cachedKey !== null) return _cachedKey;

  const stored = await SecureStore.getItemAsync(DEVICE_KEY_STORAGE_KEY);
  if (stored !== null) {
    _cachedKey = stored;
    return stored;
  }

  const newKey = Crypto.randomUUID();
  await SecureStore.setItemAsync(DEVICE_KEY_STORAGE_KEY, newKey, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  _cachedKey = newKey;
  return newKey;
}

export async function getOrCreateSalt(): Promise<Uint8Array> {
  const stored = await SecureStore.getItemAsync(SALT_STORAGE_KEY);
  if (stored !== null) {
    return new Uint8Array(
      stored.split(',').map((n) => parseInt(n, 10)),
    );
  }
  const salt = Crypto.getRandomValues(new Uint8Array(16));
  await SecureStore.setItemAsync(
    SALT_STORAGE_KEY,
    Array.from(salt).join(','),
    { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY },
  );
  return salt;
}

export async function wipeDeviceKey(): Promise<void> {
  _cachedKey = null;
  await SecureStore.deleteItemAsync(DEVICE_KEY_STORAGE_KEY);
  await SecureStore.deleteItemAsync(SALT_STORAGE_KEY);
}
