/**
 * Web Crypto API wrappers for AES-GCM 256 encryption with PBKDF2 key derivation.
 *
 * Threat model: protect data at rest in IndexedDB against casual access to the
 * device (lost phone, shared browser). Not a defense against a determined
 * attacker with root access — the deterministic fallback key is intentionally
 * weak when no PIN is set.
 */

const PBKDF2_ITERATIONS = 100_000;
const KEY_LENGTH_BITS = 256;
const IV_BYTES = 12; // AES-GCM standard
const SALT_BYTES = 16;

const enc = new TextEncoder();
const dec = new TextDecoder();

export function toBase64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

export function fromBase64(b64: string): Uint8Array {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

export function randomBytes(length: number): Uint8Array {
  const out = new Uint8Array(length);
  crypto.getRandomValues(out);
  return out;
}

export function generateSalt(): string {
  return toBase64(randomBytes(SALT_BYTES));
}

export async function deriveKeyFromPin(pin: string, saltB64: string): Promise<CryptoKey> {
  const salt = fromBase64(saltB64);
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(pin),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: KEY_LENGTH_BITS },
    false,
    ["encrypt", "decrypt"],
  );
}

/**
 * Build a deterministic per-device key from a stable browser fingerprint.
 * Used only when the user has NOT set a PIN — provides obfuscation, not real
 * security. Anyone with access to the unlocked device can derive the same key.
 */
export async function deriveDeviceKey(): Promise<CryptoKey> {
  const parts = [
    String(screen.width),
    String(screen.height),
    String(screen.colorDepth),
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.language,
    navigator.platform || "",
  ].join("|");

  const hash = await crypto.subtle.digest("SHA-256", enc.encode(parts));
  return crypto.subtle.importKey(
    "raw",
    hash,
    { name: "AES-GCM", length: KEY_LENGTH_BITS },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function hashPin(pin: string, saltB64: string): Promise<string> {
  const salt = fromBase64(saltB64);
  const material = new Uint8Array(salt.length + pin.length);
  material.set(salt, 0);
  material.set(enc.encode(pin), salt.length);
  const digest = await crypto.subtle.digest("SHA-256", material);
  return toBase64(digest);
}

export interface CipherPayload {
  iv: string;
  blob: string;
}

export async function encryptJSON(key: CryptoKey, value: unknown): Promise<CipherPayload> {
  const iv = randomBytes(IV_BYTES);
  const plaintext = enc.encode(JSON.stringify(value));
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
  return { iv: toBase64(iv), blob: toBase64(cipher) };
}

export async function decryptJSON<T>(key: CryptoKey, payload: CipherPayload): Promise<T> {
  const iv = fromBase64(payload.iv);
  const cipher = fromBase64(payload.blob);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipher);
  return JSON.parse(dec.decode(plain)) as T;
}

export async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(text));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
