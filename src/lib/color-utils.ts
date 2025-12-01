import { StatusType, PriorityType } from "@/components/design-system";

/**
 * Utilitários de cores usando o design system Minerva
 * Substitui as funções hardcoded que usam cores Tailwind padrão
 */

/**
 * Retorna as classes CSS para um status usando variáveis do design system
 * @deprecated Use o componente StatusBadge em vez desta função
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case "em_andamento":
      return "bg-info/10 text-info border-info/20";
    case "em_triagem":
      return "bg-warning/10 text-warning border-warning/20";
    case "concluido":
      return "bg-success/10 text-success border-success/20";
    case "cancelado":
      return "bg-destructive/10 text-destructive border-destructive/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

/**
 * Retorna as classes CSS para uma prioridade usando variáveis do design system
 * @deprecated Use o componente PriorityBadge em vez desta função
 */
export const getPrioridadeColor = (prioridade: string): string => {
  switch (prioridade) {
    case "ALTA":
      return "bg-destructive/5 text-destructive border-destructive/20";
    case "MEDIA":
      return "bg-warning/5 text-warning border-warning/20";
    case "BAIXA":
      return "bg-success/5 text-success border-success/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

/**
 * Mapeamento direto de cores do design system
 * Para uso em componentes que precisam de acesso direto às classes
 */
export const colorMap = {
  // Backgrounds
  background: "bg-background",
  muted: "bg-muted",
  card: "bg-card",

  // Text
  foreground: "text-foreground",
  mutedForeground: "text-muted-foreground",

  // Borders
  border: "border-border",
  input: "border-input",

  // Status
  status: {
    em_andamento: "bg-info/10 text-info border-info/20",
    em_triagem: "bg-warning/10 text-warning border-warning/20",
    concluido: "bg-success/10 text-success border-success/20",
    cancelado: "bg-destructive/10 text-destructive border-destructive/20"
  },

  // Priority
  priority: {
    ALTA: "bg-destructive/5 text-destructive border-destructive/20",
    MEDIA: "bg-warning/5 text-warning border-warning/20",
    BAIXA: "bg-success/5 text-success border-success/20"
  },

  // Semantic colors
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  success: "bg-success text-success",
  warning: "bg-warning text-warning",
  error: "bg-destructive text-destructive",
  info: "bg-info text-info"
} as const;