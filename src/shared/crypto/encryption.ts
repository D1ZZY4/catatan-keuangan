import * as Crypto from 'expo-crypto';

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;

async function deriveKey(
  passphrase: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 310000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptData(
  plaintext: string,
  passphrase: string,
  salt: Uint8Array,
): Promise<string> {
  const key = await deriveKey(passphrase, salt);
  const iv = Crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const enc = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    enc.encode(plaintext),
  );
  const combined = new Uint8Array(IV_LENGTH + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), IV_LENGTH);
  return btoa(String.fromCharCode(...combined));
}

export async function decryptData(
  encryptedBase64: string,
  passphrase: string,
  salt: Uint8Array,
): Promise<string> {
  const combined = Uint8Array.from(atob(encryptedBase64), (c) =>
    c.charCodeAt(0),
  );
  const iv = combined.slice(0, IV_LENGTH);
  const ciphertext = combined.slice(IV_LENGTH);
  const key = await deriveKey(passphrase, salt);
  const plaintext = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    ciphertext,
  );
  return new TextDecoder().decode(plaintext);
}

export function hashPin(pin: string): string {
  const hash = Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    pin + 'catat_artha_v1',
  );
  return hash as unknown as string;
}

export async function hashPinAsync(pin: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    pin + 'catat_artha_v1',
  );
}
