declare const __DEV__: boolean;

export const DEV_FLAGS = {
  bypassOnboarding:
    process.env['EXPO_PUBLIC_BYPASS_ONBOARDING'] === 'true' && __DEV__,
  bypassAuth:
    process.env['EXPO_PUBLIC_BYPASS_AUTH'] === 'true' && __DEV__,
  devMode: process.env['EXPO_PUBLIC_DEV_MODE'] === 'true' && __DEV__,
} as const;
