import React from 'react';
import { Checkbox } from './checkbox';
import { Label } from './label';
import { AlertCircle } from 'lucide-react';
import { cn } from './utils';

export interface FormCheckboxProps {
  label: React.ReactNode;
  error?: string;
  helperText?: string;
  required?: boolean;
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * FormCheckbox - Checkbox wrapper com validação visual
 *
 * Features:
 * - Label clicável ao lado do checkbox
 * - Mensagem de erro abaixo do campo
 * - Texto de ajuda (helper text)
 * - Indicador visual de erro (texto vermelho)
 * 
 * @example
 * ```tsx
 * <FormCheckbox
 *   id="termos"
 *   label="Aceito os termos e condições"
 *   required
 *   checked={formData.termos}
 *   onCheckedChange={(checked) => handleChange('termos', checked)}
 *   error={errors.termos}
 * />
 * ```
 */
export function FormCheckbox({
  label,
  error,
  required,
  helperText,
  className,
  id,
  checked,
  onCheckedChange,
  disabled,
}: FormCheckboxProps) {
  const hasError = !!error;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-start space-x-2">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          className={cn(hasError && "border-destructive aria-invalid:ring-destructive/20")}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? `${id}-error` : helperText ? `${id}-helper` : undefined
          }
        />
        <div className="grid gap-1.5 leading-none pt-0.5">
          <Label
            htmlFor={id}
            className={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              hasError && "text-destructive"
            )}
          >
            {label} {required && <span className="text-destructive">*</span>}
          </Label>
        </div>
      </div>

      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive flex items-center gap-1 ml-6">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {helperText && !error && (
        <p id={`${id}-helper`} className="text-xs text-muted-foreground ml-6">
          {helperText}
        </p>
      )}
    </div>
  );
}
