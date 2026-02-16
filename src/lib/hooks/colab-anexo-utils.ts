/**
 * colab-anexo-utils.ts
 *
 * Funções puras para upload de anexo por colaborador
 * na seção Mão de Obra da conciliação bancária.
 */

const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png'];

/**
 * Valida se a extensão do arquivo é permitida para anexo.
 * Aceita: pdf, jpg, jpeg, png (case insensitive).
 */
export function validarExtensaoAnexo(filename: string): boolean {
  if (!filename || filename.length === 0) return false;
  const parts = filename.split('.');
  if (parts.length < 2) return false;
  const ext = parts[parts.length - 1].toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}

/**
 * Gera path único para upload: mo-anexos/{lancId}/{colabId}_{timestamp}.{ext}
 */
export function gerarPathAnexo(
  colabId: string,
  lancamentoId: string,
  filename: string,
): string {
  const parts = filename.split('.');
  const ext = parts[parts.length - 1].toLowerCase();
  const timestamp = Date.now();
  return `mo-anexos/${lancamentoId}/${colabId}_${timestamp}.${ext}`;
}
