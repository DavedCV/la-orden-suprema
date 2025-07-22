import { Button } from "../../../shared/components/Button";
import { Target } from "lucide-react";

interface MissionEmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export function MissionEmptyState({
  hasFilters,
  onClearFilters,
}: MissionEmptyStateProps) {
  return (
    <div
      className="text-center py-12"
      role="region"
      aria-label="Estado vacío de misiones"
    >
      <Target
        className="h-16 w-16 text-orden-600 mx-auto mb-4"
        aria-hidden="true"
      />

      <h3 className="text-lg font-medium text-orden-300 mb-2">
        {hasFilters
          ? "No se encontraron misiones"
          : "No hay misiones disponibles"}
      </h3>

      <p className="text-orden-400 mb-6 max-w-md mx-auto">
        {hasFilters
          ? "Intenta ajustar tus filtros de búsqueda para encontrar misiones que se adapten a tus criterios"
          : "Actualmente no hay misiones disponibles para postulación. Regresa más tarde para ver nuevas oportunidades"}
      </p>

      {hasFilters && (
        <Button
          onClick={onClearFilters}
          variant="secondary"
          aria-label="Limpiar filtros de búsqueda"
        >
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}
