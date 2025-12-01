// Sistema de Temas para Modais - Minerva Design System
export const modalThemes = {
  create: {
    gradient: 'from-primary to-secondary',
    textColor: 'text-primary-foreground',
    iconBg: 'bg-primary/20',
    borderColor: 'border-primary/20',
    bgColor: 'bg-primary/5',
    accentColor: 'text-primary'
  },
  confirm: {
    gradient: 'from-success to-success',
    textColor: 'text-success-foreground',
    iconBg: 'bg-success/20',
    borderColor: 'border-success/20',
    bgColor: 'bg-success/5',
    accentColor: 'text-success'
  },
  warning: {
    gradient: 'from-warning to-warning',
    textColor: 'text-warning-foreground',
    iconBg: 'bg-warning/20',
    borderColor: 'border-warning/20',
    bgColor: 'bg-warning/5',
    accentColor: 'text-warning'
  },
  error: {
    gradient: 'from-destructive to-destructive',
    textColor: 'text-destructive-foreground',
    iconBg: 'bg-destructive/20',
    borderColor: 'border-destructive/20',
    bgColor: 'bg-destructive/5',
    accentColor: 'text-destructive'
  },
  info: {
    gradient: 'from-info to-primary',
    textColor: 'text-info',
    iconBg: 'bg-info/20',
    borderColor: 'border-info/20',
    bgColor: 'bg-info/5',
    accentColor: 'text-info'
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
  'blue-purple': 'from-primary to-secondary',
  'green-emerald': 'from-success to-success',
  'purple-pink': 'from-secondary to-secondary',
  'orange-red': 'from-warning to-destructive',
  'teal-cyan': 'from-info to-info'
} as const;

export type CustomGradient = keyof typeof customGradients;