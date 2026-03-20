import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ThemeMode = 'dark' | 'light';

export interface ThemeState {
  mode: ThemeMode;
}

export const THEME_STORAGE_KEY = 'katogo_theme';

const getInitialThemeMode = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') {
    return stored;
  }

  return 'light';
};

const initialState: ThemeState = {
  mode: getInitialThemeMode(),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(THEME_STORAGE_KEY, action.payload);
      }
    },
    toggleThemeMode: (state) => {
      state.mode = state.mode === 'dark' ? 'light' : 'dark';

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(THEME_STORAGE_KEY, state.mode);
      }
    },
  },
});

export const { setThemeMode, toggleThemeMode } = themeSlice.actions;

export const selectThemeMode = (state: { theme: ThemeState }) => state.theme.mode;

export default themeSlice.reducer;
