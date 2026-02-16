/**
 * TDD Tests — Colaborador Anexo utilities
 *
 * Testes para funções puras de upload de anexo por colaborador
 * na conciliação bancária Mão de Obra.
 */
import { describe, it, expect } from 'vitest';
import {
  validarExtensaoAnexo,
  gerarPathAnexo,
} from '../colab-anexo-utils';

// ============================================================
// validarExtensaoAnexo
// ============================================================

describe('validarExtensaoAnexo', () => {
  it('aceita .pdf', () => {
    expect(validarExtensaoAnexo('nota.pdf')).toBe(true);
  });

  it('aceita .jpg', () => {
    expect(validarExtensaoAnexo('foto.jpg')).toBe(true);
  });

  it('aceita .jpeg', () => {
    expect(validarExtensaoAnexo('comprovante.jpeg')).toBe(true);
  });

  it('aceita .png', () => {
    expect(validarExtensaoAnexo('scan.png')).toBe(true);
  });

  it('aceita extensão em maiúsculo', () => {
    expect(validarExtensaoAnexo('DOC.PDF')).toBe(true);
  });

  it('rejeita .exe', () => {
    expect(validarExtensaoAnexo('virus.exe')).toBe(false);
  });

  it('rejeita .doc', () => {
    expect(validarExtensaoAnexo('relatorio.doc')).toBe(false);
  });

  it('rejeita arquivo sem extensão', () => {
    expect(validarExtensaoAnexo('arquivo')).toBe(false);
  });

  it('rejeita string vazia', () => {
    expect(validarExtensaoAnexo('')).toBe(false);
  });
});

// ============================================================
// gerarPathAnexo
// ============================================================

describe('gerarPathAnexo', () => {
  it('gera path no formato mo-anexos/{lancId}/{colabId}_*.ext', () => {
    const path = gerarPathAnexo('colab-123', 'lanc-456', 'nota.pdf');
    expect(path).toMatch(/^mo-anexos\/lanc-456\/colab-123_\d+\.pdf$/);
  });

  it('preserva extensão original', () => {
    const path = gerarPathAnexo('c1', 'l1', 'foto.jpg');
    expect(path).toMatch(/\.jpg$/);
  });

  it('preserva extensão PNG', () => {
    const path = gerarPathAnexo('c1', 'l1', 'scan.png');
    expect(path).toMatch(/\.png$/);
  });

  it('normaliza extensão para lowercase', () => {
    const path = gerarPathAnexo('c1', 'l1', 'DOC.PDF');
    expect(path).toMatch(/\.pdf$/);
  });
});
