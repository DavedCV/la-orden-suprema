import React from "react";
import { Search } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import type { BloodMarkerFiltersProps } from "../types";

const FILTER_OPTIONS = [
  { key: "all", label: "Todos" },
  { key: "requests", label: "Solicitudes recibidas" },
  { key: "sent_requests", label: "Solicitudes enviadas" },
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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orden-400" />
          <Input
            type="text"
            placeholder="Buscar marcadores..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 w-full lg:w-80"
            aria-label="Buscar en marcadores de sangre"
          />
        </div>
      </div>
    </div>
  );
});
