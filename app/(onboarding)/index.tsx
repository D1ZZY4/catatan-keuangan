import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  type ListRenderItemInfo,
} from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../src/shared/components/AppText';
import { AppButton } from '../../src/shared/components/AppButton';
import { useTheme } from '../../src/shared/theme/ThemeContext';
import { AppLabels } from '../../src/shared/config/labels';
import { useSettings } from '../../src/shared/hooks/useSettings';
import { PinPad } from '../../src/shared/components/PinPad';
import { savePin } from '../../src/shared/crypto/pinStore';

const INTRO_SLIDES = [
  { key: 's1', icon: '🏠', ...AppLabels.onboarding.slide1 },
  { key: 's2', icon: '💳', ...AppLabels.onboarding.slide2 },
  { key: 's3', icon: '📊', ...AppLabels.onboarding.slide3 },
  { key: 's4', icon: '🔒', ...AppLabels.onboarding.slide4 },
];

const AnimatedFlatList = Animated.createAnimatedComponent(
  FlatList<(typeof INTRO_SLIDES)[0]>,
);

function DotIndicator({
  index,
  total,
  scrollX,
  width,
}: {
  index: number;
  total: number;
  scrollX: ReturnType<typeof useSharedValue<number>>;
  width: number;
}): React.ReactElement {
  const { colors } = useTheme();
  const dotStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];
    const w = interpolate(
      scrollX.value,
      inputRange,
      [6, 20, 6],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.3, 1, 0.3],
      Extrapolation.CLAMP,
    );
    return { width: w, opacity };
  });

  return (
    <Animated.View
      style={[
        {
          height: 6,
          borderRadius: 3,
          backgroundColor: colors.accentPrimary,
        },
        dotStyle,
      ]}
    />
  );
}

export default function OnboardingScreen(): React.ReactElement {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { updateSettings } = useSettings();

  const scrollX = useSharedValue(0);
  const flatRef = useRef<FlatList<(typeof INTRO_SLIDES)[0]>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSetup, setShowSetup] = useState(false);

  const [userName, setUserName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinStep, setPinStep] = useState<'create' | 'confirm'>('create');
  const [pinError, setPinError] = useState(false);

  const scrollHandler = useAnimatedScrollHandler((ev) => {
    scrollX.value = ev.contentOffset.x;
  });

  function goNext(): void {
    if (currentIndex < INTRO_SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      flatRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      setShowSetup(true);
    }
  }

  const finish = useCallback(async (): Promise<void> => {
    if (pin.length < 4) return;
    if (pinStep === 'create') {
      setPinStep('confirm');
      return;
    }
    if (pin !== confirmPin) {
      setPinError(true);
      setTimeout(() => {
        setConfirmPin('');
        setPinError(false);
      }, 600);
      return;
    }
    await savePin(pin);
    await updateSettings({ onboardingCompleted: true, userName });
    router.replace('/(tabs)');
  }, [pin, confirmPin, pinStep, userName, updateSettings]);

  function renderSlide({
    item,
  }: ListRenderItemInfo<(typeof INTRO_SLIDES)[0]>): React.ReactElement {
    return (
      <View
        style={{
          width,
          paddingHorizontal: 32,
          paddingTop: insets.top + 40,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
        }}
      >
        <AppText style={{ fontSize: 72 }}>{item.icon}</AppText>
        <AppText
          variant="displayMedium"
          center
          color={colors.textPrimary}
        >
          {item.title}
        </AppText>
        <AppText
          variant="bodyLarge"
          center
          color={colors.textMuted}
          style={{ lineHeight: 26 }}
        >
          {item.subtitle}
        </AppText>
      </View>
    );
  }

  if (showSetup) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bgPage,
          paddingTop: insets.top + 32,
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 32,
          justifyContent: 'space-between',
        }}
      >
        <View style={{ alignItems: 'center', gap: 8 }}>
          <AppText variant="displayMedium" center color={colors.textPrimary}>
            {AppLabels.onboarding.slide5.title}
          </AppText>
          <AppText variant="bodyLarge" center color={colors.textMuted}>
            {AppLabels.onboarding.slide5.subtitle}
          </AppText>
        </View>

        <View style={{ gap: 20 }}>
          <View style={{ gap: 8 }}>
            <AppText variant="labelSmall" color={colors.textMuted}>
              Nama Anda
            </AppText>
            <View
              style={{
                borderWidth: 1.5,
                borderColor: colors.border,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor: colors.bgInput,
              }}
            >
              <TextInput
                value={userName}
                onChangeText={setUserName}
                placeholder="Masukkan nama Anda"
                placeholderTextColor={colors.textPlaceholder}
                style={{
                  fontFamily: 'DMSans-Regular',
                  fontSize: 16,
                  color: colors.textPrimary,
                }}
              />
            </View>
          </View>

          <View style={{ alignItems: 'center', gap: 12 }}>
            <AppText variant="labelSmall" color={colors.textMuted} center>
              {pinStep === 'create' ? 'Buat PIN (4–6 digit)' : 'Konfirmasi PIN Anda'}
            </AppText>
            <PinPad
              value={pinStep === 'create' ? pin : confirmPin}
              onChange={pinStep === 'create' ? setPin : setConfirmPin}
              maxLength={6}
              error={pinError}
            />
          </View>
        </View>

        <AppButton
          label={pinStep === 'create' ? 'Lanjutkan' : 'Mulai Aplikasi'}
          onPress={() => void finish()}
          fullWidth
          size="lg"
          disabled={
            userName.trim().length === 0 ||
            (pinStep === 'create' ? pin.length < 4 : confirmPin.length < 4)
          }
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPage }}>
      <AnimatedFlatList
        ref={flatRef}
        data={INTRO_SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        onMomentumScrollEnd={(e) => {
          setCurrentIndex(
            Math.round(e.nativeEvent.contentOffset.x / width),
          );
        }}
        style={{ flex: 1 }}
      />

      <View
        style={{
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 32,
          gap: 20,
          alignItems: 'center',
        }}
      >
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {INTRO_SLIDES.map((_, i) => (
            <DotIndicator
              key={i}
              index={i}
              total={INTRO_SLIDES.length}
              scrollX={scrollX}
              width={width}
            />
          ))}
        </View>

        <AppButton
          label={
            currentIndex < INTRO_SLIDES.length - 1
              ? 'Lanjutkan'
              : 'Siapkan Akun'
          }
          onPress={goNext}
          fullWidth
          size="lg"
        />

        {currentIndex > 0 && (
          <TouchableOpacity onPress={() => setShowSetup(true)}>
            <AppText variant="labelSmall" color={colors.textMuted}>
              {AppLabels.actions.skip}
            </AppText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
