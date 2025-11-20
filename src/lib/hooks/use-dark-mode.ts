/**
 * Hook: useDarkMode
 *
 * Gerencia tema dark mode da aplicação
 * - Detecção de preferência do sistema
 * - Persistência em localStorage
 * - Sincronização entre abas
 * - Suporte para transições suaves
 *
 * @module use-dark-mode
 */

import { useEffect, useState, useCallback, useRef } from 'react';

// =====================================================
// TYPES
// =====================================================

export type Theme = 'light' | 'dark' | 'system';

export interface DarkModeState {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

// =====================================================
// CONSTANTS
// =====================================================

const STORAGE_KEY = 'minerva_theme_preference';
const DARK_CLASS = 'dark';
const HTML_ATTRIBUTE = 'data-theme';

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Detecta preferência de dark mode do sistema
 */
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/**
 * Recupera tema salvo do localStorage
 */
function getSavedTheme(): Theme | null {
  if (typeof window === 'undefined') return null;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return (saved as Theme) || null;
  } catch {
    return null;
  }
}

/**
 * Salva tema em localStorage
 */
function saveTheme(theme: Theme) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    console.warn('Failed to save theme preference');
  }
}

/**
 * Aplica tema ao DOM
 */
function applyTheme(theme: Theme) {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;
  const isDark =
    theme === 'dark' || (theme === 'system' && getSystemTheme() === 'dark');

  // Atualizar class dark em <html>
  if (isDark) {
    root.classList.add(DARK_CLASS);
  } else {
    root.classList.remove(DARK_CLASS);
  }

  // Atualizar data attribute
  root.setAttribute(HTML_ATTRIBUTE, isDark ? 'dark' : 'light');

  // Atualizar color-scheme para comportamento automático do navegador
  root.style.colorScheme = isDark ? 'dark' : 'light';
}

/**
 * Resolve theme final (considering system preference)
 */
function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
}

// =====================================================
// HOOK
// =====================================================

/**
 * Hook para gerenciar dark mode
 *
 * @example
 * ```typescript
 * const { theme, isDark, toggleTheme, setTheme } = useDarkMode();
 *
 * return (
 *   <div>
 *     <p>Tema atual: {theme}</p>
 *     <button onClick={toggleTheme}>Toggle Dark Mode</button>
 *     <button onClick={() => setTheme('light')}>Light</button>
 *     <button onClick={() => setTheme('dark')}>Dark</button>
 *     <button onClick={() => setTheme('system')}>System</button>
 *   </div>
 * );
 * ```
 */
export function useDarkMode(): DarkModeState {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Inicializar com tema salvo ou preferência do sistema
    return getSavedTheme() || 'system';
  });

  const [isDark, setIsDark] = useState(() => {
    const saved = getSavedTheme() || 'system';
    return resolveTheme(saved) === 'dark';
  });

  const mediaQueryRef = useRef<MediaQueryList | null>(null);

  /**
   * Monitora mudanças de preferência do sistema
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQueryRef.current = mediaQuery;

    const handleChange = () => {
      if (theme === 'system') {
        setIsDark(mediaQuery.matches);
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  /**
   * Aplica tema quando muda
   */
  useEffect(() => {
    applyTheme(theme);
    setIsDark(resolveTheme(theme) === 'dark');
  }, [theme]);

  /**
   * Sincroniza com outras abas
   */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setThemeState(e.newValue as Theme);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  /**
   * Alterna entre light/dark
   */
  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next = resolveTheme(current) === 'dark' ? 'light' : 'dark';
      saveTheme(next);
      return next;
    });
  }, []);

  /**
   * Define tema específico
   */
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    saveTheme(newTheme);
  }, []);

  return {
    theme,
    isDark,
    toggleTheme,
    setTheme,
  };
}

/**
 * Provider Context para dark mode
 */
import React from 'react';

export const DarkModeContext = React.createContext<DarkModeState | null>(null);

/**
 * Provider component
 */
export function DarkModeProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const darkMode = useDarkMode();

  return (
    <DarkModeContext.Provider value={darkMode}>
      {children}
    </DarkModeContext.Provider>
  );
}

/**
 * Hook para usar dark mode context
 */
export function useDarkModeContext(): DarkModeState {
  const context = React.useContext(DarkModeContext);
  if (!context) {
    throw new Error('useDarkModeContext must be used within DarkModeProvider');
  }
  return context;
}

// =====================================================
// STYLING UTILITIES
// =====================================================

/**
 * CSS variables para dark mode
 */
export const darkModeCSS = `
  /* Light mode (default) */
  :root {
    --color-bg: #ffffff;
    --color-bg-secondary: #f9fafb;
    --color-bg-tertiary: #f3f4f6;
    --color-text: #111827;
    --color-text-secondary: #6b7280;
    --color-text-tertiary: #9ca3af;
    --color-border: #e5e7eb;
    --color-border-light: #f3f4f6;

    --color-primary: #2563eb;
    --color-primary-hover: #1d4ed8;
    --color-success: #059669;
    --color-warning: #d97706;
    --color-danger: #dc2626;

    color-scheme: light;
  }

  /* Dark mode */
  :root.dark {
    --color-bg: #111827;
    --color-bg-secondary: #1f2937;
    --color-bg-tertiary: #374151;
    --color-text: #f9fafb;
    --color-text-secondary: #d1d5db;
    --color-text-tertiary: #9ca3af;
    --color-border: #374151;
    --color-border-light: #4b5563;

    --color-primary: #3b82f6;
    --color-primary-hover: #2563eb;
    --color-success: #10b981;
    --color-warning: #f59e0b;
    --color-danger: #ef4444;

    color-scheme: dark;
  }

  /* Smooth transitions entre temas */
  * {
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
  }

  /* Respeitar preferência de menos movimento */
  @media (prefers-reduced-motion: reduce) {
    * {
      transition: none !important;
    }
  }
`;

/**
 * Tailwind classes para dark mode
 * Usar em componentes assim: <div className="bg-white dark:bg-gray-900">
 */
export const darkModeClasses = {
  bg: 'bg-white dark:bg-gray-950',
  bgSecondary: 'bg-gray-50 dark:bg-gray-900',
  bgTertiary: 'bg-gray-100 dark:bg-gray-800',
  text: 'text-gray-900 dark:text-white',
  textSecondary: 'text-gray-600 dark:text-gray-400',
  textTertiary: 'text-gray-500 dark:text-gray-500',
  border: 'border-gray-200 dark:border-gray-700',
  borderLight: 'border-gray-100 dark:border-gray-800',
  shadow: 'shadow-sm dark:shadow-xl',
} as const;

// =====================================================
// THEME TRANSITION
// =====================================================

/**
 * Transição suave entre temas (pode causar flash)
 * Usar com cuidado - melhor usar CSS variables
 */
export function enableSmoothThemeTransition() {
  const style = document.createElement('style');
  style.textContent = `
    * {
      transition-property: background-color, border-color, color;
      transition-duration: 200ms;
      transition-timing-function: ease-in-out;
    }

    @media (prefers-reduced-motion: reduce) {
      * {
        transition-duration: 0 !important;
      }
    }
  `;
  document.head.appendChild(style);
}

/**
 * Desabilita animações durante load (previne flash)
 */
export function preventThemeFlash() {
  const script = document.createElement('script');
  script.textContent = `
    try {
      const theme = localStorage.getItem('minerva_theme_preference') || 'system';
      const isDark = theme === 'dark' || (
        theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      );
      document.documentElement.classList.toggle('dark', isDark);
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } catch(e) {}
  `;
  document.head.insertBefore(script, document.head.firstChild);
}
