import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'umami.theme';
const DARK = 'dark';
const LIGHT = 'light';

/**
 * Resolve the initial theme from localStorage, then the OS preference,
 * falling back to light mode. Safe to call during SSR (returns LIGHT).
 *
 * @returns {'dark' | 'light'}
 */
export function getInitialTheme() {
  if (typeof window === 'undefined') {
    return LIGHT;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === DARK || stored === LIGHT) {
      return stored;
    }
  } catch (e) {
    // localStorage may be unavailable (private mode, disabled cookies).
  }

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return DARK;
  }

  return LIGHT;
}

/**
 * React hook that manages a persisted light/dark theme.
 *
 * It keeps the value in localStorage, reflects it on the document root
 * via a `data-theme` attribute and a `dark` class (so CSS can react to
 * either), and stays in sync with the OS preference when the user has
 * not made an explicit choice.
 *
 * @returns {{
 *   theme: 'dark' | 'light',
 *   isDark: boolean,
 *   toggle: () => void,
 *   setTheme: (theme: 'dark' | 'light') => void,
 * }}
 */
export function useDarkMode() {
  const [theme, setThemeState] = useState(getInitialTheme);

  const applyTheme = useCallback(value => {
    if (typeof document === 'undefined') {
      return;
    }
    const root = document.documentElement;
    root.setAttribute('data-theme', value);
    root.classList.toggle('dark', value === DARK);
  }, []);

  const setTheme = useCallback(
    value => {
      const next = value === DARK ? DARK : LIGHT;
      setThemeState(next);
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch (e) {
        // Ignore persistence failures.
      }
      applyTheme(next);
    },
    [applyTheme],
  );

  const toggle = useCallback(() => {
    setTheme(theme === DARK ? LIGHT : DARK);
  }, [theme, setTheme]);

  // Apply the resolved theme on mount.
  useEffect(() => {
    applyTheme(theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Follow OS preference only while the user has no explicit choice.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return undefined;
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = event => {
      let stored = null;
      try {
        stored = window.localStorage.getItem(STORAGE_KEY);
      } catch (e) {
        // Treat as no explicit choice.
      }
      if (stored !== DARK && stored !== LIGHT) {
        setThemeState(event.matches ? DARK : LIGHT);
        applyTheme(event.matches ? DARK : LIGHT);
      }
    };

    if (media.addEventListener) {
      media.addEventListener('change', handleChange);
      return () => media.removeEventListener('change', handleChange);
    }

    // Safari < 14 fallback.
    media.addListener(handleChange);
    return () => media.removeListener(handleChange);
  }, [applyTheme]);

  return {
    theme,
    isDark: theme === DARK,
    toggle,
    setTheme,
  };
}

export default useDarkMode;
