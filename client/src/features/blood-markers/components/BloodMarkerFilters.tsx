import React from "react";
import { Search } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import type { BloodMarkerFiltersProps } from "../types";

const FILTER_OPTIONS = [
  { key: "all", label: "Todos" },
  { key: "owed_by_me", label: "Que debo" },
  { key: "owed_to_me", label: "Que me deben" },
  { key: "pending", label: "Pendientes" },
  { key: "paid", label: "Saldados" },
] as const;

export const BloodMarkerFilters = React.memo(function BloodMarkerFilters({
  activeFilter,
  searchQuery,
  onFilterChange,
  onSearchChange,
}: BloodMarkerFiltersProps) {
  return (
    <div className="card p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Filter Buttons */}
        <fieldset className="flex flex-wrap gap-2">
          <legend className="sr-only">Filtrar marcadores por tipo</legend>
          {FILTER_OPTIONS.map((filter) => (
            <Button
              key={filter.key}
              variant={activeFilter === filter.key ? "primary" : "ghost"}
              size="sm"
              onClick={() => onFilterChange(filter.key)}
              className={
                activeFilter === filter.key ? "bg-red-600 hover:bg-red-700" : ""
              }
              aria-pressed={activeFilter === filter.key}
              role="radio"
            >
              {filter.label}
            </Button>
          ))}
        </fieldset>

        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <label htmlFor="search-markers" className="sr-only">
            Buscar marcadores
          </label>
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orden-400 h-4 w-4"
            aria-hidden="true"
          />
          <Input
            id="search-markers"
            placeholder="Buscar por descripción o asesino..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
            aria-describedby="search-help"
          />
          <p id="search-help" className="sr-only">
            Buscar marcadores por descripción del favor o nombre del asesino
          </p>
        </div>
      </div>
    </div>
  );
});
