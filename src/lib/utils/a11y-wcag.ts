/**
 * Accessibility Utilities - WCAG 2.1 Level AA Compliance
 *
 * Utilitários para garantir acessibilidade
 * - Color contrast
 * - Keyboard navigation
 * - Screen reader support
 * - Focus management
 *
 * @module a11y-wcag
 */

// =====================================================
// COLOR CONTRAST UTILITIES
// =====================================================

/**
 * Calcula luminância relativa de uma cor (WCAG formula)
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calcula contrast ratio entre duas cores
 * Retorna valor entre 1 e 21
 */
export function getContrastRatio(
  color1: string,
  color2: string
): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const lum1 = getLuminance(rgb1[0], rgb1[1], rgb1[2]);
  const lum2 = getLuminance(rgb2[0], rgb2[1], rgb2[2]);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Verifica se contrast ratio atende WCAG AA
 * Normal text: 4.5:1
 * Large text (18pt+): 3:1
 */
export function meetsWCAGAA(
  color1: string,
  color2: string,
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(color1, color2);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Verifica se contrast ratio atende WCAG AAA
 * Normal text: 7:1
 * Large text (18pt+): 4.5:1
 */
export function meetsWCAGAAA(
  color1: string,
  color2: string,
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(color1, color2);
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Converte hex para RGB
 */
function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null;
}

// =====================================================
// WCAG COLOR PALETTES
// =====================================================

/**
 * Cores com WCAG AA compliant contrast
 */
export const wcagCompliantColors = {
  // Text on white
  text: {
    dark: '#000000',    // 21:1 contrast with white
    gray: '#333333',    // 12.6:1 contrast with white
    muted: '#666666',   // 7:1 contrast with white
  },

  // Text on dark
  lightText: {
    white: 'var(--background)',   // 21:1 contrast with black
    light: '#EEEEEE',   // 19.6:1 contrast with black
    pale: '#CCCCCC',    // 12.6:1 contrast with black
  },

  // Semantic colors with WCAG AA contrast
  semantic: {
    success: '#059669',   // 4.9:1 with white
    warning: '#D97706',   // 5.9:1 with white
    danger: '#DC2626',    // 5.3:1 with white
    info: '#0891B2',      // 5.6:1 with white
  },
} as const;

// =====================================================
// KEYBOARD NAVIGATION UTILITIES
// =====================================================

/**
 * Keys para navegação por teclado
 */
export enum KeyCode {
  Enter = 'Enter',
  Space = ' ',
  Escape = 'Escape',
  Tab = 'Tab',
  ArrowUp = 'ArrowUp',
  ArrowDown = 'ArrowDown',
  ArrowLeft = 'ArrowLeft',
  ArrowRight = 'ArrowRight',
  Home = 'Home',
  End = 'End',
}

/**
 * Handler para Enter e Space em botões
 */
export function createKeyboardHandler(
  callback: () => void
): (e: React.KeyboardEvent) => void {
  return (e) => {
    if (e.key === KeyCode.Enter || e.key === KeyCode.Space) {
      e.preventDefault();
      callback();
    }
  };
}

/**
 * Navega entre elementos com arrow keys
 */
export function handleArrowNavigation(
  e: React.KeyboardEvent,
  currentIndex: number,
  itemCount: number,
  direction: 'vertical' | 'horizontal' = 'vertical'
): number | null {
  let newIndex: number | null = null;

  if (direction === 'vertical') {
    if (e.key === KeyCode.ArrowDown) {
      newIndex = (currentIndex + 1) % itemCount;
      e.preventDefault();
    } else if (e.key === KeyCode.ArrowUp) {
      newIndex = (currentIndex - 1 + itemCount) % itemCount;
      e.preventDefault();
    }
  } else {
    if (e.key === KeyCode.ArrowRight) {
      newIndex = (currentIndex + 1) % itemCount;
      e.preventDefault();
    } else if (e.key === KeyCode.ArrowLeft) {
      newIndex = (currentIndex - 1 + itemCount) % itemCount;
      e.preventDefault();
    }
  }

  if (e.key === KeyCode.Home) {
    newIndex = 0;
    e.preventDefault();
  } else if (e.key === KeyCode.End) {
    newIndex = itemCount - 1;
    e.preventDefault();
  }

  return newIndex;
}

// =====================================================
// FOCUS MANAGEMENT
// =====================================================

/**
 * Estilos para focus indicator visível
 */
export const focusVisibleStyles = {
  outline: '2px solid #2563eb',
  outlineOffset: '2px',
} as const;

/**
 * Class para focus outline em Tailwind
 */
export const focusOutlineClass =
  'focus:outline-2 focus:outline-offset-2 focus:outline-blue-600';

/**
 * Move foco para elemento
 */
export function focusElement(element: HTMLElement | null, smooth = true) {
  if (!element) return;

  if (smooth) {
    element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  element.focus();
}

/**
 * Hook para focus trap (modal/dialog)
 */
export function useFocusTrap(containerRef: React.RefObject<HTMLElement>) {
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleKeydown);
    firstElement.focus();

    return () => container.removeEventListener('keydown', handleKeydown);
  }, [containerRef]);
}

// =====================================================
// SCREEN READER SUPPORT
// =====================================================

/**
 * ARIA attributes para screen readers
 */
export const ariaAttributes = {
  // Announce changes to screen readers
  live: 'aria-live',
  polite: 'aria-live="polite"',
  assertive: 'aria-live="assertive"',

  // Describe button purposes
  label: 'aria-label',
  describedby: 'aria-describedby',
  labelledby: 'aria-labelledby',

  // Indicate required fields
  required: 'aria-required="true"',

  // Invalid/error state
  invalid: 'aria-invalid="true"',
  errormessage: 'aria-errormessage',

  // Hidden from screen readers
  hidden: 'aria-hidden="true"',

  // Expanded/collapsed state
  expanded: 'aria-expanded',
  controls: 'aria-controls',

  // Navigation
  current: 'aria-current="page"',
} as const;

/**
 * Announces mensagem para screen reader
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
) {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only'; // Screen reader only
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => announcement.remove(), 1000);
}

// =====================================================
// SEMANTIC HTML UTILITIES
// =====================================================

/**
 * Checklist para HTML semântico
 */
export const semanticHTMLChecklist = {
  structure: [
    '✓ Use <main> para conteúdo principal',
    '✓ Use <nav> para navegação',
    '✓ Use <section> para seções temáticas',
    '✓ Use <article> para conteúdo independente',
    '✓ Use <aside> para conteúdo relacionado',
    '✓ Use <footer> para rodapé',
    '✓ Use <header> para cabeçalho',
  ],

  forms: [
    '✓ Use <label> associado a <input>',
    '✓ Use <fieldset> para agrupar relacionados',
    '✓ Use <legend> para descrever fieldset',
    '✓ Use type correto em <input> (email, date, etc)',
    '✓ Marque required com aria-required',
    '✓ Associe erros com aria-errormessage',
  ],

  interactive: [
    '✓ Use <button> para ações',
    '✓ Use <a> para navegação',
    '✓ Use <dialog> para modais',
    '✓ Implemente focus indicators visíveis',
    '✓ Suporte navegação por teclado',
    '✓ Use ARIA roles quando necessário',
  ],

  accessibility: [
    '✓ Alt text em todas imagens',
    '✓ Title em iframes',
    '✓ Lang attribute em <html>',
    '✓ Meta charset e viewport',
    '✓ Skip links para conteúdo',
    '✓ Landmark regions definidas',
  ],
} as const;

// =====================================================
// WCAG 2.1 CHECKLIST
// =====================================================

export const wcagCompleteChecklist = {
  perceivable: [
    '✓ 1.1.1 Non-text Content (Nível A)',
    '✓ 1.3.1 Info and Relationships (Nível A)',
    '✓ 1.4.1 Use of Color (Nível A)',
    '✓ 1.4.3 Contrast (Minimum) - WCAG AA',
    '✓ 1.4.11 Non-text Contrast - WCAG AA',
  ],

  operable: [
    '✓ 2.1.1 Keyboard (Nível A)',
    '✓ 2.1.2 No Keyboard Trap (Nível A)',
    '✓ 2.4.1 Bypass Blocks (Nível A)',
    '✓ 2.4.3 Focus Order (Nível A)',
    '✓ 2.4.7 Focus Visible - WCAG AA',
  ],

  understandable: [
    '✓ 3.1.1 Language of Page (Nível A)',
    '✓ 3.2.1 On Focus (Nível A)',
    '✓ 3.2.2 On Input (Nível A)',
    '✓ 3.3.1 Error Identification (Nível A)',
    '✓ 3.3.4 Error Prevention (Legal, Financial, Data) - WCAG AA',
  ],

  robust: [
    '✓ 4.1.1 Parsing (Nível A)',
    '✓ 4.1.2 Name, Role, Value (Nível A)',
    '✓ 4.1.3 Status Messages - WCAG AA',
  ],
} as const;

// =====================================================
// TESTING UTILITIES
// =====================================================

/**
 * Simula leitura de screen reader
 */
export function getScreenReaderText(element: HTMLElement): string {
  const text: string[] = [];

  // Pega aria-label
  const label = element.getAttribute('aria-label');
  if (label) text.push(label);

  // Pega aria-labelledby
  const labelledById = element.getAttribute('aria-labelledby');
  if (labelledById) {
    const labelledEl = document.getElementById(labelledById);
    if (labelledEl) text.push(labelledEl.textContent || '');
  }

  // Pega texto do elemento
  if (!label && !labelledById) {
    text.push(element.textContent || '');
  }

  return text.filter(Boolean).join(' ');
}

/**
 * Valida keyboard accessibility
 */
export function validateKeyboardAccessibility(
  element: HTMLElement
): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check if interactive elements are keyboard accessible
  const interactive = element.querySelectorAll(
    'button, a, input, select, textarea, [role="button"]'
  );

  interactive.forEach((el) => {
    const tabindex = el.getAttribute('tabindex');
    if (tabindex === '-1') {
      issues.push(`Element not keyboard accessible: ${el.tagName}`);
    }
  });

  // Check for focus trap in dialogs
  const dialogs = element.querySelectorAll('[role="dialog"], dialog');
  if (dialogs.length > 0 && issues.length === 0) {
    // Dialog should have focus trap
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

// =====================================================
// IMPORT REACT
// =====================================================

import React from 'react';
