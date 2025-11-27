import { z } from 'zod';
import { stepsSchemas } from '@/lib/validations/os-etapas-schema';

/**
 * Gera valores padrão a partir de um schema Zod
 *
 * Esta função analisa a estrutura do schema e retorna um objeto com valores
 * padrão apropriados para cada tipo de campo, garantindo que componentes
 * React sejam sempre controlados (não recebem undefined).
 *
 * @param schema - Schema Zod a ser processado
 * @returns Objeto com valores padrão baseados no tipo de cada campo
 *
 * @example
 * ```typescript
 * const schema = z.object({
 *   nome: z.string(),
 *   idade: z.number(),
 *   ativo: z.boolean(),
 *   tags: z.array(z.string())
 * });
 *
 * const defaults = getSchemaDefaults(schema);
 * // { nome: '', idade: 0, ativo: false, tags: [] }
 * ```
 */
export function getSchemaDefaults<T extends z.ZodTypeAny>(schema: T): z.infer<T> {
  // Handle ZodObject (most common case)
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const defaults: Record<string, any> = {};

    for (const [key, fieldSchema] of Object.entries(shape)) {
      defaults[key] = getFieldDefault(fieldSchema as z.ZodTypeAny);
    }

    return defaults as z.infer<T>;
  }

  // Handle ZodOptional/ZodNullable - unwrap and get default of inner type
  if (schema instanceof z.ZodOptional || schema instanceof z.ZodNullable) {
    return getFieldDefault(schema._def.innerType);
  }

  // Fallback to field default
  return getFieldDefault(schema);
}

/**
 * Retorna o valor padrão apropriado para um tipo de campo Zod
 *
 * @param fieldSchema - Schema Zod do campo
 * @returns Valor padrão apropriado para o tipo
 */
function getFieldDefault(fieldSchema: z.ZodTypeAny): any {
  // Unwrap optional/nullable types
  if (fieldSchema instanceof z.ZodOptional || fieldSchema instanceof z.ZodNullable) {
    return getFieldDefault(fieldSchema._def.innerType);
  }

  // String fields -> empty string (prevents uncontrolled component warning)
  if (fieldSchema instanceof z.ZodString) {
    return '';
  }

  // Number fields -> 0
  if (fieldSchema instanceof z.ZodNumber) {
    return 0;
  }

  // Boolean fields -> false
  if (fieldSchema instanceof z.ZodBoolean) {
    return false;
  }

  // Array fields -> empty array
  if (fieldSchema instanceof z.ZodArray) {
    return [];
  }

  // Object fields -> recursively get defaults
  if (fieldSchema instanceof z.ZodObject) {
    return getSchemaDefaults(fieldSchema);
  }

  // Default fallback for unknown types
  return undefined;
}

/**
 * Gera valores padrão para uma etapa do workflow baseado no schema Zod
 *
 * Esta função é o ponto de entrada principal para obter valores padrão
 * de qualquer etapa do workflow (1-15). Ela garante que todos os
 * componentes de formulário recebam valores iniciais apropriados.
 *
 * @param stepNumber - Número da etapa (1-15)
 * @returns Objeto com valores padrão apropriados para cada campo da etapa
 *
 * @example
 * ```typescript
 * // Etapa 7 (Memorial/Escopo)
 * const defaults = getStepDefaults(7);
 * // {
 * //   objetivo: '',
 * //   etapasPrincipais: [],
 * //   planejamentoInicial: '',
 * //   logisticaTransporte: '',
 * //   preparacaoArea: ''
 * // }
 * ```
 */
export function getStepDefaults(stepNumber: number): any {
  const schema = stepsSchemas[stepNumber as keyof typeof stepsSchemas];

  if (!schema) {
    return {};
  }

  return getSchemaDefaults(schema);
}
