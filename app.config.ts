import { ExpoConfig, ConfigContext } from 'expo/config';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require('./package.json') as { version: string };

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Catat Artha',
  slug: 'catat-artha',
  version: packageJson.version,
  orientation: 'portrait',
  icon: './src/assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './src/assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#FFF9D2',
  },
  android: {
    package: 'id.catartha.app',
    adaptiveIcon: {
      foregroundImage: './src/assets/adaptive-icon.png',
      backgroundColor: '#FFF9D2',
    },
    permissions: [
      'CAMERA',
      'USE_BIOMETRIC',
      'USE_FINGERPRINT',
      'VIBRATE',
      'RECEIVE_BOOT_COMPLETED',
    ],
    versionCode: 1,
  } as ExpoConfig['android'] & { minSdkVersion: number; targetSdkVersion: number },
  plugins: [
    'expo-router',
    'expo-font',
    'expo-local-authentication',
    'expo-notifications',
    ['expo-camera', { cameraPermission: 'Izinkan kamera untuk scan struk.' }],
    ['expo-secure-store'],
  ],
  extra: {
    buildDate: new Date().toISOString().split('T')[0],
  },
});
