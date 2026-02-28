import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkTheme, lightTheme } from './designSystem';

const STORAGE_KEY = 'app_theme_mode_v2';
const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('light');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loadMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedMode === 'light' || savedMode === 'dark') {
          setMode(savedMode);
        } else {
          // Keep app white by default until user explicitly toggles dark mode.
          setMode('light');
        }
      } catch {
        setMode('light');
      } finally {
        setReady(true);
      }
    };
    loadMode();
  }, []);

  const setThemeMode = async nextMode => {
    setMode(nextMode);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, nextMode);
    } catch {
      // no-op
    }
  };

  const toggleTheme = () => {
    const nextMode = mode === 'dark' ? 'light' : 'dark';
    setThemeMode(nextMode);
  };

  const value = useMemo(
    () => ({
      mode,
      isDark: mode === 'dark',
      theme: mode === 'dark' ? darkTheme : lightTheme,
      toggleTheme,
      setThemeMode,
      ready,
    }),
    [mode, ready],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useAppTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme must be used inside ThemeProvider');
  }
  return ctx;
};
