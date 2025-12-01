import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { Label } from './label';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from './utils';

export interface FormSelectOption {
  value: string;
  label: string;
}

export interface FormSelectProps {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  required?: boolean;
  id: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  options: FormSelectOption[];
  className?: string;
}

/**
 * FormSelect - Select wrapper com validação visual
 *
 * Features:
 * - Borda vermelha + ícone de erro quando há erro
 * - Borda verde + ícone de sucesso quando válido
 * - Mensagem de erro abaixo do campo
 * - Texto de ajuda (helper text)
 * - Label com indicador de campo obrigatório
 * - Acessibilidade com aria-invalid e aria-describedby
 *
 * @example
 * ```tsx
 * <FormSelect
 *   id="setor"
 *   label="Setor"
 *   required
 *   value={formData.setor}
 *   onValueChange={(value) => handleChange('setor', value)}
 *   error={errors.setor}
 *   success={!errors.setor && !!formData.setor}
 *   helperText="Selecione o setor responsável"
 *   options={[
 *     { value: 'obras', label: 'Obras' },
 *     { value: 'assessoria', label: 'Assessoria' },
 *   ]}
 *   placeholder="Selecione o setor"
 * />
 * ```
 */
export function FormSelect({
  label,
  error,
  required,
  success,
  helperText,
  className,
  id,
  value,
  onValueChange,
  placeholder,
  disabled,
  options,
}: FormSelectProps) {
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
        <Select value={value} onValueChange={onValueChange} disabled={disabled}>
          <SelectTrigger
            id={id}
            className={cn(
              className,
              hasError && "border-destructive focus:ring-red-500",
              hasSuccess && "border-success focus:ring-green-500"
            )}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? `${id}-error` : helperText ? `${id}-helper` : undefined
            }
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(hasError || hasSuccess) && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none">
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
