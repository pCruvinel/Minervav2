/**
 * Setup global para testes Vitest
 *
 * Este arquivo é executado antes de todos os testes
 */

import { expect } from 'vitest';

// Configurar timezone para testes consistentes
process.env.TZ = 'America/Sao_Paulo';
