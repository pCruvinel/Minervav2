/**
 * PeriodoSelector - Componente de seleção de período com atalhos
 * 
 * Permite selecionar:
 * - Períodos pré-definidos (Este Mês, Mês Anterior, etc.)
 * - Range customizado via DatePicker
 * 
 * @example
 * ```tsx
 * const [periodo, setPeriodo] = useState(getPeriodoPreset('thisMonth'));
 * 
 * <PeriodoSelector
 *   value={periodo}
 *   onChange={setPeriodo}
 *   showPresets
 * />
 * ```
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { PeriodoFiltro, getPeriodoPreset } from '@/lib/hooks/use-dashboard-analitico';

// ============================================================
// TYPES
// ============================================================

type PresetKey = 'thisMonth' | 'lastMonth' | 'lastQuarter' | 'thisYear' | 'last6Months' | 'custom';

interface PeriodoSelectorProps {
  value: PeriodoFiltro;
  onChange: (periodo: PeriodoFiltro) => void;
  showPresets?: boolean;
  className?: string;
}

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: 'thisMonth', label: 'Este Mês' },
  { key: 'lastMonth', label: 'Mês Anterior' },
  { key: 'lastQuarter', label: 'Último Trimestre' },
  { key: 'last6Months', label: 'Últimos 6 Meses' },
  { key: 'thisYear', label: 'Este Ano' },
  { key: 'custom', label: 'Personalizado' },
];

// ============================================================
// COMPONENT
// ============================================================

export function PeriodoSelector({ 
  value, 
  onChange, 
  showPresets = true,
  className 
}: PeriodoSelectorProps) {
  const [selectedPreset, setSelectedPreset] = useState<PresetKey>('thisMonth');
  const [isCustomOpen, setIsCustomOpen] = useState(false);

  const formatDateRange = () => {
    if (!value.inicio || !value.fim) return 'Selecione um período';
    
    try {
      const inicio = parseISO(value.inicio);
      const fim = parseISO(value.fim);
      
      // Se mesmo mês/ano, formato simplificado
      if (format(inicio, 'MM/yyyy') === format(fim, 'MM/yyyy')) {
        return format(inicio, "MMMM 'de' yyyy", { locale: ptBR });
      }
      
      return `${format(inicio, 'dd/MM/yy')} - ${format(fim, 'dd/MM/yy')}`;
    } catch {
      return 'Período inválido';
    }
  };

  const handlePresetChange = (preset: PresetKey) => {
    setSelectedPreset(preset);
    
    if (preset === 'custom') {
      setIsCustomOpen(true);
      return;
    }
    
    const novoPeriodo = getPeriodoPreset(preset);
    onChange(novoPeriodo);
  };

  const handleDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      onChange({
        inicio: format(range.from, 'yyyy-MM-dd'),
        fim: format(range.to, 'yyyy-MM-dd'),
      });
    }
  };

  // Parse dates for calendar
  const dateRange = {
    from: value.inicio ? parseISO(value.inicio) : undefined,
    to: value.fim ? parseISO(value.fim) : undefined,
  };

  if (!showPresets) {
    // Modo simples: apenas DatePicker
    return (
      <Popover open={isCustomOpen} onOpenChange={setIsCustomOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className={cn("justify-between min-w-[240px]", className)}
          >
            <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="flex-1 text-left">{formatDateRange()}</span>
            <ChevronDown className="h-4 w-4 ml-2 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={handleDateSelect}
            numberOfMonths={2}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    );
  }

  // Modo com presets
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select value={selectedPreset} onValueChange={(v) => handlePresetChange(v as PresetKey)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Selecione período" />
        </SelectTrigger>
        <SelectContent>
          {PRESETS.map((preset) => (
            <SelectItem key={preset.key} value={preset.key}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedPreset === 'custom' && (
        <Popover open={isCustomOpen} onOpenChange={setIsCustomOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="min-w-[200px] justify-between">
              <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="flex-1 text-left text-sm">{formatDateRange()}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={handleDateSelect}
              numberOfMonths={2}
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      )}

      {selectedPreset !== 'custom' && (
        <span className="text-sm text-muted-foreground">
          {formatDateRange()}
        </span>
      )}
    </div>
  );
}

export { type PeriodoSelectorProps, type PresetKey };
