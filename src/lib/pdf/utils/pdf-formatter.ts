/**
 * Utilitários de formatação para geração de PDFs
 */

/**
 * Formata valor monetário para BRL
 */
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

/**
 * Formata data para formato brasileiro
 */
export function formatarData(data: string | Date): string {
  const d = typeof data === 'string' ? new Date(data) : data;
  return new Intl.DateTimeFormat('pt-BR').format(d);
}

/**
 * Formata data com hora
 */
export function formatarDataHora(data: string | Date): string {
  const d = typeof data === 'string' ? new Date(data) : data;
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(d);
}

/**
 * Formata CPF
 */
export function formatarCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '');
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata CNPJ
 */
export function formatarCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, '');
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

/**
 * Formata CPF ou CNPJ automaticamente
 */
export function formatarCpfCnpj(documento: string): string {
  const cleaned = documento.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return formatarCPF(cleaned);
  } else if (cleaned.length === 14) {
    return formatarCNPJ(cleaned);
  }
  return documento;
}

/**
 * Formata telefone
 */
export function formatarTelefone(telefone: string): string {
  const cleaned = telefone.replace(/\D/g, '');

  // Celular (11 dígitos)
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }

  // Fixo (10 dígitos)
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  return telefone;
}

/**
 * Formata CEP
 */
export function formatarCEP(cep: string): string {
  const cleaned = cep.replace(/\D/g, '');
  return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
}

/**
 * Capitaliza primeira letra de cada palavra
 */
export function capitalize(texto: string): string {
  return texto
    .toLowerCase()
    .split(' ')
    .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(' ');
}

/**
 * Trunca texto com ellipsis
 */
export function truncate(texto: string, maxLength: number): string {
  if (texto.length <= maxLength) return texto;
  return texto.substring(0, maxLength - 3) + '...';
}
