import React from 'react';
import { RadioGroup, RadioGroupItem } from './radio-group';
import { Label } from './label';
import { AlertCircle } from 'lucide-react';
import { cn } from './utils';

export interface FormRadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FormRadioGroupProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  id: string;
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  options: FormRadioOption[];
  className?: string;
  layout?: 'vertical' | 'horizontal';
}

/**
 * FormRadioGroup - RadioGroup wrapper com validação visual
 *
 * Features:
 * - Renderização via options para facilidade de uso
 * - Layout vertical ou horizontal
 * - Mensagem de erro e helper text
 * 
 * @example
 * ```tsx
 * <FormRadioGroup
 *   id="tipo_pessoa"
 *   label="Tipo de Pessoa"
 *   value={formData.tipo}
 *   onValueChange={(val) => handleChange('tipo', val)}
 *   options={[
 *     { value: 'PF', label: 'Pessoa Física' },
 *     { value: 'PJ', label: 'Pessoa Jurídica' }
 *   ]}
 *   layout="horizontal"
 *   error={errors.tipo}
 * />
 * ```
 */
export function FormRadioGroup({
  label,
  error,
  required,
  helperText,
  className,
  id,
  value,
  onValueChange,
  disabled,
  options,
  layout = 'vertical',
}: FormRadioGroupProps) {
  const hasError = !!error;

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <Label className={cn(hasError && "text-destructive")}>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}

      <RadioGroup
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        className={cn(
          layout === 'horizontal' ? "flex flex-row space-x-4 space-y-0" : "flex flex-col space-y-2"
        )}
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem 
              value={option.value} 
              id={`${id}-${option.value}`}
              className={cn(hasError && "border-destructive text-destructive")} 
              disabled={option.disabled}
            />
            <Label 
              htmlFor={`${id}-${option.value}`}
              className={cn("font-normal cursor-pointer", hasError && "text-destructive")}
            >
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>

      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {helperText && !error && (
        <p className="text-xs text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
}
