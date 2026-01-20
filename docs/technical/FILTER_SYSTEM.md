# Sistema de Filtros Reutilizáveis

> **📖 Guia de Componentes de Filtro**  
> **Última atualização:** 2026-01-19

---

## Visão Geral

Sistema de componentes padronizados para filtros em páginas e tabelas.

### Importação

```tsx
import {
  FilterBar,
  SearchInput,
  FilterSelect,
  DateRangePicker,
} from '@/components/shared/filters';
```

---

## Componentes

### 1. FilterBar

Wrapper padrão para barras de filtro.

```tsx
<FilterBar>
  <SearchInput value={search} onChange={setSearch} />
  <FilterSelect value={status} onChange={setStatus} options={options} />
</FilterBar>
```

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `children` | `ReactNode` | - | Componentes de filtro |
| `compact` | `boolean` | `false` | Sem Card (inline) |
| `onClear` | `() => void` | - | Callback limpar filtros |
| `showClearButton` | `boolean` | `false` | Mostrar botão limpar |

---

### 2. SearchInput

Input de busca com debounce.

```tsx
<SearchInput
  value={search}
  onChange={setSearch}
  placeholder="Buscar por cliente, código..."
  debounceMs={300}
/>
```

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `value` | `string` | - | Valor atual |
| `onChange` | `(value: string) => void` | - | Callback |
| `placeholder` | `string` | `"Buscar..."` | Placeholder |
| `debounceMs` | `number` | `300` | Tempo de debounce |

---

### 3. FilterSelect

Select genérico para filtros.

```tsx
<FilterSelect
  value={setor}
  onChange={setSetor}
  options={[
    { value: 'todos', label: 'Todos' },
    { value: 'obras', label: 'Obras' },
    { value: 'assessoria', label: 'Assessoria' },
  ]}
  placeholder="Setor"
  icon={<Building className="h-4 w-4" />}
/>
```

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `value` | `T` | - | Valor selecionado |
| `onChange` | `(value: T) => void` | - | Callback |
| `options` | `FilterOption<T>[]` | - | Opções disponíveis |
| `placeholder` | `string` | `"Selecione"` | Placeholder |
| `icon` | `ReactNode` | - | Ícone no trigger |
| `width` | `string` | `"w-[180px]"` | Largura |

---

### 4. DateRangePicker

Seletor de período com presets.

```tsx
const [range, setRange] = useState<DateRange | null>(null);

<DateRangePicker
  startDate={range?.start}
  endDate={range?.end}
  onChange={setRange}
  placeholder="Período"
/>
```

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `startDate` | `string` | - | Data início (YYYY-MM-DD) |
| `endDate` | `string` | - | Data fim (YYYY-MM-DD) |
| `onChange` | `(range: DateRange \| null) => void` | - | Callback |
| `showPresets` | `boolean` | `true` | Mostrar presets |
| `customPresets` | `DateRangePreset[]` | - | Presets customizados |

**Presets Padrão:**
- Hoje
- Últimos 7 dias
- Últimos 30 dias
- Esta semana
- Este mês
- Mês anterior

---

### 5. GroupedMultiSelect

Multi-select agrupado (existente).

```tsx
import { GroupedMultiSelect } from '@/components/dashboard/grouped-multi-select';

<GroupedMultiSelect
  title="Filtros"
  selectedValues={filters}
  onChange={setFilters}
  groups={[
    { key: 'status', label: 'Status', options: statusOptions },
    { key: 'tipo', label: 'Tipo', options: tipoOptions },
  ]}
/>
```

---

## Exemplo Completo

```tsx
import {
  FilterBar,
  SearchInput,
  FilterSelect,
  DateRangePicker,
  type DateRange,
} from '@/components/shared/filters';

function MinhaListagem() {
  const [search, setSearch] = useState('');
  const [setor, setSetor] = useState<string>('todos');
  const [range, setRange] = useState<DateRange | null>(null);

  const handleClear = () => {
    setSearch('');
    setSetor('todos');
    setRange(null);
  };

  return (
    <FilterBar onClear={handleClear} showClearButton>
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar..."
      />
      <FilterSelect
        value={setor}
        onChange={setSetor}
        options={[
          { value: 'todos', label: 'Todos' },
          { value: 'obras', label: 'Obras' },
        ]}
        placeholder="Setor"
      />
      <DateRangePicker
        startDate={range?.start}
        endDate={range?.end}
        onChange={setRange}
      />
    </FilterBar>
  );
}
```

---

## Referência Rápida

| Componente | Quando usar |
|------------|-------------|
| `FilterBar` | Wrapper para qualquer barra de filtros |
| `SearchInput` | Busca textual com ícone |
| `FilterSelect` | Seleção única (setor, status, etc.) |
| `DateRangePicker` | Período de datas |
| `GroupedMultiSelect` | Multi-seleção agrupada (checkboxes) |
