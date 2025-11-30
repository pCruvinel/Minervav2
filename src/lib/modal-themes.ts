// Sistema de Temas para Modais - Minerva Design System
export const modalThemes = {
  create: {
    gradient: 'from-blue-500 to-purple-600',
    textColor: 'text-blue-50',
    iconBg: 'bg-blue-500/20',
    borderColor: 'border-blue-200',
    bgColor: 'bg-blue-50',
    accentColor: 'text-blue-600'
  },
  confirm: {
    gradient: 'from-green-500 to-emerald-600',
    textColor: 'text-green-50',
    iconBg: 'bg-green-500/20',
    borderColor: 'border-green-200',
    bgColor: 'bg-green-50',
    accentColor: 'text-green-600'
  },
  warning: {
    gradient: 'from-amber-500 to-orange-600',
    textColor: 'text-amber-50',
    iconBg: 'bg-amber-500/20',
    borderColor: 'border-amber-200',
    bgColor: 'bg-amber-50',
    accentColor: 'text-amber-600'
  },
  error: {
    gradient: 'from-red-500 to-pink-600',
    textColor: 'text-red-50',
    iconBg: 'bg-red-500/20',
    borderColor: 'border-red-200',
    bgColor: 'bg-red-50',
    accentColor: 'text-red-600'
  },
  info: {
    gradient: 'from-cyan-500 to-blue-600',
    textColor: 'text-cyan-50',
    iconBg: 'bg-cyan-500/20',
    borderColor: 'border-cyan-200',
    bgColor: 'bg-cyan-50',
    accentColor: 'text-cyan-600'
  }
} as const;

export type ModalTheme = keyof typeof modalThemes;

// Utilitários para aplicar temas
export const getModalTheme = (theme: ModalTheme) => modalThemes[theme];

export const getModalGradient = (theme: ModalTheme) =>
  `bg-gradient-to-r ${modalThemes[theme].gradient}`;

export const getModalTextColor = (theme: ModalTheme) =>
  modalThemes[theme].textColor;

export const getModalIconBg = (theme: ModalTheme) =>
  modalThemes[theme].iconBg;

// Gradientes customizados para casos específicos
export const customGradients = {
  'blue-purple': 'from-blue-500 to-purple-600',
  'green-emerald': 'from-green-500 to-emerald-600',
  'purple-pink': 'from-purple-500 to-pink-600',
  'orange-red': 'from-orange-500 to-red-600',
  'teal-cyan': 'from-teal-500 to-cyan-600'
} as const;

export type CustomGradient = keyof typeof customGradients;