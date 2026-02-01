import React from 'react';
import { Switch } from './switch';
import { Label } from './label';
import { AlertCircle } from 'lucide-react';
import { cn } from './utils';

export interface FormSwitchProps {
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
 * FormSwitch - Switch wrapper com validação visual
 *
 * Features:
 * - Label clicável ao lado do switch
 * - Mensagem de erro abaixo do campo
 * - Texto de ajuda (helper text)
 * 
 * @example
 * ```tsx
 * <FormSwitch
 *   id="notificacoes"
 *   label="Receber notificações por email"
 *   checked={formData.notificacoes}
 *   onCheckedChange={(checked) => handleChange('notificacoes', checked)}
 * />
 * ```
 */
export function FormSwitch({
  label,
  error,
  required,
  helperText,
  className,
  id,
  checked,
  onCheckedChange,
  disabled,
}: FormSwitchProps) {
  const hasError = !!error;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center space-x-2">
        <Switch
          id={id}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          className={cn(hasError && "border-destructive")}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? `${id}-error` : helperText ? `${id}-helper` : undefined
          }
        />
        <Label
            htmlFor={id}
            className={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer",
              hasError && "text-destructive"
            )}
          >
            {label} {required && <span className="text-destructive">*</span>}
          </Label>
      </div>

      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive flex items-center gap-1 ml-12">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {helperText && !error && (
        <p id={`${id}-helper`} className="text-xs text-muted-foreground ml-12">
          {helperText}
        </p>
      )}
    </div>
  );
}
