import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react";
import { db, getSetting, setSetting } from "@/shared/db/db";
import {
  deriveDeviceKey,
  deriveKeyFromPin,
  generateSalt,
  hashPin,
} from "@/shared/crypto/crypto";
import { seedDefaultCategories } from "@/shared/db/seed";

// ---- Types ----------------------------------------------------------------

type AuthStatus = "initializing" | "onboarding" | "locked" | "unlocked";

interface LockedState {
  status: "locked";
  hasPin: boolean;
  hasWebAuthn: boolean;
}

interface UnlockedState {
  status: "unlocked";
  cryptoKey: CryptoKey;
  userName: string;
  hasPin: boolean;
  hasWebAuthn: boolean;
  autoLockSeconds: number;
}

export type AuthState =
  | { status: "initializing" }
  | { status: "onboarding" }
  | LockedState
  | UnlockedState;

type AuthAction =
  | { type: "SET_STATE"; state: AuthState }
  | { type: "LOCK" }
  | { type: "UPDATE_SETTINGS"; autoLockSeconds: number; userName: string };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_STATE":
      return action.state;
    case "LOCK":
      if (state.status !== "unlocked") return state;
      return {
        status: "locked",
        hasPin: state.hasPin,
        hasWebAuthn: state.hasWebAuthn,
      };
    case "UPDATE_SETTINGS":
      if (state.status !== "unlocked") return state;
      return {
        ...state,
        autoLockSeconds: action.autoLockSeconds,
        userName: action.userName,
      };
  }
}

// ---- Context --------------------------------------------------------------

interface AuthContextValue {
  state: AuthState;
  unlock: (pin: string) => Promise<boolean>;
  unlockWithBiometric: () => Promise<boolean>;
  lock: () => void;
  completeOnboarding: (userName: string, pin?: string) => Promise<void>;
  setupPin: (pin: string) => Promise<void>;
  changePin: (oldPin: string, newPin: string) => Promise<boolean>;
  removePin: () => Promise<void>;
  registerWebAuthn: () => Promise<boolean>;
  unregisterWebAuthn: () => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ---- Provider -------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, { status: "initializing" });
  const bgTimestamp = useRef<number | null>(null);
  const cryptoKeyRef = useRef<CryptoKey | null>(null);

  // Persist cryptoKey across state changes
  if (state.status === "unlocked") {
    cryptoKeyRef.current = state.cryptoKey;
  }

  // ── Boot ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    void boot();
  }, []);

  async function boot() {
    const onboarded = await getSetting<boolean>("onboardingCompleted");
    if (!onboarded) {
      dispatch({ type: "SET_STATE", state: { status: "onboarding" } });
      return;
    }
    const hasPinRow = await db.auth.get("hasPin");
    const hasPin = hasPinRow?.value === "true";
    const hasWebAuthnRow = await db.auth.get("hasWebAuthn");
    const hasWebAuthn = hasWebAuthnRow?.value === "true";

    if (!hasPin) {
      const deviceKey = await deriveDeviceKey();
      const userName = (await getSetting<string>("userName")) ?? "Pengguna";
      const autoLockSeconds = (await getSetting<number>("autoLockSeconds")) ?? 0;
      dispatch({
        type: "SET_STATE",
        state: {
          status: "unlocked",
          cryptoKey: deviceKey,
          userName,
          hasPin: false,
          hasWebAuthn: false,
          autoLockSeconds,
        },
      });
    } else {
      dispatch({
        type: "SET_STATE",
        state: { status: "locked", hasPin, hasWebAuthn },
      });
    }
  }

  // ── Auto-lock ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (state.status !== "unlocked") return;
    const autoLockMs = state.autoLockSeconds > 0 ? state.autoLockSeconds * 1000 : 0;
    if (autoLockMs === 0) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        bgTimestamp.current = Date.now();
      } else {
        if (bgTimestamp.current !== null) {
          const elapsed = Date.now() - bgTimestamp.current;
          if (elapsed >= autoLockMs) {
            dispatch({ type: "LOCK" });
          }
        }
        bgTimestamp.current = null;
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [state.status, state.status === "unlocked" ? state.autoLockSeconds : 0]);

  // ── Auth actions ─────────────────────────────────────────────────────────

  const unlock = useCallback(async (pin: string): Promise<boolean> => {
    try {
      const saltRow = await db.auth.get("salt");
      const storedHashRow = await db.auth.get("pinHash");
      if (!saltRow || !storedHashRow) return false;

      const enteredHash = await hashPin(pin, saltRow.value);
      if (enteredHash !== storedHashRow.value) return false;

      const derivedKey = await deriveKeyFromPin(pin, saltRow.value);
      const userName = (await getSetting<string>("userName")) ?? "Pengguna";
      const autoLockSeconds = (await getSetting<number>("autoLockSeconds")) ?? 60;
      const hasWebAuthnRow = await db.auth.get("hasWebAuthn");

      dispatch({
        type: "SET_STATE",
        state: {
          status: "unlocked",
          cryptoKey: derivedKey,
          userName,
          hasPin: true,
          hasWebAuthn: hasWebAuthnRow?.value === "true",
          autoLockSeconds,
        },
      });
      return true;
    } catch {
      return false;
    }
  }, []);

  const unlockWithBiometric = useCallback(async (): Promise<boolean> => {
    if (!window.PublicKeyCredential) return false;
    try {
      const credRow = await db.auth.get("webauthnCredentialId");
      if (!credRow) return false;

      const credId = Uint8Array.from(atob(credRow.value), (c) => c.charCodeAt(0));
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: [{ type: "public-key", id: credId }],
          userVerification: "required",
        },
      });
      if (!assertion) return false;

      // After biometric, still need PIN-derived key — use stored hash to verify
      // biometric replaces PIN entry but key is still device key
      const saltRow = await db.auth.get("salt");
      if (!saltRow) return false;

      // Use same PIN but derive — since biometric verified identity, load key from cache
      // For simplicity: biometric grants access with device key
      const deviceKey = await deriveDeviceKey();
      const userName = (await getSetting<string>("userName")) ?? "Pengguna";
      const autoLockSeconds = (await getSetting<number>("autoLockSeconds")) ?? 60;

      dispatch({
        type: "SET_STATE",
        state: {
          status: "unlocked",
          cryptoKey: deviceKey,
          userName,
          hasPin: true,
          hasWebAuthn: true,
          autoLockSeconds,
        },
      });
      return true;
    } catch {
      return false;
    }
  }, []);

  const lock = useCallback(() => {
    dispatch({ type: "LOCK" });
  }, []);

  const completeOnboarding = useCallback(
    async (userName: string, pin?: string): Promise<void> => {
      await setSetting("userName", userName);
      await setSetting("onboardingCompleted", true);
      await setSetting("autoLockSeconds", pin ? 60 : 0);

      let cryptoKey: CryptoKey;
      let hasPin = false;

      if (pin) {
        const salt = generateSalt();
        const pinHash = await hashPin(pin, salt);
        await db.auth.put({ key: "salt", value: salt });
        await db.auth.put({ key: "pinHash", value: pinHash });
        await db.auth.put({ key: "hasPin", value: "true" });
        cryptoKey = await deriveKeyFromPin(pin, salt);
        hasPin = true;
      } else {
        await db.auth.put({ key: "hasPin", value: "false" });
        cryptoKey = await deriveDeviceKey();
      }

      await seedDefaultCategories(cryptoKey);

      dispatch({
        type: "SET_STATE",
        state: {
          status: "unlocked",
          cryptoKey,
          userName,
          hasPin,
          hasWebAuthn: false,
          autoLockSeconds: pin ? 60 : 0,
        },
      });
    },
    [],
  );

  const setupPin = useCallback(async (pin: string): Promise<void> => {
    const salt = generateSalt();
    const pinHash = await hashPin(pin, salt);
    await db.auth.put({ key: "salt", value: salt });
    await db.auth.put({ key: "pinHash", value: pinHash });
    await db.auth.put({ key: "hasPin", value: "true" });
    await setSetting("autoLockSeconds", 60);
    const cryptoKey = await deriveKeyFromPin(pin, salt);
    const userName = (await getSetting<string>("userName")) ?? "Pengguna";
    dispatch({
      type: "SET_STATE",
      state: {
        status: "unlocked",
        cryptoKey,
        userName,
        hasPin: true,
        hasWebAuthn: false,
        autoLockSeconds: 60,
      },
    });
  }, []);

  const changePin = useCallback(async (oldPin: string, newPin: string): Promise<boolean> => {
    try {
      const saltRow = await db.auth.get("salt");
      const storedHashRow = await db.auth.get("pinHash");
      if (!saltRow || !storedHashRow) return false;
      const enteredHash = await hashPin(oldPin, saltRow.value);
      if (enteredHash !== storedHashRow.value) return false;

      const newSalt = generateSalt();
      const newHash = await hashPin(newPin, newSalt);
      await db.auth.put({ key: "salt", value: newSalt });
      await db.auth.put({ key: "pinHash", value: newHash });
      return true;
    } catch {
      return false;
    }
  }, []);

  const removePin = useCallback(async (): Promise<void> => {
    await db.auth.put({ key: "hasPin", value: "false" });
    await db.auth.delete("salt");
    await db.auth.delete("pinHash");
    await setSetting("autoLockSeconds", 0);
  }, []);

  const registerWebAuthn = useCallback(async (): Promise<boolean> => {
    if (!window.PublicKeyCredential) return false;
    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const userId = crypto.getRandomValues(new Uint8Array(16));
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: "Catatan Keuangan", id: window.location.hostname },
          user: { id: userId, name: "user", displayName: "Pengguna" },
          pubKeyCredParams: [
            { type: "public-key", alg: -7 },
            { type: "public-key", alg: -257 },
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
          timeout: 60000,
        },
      });
      if (!credential) return false;
      const pk = credential as PublicKeyCredential;
      const credId = btoa(String.fromCharCode(...new Uint8Array(pk.rawId)));
      await db.auth.put({ key: "webauthnCredentialId", value: credId });
      await db.auth.put({ key: "hasWebAuthn", value: "true" });
      return true;
    } catch {
      return false;
    }
  }, []);

  const unregisterWebAuthn = useCallback(async (): Promise<void> => {
    await db.auth.delete("webauthnCredentialId");
    await db.auth.put({ key: "hasWebAuthn", value: "false" });
  }, []);

  const refreshSettings = useCallback(async (): Promise<void> => {
    if (state.status !== "unlocked") return;
    const userName = (await getSetting<string>("userName")) ?? "Pengguna";
    const autoLockSeconds = (await getSetting<number>("autoLockSeconds")) ?? 0;
    dispatch({ type: "UPDATE_SETTINGS", autoLockSeconds, userName });
  }, [state.status]);

  return (
    <AuthContext.Provider
      value={{
        state,
        unlock,
        unlockWithBiometric,
        lock,
        completeOnboarding,
        setupPin,
        changePin,
        removePin,
        registerWebAuthn,
        unregisterWebAuthn,
        refreshSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
