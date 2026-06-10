import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Appearance } from 'react-native';
import { lightColors, darkColors, type AppColors } from './colors';
import { typography } from './typography';
import { shadows } from './shadows';
import { spacing, radius } from './spacing';
import { patchSettings, loadSettings } from '../services/settingsStore';

export interface ThemeContextValue {
  colors: AppColors;
  typography: typeof typography;
  shadows: typeof shadows;
  spacing: typeof spacing;
  radius: typeof radius;
  isDark: boolean;
  toggleDark: () => void;
  setDarkMode: (mode: 'auto' | 'light' | 'dark') => void;
  darkModePreference: 'auto' | 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const [darkModePreference, setDarkModePreference] = useState<
    'auto' | 'light' | 'dark'
  >('auto');
  const systemColorScheme = Appearance.getColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    void loadSettings().then((s) => {
      setDarkModePreference(s.darkMode);
      if (s.darkMode === 'auto') {
        setIsDark(systemColorScheme === 'dark');
      } else {
        setIsDark(s.darkMode === 'dark');
      }
    });
  }, [systemColorScheme]);

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      if (darkModePreference === 'auto') {
        setIsDark(colorScheme === 'dark');
      }
    });
    return () => sub.remove();
  }, [darkModePreference]);

  const setDarkMode = useCallback(
    (mode: 'auto' | 'light' | 'dark') => {
      setDarkModePreference(mode);
      if (mode === 'auto') {
        setIsDark(Appearance.getColorScheme() === 'dark');
      } else {
        setIsDark(mode === 'dark');
      }
      void patchSettings({ darkMode: mode });
    },
    [],
  );

  const toggleDark = useCallback(() => {
    setDarkMode(isDark ? 'light' : 'dark');
  }, [isDark, setDarkMode]);

  const colors = isDark ? darkColors : lightColors;

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors,
      typography,
      shadows,
      spacing,
      radius,
      isDark,
      toggleDark,
      setDarkMode,
      darkModePreference,
    }),
    [colors, isDark, toggleDark, setDarkMode, darkModePreference],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx === null)
    throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
