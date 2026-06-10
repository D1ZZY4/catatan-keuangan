import '../shared/theme/global.css';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { DatabaseProvider } from '@nozbe/watermelondb/DatabaseProvider';
import { database } from '../shared/db/database';
import { ThemeProvider } from '../shared/theme/ThemeContext';
import { SettingsProvider, useSettings } from '../shared/hooks/useSettings';
import { AppLockProvider, useAppLock } from '../shared/hooks/useAppLock';
import { seedDefaultData } from '../shared/services/seedData';

SplashScreen.preventAutoHideAsync().catch(() => {});

function InnerLayout(): React.ReactElement {
  const { settings, isLoading } = useSettings();

  useEffect(() => {
    if (!isLoading) {
      void seedDefaultData();
    }
  }, [isLoading]);

  if (isLoading) return <View style={{ flex: 1 }} />;

  return (
    <AppLockProvider autoLockSeconds={settings.autoLockSeconds}>
      <AppNavigator
        onboardingCompleted={settings.onboardingCompleted}
      />
    </AppLockProvider>
  );
}

function AppNavigator({
  onboardingCompleted,
}: {
  onboardingCompleted: boolean;
}): React.ReactElement {
  const { isLocked } = useAppLock();

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      {!onboardingCompleted ? (
        <Stack.Screen name="(onboarding)" />
      ) : isLocked ? (
        <Stack.Screen name="(auth)" />
      ) : (
        <>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="(modals)"
            options={{ presentation: 'transparentModal', animation: 'fade' }}
          />
        </>
      )}
    </Stack>
  );
}

export default function RootLayout(): React.ReactElement | null {
  const [fontsLoaded] = useFonts({
    'InstrumentSerif-Regular': require('@expo-google-fonts/instrument-serif/400Regular/InstrumentSerif_400Regular.ttf'),
    'DMSans-Regular': require('@expo-google-fonts/dm-sans/400Regular/DMSans_400Regular.ttf'),
    'DMSans-Medium': require('@expo-google-fonts/dm-sans/500Medium/DMSans_500Medium.ttf'),
    'DMSans-SemiBold': require('@expo-google-fonts/dm-sans/600SemiBold/DMSans_600SemiBold.ttf'),
    'JetBrainsMono-Regular': require('@expo-google-fonts/jetbrains-mono/400Regular/JetBrainsMono_400Regular.ttf'),
  });

  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    if (fontsLoaded) {
      setAppReady(true);
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!appReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <DatabaseProvider database={database}>
          <ThemeProvider>
            <SettingsProvider>
              <BottomSheetModalProvider>
                <InnerLayout />
              </BottomSheetModalProvider>
            </SettingsProvider>
          </ThemeProvider>
        </DatabaseProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
