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
        light: 'var(--primary)',
        DEFAULT: 'var(--primary)',
        dark: 'var(--primary)',
        text: 'var(--primary)'
      },
      green: {
        light: 'var(--success)',
        DEFAULT: 'var(--success)',
        dark: 'var(--success)',
        text: 'var(--success)'
      },
      yellow: {
        light: 'var(--warning)',
        DEFAULT: 'var(--warning)',
        dark: 'var(--warning)',
        text: 'var(--warning)'
      },
      purple: {
        light: 'var(--secondary)',
        DEFAULT: 'var(--secondary)',
        dark: 'var(--secondary)',
        text: 'var(--secondary)'
      },
      orange: {
        light: 'var(--warning)',
        DEFAULT: 'var(--warning)',
        dark: 'var(--warning)',
        text: 'var(--warning)'
      }
    },
    background: {
      primary: 'var(--background)',
      secondary: 'var(--muted)',
      tertiary: 'var(--muted)',
      pearl: 'hsl(30, 20%, 98%)'  // Branco pérola para células vazias
    },
    text: {
      primary: 'var(--foreground)',
      secondary: 'var(--muted-foreground)',
      tertiary: 'var(--muted-foreground)'
    },
    border: {
      light: 'var(--border)',
      DEFAULT: 'var(--border)',
      dark: 'var(--muted-foreground)'
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
 * Cores para turnos do calendário (Verde, Vermelho, Azul)
 */
export const turnoColors = {
  verde: {
    bg: 'rgba(34, 197, 94, 0.23)',      // success with 23% opacity (77% transparency)
    border: 'var(--success)',
    solid: 'var(--success)'
  },
  verm: {
    bg: 'rgba(239, 68, 68, 0.23)',      // destructive with 23% opacity (77% transparency)
    border: 'var(--destructive)',
    solid: 'var(--destructive)'
  },
  azul: {
    bg: 'rgba(59, 130, 246, 0.23)',     // info with 23% opacity (77% transparency)
    border: 'var(--info)',
    solid: 'var(--info)'
  },
  // Fallbacks para valores antigos
  primary: {
    bg: 'rgba(34, 197, 94, 0.23)',
    border: 'var(--success)',
    solid: 'var(--success)'
  },
  secondary: {
    bg: 'rgba(59, 130, 246, 0.23)',
    border: 'var(--info)',
    solid: 'var(--info)'
  }
};

/**
 * Cores para badges de agendamento (Tríade em relação ao turno)
 * Para destacar sobre o fundo do turno.
 */
export const badgeColors = {
  // Tríade do Verde (Success) -> Roxo/Rosa
  verde: {
    bg: 'rgba(147, 51, 234, 0.7)', // Purple 600 with 30% transparency
    text: '#FFFFFF',
    border: '#7E22CE'
  },
  // Tríade do Vermelho (Destructive) -> Azul/Ciano
  verm: {
    bg: 'rgba(6, 182, 212, 0.7)', // Cyan 500 with 30% transparency
    text: '#FFFFFF',
    border: '#0891B2'
  },
  // Tríade do Azul (Info) -> Laranja/Amarelo
  azul: {
    bg: 'rgba(245, 158, 11, 0.7)', // Amber 500 with 30% transparency
    text: '#FFFFFF',
    border: '#D97706'
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
