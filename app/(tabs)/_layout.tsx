import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '../../src/shared/components/AppIcon';
import { AppText } from '../../src/shared/components/AppText';
import { useTheme } from '../../src/shared/theme/ThemeContext';
import { AppLabels } from '../../src/shared/config/labels';

interface TabIconProps {
  focused: boolean;
  name: string;
  label: string;
}

function TabBarIcon({ focused, name, label }: TabIconProps): React.ReactElement {
  const { colors } = useTheme();
  const color = focused ? colors.accentPrimary : colors.textMuted;

  return (
    <View style={{ alignItems: 'center', gap: 2, paddingTop: 8 }}>
      <AppIcon name={name} size={22} color={color} strokeWidth={focused ? 2 : 1.5} />
      <AppText
        variant="labelSmall"
        color={color}
        style={{
          fontSize: 10,
          fontFamily: focused ? 'DMSans-SemiBold' : 'DMSans-Regular',
        }}
      >
        {label}
      </AppText>
    </View>
  );
}

export default function TabsLayout(): React.ReactElement {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const tabBarStyle: ViewStyle = {
    backgroundColor: colors.bgCard,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 60 + insets.bottom,
    paddingBottom: insets.bottom,
    paddingTop: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} name="home" label={AppLabels.tabs.home} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              name="arrow-left-right"
              label={AppLabels.tabs.transaction}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              name="bar-chart"
              label={AppLabels.tabs.stats}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="wallets"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              name="wallet"
              label={AppLabels.tabs.wallet}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              name="settings"
              label={AppLabels.tabs.settings}
            />
          ),
        }}
      />
      <Tabs.Screen name="home" options={{ href: null }} />
    </Tabs>
  );
}
