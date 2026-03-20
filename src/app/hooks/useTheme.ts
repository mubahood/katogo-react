import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import {
  selectThemeMode,
  setThemeMode,
  toggleThemeMode,
  ThemeMode,
} from '../store/slices/themeSlice';

const applyThemeToDocument = (theme: ThemeMode) => {
  if (typeof document === 'undefined') {
    return;
  }

  const isDark = theme === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.setAttribute('data-bs-theme', theme);
  document.documentElement.style.colorScheme = theme;
};

export const useTheme = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => selectThemeMode(state));

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  const setTheme = (mode: ThemeMode) => dispatch(setThemeMode(mode));
  const toggleTheme = () => dispatch(toggleThemeMode());

  return {
    theme,
    setTheme,
    toggleTheme,
  };
};

export const initializeThemeFromStorage = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  const storedTheme = window.localStorage.getItem('katogo_theme');
  const resolvedTheme: ThemeMode = storedTheme === 'dark' ? 'dark' : 'light';
  applyThemeToDocument(resolvedTheme);
};
