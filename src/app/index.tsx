import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/features/auth/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { SecureStorage } from '@/shared/utils/secureStorage';
import { ensureSeeded } from '@/shared/utils/seedDatabase';

export default function IndexScreen() {
  const router = useRouter();
  const { isPinSet, isLoading } = useAuth();
  const { colors } = useTheme();

  useEffect(() => {
    if (isLoading) return;
    void checkRouting();
  }, [isLoading, isPinSet]);

  async function checkRouting() {
    const onboardingDone = await SecureStorage.getItemAsync('onboarding_done');
    if (!onboardingDone) {
      router.replace('/onboarding');
    } else {
      await ensureSeeded();
      if (isPinSet) {
        router.replace('/auth');
      } else {
        router.replace('/(tabs)/beranda');
      }
    }
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bgPage }}>
      <ActivityIndicator color={colors.accentPrimary} size="large" />
    </View>
  );
}
