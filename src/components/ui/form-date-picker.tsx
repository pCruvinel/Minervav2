import React from 'react';
import { DatePicker } from './date-picker';
import { Label } from './label';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from './utils';

export interface FormDatePickerProps {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  id: string;
  value?: string;
  onChange: (date: string) => void;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  className?: string;
}

/**
 * FormDatePicker - DatePicker wrapper com validação visual
 *
 * Features:
 * - Borda vermelha + ícone de erro quando há erro
 * - Borda verde + ícone de sucesso quando válido
 * - Mensagem de erro abaixo do campo
 * - Texto de ajuda (helper text)
 * - Label com indicador de campo obrigatório
 *
 * @example
 * ```tsx
 * <FormDatePicker
 *   id="data_nascimento"
 *   label="Data de Nascimento"
 *   required
 *   value={formData.data_nascimento}
 *   onChange={(date) => handleChange('data_nascimento', date)}
 *   error={errors.data_nascimento}
 *   success={!errors.data_nascimento && !!formData.data_nascimento}
 * />
 * ```
 */
export function FormDatePicker({
  label,
  error,
  required,
  success,
  helperText,
  className,
  id,
  value,
  onChange,
  placeholder,
  disabled,
  minDate,
  maxDate,
}: FormDatePickerProps) {
  const hasError = !!error;
  const hasSuccess = success && !hasError;

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id}>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}

      <div className="relative">
        <DatePicker
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          minDate={minDate}
          maxDate={maxDate}
          hasError={hasError}
          className={cn(
            className,
            hasError && "border-destructive focus:ring-red-500",
            hasSuccess && "border-success focus:ring-green-500"
          )}
        />

        {(hasError || hasSuccess) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {hasError && <AlertCircle className="h-4 w-4 text-destructive" />}
            {hasSuccess && <CheckCircle2 className="h-4 w-4 text-success" />}
          </div>
        )}
      </div>

      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive flex items-center gap-1">
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
