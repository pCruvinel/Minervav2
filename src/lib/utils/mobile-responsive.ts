/**
 * Mobile Responsive Utilities
 *
 * Utilitários para garantir responsiveness em mobile
 * - Breakpoints Tailwind
 * - Touch-friendly sizing
 * - Mobile-optimized layouts
 * - Accessibility no mobile
 *
 * @module mobile-responsive
 */

// =====================================================
// BREAKPOINTS
// =====================================================

export const BREAKPOINTS = {
  xs: 0,      // Extra small devices
  sm: 640,    // Small devices (landscape phones)
  md: 768,    // Medium devices (tablets)
  lg: 1024,   // Large devices (desktop)
  xl: 1280,   // Extra large devices
  '2xl': 1536 // 2x extra large devices
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

// =====================================================
// TAILWIND UTILITIES
// =====================================================

/**
 * Responsive padding com breakpoints
 */
export const responsivePadding = {
  mobile: 'p-3 sm:p-4',         // 12px / 16px
  tablet: 'p-4 md:p-6',         // 16px / 24px
  desktop: 'p-6 lg:p-8',        // 24px / 32px
} as const;

/**
 * Responsive gap com breakpoints
 */
export const responsiveGap = {
  mobile: 'gap-2 sm:gap-3',     // 8px / 12px
  tablet: 'gap-3 md:gap-4',     // 12px / 16px
  desktop: 'gap-4 lg:gap-6',    // 16px / 24px
} as const;

/**
 * Responsive text sizes
 */
export const responsiveText = {
  xs: 'text-xs sm:text-sm',     // 12px / 14px
  sm: 'text-sm md:text-base',   // 14px / 16px
  base: 'text-base md:text-lg', // 16px / 18px
  lg: 'text-lg md:text-xl',     // 18px / 20px
  xl: 'text-xl md:text-2xl',    // 20px / 24px
} as const;

/**
 * Touch-friendly button size (min 44x44px)
 */
export const TOUCH_TARGET_MIN = 44; // pixels

export const touchFriendlyButton =
  'h-[2.75rem] min-h-[2.75rem] px-4 sm:h-10 sm:min-h-10'; // 44px / 40px

/**
 * Touch-friendly input size
 */
export const touchFriendlyInput =
  'h-[2.75rem] min-h-[2.75rem] sm:h-10 sm:min-h-10'; // 44px / 40px

// =====================================================
// CONTAINER UTILITIES
// =====================================================

/**
 * Responsive grid para calendário
 */
export const responsiveGrid = {
  // Week view: stack em mobile, grid em tablet+
  week: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2 sm:gap-3 md:gap-4',

  // Month view: 2 columns em mobile, 4 em tablet, 7 em desktop
  month: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-1 sm:gap-2 md:gap-3',

  // 2 columns em mobile, 3 em tablet, 4 em desktop
  twoToFour: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4',
} as const;

/**
 * Responsive container widths
 */
export const responsiveContainer = {
  full: 'w-full',
  mobile: 'w-full sm:w-[90%] md:w-[95%]',
  tablet: 'w-full md:w-[90%] lg:w-[85%]',
  desktop: 'w-full max-w-6xl',
  narrow: 'w-full max-w-2xl',
  wide: 'w-full max-w-7xl',
} as const;

// =====================================================
// HOOKS & UTILITIES
// =====================================================

/**
 * Hook para detectar breakpoint atual
 */
export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = React.useState<Breakpoint>('md');

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;

      if (width < BREAKPOINTS.sm) setBreakpoint('xs');
      else if (width < BREAKPOINTS.md) setBreakpoint('sm');
      else if (width < BREAKPOINTS.lg) setBreakpoint('md');
      else if (width < BREAKPOINTS.xl) setBreakpoint('lg');
      else if (width < BREAKPOINTS['2xl']) setBreakpoint('xl');
      else setBreakpoint('2xl');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
}

/**
 * Hook para detectar se é mobile
 */
export function useIsMobile(): boolean {
  const breakpoint = useBreakpoint();
  return breakpoint === 'xs' || breakpoint === 'sm';
}

/**
 * Hook para detectar orientação
 */
export function useOrientation(): 'portrait' | 'landscape' {
  const [orientation, setOrientation] = React.useState<'portrait' | 'landscape'>(
    typeof window !== 'undefined' && window.innerHeight > window.innerWidth
      ? 'portrait'
      : 'landscape'
  );

  React.useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      );
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    return () => window.removeEventListener('orientationchange', handleOrientationChange);
  }, []);

  return orientation;
}

/**
 * Verifica se é touch device
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    typeof window !== 'undefined' &&
    (navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0 ||
      window.matchMedia?.('(hover: none)').matches)
  );
}

/**
 * Hook para safe area (notch awareness)
 */
export function useSafeArea(): {
  top: number;
  bottom: number;
  left: number;
  right: number;
} {
  const [safeArea, setSafeArea] = React.useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  React.useEffect(() => {
    const updateSafeArea = () => {
      const safeAreaInsets = (window as any).CSS?.supports?.('padding-top: max(0px)');

      if (safeAreaInsets) {
        const style = getComputedStyle(document.documentElement);
        setSafeArea({
          top: parseInt(style.getPropertyValue('safe-area-inset-top')) || 0,
          bottom: parseInt(style.getPropertyValue('safe-area-inset-bottom')) || 0,
          left: parseInt(style.getPropertyValue('safe-area-inset-left')) || 0,
          right: parseInt(style.getPropertyValue('safe-area-inset-right')) || 0,
        });
      }
    };

    updateSafeArea();
    window.addEventListener('resize', updateSafeArea);
    return () => window.removeEventListener('resize', updateSafeArea);
  }, []);

  return safeArea;
}

// =====================================================
// CLASS NAME HELPERS
// =====================================================

/**
 * Gera className responsivo baseado em config
 */
export function getResponsiveClass(config: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
}): string {
  const parts: string[] = [];

  if (config.mobile) parts.push(config.mobile);
  if (config.tablet) parts.push(`md:${config.tablet}`);
  if (config.desktop) parts.push(`lg:${config.desktop}`);

  return parts.join(' ');
}

/**
 * Gera styles inline responsivos
 */
export function getResponsiveStyle(
  breakpoint: Breakpoint,
  styles: Record<Breakpoint, React.CSSProperties>
): React.CSSProperties {
  const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const currentIndex = breakpointOrder.indexOf(breakpoint);

  let result: React.CSSProperties = {};

  // Apply styles from current breakpoint and above
  for (let i = 0; i <= currentIndex; i++) {
    result = { ...result, ...styles[breakpointOrder[i]] };
  }

  return result;
}

// =====================================================
// MOBILE OPTIMIZATION CHECKLIST
// =====================================================

export const mobileOptimizationChecklist = {
  layout: [
    '✓ Stack layout em mobile (flex-col)',
    '✓ Padding responsive (p-3 sm:p-4 md:p-6)',
    '✓ Gap responsive (gap-2 sm:gap-3)',
    '✓ Grids responsivos (grid-cols-1 md:grid-cols-2)',
  ],

  touch: [
    '✓ Botões min 44x44px',
    '✓ Inputs min 44px altura',
    '✓ Espaçamento de 8px entre alvos',
    '✓ Hover desabilitado em touch',
  ],

  text: [
    '✓ Texto min 16px em mobile',
    '✓ Line height 1.5+ para leitura',
    '✓ Contrast ratio 4.5:1 (WCAG AA)',
    '✓ Responsive font sizes (text-sm md:text-base)',
  ],

  viewport: [
    '✓ Viewport meta tag configurado',
    '✓ Mobile-friendly viewport',
    '✓ Notch/safe area awareness',
    '✓ No horizontal scroll',
  ],

  performance: [
    '✓ Lazy loading de imagens',
    '✓ Code splitting para mobile',
    '✓ Compressed assets',
    '✓ Minimal JavaScript',
  ],

  accessibility: [
    '✓ Keyboard navigation full',
    '✓ Focus indicators visíveis',
    '✓ Semantic HTML',
    '✓ ARIA labels quando necessário',
  ],
} as const;

// =====================================================
// MEDIA QUERY HELPERS
// =====================================================

/**
 * CSS media query para dark mode
 */
export const darkModeMediaQuery = '@media (prefers-color-scheme: dark)';

/**
 * CSS media query para reduced motion
 */
export const reducedMotionMediaQuery = '@media (prefers-reduced-motion: reduce)';

/**
 * CSS media query para landscape
 */
export const landscapeMediaQuery = '@media (orientation: landscape)';

/**
 * CSS media query para portrait
 */
export const portraitMediaQuery = '@media (orientation: portrait)';

// =====================================================
// MOCK REACT IMPORT (para compilação)
// =====================================================

import React from 'react';
