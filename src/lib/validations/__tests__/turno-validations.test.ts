/**
 * Tests for Turno Validations
 *
 * @module turno-validations.test
 */

import {
  converterParaMinutos,
  verificarSobreposicao,
  validarHorarioOperacional,
  validarDuracao,
  validarSobreposicaoComExistentes,
  calcularDuracao,
} from '../turno-validations';

// =====================================================
// TEST DATA
// =====================================================

interface TestTurno {
  horaInicio: string;
  horaFim: string;
}

// =====================================================
// UNIT TESTS
// =====================================================

describe('converterParaMinutos', () => {
  test('should convert valid time strings to minutes', () => {
    expect(converterParaMinutos('00:00')).toBe(0);
    expect(converterParaMinutos('01:00')).toBe(60);
    expect(converterParaMinutos('09:00')).toBe(540);
    expect(converterParaMinutos('12:30')).toBe(750);
    expect(converterParaMinutos('23:59')).toBe(1439);
  });

  test('should handle edge cases', () => {
    const midday = converterParaMinutos('12:00');
    expect(midday).toBe(720);

    const midnight = converterParaMinutos('00:00');
    expect(midnight).toBe(0);
  });
});

describe('verificarSobreposicao', () => {
  test('should detect overlapping shifts', () => {
    const turno1: TestTurno = { horaInicio: '09:00', horaFim: '11:00' };
    const turno2: TestTurno = { horaInicio: '10:00', horaFim: '12:00' };

    const overlap = verificarSobreposicao(turno1, turno2);
    expect(overlap).toBe(true);
  });

  test('should not detect adjacent shifts as overlapping', () => {
    const turno1: TestTurno = { horaInicio: '09:00', horaFim: '11:00' };
    const turno2: TestTurno = { horaInicio: '11:00', horaFim: '13:00' };

    const overlap = verificarSobreposicao(turno1, turno2);
    expect(overlap).toBe(false);
  });

  test('should handle completely separate shifts', () => {
    const turno1: TestTurno = { horaInicio: '09:00', horaFim: '11:00' };
    const turno2: TestTurno = { horaInicio: '14:00', horaFim: '16:00' };

    const overlap = verificarSobreposicao(turno1, turno2);
    expect(overlap).toBe(false);
  });

  test('should detect when one shift contains another', () => {
    const turno1: TestTurno = { horaInicio: '09:00', horaFim: '17:00' };
    const turno2: TestTurno = { horaInicio: '10:00', horaFim: '12:00' };

    const overlap = verificarSobreposicao(turno1, turno2);
    expect(overlap).toBe(true);
  });

  test('should be commutative (order should not matter)', () => {
    const turno1: TestTurno = { horaInicio: '09:00', horaFim: '11:00' };
    const turno2: TestTurno = { horaInicio: '10:00', horaFim: '12:00' };

    const overlap1 = verificarSobreposicao(turno1, turno2);
    const overlap2 = verificarSobreposicao(turno2, turno1);

    expect(overlap1).toBe(overlap2);
    expect(overlap1).toBe(true);
  });
});

describe('validarHorarioOperacional', () => {
  test('should accept valid operational hours', () => {
    const result = validarHorarioOperacional('10:00', '08:00', '18:00');

    expect(result.valido).toBe(true);
    expect(result.erro).toBeUndefined();
  });

  test('should reject hours before minimum', () => {
    const result = validarHorarioOperacional('07:00', '08:00', '18:00');

    expect(result.valido).toBe(false);
    expect(result.erro).toBeDefined();
  });

  test('should reject hours after maximum', () => {
    const result = validarHorarioOperacional('19:00', '08:00', '18:00');

    expect(result.valido).toBe(false);
    expect(result.erro).toBeDefined();
  });

  test('should use default hours if not provided', () => {
    const result = validarHorarioOperacional('10:00'); // Default: 08:00-18:00

    expect(result.valido).toBe(true);
  });
});

describe('validarDuracao', () => {
  test('should accept valid durations', () => {
    const result = validarDuracao('09:00', '11:00'); // 2h = 120min

    expect(result.valido).toBe(true);
  });

  test('should reject durations shorter than minimum (30min)', () => {
    const result = validarDuracao('09:00', '09:15'); // 15min

    expect(result.valido).toBe(false);
    expect(result.erro).toBeDefined();
  });

  test('should reject durations longer than maximum (240min)', () => {
    const result = validarDuracao('09:00', '13:01'); // 241min

    expect(result.valido).toBe(false);
    expect(result.erro).toBeDefined();
  });

  test('should accept boundary durations', () => {
    const result30 = validarDuracao('09:00', '09:30'); // Exactly 30min
    expect(result30.valido).toBe(true);

    const result240 = validarDuracao('09:00', '13:00'); // Exactly 240min
    expect(result240.valido).toBe(true);
  });

  test('should handle custom min/max durations', () => {
    const result = validarDuracao('09:00', '10:00', 45, 120); // 60min, custom: 45-120

    expect(result.valido).toBe(true);
  });
});

describe('calcularDuracao', () => {
  test('should calculate duration correctly', () => {
    const result = calcularDuracao('09:00', '11:00');

    expect(result.minutos).toBe(120);
    expect(result.horas).toBe(2);
    expect(result.minutosResto).toBe(0);
    expect(result.texto).toContain('2h');
  });

  test('should handle partial hours', () => {
    const result = calcularDuracao('09:00', '10:30');

    expect(result.minutos).toBe(90);
    expect(result.horas).toBe(1);
    expect(result.minutosResto).toBe(30);
    expect(result.texto).toContain('1h 30min');
  });

  test('should format duration text correctly', () => {
    const result = calcularDuracao('09:00', '13:45');

    expect(result.minutos).toBe(285);
    expect(result.horas).toBe(4);
    expect(result.minutosResto).toBe(45);
    expect(result.texto).toBe('4h 45min');
  });
});

describe('validarSobreposicaoComExistentes', () => {
  test('should detect overlap with existing shifts', () => {
    const novoTurno: TestTurno = { horaInicio: '10:00', horaFim: '12:00' };
    const turnosExistentes: TestTurno[] = [{ horaInicio: '09:00', horaFim: '11:00' }];

    const result = validarSobreposicaoComExistentes(novoTurno, turnosExistentes);

    expect(result.valido).toBe(false);
    expect(result.erro).toBeDefined();
  });

  test('should allow non-overlapping shifts', () => {
    const novoTurno: TestTurno = { horaInicio: '13:00', horaFim: '15:00' };
    const turnosExistentes: TestTurno[] = [{ horaInicio: '09:00', horaFim: '11:00' }];

    const result = validarSobreposicaoComExistentes(novoTurno, turnosExistentes);

    expect(result.valido).toBe(true);
  });

  test('should check against multiple existing shifts', () => {
    const novoTurno: TestTurno = { horaInicio: '11:00', horaFim: '13:00' };
    const turnosExistentes: TestTurno[] = [
      { horaInicio: '09:00', horaFim: '10:00' },
      { horaInicio: '10:00', horaFim: '11:00' },
      { horaInicio: '13:00', horaFim: '14:00' },
    ];

    const result = validarSobreposicaoComExistentes(novoTurno, turnosExistentes);

    expect(result.valido).toBe(true); // No overlap
  });

  test('should handle empty existing shifts list', () => {
    const novoTurno: TestTurno = { horaInicio: '09:00', horaFim: '11:00' };
    const turnosExistentes: TestTurno[] = [];

    const result = validarSobreposicaoComExistentes(novoTurno, turnosExistentes);

    expect(result.valido).toBe(true);
  });
});

// =====================================================
// INTEGRATION TESTS
// =====================================================

describe('Validation Workflow', () => {
  test('should validate complete shift creation', () => {
    const novoTurno: TestTurno = { horaInicio: '09:00', horaFim: '11:00' };

    // Check duration
    const duracao = validarDuracao(novoTurno.horaInicio, novoTurno.horaFim);
    expect(duracao.valido).toBe(true);

    // Check operational hours
    const horario = validarHorarioOperacional(novoTurno.horaInicio);
    expect(horario.valido).toBe(true);

    // Check overlap with existing
    const existentes: TestTurno[] = [{ horaInicio: '11:00', horaFim: '13:00' }];
    const overlap = validarSobreposicaoComExistentes(novoTurno, existentes);
    expect(overlap.valido).toBe(true);

    // All checks passed
    expect(duracao.valido && horario.valido && overlap.valido).toBe(true);
  });

  test('should reject invalid shift creation', () => {
    const novoTurno: TestTurno = { horaInicio: '10:00', horaFim: '10:15' }; // Too short

    const duracao = validarDuracao(novoTurno.horaInicio, novoTurno.horaFim);
    expect(duracao.valido).toBe(false);
  });
});

// =====================================================
// RUN MANUAL TESTS
// =====================================================

console.log('✅ Turno Validations Tests (Manual)');
console.log('');

// Test 1: Time conversion
console.log('Test: converterParaMinutos');
const min = converterParaMinutos('09:30');
console.log(`  Result: ${min === 570 ? '✅ PASS' : '❌ FAIL'} (09:30 = ${min} minutes)`);

// Test 2: Overlap detection
console.log('Test: verificarSobreposicao');
const turno1 = { horaInicio: '09:00', horaFim: '11:00' };
const turno2 = { horaInicio: '10:00', horaFim: '12:00' };
const overlap = verificarSobreposicao(turno1, turno2);
console.log(`  Result: ${overlap ? '✅ PASS' : '❌ FAIL'} (Overlap detected: ${overlap})`);

// Test 3: No overlap for adjacent
console.log('Test: Adjacent shifts');
const turno3 = { horaInicio: '09:00', horaFim: '11:00' };
const turno4 = { horaInicio: '11:00', horaFim: '13:00' };
const adjacent = verificarSobreposicao(turno3, turno4);
console.log(`  Result: ${!adjacent ? '✅ PASS' : '❌ FAIL'} (Adjacent OK: ${!adjacent})`);

// Test 4: Duration validation
console.log('Test: validarDuracao');
const validDuration = validarDuracao('09:00', '11:00');
const invalidDuration = validarDuracao('09:00', '09:15');
console.log(
  `  Result: ${validDuration.valido && !invalidDuration.valido ? '✅ PASS' : '❌ FAIL'} (Valid: ${validDuration.valido}, Invalid: ${!invalidDuration.valido})`
);

// Test 5: Duration calculation
console.log('Test: calcularDuracao');
const calc = calcularDuracao('09:00', '12:30');
console.log(`  Result: ${calc.minutos === 210 ? '✅ PASS' : '❌ FAIL'} (09:00-12:30 = ${calc.minutos} minutes, ${calc.texto})`);

// Test 6: Operational hours
console.log('Test: validarHorarioOperacional');
const validOp = validarHorarioOperacional('10:00', '08:00', '18:00');
const invalidOp = validarHorarioOperacional('19:00', '08:00', '18:00');
console.log(`  Result: ${validOp.valido && !invalidOp.valido ? '✅ PASS' : '❌ FAIL'} (Valid: ${validOp.valido}, Invalid: ${!invalidOp.valido})`);

// Test 7: Overlap with existing
console.log('Test: validarSobreposicaoComExistentes');
const novo = { horaInicio: '13:00', horaFim: '15:00' };
const existentes = [{ horaInicio: '09:00', horaFim: '11:00' }];
const noOverlap = validarSobreposicaoComExistentes(novo, existentes);
console.log(`  Result: ${noOverlap.valido ? '✅ PASS' : '❌ FAIL'} (No overlap: ${noOverlap.valido})`);

console.log('');
console.log('✅ All manual tests completed');
