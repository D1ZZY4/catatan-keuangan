import { ExpoConfig, ConfigContext } from 'expo/config';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const packageJson = require('./package.json') as { version: string };

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Catatan Keuangan',
  slug: 'catatan-keuangan',
  version: packageJson.version,
  orientation: 'portrait',
  icon: './src/assets/icons/icon.png',
  scheme: 'catkeu',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './src/assets/icons/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#FFF9D2',
  },
  android: {
    package: 'id.catkeu.app',
    adaptiveIcon: {
      foregroundImage: './src/assets/icons/adaptive-icon.png',
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
  },
  plugins: [
    'expo-router',
    'expo-font',
    'expo-local-authentication',
    'expo-notifications',
    ['expo-camera', { cameraPermission: 'Izinkan kamera untuk scan struk.' }],
    ['expo-secure-store'],
    '@react-native-community/datetimepicker',
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    buildDate: new Date().toISOString().split('T')[0],
    eas: {
      projectId: 'catatan-keuangan',
    },
  },
});
