import { Colaborador } from '@/types/colaborador';

// ============================================================
// TYPES
// ============================================================

export type ColaboradorStatusType = 'INATIVO' | 'PENDENTE' | 'BLOQUEADO' | 'ATIVO';

export interface ColaboradorStatusResult {
  label: string;
  type: ColaboradorStatusType;
  variant: 'destructive' | 'secondary' | 'default' | 'outline';
  className: string;
}

// ============================================================
// STATUS HIERARCHY
// ============================================================

/**
 * Retorna o status definitivo do colaborador com base na hierarquia de prioridade:
 * 1. INATIVO (vermelho)  — ativo === false
 * 2. PENDENTE (amarelo)  — ativo && status_convite !== 'ativo'
 * 3. BLOQUEADO (laranja) — ativo && bloqueado_sistema
 * 4. ATIVO (verde)       — fallback
 */
export function getColaboradorStatus(colaborador: Colaborador): ColaboradorStatusResult {
  // 1. INATIVO — prioridade máxima
  if (!colaborador.ativo) {
    return {
      label: 'Inativo',
      type: 'INATIVO',
      variant: 'destructive',
      className: 'bg-destructive/10 text-destructive border-destructive/30',
    };
  }

  // 2. PENDENTE — convite ainda não aceito
  if (colaborador.status_convite && colaborador.status_convite !== 'ativo') {
    return {
      label: 'Pendente',
      type: 'PENDENTE',
      variant: 'secondary',
      className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
    };
  }

  // 3. BLOQUEADO — acesso ao sistema bloqueado
  if (colaborador.bloqueado_sistema) {
    return {
      label: 'Bloqueado',
      type: 'BLOQUEADO',
      variant: 'secondary',
      className: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
    };
  }

  // 4. ATIVO — tudo ok
  return {
    label: 'Ativo',
    type: 'ATIVO',
    variant: 'default',
    className: 'bg-success/10 text-success border-success/30',
  };
}
