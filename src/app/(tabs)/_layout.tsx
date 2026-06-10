import { Tabs } from 'expo-router';
import { StyleSheet, View, Pressable, Text, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, ArrowUpDown, BarChart3, Wallet, Settings } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { FAB } from '@/shared/components/FAB';

type TabNav = {
  emit: (args: { type: string; target: string; canPreventDefault?: boolean }) => { defaultPrevented: boolean };
  navigate: (name: string) => void;
};
type TabBarProps = {
  state: { index: number; routes: Array<{ key: string; name: string }> };
  navigation: TabNav;
};

const TAB_CONFIG = [
  { name: 'beranda',    label: 'Beranda',    Icon: Home,       size: 22 },
  { name: 'transaksi',  label: 'Transaksi',  Icon: ArrowUpDown, size: 22 },
  { name: 'statistik',  label: 'Statistik',  Icon: BarChart3,  size: 22 },
  { name: 'dompet',     label: 'Dompet',     Icon: Wallet,     size: 22 },
  { name: 'pengaturan', label: 'Pengaturan', Icon: Settings,   size: 22 },
] as const;

function CustomTabBar({ state, navigation }: TabBarProps) {
  const { colors, shadows } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.outerWrap, { paddingBottom: insets.bottom + 8 }]}>
      <View
        style={[
          styles.pill,
          {
            backgroundColor: colors.bgCard,
            borderColor: 'rgba(255,255,255,0.35)',
            ...(Platform.OS === 'web'
              ? {
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: '0px 8px 32px rgba(0,0,0,0.18)',
                  backgroundColor: `${colors.bgCard}D9`,
                } as object
              : {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.18,
                  shadowRadius: 32,
                  elevation: 12,
                }),
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const conf = TAB_CONFIG[index];
          if (!conf) return null;
          const { Icon, label, size } = conf;
          const color = isFocused ? colors.accentPrimary : colors.textMuted;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
              accessibilityLabel={label}
              accessibilityRole="button"
              accessibilityState={{ selected: isFocused }}
            >
              <Icon
                size={size}
                color={color}
                strokeWidth={isFocused ? 2.5 : 1.8}
              />
              <Text style={[
                styles.tabLabel,
                {
                  color,
                  fontFamily: isFocused ? 'DMSans-SemiBold' : 'DMSans-Regular',
                },
              ]}>
                {label}
              </Text>
              {isFocused && (
                <View style={[styles.activeDot, { backgroundColor: colors.accentPrimary }]} />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <>
      <Tabs
        tabBar={(props) => <CustomTabBar {...(props as TabBarProps)} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="beranda" />
        <Tabs.Screen name="transaksi" />
        <Tabs.Screen name="statistik" />
        <Tabs.Screen name="dompet" />
        <Tabs.Screen name="pengaturan" />
      </Tabs>
      <FAB />
    </>
  );
}

const styles = StyleSheet.create({
  outerWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
    pointerEvents: 'box-none',
  },
  pill: {
    flexDirection: 'row',
    borderRadius: 28,
    paddingVertical: 10,
    paddingHorizontal: 6,
    width: '100%',
    maxWidth: 480,
    borderWidth: 1,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minHeight: 44,
    position: 'relative',
    gap: 3,
  },
  tabLabel: { fontSize: 10, lineHeight: 14 },
  activeDot: {
    position: 'absolute',
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
