"use client";

import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  value?: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: string; // YYYY-MM-DD
  maxDate?: string; // YYYY-MM-DD
  className?: string;
  hasError?: boolean;
}

/**
 * DatePicker - Componente de seleção de data com formato dd/MM/yyyy
 * 
 * Usa Popover + Calendar do shadcn/ui.
 * Exibe a data no formato brasileiro (dd/MM/yyyy).
 */
export function DatePicker({
  value,
  onChange,
  placeholder = "Selecione uma data",
  disabled = false,
  minDate,
  maxDate,
  className,
  hasError = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Converter string YYYY-MM-DD para Date
  const selectedDate = value ? new Date(value + "T00:00:00") : undefined;
  const minDateObj = minDate ? new Date(minDate + "T00:00:00") : undefined;
  const maxDateObj = maxDate ? new Date(maxDate + "T00:00:00") : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      // Converter Date para string YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      onChange(`${year}-${month}-${day}`);
    }
    setOpen(false);
  };

  // Formatar para exibição (dd/MM/yyyy)
  const displayValue = selectedDate
    ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR })
    : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full h-11 justify-start text-left font-normal",
            !value && "text-muted-foreground",
            hasError && "border-destructive",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayValue || <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          disabled={(date) => {
            if (minDateObj && date < minDateObj) return true;
            if (maxDateObj && date > maxDateObj) return true;
            return false;
          }}
          locale={ptBR}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
