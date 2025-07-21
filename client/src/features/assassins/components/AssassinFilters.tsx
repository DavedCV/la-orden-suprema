import React, { useMemo } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "../../../shared/components/Input";
import { Button } from "../../../shared/components/Button";
import type { AsassinStatus } from "../../../shared/types";

interface AssassinFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: AsassinStatus | "Todos";
  setStatusFilter: (status: AsassinStatus | "Todos") => void;
  stats: {
    active: number;
    retired: number;
    excommunicated: number;
    total: number;
  };
}

export const AssassinFilters: React.FC<AssassinFiltersProps> = React.memo(
  ({ searchTerm, setSearchTerm, statusFilter, setStatusFilter, stats }) => {
    // Memoized clear handler
    const handleClearFilters = useMemo(
      () => () => {
        setSearchTerm("");
        setStatusFilter("Todos");
      },
      [setSearchTerm, setStatusFilter]
    );

    // Memoized search handler
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    };

    // Memoized status change handler
    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setStatusFilter(e.target.value as AsassinStatus | "Todos");
    };

    return (
      <section
        className="bg-orden-800 rounded-lg p-6 mb-6"
        aria-label="Filtros de búsqueda"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <label htmlFor="assassin-search" className="sr-only">
              Buscar asesinos
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orden-400 h-4 w-4"
                aria-hidden="true"
              />
              <Input
                id="assassin-search"
                placeholder="Buscar por alias, email o nombre real..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10"
                aria-describedby="search-help"
              />
            </div>
            <div id="search-help" className="sr-only">
              Busca asesinos por alias, email o nombre real
            </div>
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <label htmlFor="status-filter" className="sr-only">
              Filtrar por estado
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={handleStatusChange}
              className="w-full bg-orden-700 border border-orden-600 rounded-lg px-3 py-2 text-orden-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
              aria-describedby="status-help"
            >
              <option value="Todos">Todos los estados</option>
              <option value="Activo">Activo</option>
              <option value="Retirado">Retirado</option>
              <option value="Excommunicado">Excommunicado</option>
            </select>
            <div id="status-help" className="sr-only">
              Filtra asesinos por su estado actual
            </div>
          </div>

          {/* Clear Filters Button */}
          {(searchTerm || statusFilter !== "Todos") && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleClearFilters}
              className="sm:w-auto"
              aria-label="Limpiar todos los filtros"
            >
              <Filter className="h-4 w-4 mr-2" aria-hidden="true" />
              Limpiar
            </Button>
          )}
        </div>

        {/* Stats Summary */}
        <div
          className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-orden-700"
          role="region"
          aria-label="Estadísticas de asesinos"
        >
          <div className="text-center">
            <div
              className="text-2xl font-bold text-green-400"
              aria-label={`${stats.active} asesinos activos`}
            >
              {stats.active}
            </div>
            <div className="text-sm text-orden-400">Activos</div>
          </div>
          <div className="text-center">
            <div
              className="text-2xl font-bold text-yellow-400"
              aria-label={`${stats.retired} asesinos retirados`}
            >
              {stats.retired}
            </div>
            <div className="text-sm text-orden-400">Retirados</div>
          </div>
          <div className="text-center">
            <div
              className="text-2xl font-bold text-red-400"
              aria-label={`${stats.excommunicated} asesinos excommunicados`}
            >
              {stats.excommunicated}
            </div>
            <div className="text-sm text-orden-400">Excommunicados</div>
          </div>
          <div className="text-center">
            <div
              className="text-2xl font-bold text-orden-200"
              aria-label={`${stats.total} asesinos en total`}
            >
              {stats.total}
            </div>
            <div className="text-sm text-orden-400">Total</div>
          </div>
        </div>
      </section>
    );
  }
);

AssassinFilters.displayName = "AssassinFilters";
