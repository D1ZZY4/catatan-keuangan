import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "id.catatankeuangan.app",
  appName: "Catatan Keuangan",
  webDir: "dist",
  bundledWebRuntime: false,
  android: {
    buildOptions: {
      keystorePath: "release-key.keystore",
      keystoreAlias: "catatan-keuangan",
    },
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: "#FFF9D2",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
  },
};

export default config;
