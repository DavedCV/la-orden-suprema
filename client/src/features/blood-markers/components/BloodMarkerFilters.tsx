import React from "react";
import { Button } from "../../../shared/components/Button";
import { Search } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface BloodMarkerFiltersProps {
  filterType: string;
  onFilterTypeChange: (filter: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterTypeOptions: FilterOption[];
}

export function BloodMarkerFilters({
  filterType,
  onFilterTypeChange,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchChange,
  filterTypeOptions,
}: BloodMarkerFiltersProps) {
  const statusOptions = [
    { value: "all", label: "Todos los estados" },
    { value: "Solicitud Pendiente", label: "Solicitud Pendiente" },
    { value: "Pendiente", label: "Pendiente" },
    {
      value: "Pago Pendiente de Confirmación",
      label: "Esperando Confirmación",
    },
    { value: "Saldado", label: "Saldado" },
    { value: "Rechazada", label: "Rechazada" },
  ];

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-orden-200 mb-3">Buscar</h3>
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-orden-400" />
          <input
            type="text"
            placeholder="Buscar por descripción o nombre..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-orden-900 border border-orden-600 rounded-md text-orden-200 placeholder-orden-500 focus:border-gold-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Filter by Type */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-orden-200 mb-3">
          Filtrar por tipo
        </h3>
        <div className="space-y-2">
          {filterTypeOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => onFilterTypeChange(option.value)}
                className={`w-full text-left p-2 rounded-md transition-colors flex items-center space-x-2 ${
                  filterType === option.value
                    ? "bg-gold-500/20 text-gold-400 border border-gold-500/30"
                    : "text-orden-400 hover:bg-orden-700 hover:text-orden-200"
                }`}
              >
                <IconComponent className="h-4 w-4" />
                <span className="text-sm">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter by Status */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-orden-200 mb-3">Estado</h3>
        <div className="space-y-2">
          {statusOptions.map((status) => (
            <button
              key={status.value}
              onClick={() => onStatusFilterChange(status.value)}
              className={`w-full text-left p-2 rounded-md transition-colors text-sm ${
                statusFilter === status.value
                  ? "bg-gold-500/20 text-gold-400 border border-gold-500/30"
                  : "text-orden-400 hover:bg-orden-700 hover:text-orden-200"
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {(filterType !== "all" || statusFilter !== "all" || searchQuery) && (
        <div className="card p-4">
          <Button
            onClick={() => {
              onFilterTypeChange("all");
              onStatusFilterChange("all");
              onSearchChange("");
            }}
            variant="ghost"
            size="sm"
            className="w-full text-orden-400 hover:text-orden-200"
          >
            Limpiar filtros
          </Button>
        </div>
      )}
    </div>
  );
}
