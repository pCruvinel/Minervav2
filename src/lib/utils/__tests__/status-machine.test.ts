import { describe, expect, it } from 'vitest';
import {
  getAvailableTransitions,
  isTerminalStatus,
  isValidTransition,
  KANBAN_TRANSITIONS,
} from '@/lib/utils/status-machine';

describe('KANBAN_TRANSITIONS', () => {
  it('permite apenas a próxima etapa visual do fluxo', () => {
    expect(getAvailableTransitions('pendente_aprovacao', KANBAN_TRANSITIONS)).toEqual(['em_divulgacao']);
    expect(getAvailableTransitions('em_divulgacao', KANBAN_TRANSITIONS)).toEqual(['entrevistas']);
    expect(getAvailableTransitions('entrevistas', KANBAN_TRANSITIONS)).toEqual(['finalizado']);
  });

  it('bloqueia saltos e retornos inválidos', () => {
    expect(isValidTransition('pendente_aprovacao', 'entrevistas', KANBAN_TRANSITIONS)).toBe(false);
    expect(isValidTransition('finalizado', 'em_divulgacao', KANBAN_TRANSITIONS)).toBe(false);
  });

  it('marca finalizado como estado terminal', () => {
    expect(isTerminalStatus('finalizado', KANBAN_TRANSITIONS)).toBe(true);
    expect(isTerminalStatus('em_divulgacao', KANBAN_TRANSITIONS)).toBe(false);
  });
});
