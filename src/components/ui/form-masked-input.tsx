import React from 'react';
import { Input } from './input';
import { Label } from './label';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from './utils';

export type MaskType = 'telefone' | 'celular' | 'cpf' | 'cnpj' | 'cpf-cnpj' | 'cep';

export interface FormMaskedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  id: string;
  maskType: MaskType;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Padrões de validação HTML5 para diferentes tipos de campos
 */
const PATTERNS: Record<MaskType, string> = {
  telefone: '\\([0-9]{2}\\) [0-9]{4,5}-[0-9]{4}',
  celular: '\\([0-9]{2}\\) [0-9]{5}-[0-9]{4}',
  cpf: '[0-9]{3}\\.[0-9]{3}\\.[0-9]{3}-[0-9]{2}',
  cnpj: '[0-9]{2}\\.[0-9]{3}\\.[0-9]{3}/[0-9]{4}-[0-9]{2}',
  'cpf-cnpj': '([0-9]{3}\\.[0-9]{3}\\.[0-9]{3}-[0-9]{2}|[0-9]{2}\\.[0-9]{3}\\.[0-9]{3}/[0-9]{4}-[0-9]{2})',
  cep: '[0-9]{5}-[0-9]{3}',
};

/**
 * Máximos de caracteres para cada tipo
 */
const MAX_LENGTHS: Record<MaskType, number> = {
  telefone: 15, // (99) 99999-9999
  celular: 15, // (99) 99999-9999
  cpf: 14, // 999.999.999-99
  cnpj: 18, // 99.999.999/9999-99
  'cpf-cnpj': 18, // Maior entre CPF e CNPJ
  cep: 9, // 99999-999
};

/**
 * Placeholder padrão para cada tipo de máscara
 */
const PLACEHOLDERS: Record<MaskType, string> = {
  telefone: '(00) 00000-0000',
  celular: '(00) 00000-0000',
  cpf: '000.000.000-00',
  cnpj: '00.000.000/0000-00',
  'cpf-cnpj': 'CPF ou CNPJ',
  cep: '00000-000',
};

/**
 * Aplica máscara ao valor digitado
 */
function applyMask(value: string, maskType: MaskType): string {
  const cleaned = value.replace(/\D/g, '');

  switch (maskType) {
    case 'telefone':
    case 'celular':
      if (cleaned.length <= 10) {
        // Telefone fixo: (99) 9999-9999
        return cleaned
          .replace(/(\d{2})(\d)/, '($1) $2')
          .replace(/(\d{4})(\d)/, '$1-$2');
      } else {
        // Celular: (99) 99999-9999
        return cleaned
          .replace(/(\d{2})(\d)/, '($1) $2')
          .replace(/(\d{5})(\d)/, '$1-$2');
      }

    case 'cpf':
      return cleaned
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');

    case 'cnpj':
      return cleaned
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
        .replace(/(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5');

    case 'cpf-cnpj':
      if (cleaned.length <= 11) {
        // Aplica máscara de CPF
        return cleaned
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
          .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
      } else {
        // Aplica máscara de CNPJ
        return cleaned
          .replace(/(\d{2})(\d)/, '$1.$2')
          .replace(/(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
          .replace(/(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
          .replace(/(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5');
      }

    case 'cep':
      return cleaned
        .replace(/(\d{5})(\d)/, '$1-$2');

    default:
      return value;
  }
}

/**
 * FormMaskedInput - Input com máscara e validação visual
 *
 * Features:
 * - Máscaras automáticas para telefone, CPF, CNPJ, CEP
 * - Auto-detecção de CPF/CNPJ baseado no tamanho
 * - Auto-detecção de telefone fixo/celular baseado no tamanho
 * - Borda vermelha + ícone de erro quando há erro
 * - Borda verde + ícone de sucesso quando válido
 * - Mensagem de erro abaixo do campo
 * - Texto de ajuda (helper text)
 * - Label com indicador de campo obrigatório
 *
 * @example
 * ```tsx
 * <FormMaskedInput
 *   id="telefone"
 *   label="Telefone"
 *   required
 *   maskType="telefone"
 *   value={formData.telefone}
 *   onChange={(e) => handleChange('telefone', e.target.value)}
 *   onBlur={() => validateField('telefone')}
 *   error={errors.telefone}
 *   success={!errors.telefone && formData.telefone.length >= 14}
 *   helperText="Digite o telefone com DDD"
 * />
 * ```
 */
export function FormMaskedInput({
  label,
  error,
  required,
  success,
  helperText,
  className,
  id,
  maskType,
  value,
  onChange,
  placeholder,
  ...props
}: FormMaskedInputProps) {
  const hasError = !!error;
  const hasSuccess = success && !hasError;

  const defaultPlaceholder = PLACEHOLDERS[maskType];
  const maxLength = MAX_LENGTHS[maskType];
  const pattern = PATTERNS[maskType];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const maskedValue = applyMask(rawValue, maskType);

    // Cria um evento sintético com o valor mascarado
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: maskedValue
      }
    };

    onChange(syntheticEvent);
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id}>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}

      <div className="relative">
        <Input
          id={id}
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder || defaultPlaceholder}
          maxLength={maxLength}
          pattern={pattern}
          inputMode="numeric"
          className={cn(
            className,
            hasError && "border-red-500 focus-visible:ring-red-500",
            hasSuccess && "border-green-500 focus-visible:ring-green-500"
          )}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? `${id}-error` : helperText ? `${id}-helper` : undefined
          }
          {...props}
        />

        {(hasError || hasSuccess) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {hasError && <AlertCircle className="h-4 w-4 text-red-500" />}
            {hasSuccess && <CheckCircle2 className="h-4 w-4 text-green-500" />}
          </div>
        )}
      </div>

      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {helperText && !error && (
        <p id={`${id}-helper`} className="text-xs text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
}

/**
 * Utility: Remove máscara de um valor (retorna apenas números)
 */
export function removeMask(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Utility: Valida CPF
 */
export function validarCPF(cpf: string): boolean {
  const cleaned = removeMask(cpf);
  if (cleaned.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleaned)) return false;

  // Valida dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  let digit1 = remainder >= 10 ? 0 : remainder;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  let digit2 = remainder >= 10 ? 0 : remainder;

  return (
    parseInt(cleaned.charAt(9)) === digit1 &&
    parseInt(cleaned.charAt(10)) === digit2
  );
}

/**
 * Utility: Valida CNPJ
 */
export function validarCNPJ(cnpj: string): boolean {
  const cleaned = removeMask(cnpj);
  if (cleaned.length !== 14) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cleaned)) return false;

  // Valida primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned.charAt(i)) * weights1[i];
  }
  let remainder = sum % 11;
  let digit1 = remainder < 2 ? 0 : 11 - remainder;

  // Valida segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned.charAt(i)) * weights2[i];
  }
  remainder = sum % 11;
  let digit2 = remainder < 2 ? 0 : 11 - remainder;

  return (
    parseInt(cleaned.charAt(12)) === digit1 &&
    parseInt(cleaned.charAt(13)) === digit2
  );
}

/**
 * Utility: Valida telefone (10 ou 11 dígitos)
 */
export function validarTelefone(telefone: string): boolean {
  const cleaned = removeMask(telefone);
  return cleaned.length === 10 || cleaned.length === 11;
}

/**
 * Utility: Valida CEP (8 dígitos)
 */
export function validarCEP(cep: string): boolean {
  const cleaned = removeMask(cep);
  return cleaned.length === 8;
}
