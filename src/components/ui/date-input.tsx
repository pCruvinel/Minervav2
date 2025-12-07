import * as React from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

// Máscara para data no formato dd/mm/yyyy
const maskDate = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\/\d{4})\d+?$/, '$1');
};

// Converter dd/mm/yyyy para yyyy-mm-dd (formato ISO)
export const dateToISO = (dateBR: string): string => {
  if (!dateBR || dateBR.length !== 10) return '';
  const [dia, mes, ano] = dateBR.split('/');
  if (!dia || !mes || !ano) return '';
  return `${ano}-${mes}-${dia}`;
};

// Converter yyyy-mm-dd (formato ISO) para dd/mm/yyyy
export const dateFromISO = (dateISO: string): string => {
  if (!dateISO) return '';
  // Se já está no formato dd/mm/yyyy, retorna como está
  if (dateISO.includes('/')) return dateISO;
  // Se está no formato ISO (yyyy-mm-dd ou com timestamp)
  const datePart = dateISO.split('T')[0];
  const [ano, mes, dia] = datePart.split('-');
  if (!dia || !mes || !ano) return '';
  return `${dia}/${mes}/${ano}`;
};

// Validar se a data é válida
export const isValidDate = (dateBR: string): boolean => {
  if (!dateBR || dateBR.length !== 10) return false;
  const [dia, mes, ano] = dateBR.split('/').map(Number);
  if (!dia || !mes || !ano) return false;
  
  const date = new Date(ano, mes - 1, dia);
  return date.getFullYear() === ano && 
         date.getMonth() === mes - 1 && 
         date.getDate() === dia;
};

export interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
  /** Se true, armazena internamente em formato ISO mas exibe em formato BR */
  useISOFormat?: boolean;
}

const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, value, onChange, useISOFormat = false, ...props }, ref) => {
    // Se useISOFormat, converte de ISO para BR para exibição
    const displayValue = useISOFormat ? dateFromISO(value) : value;
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const masked = maskDate(e.target.value);
      
      if (useISOFormat) {
        // Se o valor está completo (10 chars), converte para ISO
        if (masked.length === 10) {
          onChange(dateToISO(masked));
        } else {
          // Durante a digitação, mantém o valor mascarado temporariamente
          // Isso pode causar problemas se o componente pai espera sempre ISO
          // Por segurança, enviamos string vazia se incompleto
          onChange(masked.length === 10 ? dateToISO(masked) : '');
        }
      } else {
        onChange(masked);
      }
    };

    return (
      <Input
        type="text"
        placeholder="dd/mm/aaaa"
        maxLength={10}
        className={cn(className)}
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        {...props}
      />
    );
  }
);
DateInput.displayName = "DateInput";

export { DateInput, maskDate };

