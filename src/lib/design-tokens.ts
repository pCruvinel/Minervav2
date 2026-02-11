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

// =====================================================
// CORES POR SETOR - Sistema de Capacidade v2.0
// =====================================================

/**
 * Cores para agendamentos por setor (Color Coding rigoroso)
 * Usado para diferenciar visualmente agendamentos de diferentes setores
 */
export const setorColors = {
  obras: {
    bg: 'rgba(146, 64, 14, 0.15)',       // Marrom amber-800 com transparência
    bgSolid: '#92400E',                   // bg-amber-800
    border: '#78350F',                    // border-amber-900
    text: '#451A03',                      // text-amber-950
    badge: {
      bg: '#92400E',
      text: '#FFFFFF',
      border: '#78350F'
    }
  },
  assessoria: {
    bg: 'rgba(37, 99, 235, 0.15)',        // Azul blue-600 com transparência
    bgSolid: '#2563EB',                   // bg-blue-600
    border: '#1D4ED8',                    // border-blue-700
    text: '#1E3A8A',                      // text-blue-900
    badge: {
      bg: '#2563EB',
      text: '#FFFFFF',
      border: '#1D4ED8'
    }
  },
  comercial: {
    bg: 'rgba(220, 38, 38, 0.15)',        // Vermelho red-600 com transparência
    bgSolid: '#DC2626',                   // bg-red-600
    border: '#B91C1C',                    // border-red-700
    text: '#7F1D1D',                      // text-red-900
    badge: {
      bg: '#DC2626',
      text: '#FFFFFF',
      border: '#B91C1C'
    }
  },
  administrativo: {
    bg: 'rgba(22, 163, 74, 0.15)',        // Verde green-600 com transparência
    bgSolid: '#16A34A',                   // bg-green-600
    border: '#15803D',                    // border-green-700
    text: '#14532D',                      // text-green-900
    badge: {
      bg: '#16A34A',
      text: '#FFFFFF',
      border: '#15803D'
    }
  },
  diretoria: {
    bg: 'rgba(124, 58, 237, 0.15)',       // Roxo violet-600 com transparência
    bgSolid: '#7C3AED',                   // bg-violet-600
    border: '#6D28D9',                    // border-violet-700
    text: '#4C1D95',                      // text-violet-900
    badge: {
      bg: '#7C3AED',
      text: '#FFFFFF',
      border: '#6D28D9'
    }
  },
  ti: {
    bg: 'rgba(14, 116, 144, 0.15)',       // Ciano cyan-700 com transparência
    bgSolid: '#0E7490',                   // bg-cyan-700
    border: '#0E7490',                    // border-cyan-700
    text: '#164E63',                      // text-cyan-900
    badge: {
      bg: '#0E7490',
      text: '#FFFFFF',
      border: '#0E7490'
    }
  }
} as const;

/**
 * Tipo para slugs de setor
 */
export type SetorColorKey = keyof typeof setorColors;

/**
 * Cores para bloqueios do calendário
 */
export const bloqueioColors = {
  feriado: {
    bg: 'rgba(239, 68, 68, 0.1)',         // Vermelho suave
    bgSolid: '#EF4444',                    // Vermelho sólido
    border: '#FCA5A5',
    text: '#7F1D1D',
    pattern: 'striped',                    // Padrão hachurado
    icon: '🏛️',
    badge: {
      bg: '#EF4444',
      text: '#FFFFFF',
      border: '#DC2626'
    }
  },
  ponto_facultativo: {
    bg: 'rgba(245, 158, 11, 0.12)',       // Âmbar suave
    bgSolid: '#F59E0B',                    // Âmbar sólido
    border: '#FCD34D',
    text: '#92400E',
    pattern: 'dashed',                     // Padrão tracejado
    icon: '⚡',
    badge: {
      bg: '#F59E0B',
      text: '#FFFFFF',
      border: '#D97706'
    }
  },
  manutencao: {
    bg: 'rgba(156, 163, 175, 0.2)',       // Cinza
    bgSolid: '#6B7280',                    // Cinza sólido
    border: '#9CA3AF',
    text: '#374151',
    pattern: 'solid',
    icon: '🔧',
    badge: {
      bg: '#6B7280',
      text: '#FFFFFF',
      border: '#4B5563'
    }
  },
  evento: {
    bg: 'rgba(168, 85, 247, 0.1)',        // Roxo suave
    bgSolid: '#A855F7',                    // Roxo sólido
    border: '#C084FC',
    text: '#581C87',
    pattern: 'solid',
    icon: '📅',
    badge: {
      bg: '#A855F7',
      text: '#FFFFFF',
      border: '#9333EA'
    }
  },
  ferias_coletivas: {
    bg: 'rgba(251, 191, 36, 0.15)',       // Amarelo suave
    bgSolid: '#F59E0B',                    // Amarelo sólido
    border: '#FCD34D',
    text: '#78350F',
    pattern: 'striped',
    icon: '🏖️',
    badge: {
      bg: '#F59E0B',
      text: '#FFFFFF',
      border: '#D97706'
    }
  },
  outro: {
    bg: 'rgba(156, 163, 175, 0.15)',      // Cinza neutro
    bgSolid: '#9CA3AF',                    // Cinza neutro sólido
    border: '#D1D5DB',
    text: '#374151',
    pattern: 'solid',
    icon: '⛔',
    badge: {
      bg: '#9CA3AF',
      text: '#FFFFFF',
      border: '#6B7280'
    }
  }
} as const;

/**
 * Tipo para motivos de bloqueio
 */
export type BloqueioMotivoKey = keyof typeof bloqueioColors;

/**
 * Helper para obter cor do setor com fallback
 */
export function getSetorColor(setor: string | undefined | null) {
  if (!setor) return setorColors.administrativo;
  
  const normalizado = setor.toLowerCase().trim();
  return setorColors[normalizado as SetorColorKey] || setorColors.administrativo;
}

/**
 * Helper para obter cor do bloqueio
 */
export function getBloqueioColor(motivo: string | undefined | null) {
  if (!motivo) return bloqueioColors.outro;
  
  const normalizado = motivo.toLowerCase().trim();
  return bloqueioColors[normalizado as BloqueioMotivoKey] || bloqueioColors.outro;
}
