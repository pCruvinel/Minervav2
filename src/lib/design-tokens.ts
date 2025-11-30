/**
 * Design Tokens - Sistema de Cores e Estilos
 *
 * Tokens de design para garantir consistência visual em todo o sistema.
 * Baseado em cores pastéis suaves e design moderno.
 */

export const designTokens = {
  colors: {
    events: {
      pink: {
        light: '#FEE2E2',
        DEFAULT: '#FECACA',
        dark: '#FCA5A5',
        text: '#991B1B'
      },
      blue: {
        light: '#DBEAFE',
        DEFAULT: '#BFDBFE',
        dark: '#93C5FD',
        text: '#1E40AF'
      },
      green: {
        light: '#D1FAE5',
        DEFAULT: '#A7F3D0',
        dark: '#6EE7B7',
        text: '#065F46'
      },
      yellow: {
        light: '#FEF3C7',
        DEFAULT: '#FDE68A',
        dark: '#FCD34D',
        text: '#92400E'
      },
      purple: {
        light: '#E9D5FF',
        DEFAULT: '#D8B4FE',
        dark: '#C084FC',
        text: '#6B21A8'
      },
      orange: {
        light: '#FFEDD5',
        DEFAULT: '#FED7AA',
        dark: '#FDBA74',
        text: '#9A3412'
      }
    },
    background: {
      primary: '#FFFFFF',
      secondary: '#F9FAFB',
      tertiary: '#F3F4F6'
    },
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      tertiary: '#9CA3AF'
    },
    border: {
      light: '#E5E7EB',
      DEFAULT: '#D1D5DB',
      dark: '#9CA3AF'
    }
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
  },
  radius: {
    sm: '0.25rem',    // 4px
    DEFAULT: '0.5rem', // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.5rem'      // 24px
  }
};

/**
 * Mapeamento de categorias para cores de eventos
 */
export const categoryColors = {
  'Vistoria Inicial': {
    bg: designTokens.colors.events.blue.light,
    border: designTokens.colors.events.blue.dark,
    text: designTokens.colors.events.blue.text
  },
  'Apresentação de Proposta': {
    bg: designTokens.colors.events.green.light,
    border: designTokens.colors.events.green.dark,
    text: designTokens.colors.events.green.text
  },
  'Vistoria Técnica': {
    bg: designTokens.colors.events.yellow.light,
    border: designTokens.colors.events.yellow.dark,
    text: designTokens.colors.events.yellow.text
  },
  'Visita Semanal': {
    bg: designTokens.colors.events.pink.light,
    border: designTokens.colors.events.pink.dark,
    text: designTokens.colors.events.pink.text
  }
};
