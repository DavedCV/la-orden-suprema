import React, { useMemo } from "react";
import { Users, Download } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { AssassinCard } from "./AssassinCard";
import type { Assassin, AsassinStatus } from "../../../shared/types";

interface AssassinListProps {
  assassins: Assassin[];
  onStatusChange: (id: string, status: AsassinStatus) => void;
  onViewDetails: (assassin: Assassin) => void;
  searchTerm: string;
  statusFilter: AsassinStatus | "Todos";
  isUpdating?: boolean;
}

export const AssassinList: React.FC<AssassinListProps> = React.memo(
  ({
    assassins,
    onStatusChange,
    onViewDetails,
    searchTerm,
    statusFilter,
    isUpdating = false,
  }) => {
    // Memoized export data function
    const exportData = useMemo(() => {
      return () => {
        const csvData = assassins.map((assassin) => ({
          Alias: assassin.alias,
          Email: assassin.email,
          "Nombre Real": assassin.realName || "",
          Estado: assassin.status,
          "Monedas de Oro": assassin.goldCoins,
          "Misiones Completadas": assassin.completedMissions,
          Habilidades: assassin.skills?.join(", ") || "",
        }));

        const csvContent = [
          Object.keys(csvData[0]).join(","),
          ...csvData.map((row) =>
            Object.values(row)
              .map((value) =>
                typeof value === "string" && value.includes(",")
                  ? `"${value}"`
                  : value
              )
              .join(",")
          ),
        ].join("\n");

        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `asesinos-${new Date().toISOString().split("T")[0]}.csv`
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
    }, [assassins]);

    if (assassins.length === 0) {
      return (
        <section
          className="bg-orden-800 rounded-lg p-12 text-center"
          role="region"
          aria-label="Lista de asesinos vacía"
        >
          <Users
            className="h-16 w-16 text-orden-600 mx-auto mb-4"
            aria-hidden="true"
          />
          <h3 className="text-lg font-medium text-orden-300 mb-2">
            No se encontraron asesinos
          </h3>
          <p className="text-orden-500">
            {searchTerm || statusFilter !== "Todos"
              ? "Intenta ajustar los filtros de búsqueda"
              : "Aún no hay asesinos registrados en el sistema"}
          </p>
        </section>
      );
    }

    return (
      <section role="region" aria-label="Lista de asesinos">
        {/* List Header with Export */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-orden-100">
            {assassins.length} asesino{assassins.length !== 1 ? "s" : ""}{" "}
            encontrado{assassins.length !== 1 ? "s" : ""}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={exportData}
            className="text-orden-400 hover:text-orden-200"
            aria-label="Exportar datos de asesinos a CSV"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>

        {/* Assassins Grid */}
        <div
          className="space-y-4"
          role="list"
          aria-label={`Lista de ${assassins.length} asesinos`}
        >
          {assassins.map((assassin, index) => (
            <div
              key={assassin.id}
              role="listitem"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onViewDetails(assassin);
                }
              }}
              aria-posinset={index + 1}
              aria-setsize={assassins.length}
            >
              <AssassinCard
                assassin={assassin}
                onStatusChange={onStatusChange}
                onViewDetails={onViewDetails}
                isUpdating={isUpdating}
              />
            </div>
          ))}
        </div>

        {/* Live region for screen readers */}
        <div
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
          id="assassins-status"
        >
          {isUpdating && "Actualizando estado del asesino..."}
        </div>
      </section>
    );
  }
);

AssassinList.displayName = "AssassinList";
