import { Input } from "../../../shared/components/Input";
import { Button } from "../../../shared/components/Button";
import { Search } from "lucide-react";

export interface MissionFiltersProps {
  searchQuery: string;
  priorityFilter: string;
  sortBy: "deadline" | "reward" | "priority";
  onSearchChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onSortChange: (value: "deadline" | "reward" | "priority") => void;
  onClearFilters: () => void;
  hasActiveFilters?: boolean;
}

export function MissionFiltersSection({
  searchQuery,
  priorityFilter,
  sortBy,
  onSearchChange,
  onPriorityChange,
  onSortChange,
  onClearFilters,
  hasActiveFilters = false,
}: MissionFiltersProps) {
  return (
    <section className="card p-6 mb-8" aria-label="Filtros de misiones">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Input */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orden-400 h-4 w-4"
            aria-hidden="true"
          />
          <Input
            placeholder="Buscar por título, descripción o objetivo..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
            aria-label="Buscar misiones"
          />
        </div>

        {/* Priority Filter */}
        <div>
          <label htmlFor="priority-filter" className="sr-only">
            Filtrar por prioridad
          </label>
          <select
            id="priority-filter"
            value={priorityFilter}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="w-full bg-orden-800 border border-orden-600 rounded-lg px-3 py-2 text-orden-100 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            aria-label="Filtrar por prioridad"
          >
            <option value="all">Todas las prioridades</option>
            <option value="high">Alta prioridad</option>
            <option value="medium">Prioridad media</option>
            <option value="low">Prioridad baja</option>
          </select>
        </div>

        {/* Sort Options */}
        <div>
          <label htmlFor="sort-options" className="sr-only">
            Ordenar por
          </label>
          <select
            id="sort-options"
            value={sortBy}
            onChange={(e) =>
              onSortChange(e.target.value as "deadline" | "reward" | "priority")
            }
            className="w-full bg-orden-800 border border-orden-600 rounded-lg px-3 py-2 text-orden-100 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            aria-label="Ordenar misiones por"
          >
            <option value="deadline">Ordenar por fecha límite</option>
            <option value="reward">Ordenar por recompensa</option>
            <option value="priority">Ordenar por prioridad</option>
          </select>
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <Button
            onClick={onClearFilters}
            variant="secondary"
            size="sm"
            aria-label="Limpiar todos los filtros"
          >
            Limpiar filtros
          </Button>
        </div>
      )}
    </section>
  );
}
