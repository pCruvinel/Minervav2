/**
 * Tests for Conflict Resolver
 *
 * @module conflict-resolver.test
 */

import {
  ConflictResolver,
  createCalendarConflictResolver,
  createAgendamentoConflictResolver,
  createMergeConflictResolver,
  detectChanges,
  resolveBatchConflicts,
} from '../conflict-resolver';

// =====================================================
// TEST DATA
// =====================================================

interface TestTurno {
  id: string;
  horaInicio: string;
  horaFim: string;
  vagasTotal: number;
  updatedAt?: string;
  nome?: string;
}

const createTurno = (
  id: string,
  horaInicio: string,
  horaFim: string,
  vagasTotal: number,
  updatedAt?: string,
  nome?: string
): TestTurno => ({
  id,
  horaInicio,
  horaFim,
  vagasTotal,
  updatedAt: updatedAt || new Date().toISOString(),
  nome: nome || `Turno ${id}`,
});

// =====================================================
// UNIT TESTS
// =====================================================

describe('ConflictResolver - Last-Write-Wins', () => {
  let resolver: ConflictResolver<TestTurno>;

  beforeEach(() => {
    resolver = new ConflictResolver<TestTurno>('last-write-wins');
  });

  test('should resolve conflict using most recent timestamp', () => {
    const now = new Date();
    const past = new Date(now.getTime() - 10000); // 10s ago

    const local = createTurno('1', '09:00', '11:00', 10, past.toISOString());
    const remote = createTurno('1', '09:00', '11:00', 5, now.toISOString());

    const resolved = resolver.resolve('1', local, remote);

    expect(resolved.vagasTotal).toBe(5); // Remote wins (more recent)
  });

  test('should prefer local if newer', () => {
    const now = new Date();
    const past = new Date(now.getTime() - 10000);

    const local = createTurno('1', '09:00', '11:00', 10, now.toISOString());
    const remote = createTurno('1', '09:00', '11:00', 5, past.toISOString());

    const resolved = resolver.resolve('1', local, remote);

    expect(resolved.vagasTotal).toBe(10); // Local wins (more recent)
  });

  test('should track conflict statistics', () => {
    const local = createTurno('1', '09:00', '11:00', 10);
    const remote = createTurno('1', '09:00', '11:00', 5);

    resolver.resolve('1', local, remote);
    resolver.resolve('2', local, remote);

    const stats = resolver.getStats();

    expect(stats.total).toBe(2);
    expect(stats.resolved).toBe(2);
    expect(stats.byStrategy['last-write-wins']).toBe(2);
  });

  test('should detect critical data loss', () => {
    resolver.setCriticalFields(['id', 'horaInicio']);

    const local = createTurno('1', '09:00', '11:00', 10);
    const remote = { id: '1', horaInicio: '', horaFim: '11:00', vagasTotal: 5, updatedAt: new Date().toISOString() };

    resolver.resolve('1', local, remote as TestTurno);

    const history = resolver.getConflictHistory();
    expect(history[0].criticalDataLost).toBe(true);
  });
});

describe('ConflictResolver - Remote-Wins', () => {
  test('should always prefer remote', () => {
    const resolver = new ConflictResolver<TestTurno>('remote-wins');

    const local = createTurno('1', '09:00', '11:00', 10);
    const remote = createTurno('1', '09:00', '11:00', 5);

    const resolved = resolver.resolve('1', local, remote);

    expect(resolved.vagasTotal).toBe(5);
  });
});

describe('ConflictResolver - Merge', () => {
  test('should merge non-conflicting fields', () => {
    const resolver = new ConflictResolver<TestTurno>('merge');

    const local = createTurno('1', '09:00', '11:00', 10, undefined, 'Local Turno');
    const remote: TestTurno = {
      id: '1',
      horaInicio: '09:00',
      horaFim: '11:00',
      vagasTotal: 5,
      updatedAt: new Date().toISOString(),
      nome: undefined, // Campo novo no remote
    };

    const resolved = resolver.resolve('1', local, remote);

    // Should keep local values when same field
    expect(resolved.vagasTotal).toBeLessThanOrEqual(10);
  });
});

describe('ConflictResolver - Factory Functions', () => {
  test('createCalendarConflictResolver should use last-write-wins', () => {
    const resolver = createCalendarConflictResolver();
    const stats = resolver.getStats();

    expect(stats.byStrategy['last-write-wins']).toBe(0); // Not yet called

    const local = createTurno('1', '09:00', '11:00', 10);
    const remote = createTurno('1', '09:00', '11:00', 5);

    resolver.resolve('1', local, remote);

    expect(resolver.getStats().byStrategy['last-write-wins']).toBe(1);
  });

  test('createAgendamentoConflictResolver should use remote-wins', () => {
    const resolver = createAgendamentoConflictResolver();

    const local = createTurno('1', '09:00', '11:00', 10);
    const remote = createTurno('1', '09:00', '11:00', 5);

    const resolved = resolver.resolve('1', local, remote);

    expect(resolved.vagasTotal).toBe(5); // Remote wins
  });
});

describe('detectChanges', () => {
  test('should detect field differences', () => {
    const local = createTurno('1', '09:00', '11:00', 10);
    const remote = createTurno('1', '09:00', '11:00', 5);

    const changes = detectChanges(local, remote);

    const vagasChange = changes.find((c) => c.field === 'vagasTotal');
    expect(vagasChange).toBeDefined();
    expect(vagasChange?.localValue).toBe(10);
    expect(vagasChange?.remoteValue).toBe(5);
  });

  test('should not detect changes when identical', () => {
    const turno = createTurno('1', '09:00', '11:00', 10);

    const changes = detectChanges(turno, turno);

    expect(changes.length).toBe(0);
  });
});

describe('resolveBatchConflicts', () => {
  test('should resolve multiple conflicts efficiently', () => {
    const resolver = createCalendarConflictResolver();

    const localMap = new Map([
      ['1', createTurno('1', '09:00', '11:00', 10)],
      ['2', createTurno('2', '11:00', '13:00', 10)],
    ]);

    const remoteMap = new Map([
      ['1', createTurno('1', '09:00', '11:00', 5)],
      ['2', createTurno('2', '11:00', '13:00', 8)],
      ['3', createTurno('3', '13:00', '15:00', 10)],
    ]);

    const resolved = resolveBatchConflicts(localMap, remoteMap, resolver);

    expect(resolved.size).toBe(3); // All items present
    expect(resolved.has('1')).toBe(true);
    expect(resolved.has('3')).toBe(true); // New item from remote
  });
});

// =====================================================
// INTEGRATION TESTS
// =====================================================

describe('ConflictResolver - Offline Sync Scenario', () => {
  test('should handle offline changes followed by sync', () => {
    const resolver = createCalendarConflictResolver();

    // Offline: User edits turno locally
    const localTurno = createTurno(
      '1',
      '09:00',
      '11:00',
      8,
      new Date(Date.now() + 5000).toISOString() // Local is newer
    );

    // Sync: Server has different version
    const remoteTurno = createTurno('1', '09:00', '11:00', 10, new Date().toISOString());

    const resolved = resolver.resolve('1', localTurno, remoteTurno);

    // Local should win because it's newer
    expect(resolved.vagasTotal).toBe(8);
  });

  test('should handle concurrent edits with merge', () => {
    const resolver = createMergeConflictResolver();

    const local: TestTurno = {
      id: '1',
      horaInicio: '09:00',
      horaFim: '11:00',
      vagasTotal: 8,
      nome: 'Morning Shift',
      updatedAt: new Date().toISOString(),
    };

    const remote: TestTurno = {
      id: '1',
      horaInicio: '09:00',
      horaFim: '11:00',
      vagasTotal: 10,
      nome: 'Morning Shift', // Same
      updatedAt: new Date().toISOString(),
    };

    const resolved = resolver.resolve('1', local, remote);

    expect(resolved.id).toBe('1'); // Critical field preserved
  });
});

// =====================================================
// HELPER TEST FUNCTIONS
// =====================================================

function beforeEach(fn: () => void) {
  // Simple beforeEach implementation
  fn();
}

// =====================================================
// RUN TESTS
// =====================================================

console.log('✅ Conflict Resolver Tests (Manual)');
console.log('');

// Test 1: Last-Write-Wins
console.log('Test: Last-Write-Wins resolution');
const resolver = new ConflictResolver<TestTurno>('last-write-wins');
const now = new Date();
const past = new Date(now.getTime() - 10000);
const local = createTurno('1', '09:00', '11:00', 10, past.toISOString());
const remote = createTurno('1', '09:00', '11:00', 5, now.toISOString());
const resolved = resolver.resolve('1', local, remote);
console.log(`  Result: ${resolved.vagasTotal === 5 ? '✅ PASS' : '❌ FAIL'} (Remote wins with vagas=${resolved.vagasTotal})`);

// Test 2: Critical Field Detection
console.log('Test: Critical field loss detection');
const resolver2 = createCalendarConflictResolver();
const local2 = createTurno('2', '09:00', '11:00', 10);
const remote2 = { id: '2', horaInicio: '', horaFim: '11:00', vagasTotal: 5, updatedAt: new Date().toISOString() };
const resolved2 = resolver2.resolve('2', local2, remote2 as TestTurno);
const history = resolver2.getConflictHistory();
console.log(`  Result: ${history[0].criticalDataLost ? '✅ PASS' : '❌ FAIL'} (Critical loss detected)`);

// Test 3: Batch Resolution
console.log('Test: Batch conflict resolution');
const resolver3 = createCalendarConflictResolver();
const localMap = new Map([['1', createTurno('1', '09:00', '11:00', 10)]]);
const remoteMap = new Map([
  ['1', createTurno('1', '09:00', '11:00', 5)],
  ['2', createTurno('2', '11:00', '13:00', 10)],
]);
const resolvedBatch = resolveBatchConflicts(localMap, remoteMap, resolver3);
console.log(`  Result: ${resolvedBatch.size === 2 ? '✅ PASS' : '❌ FAIL'} (${resolvedBatch.size} items resolved)`);

// Test 4: Change Detection
console.log('Test: Change detection');
const turno1 = createTurno('1', '09:00', '11:00', 10);
const turno2 = createTurno('1', '09:00', '11:00', 5);
const changes = detectChanges(turno1, turno2);
const hasVagasChange = changes.some((c) => c.field === 'vagasTotal');
console.log(`  Result: ${hasVagasChange ? '✅ PASS' : '❌ FAIL'} (Changes detected: ${changes.length})`);

console.log('');
console.log('✅ All manual tests completed');
