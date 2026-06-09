import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View, Text, Pressable, StyleSheet, Dimensions, TextInput,
  PanResponder, Animated, ScrollView, Switch, Platform,
} from 'react-native';

import Svg, {
  Rect, Circle, Path, Ellipse, Text as SvgText, G,
} from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronRight, Fingerprint, Lock } from 'lucide-react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { SecureStorage } from '@/shared/utils/secureStorage';
import { useTheme } from '@/shared/hooks/useTheme';
import { useAuth } from '@/features/auth/AuthContext';
import { database } from '@/shared/db';
import { DEFAULT_WALLETS } from '@/shared/constants/defaultWallets';
import { ALL_DEFAULT_CATEGORIES } from '@/shared/constants/defaultCategories';
import { ConfettiCannon, type ConfettiCannonRef } from '@/shared/components/ConfettiCannon';

const ND = Platform.OS !== 'web';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
void SCREEN_WIDTH;

type AppColors = ReturnType<typeof useTheme>['colors'];

// ── SVG Illustrations ──────────────────────────────────────────────────────

function Slide1Illustration({ c }: { c: AppColors }) {
  return (
    <Svg width={220} height={200} viewBox="0 0 220 200">
      <Ellipse cx="110" cy="185" rx="80" ry="12" fill={c.bgCard} opacity={0.8} />
      <Rect x="55" y="80" width="110" height="90" rx="16" fill={c.accentSecondary} opacity={0.5} />
      <Rect x="40" y="70" width="140" height="95" rx="16" fill={c.accentPrimary} opacity={0.3} />
      <Rect x="30" y="55" width="160" height="100" rx="18" fill={c.bgSurface} />
      <Rect x="30" y="55" width="160" height="32" rx="18" fill={c.accentPrimary} opacity={0.8} />
      <Circle cx="50" cy="71" r="8" fill="white" opacity={0.5} />
      <Circle cx="170" cy="71" r="6" fill="white" opacity={0.4} />
      <Rect x="45" y="100" width="60" height="8" rx="4" fill={c.bgCard} />
      <Rect x="45" y="115" width="90" height="6" rx="3" fill={c.bgCard} opacity={0.7} />
      <Rect x="45" y="128" width="70" height="6" rx="3" fill={c.bgCard} opacity={0.5} />
      <SvgText x="110" y="148" textAnchor="middle" fontSize={22} fill={c.accentPrimary} opacity={0.8}>Rp</SvgText>
      <Circle cx="165" cy="30" r="20" fill={c.accentPrimary} opacity={0.15} />
      <Circle cx="165" cy="30" r="12" fill={c.accentPrimary} opacity={0.3} />
      <Path d="M159 30 L163 34 L172 25" stroke={c.accentPrimary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function Slide2Illustration({ c }: { c: AppColors }) {
  return (
    <Svg width={220} height={200} viewBox="0 0 220 200">
      <Rect x="10" y="80" width="80" height="55" rx="12" fill="#E65100" opacity={0.15} transform="rotate(-8, 10, 80)" />
      <Rect x="14" y="78" width="78" height="53" rx="11" fill="#E65100" opacity={0.25} transform="rotate(-8, 14, 78)" />
      <Rect x="70" y="65" width="80" height="55" rx="12" fill="#1976D2" opacity={0.15} transform="rotate(5, 70, 65)" />
      <Rect x="74" y="63" width="78" height="53" rx="11" fill="#1976D2" opacity={0.3} transform="rotate(5, 74, 63)" />
      <Rect x="60" y="60" width="100" height="65" rx="14" fill={c.bgSurface} />
      <Rect x="60" y="60" width="100" height="22" rx="14" fill={c.accentPrimary} />
      <Circle cx="78" cy="71" r="7" fill="white" opacity={0.5} />
      <Rect x="92" y="67" width="36" height="4" rx="2" fill="white" opacity={0.6} />
      <Rect x="72" y="90" width="50" height="6" rx="3" fill={c.bgCard} />
      <Rect x="72" y="102" width="35" height="5" rx="2.5" fill={c.bgCard} opacity={0.6} />
      <Rect x="72" y="113" width="42" height="5" rx="2.5" fill={c.bgCard} opacity={0.4} />
      <Circle cx="150" cy="145" r="22" fill="#2E7D32" opacity={0.15} />
      <Circle cx="150" cy="145" r="14" fill="#2E7D32" opacity={0.3} />
      <Path d="M142 145 L149 152 L160 138" stroke="#2E7D32" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function Slide3Illustration({ c: _c }: { c: AppColors }) {
  const items = [
    { x: 30, y: 40, color: '#2E7D32', label: '+' },
    { x: 100, y: 40, color: '#C62828', label: '-' },
    { x: 170, y: 40, color: '#1976D2', label: '⇄' },
    { x: 30, y: 120, color: '#8E24AA', label: 'Rp' },
    { x: 100, y: 120, color: '#E65100', label: '%' },
    { x: 170, y: 120, color: '#00897B', label: 'Bk' },
  ];
  return (
    <Svg width={220} height={200} viewBox="0 0 220 200">
      {items.map((ic) => (
        <G key={`${ic.x}-${ic.y}`}>
          <Circle cx={ic.x + 20} cy={ic.y + 20} r={22} fill={ic.color} opacity={0.15} />
          <Circle cx={ic.x + 20} cy={ic.y + 20} r={16} fill={ic.color} opacity={0.25} />
          <SvgText x={ic.x + 20} y={ic.y + 26} textAnchor="middle" fontSize={16} fill={ic.color} fontWeight="bold">
            {ic.label}
          </SvgText>
        </G>
      ))}
    </Svg>
  );
}

function Slide4Illustration({ c }: { c: AppColors }) {
  return (
    <Svg width={220} height={200} viewBox="0 0 220 200">
      <Circle cx="110" cy="90" r="65" fill={c.accentSecondary} opacity={0.2} />
      <Circle cx="110" cy="90" r="48" fill={c.accentSecondary} opacity={0.3} />
      <Rect x="82" y="72" width="56" height="46" rx="8" fill={c.bgSurface} />
      <Rect x="82" y="72" width="56" height="20" rx="8" fill={c.accentPrimary} opacity={0.6} />
      <Rect x="82" y="80" width="56" height="12" fill={c.accentPrimary} opacity={0.6} />
      <Rect x="96" y="100" width="28" height="5" rx="2.5" fill={c.bgCard} />
      <Rect x="100" y="110" width="20" height="5" rx="2.5" fill={c.bgCard} opacity={0.7} />
      <Circle cx="110" cy="67" r="10" fill={c.accentPrimary} />
      <Rect x="107" y="63" width="6" height="8" rx="3" fill="white" />
      <Rect x="105" y="67" width="10" height="6" rx="2" fill="white" />
      <Path d="M50 140 Q110 115 170 140" stroke={c.accentPrimary} strokeWidth="1.5" strokeDasharray="4 3" fill="none" opacity={0.5} />
      <Circle cx="50" cy="140" r="5" fill={c.textMuted} opacity={0.3} />
      <Circle cx="170" cy="140" r="5" fill={c.textMuted} opacity={0.3} />
    </Svg>
  );
}

// ── Slide data ─────────────────────────────────────────────────────────────

type IllustrationComp = React.ComponentType<{ c: AppColors }>;

interface SlideData {
  Illustration: IllustrationComp;
  headline: string;
  subtitle: string;
}

const SLIDES: SlideData[] = [
  {
    Illustration: Slide1Illustration,
    headline: 'Semua keuangan keluarga,\ndalam satu tempat',
    subtitle: 'Pantau dompet, tabungan, dan investasi keluarga dengan mudah.',
  },
  {
    Illustration: Slide2Illustration,
    headline: 'Banyak dompet,\nsatu pandangan',
    subtitle: 'Kelola kas tunai, rekening bank, dan e-wallet sekaligus.',
  },
  {
    Illustration: Slide3Illustration,
    headline: 'Semua jenis transaksi\ntercatat rapi',
    subtitle: 'Pemasukan, pengeluaran, transfer, piutang, dan investasi. Semuanya ada.',
  },
  {
    Illustration: Slide4Illustration,
    headline: 'Data kamu,\ntidak kemana-mana',
    subtitle: 'Semua data tersimpan di HP kamu sendiri, tidak dikirim ke server manapun.',
  },
];

const TOTAL_STEPS = SLIDES.length + 1; // 4 info slides + 1 setup slide

// ── Setup Slide ────────────────────────────────────────────────────────────

interface SetupSlideProps {
  c: AppColors;
  loading: boolean;
  onComplete: (name: string, pin?: string) => Promise<void>;
}

function SetupSlide({ c, loading, onComplete }: SetupSlideProps) {
  const [name, setName] = useState('');
  const [usePIN, setUsePIN] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Nama tidak boleh kosong'); return; }
    if (usePIN) {
      if (pin.length < 4) { setError('PIN minimal 4 digit'); return; }
      if (pin !== confirmPin) { setError('PIN tidak cocok'); return; }
    }
    setError('');
    await onComplete(name.trim(), usePIN ? pin : undefined);
  };

  return (
    <ScrollView
      contentContainerStyle={s.setupScroll}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Svg width={120} height={120} viewBox="0 0 120 120" style={{ marginBottom: 4 }}>
        <Circle cx="60" cy="60" r="50" fill={c.accentSecondary} opacity={0.3} />
        <Circle cx="60" cy="45" r="20" fill={c.accentPrimary} opacity={0.6} />
        <Ellipse cx="60" cy="90" rx="28" ry="16" fill={c.accentPrimary} opacity={0.4} />
        <Circle cx="60" cy="45" r="14" fill={c.accentPrimary} />
        <Circle cx="55" cy="42" r="3" fill="white" opacity={0.8} />
      </Svg>

      <Text style={[s.setupHeadline, { color: c.textPrimary, fontFamily: 'InstrumentSerif-Regular' }]}>
        Hampir siap!
      </Text>

      <View style={s.setupField}>
        <Text style={[s.setupLabel, { color: c.textMuted, fontFamily: 'DMSans-SemiBold' }]}>
          Siapa nama kamu?
        </Text>
        <TextInput
          value={name}
          onChangeText={v => { setName(v); setError(''); }}
          placeholder="Masukkan nama kamu"
          placeholderTextColor={c.textPlaceholder}
          style={[s.setupInput, { backgroundColor: c.bgCard, color: c.textPrimary, fontFamily: 'DMSans-Regular' }]}
          autoFocus
          maxLength={40}
          returnKeyType="next"
        />
      </View>

      <View style={[s.pinCard, { backgroundColor: c.bgCard }]}>
        <Pressable
          onPress={() => setUsePIN(v => !v)}
          style={s.pinRow}
          accessibilityRole="switch"
          accessibilityLabel="Aktifkan PIN"
        >
          <Switch
            value={usePIN}
            onValueChange={setUsePIN}
            trackColor={{ false: c.bgSurface, true: c.accentPrimary }}
            thumbColor={c.white}
          />
          <View style={{ flex: 1 }}>
            <Text style={[s.pinTitle, { color: c.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
              Aktifkan PIN
            </Text>
            <Text style={[s.pinSub, { color: c.textMuted, fontFamily: 'DMSans-Regular' }]}>
              Kunci aplikasi dengan kode rahasia
            </Text>
          </View>
        </Pressable>

        {usePIN && (
          <View style={{ marginTop: 12, gap: 8 }}>
            <TextInput
              value={pin}
              onChangeText={v => { setPin(v.replace(/\D/g, '').slice(0, 8)); setError(''); }}
              placeholder="Buat PIN (4–8 digit)"
              placeholderTextColor={c.textPlaceholder}
              keyboardType="numeric"
              secureTextEntry
              maxLength={8}
              style={[s.pinInput, { backgroundColor: c.bgPage, color: c.textPrimary, fontFamily: 'JetBrainsMono-Regular' }]}
              returnKeyType="next"
            />
            <TextInput
              value={confirmPin}
              onChangeText={v => { setConfirmPin(v.replace(/\D/g, '').slice(0, 8)); setError(''); }}
              placeholder="Ulangi PIN"
              placeholderTextColor={c.textPlaceholder}
              keyboardType="numeric"
              secureTextEntry
              maxLength={8}
              style={[s.pinInput, { backgroundColor: c.bgPage, color: c.textPrimary, fontFamily: 'JetBrainsMono-Regular' }]}
              returnKeyType="done"
              onSubmitEditing={() => { void handleSubmit(); }}
            />
          </View>
        )}
      </View>

      {usePIN && (
        <View style={[s.bioHint, { backgroundColor: `${c.accentPrimary}18`, borderColor: `${c.accentPrimary}33` }]}>
          <Fingerprint size={20} color={c.accentPrimary} />
          <Text style={[s.bioHintText, { color: c.textPrimary, fontFamily: 'DMSans-Regular' }]}>
            Setelah PIN dibuat, kamu bisa aktifkan{' '}
            <Text style={{ fontFamily: 'DMSans-SemiBold' }}>sidik jari / wajah</Text>
            {' '}di langkah berikutnya.
          </Text>
        </View>
      )}

      {!!error && (
        <Text style={[s.errorText, { color: c.danger, fontFamily: 'DMSans-Regular' }]}>{error}</Text>
      )}

      <Pressable
        onPress={() => { void handleSubmit(); }}
        disabled={loading || !name.trim()}
        style={({ pressed }) => [
          s.primaryBtn,
          { backgroundColor: c.accentPrimary },
          (loading || !name.trim()) && s.disabled,
          pressed && s.pressed,
        ]}
        accessibilityLabel="Mulai Sekarang"
        accessibilityRole="button"
      >
        <Text style={[s.primaryBtnText, { fontFamily: 'DMSans-SemiBold' }]}>
          {loading ? 'Mempersiapkan…' : 'Mulai Sekarang'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

// ── Biometric Step ─────────────────────────────────────────────────────────

function BiometricStep({ c, onFinish }: { c: AppColors; onFinish: () => void }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bioError, setBioError] = useState('');

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: ND }).start();
  }, [fadeAnim]);

  const handleBiometric = async () => {
    setLoading(true);
    setBioError('');
    try {
      const hasHW = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHW || !enrolled) {
        setBioError('Perangkat tidak mendukung biometrik atau belum terdaftar.');
        setLoading(false);
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Aktifkan biometrik untuk Catatan Keuangan',
        cancelLabel: 'Batalkan',
      });
      if (result.success) {
        await SecureStorage.setItemAsync('biometric_enabled', 'true');
        setDone(true);
      } else {
        setBioError('Gagal mengaktifkan. Coba lagi atau lewati.');
      }
    } catch {
      setBioError('Gagal mengaktifkan. Coba lagi atau lewati.');
    }
    setLoading(false);
  };

  return (
    <Animated.View style={[s.bioContainer, { opacity: fadeAnim }]}>
      <View style={[s.bioIconWrap, { backgroundColor: `${c.accentPrimary}20` }]}>
        <Fingerprint size={40} color={c.accentPrimary} />
      </View>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Text style={[s.bioTitle, { color: c.textPrimary, fontFamily: 'InstrumentSerif-Regular' }]}>
          Aktifkan Sidik Jari / Wajah?
        </Text>
        <Text style={[s.bioSubtitle, { color: c.textMuted, fontFamily: 'DMSans-Regular' }]}>
          Buka aplikasi lebih cepat dan aman menggunakan biometrik HP kamu.
        </Text>
      </View>
      {!!bioError && (
        <Text style={[s.errorText, { color: c.danger, fontFamily: 'DMSans-Regular' }]}>{bioError}</Text>
      )}
      {done ? (
        <View style={[s.bioDoneWrap, { backgroundColor: `${c.success}20` }]}>
          <Lock size={18} color={c.success} />
          <Text style={[s.bioDoneText, { color: c.success, fontFamily: 'DMSans-SemiBold' }]}>
            Biometrik aktif!
          </Text>
        </View>
      ) : (
        <Pressable
          onPress={() => { void handleBiometric(); }}
          disabled={loading}
          style={({ pressed }) => [
            s.primaryBtn,
            { backgroundColor: c.accentPrimary },
            loading && s.disabled,
            pressed && s.pressed,
          ]}
        >
          <Text style={[s.primaryBtnText, { fontFamily: 'DMSans-SemiBold' }]}>
            {loading ? 'Memproses…' : 'Aktifkan Sidik Jari / Wajah'}
          </Text>
        </Pressable>
      )}
      <Pressable onPress={onFinish} style={{ paddingVertical: 10 }} accessibilityLabel={done ? 'Lanjut ke aplikasi' : 'Lewati biometrik'}>
        <Text style={[s.bioSkipText, { color: c.textMuted, fontFamily: 'DMSans-Regular' }]}>
          {done ? 'Lanjut ke aplikasi' : 'Lewati, gunakan PIN saja'}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// ── Welcome Screen ─────────────────────────────────────────────────────────

const WALLET_PREVIEWS = [
  { name: 'Tunai',    color: '#4CAF50' },
  { name: 'Bank',     color: '#8CC0EB' },
  { name: 'Tabungan', color: '#F4A35A' },
];

function WelcomeScreen({ c, userName, onContinue }: { c: AppColors; userName: string; onContinue: () => void }) {
  const insets = useSafeAreaInsets();
  const confettiRef = useRef<ConfettiCannonRef>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: ND }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: ND }),
    ]).start();
    const t = setTimeout(() => confettiRef.current?.shoot(), 200);
    return () => clearTimeout(t);
  }, [fadeAnim, slideAnim]);

  return (
    <View style={[s.welcomeOuter, { backgroundColor: c.bgPage, paddingBottom: insets.bottom + 24, paddingTop: insets.top + 24 }]}>
      <ConfettiCannon ref={confettiRef} count={120} />
      <Animated.View style={[s.welcomeContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={[s.welcomeLogo, { backgroundColor: c.accentPrimary }]}>
          <Text style={[s.welcomeLogoText, { fontFamily: 'DMSans-SemiBold' }]}>CK</Text>
        </View>
        <Text style={[s.welcomeTitle, { color: c.textPrimary, fontFamily: 'InstrumentSerif-Regular' }]}>
          {'Selamat datang,\n'}{userName}!
        </Text>
        <Text style={[s.welcomeSub, { color: c.textMuted, fontFamily: 'DMSans-Regular' }]}>
          Semua siap. Tiga dompet default sudah dibuat untuk Anda.
        </Text>

        <View style={{ width: '100%', gap: 10, marginTop: 4 }}>
          {WALLET_PREVIEWS.map((w) => (
            <View key={w.name} style={[s.walletCard, { backgroundColor: c.bgCard }]}>
              <View style={[s.walletIcon, { backgroundColor: w.color }]}>
                <Text style={s.walletIconLetter}>{w.name.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.walletName, { color: c.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>{w.name}</Text>
                <Text style={[s.walletBalance, { color: c.textMuted, fontFamily: 'JetBrainsMono-Regular' }]}>Rp 0</Text>
              </View>
              <View style={[s.walletBadge, { backgroundColor: c.bgSurface }]}>
                <Text style={[s.walletBadgeText, { color: c.textMuted, fontFamily: 'DMSans-Regular' }]}>Siap</Text>
              </View>
            </View>
          ))}
        </View>

        <Pressable
          onPress={onContinue}
          style={({ pressed }) => [
            s.primaryBtn,
            { backgroundColor: c.accentPrimary, marginTop: 8 },
            pressed && s.pressed,
          ]}
          accessibilityLabel="Jelajahi Aplikasi"
        >
          <Text style={[s.primaryBtnText, { fontFamily: 'DMSans-SemiBold' }]}>Jelajahi Aplikasi</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

// ── Main OnboardingScreen ──────────────────────────────────────────────────

export default function OnboardingScreen() {
  const { colors: c } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setupPin } = useAuth();

  const [current, setCurrent] = useState(0);
  const currentRef = useRef(0); // for PanResponder (avoids stale closure)

  const [showBiometric, setShowBiometric] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [savedName, setSavedName] = useState('');
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const isSetup = current === SLIDES.length;

  const animateTransition = useCallback((toIndex: number) => {
    currentRef.current = toIndex;
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 100, useNativeDriver: ND }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: ND }),
    ]).start();
    setCurrent(toIndex);
  }, [fadeAnim]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 12 && Math.abs(g.dy) < 80,
      onPanResponderRelease: (_, g) => {
        if (g.dx < -50) {
          const next = Math.min(currentRef.current + 1, SLIDES.length);
          if (next !== currentRef.current) {
            currentRef.current = next;
            Animated.sequence([
              Animated.timing(fadeAnim, { toValue: 0, duration: 100, useNativeDriver: ND }),
              Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: ND }),
            ]).start();
            setCurrent(next);
          }
        } else if (g.dx > 50) {
          const prev = Math.max(currentRef.current - 1, 0);
          if (prev !== currentRef.current) {
            currentRef.current = prev;
            Animated.sequence([
              Animated.timing(fadeAnim, { toValue: 0, duration: 100, useNativeDriver: ND }),
              Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: ND }),
            ]).start();
            setCurrent(prev);
          }
        }
      },
    })
  ).current;

  async function handleComplete(name: string, pin?: string) {
    setSavedName(name);
    setLoading(true);
    try {
      if (pin) await setupPin(pin);
      await SecureStorage.setItemAsync('user_name', name);
      await seedInitialData();
      await SecureStorage.setItemAsync('onboarding_done', 'true');
      if (pin) {
        setShowBiometric(true);
      } else {
        setShowWelcome(true);
      }
    } catch {
      // error propagated to SetupSlide
    } finally {
      setLoading(false);
    }
  }

  async function seedInitialData() {
    await database.write(async () => {
      for (const cat of ALL_DEFAULT_CATEGORIES) {
        await database.get<import('@/shared/db').CategoryModel>('categories').create(rec => {
          rec.name = cat.name;
          rec.icon = cat.icon;
          rec.color = cat.color;
          rec.type = cat.type;
          rec.isDefault = cat.isDefault;
        });
      }
      for (const wallet of DEFAULT_WALLETS) {
        await database.get<import('@/shared/db').WalletModel>('wallets').create(rec => {
          rec.name = wallet.name;
          rec.icon = wallet.icon;
          rec.color = wallet.color;
          rec.currency = wallet.currency;
          rec.balance = 0;
          rec.initialBalance = 0;
          rec.type = wallet.type;
          rec.isArchived = false;
          rec.showInDashboard = true;
          rec.includeInTotal = true;
          rec.sortOrder = wallet.sortOrder;
          // @ts-expect-error set by WatermelonDB
          rec._raw.created_at = Date.now();
        });
      }
    });
  }

  // ── Conditional renders ──
  if (showWelcome) {
    return (
      <WelcomeScreen
        c={c}
        userName={savedName}
        onContinue={() => router.replace('/(tabs)/beranda')}
      />
    );
  }

  if (showBiometric) {
    return (
      <View style={[s.fullPage, { backgroundColor: c.bgPage, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24, paddingHorizontal: 24 }]}>
        <BiometricStep
          c={c}
          onFinish={() => { setShowBiometric(false); setShowWelcome(true); }}
        />
      </View>
    );
  }

  const slideData = SLIDES[current];

  return (
    <View style={[s.container, { backgroundColor: c.bgPage }]} {...panResponder.panHandlers}>
      {/* Slide content */}
      <Animated.View style={[s.slideArea, { opacity: fadeAnim }]}>
        {!isSetup && slideData !== undefined ? (
          <View style={[s.slideContent, { paddingTop: insets.top + 24 }]}>
            <View style={s.illustrationWrap}>
              <slideData.Illustration c={c} />
            </View>
            <View style={s.textBlock}>
              <Text style={[s.headline, { color: c.textPrimary, fontFamily: 'InstrumentSerif-Regular' }]}>
                {slideData.headline}
              </Text>
              <Text style={[s.subtitle, { color: c.textMuted, fontFamily: 'DMSans-Regular' }]}>
                {slideData.subtitle}
              </Text>
            </View>
          </View>
        ) : (
          <SetupSlide c={c} loading={loading} onComplete={handleComplete} />
        )}
      </Animated.View>

      {/* Bottom bar — dots + buttons */}
      <View style={[s.bottomBar, { paddingBottom: insets.bottom + 20 }]}>
        <View style={s.dotsRow}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <Pressable
              key={i}
              onPress={() => animateTransition(i)}
              hitSlop={{ top: 10, bottom: 10, left: 4, right: 4 }}
              accessibilityLabel={`Slide ${i + 1}`}
            >
              <View
                style={[
                  s.dot,
                  i === current
                    ? [s.dotActive, { backgroundColor: c.accentPrimary }]
                    : [s.dotInactive, { backgroundColor: c.bgCard }],
                ]}
              />
            </Pressable>
          ))}
        </View>

        {!isSetup && (
          <View style={s.actionsRow}>
            <Pressable
              onPress={() => animateTransition(SLIDES.length)}
              style={[s.skipBtn, { backgroundColor: c.bgSurface }]}
              accessibilityLabel="Lewati"
            >
              <Text style={[s.skipLabel, { color: c.textMuted, fontFamily: 'DMSans-SemiBold' }]}>
                Lewati
              </Text>
            </Pressable>
            <Pressable
              onPress={() => animateTransition(Math.min(current + 1, SLIDES.length))}
              style={({ pressed }) => [
                s.nextBtn,
                { backgroundColor: c.accentPrimary },
                pressed && s.pressed,
              ]}
              accessibilityLabel="Lanjut"
            >
              <Text style={[s.nextLabel, { fontFamily: 'DMSans-SemiBold' }]}>Lanjut</Text>
              <ChevronRight size={16} color="#FFFFFF" strokeWidth={2.5} />
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  fullPage: { flex: 1 },
  container: { flex: 1 },
  slideArea: { flex: 1 },

  slideContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 130,
  },
  illustrationWrap: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  textBlock: { alignItems: 'center', gap: 12, maxWidth: 360 },
  headline: { fontSize: 26, lineHeight: 34, textAlign: 'center' },
  subtitle: { fontSize: 14, lineHeight: 22, textAlign: 'center' },

  bottomBar: { paddingHorizontal: 24, gap: 10 },
  dotsRow: { flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
  dot: { borderRadius: 99 },
  dotActive: { width: 24, height: 6 },
  dotInactive: { width: 6, height: 6 },
  actionsRow: { flexDirection: 'row', gap: 10 },
  skipBtn: {
    flex: 1, height: 52, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  skipLabel: { fontSize: 14 },
  nextBtn: {
    flex: 1, height: 52, borderRadius: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  nextLabel: { fontSize: 14, color: '#FFFFFF' },

  // Setup
  setupScroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
    gap: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setupHeadline: { fontSize: 26, lineHeight: 34, textAlign: 'center' },
  setupField: { width: '100%', gap: 6 },
  setupLabel: { fontSize: 12 },
  setupInput: { width: '100%', height: 52, borderRadius: 16, paddingHorizontal: 16, fontSize: 16 },
  pinCard: { width: '100%', borderRadius: 16, padding: 16 },
  pinRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pinTitle: { fontSize: 14, lineHeight: 20 },
  pinSub: { fontSize: 12, lineHeight: 18, marginTop: 1 },
  pinInput: { height: 48, borderRadius: 12, paddingHorizontal: 14, fontSize: 16, letterSpacing: 4 },
  bioHint: {
    width: '100%', borderRadius: 16, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
  },
  bioHintText: { flex: 1, fontSize: 12, lineHeight: 18 },
  errorText: { fontSize: 13, lineHeight: 18, textAlign: 'center', width: '100%' },

  // Shared button
  primaryBtn: { width: '100%', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { fontSize: 16, color: '#FFFFFF' },
  disabled: { opacity: 0.5 },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },

  // Biometric step
  bioContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: 20, maxWidth: 360, alignSelf: 'center', width: '100%',
  },
  bioIconWrap: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  bioTitle: { fontSize: 22, lineHeight: 30, textAlign: 'center' },
  bioSubtitle: { fontSize: 14, lineHeight: 22, textAlign: 'center' },
  bioDoneWrap: { width: '100%', height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  bioDoneText: { fontSize: 14 },
  bioSkipText: { fontSize: 14 },

  // Welcome
  welcomeOuter: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  welcomeContent: { width: '100%', maxWidth: 400, alignItems: 'center', gap: 16 },
  welcomeLogo: { width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  welcomeLogoText: { fontSize: 22, color: '#FFFFFF' },
  welcomeTitle: { fontSize: 30, lineHeight: 40, textAlign: 'center', marginTop: 4 },
  welcomeSub: { fontSize: 14, lineHeight: 22, textAlign: 'center' },
  walletCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, gap: 12,
  },
  walletIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  walletIconLetter: { fontSize: 16, color: '#FFFFFF', fontWeight: '700' },
  walletName: { fontSize: 14, lineHeight: 20 },
  walletBalance: { fontSize: 12, lineHeight: 18, marginTop: 1 },
  walletBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 99 },
  walletBadgeText: { fontSize: 11, lineHeight: 16 },
});
