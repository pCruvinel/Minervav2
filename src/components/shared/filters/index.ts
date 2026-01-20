/**
 * Filter Components - Sistema de Filtros Reutilizáveis
 * 
 * @module components/shared/filters
 * 
 * @example
 * ```tsx
 * import {
 *   FilterBar,
 *   SearchInput,
 *   FilterSelect,
 *   DateRangePicker,
 * } from '@/components/shared/filters';
 * 
 * function MyPage() {
 *   return (
 *     <FilterBar>
 *       <SearchInput value={search} onChange={setSearch} />
 *       <FilterSelect value={status} onChange={setStatus} options={statusOptions} />
 *       <DateRangePicker startDate={start} endDate={end} onChange={setRange} />
 *     </FilterBar>
 *   );
 * }
 * ```
 */

// Components
export { FilterBar, type FilterBarProps } from './filter-bar';
export { SearchInput, type SearchInputProps } from './search-input';
export { FilterSelect, type FilterSelectProps, type FilterOption } from './filter-select';
export { 
  DateRangePicker, 
  type DateRangePickerProps, 
  type DateRange,
  type DateRangePreset,
} from './date-range-picker';
