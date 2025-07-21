import { Shield, ShieldOff, UserX } from "lucide-react";
import type { AsassinStatus, Assassin } from "../../../shared/types";

export const getStatusColor = (status: AsassinStatus): string => {
  switch (status) {
    case "Activo":
      return "text-green-400 bg-green-400/10 border-green-400/20";
    case "Retirado":
      return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
    case "Excommunicado":
      return "text-red-400 bg-red-400/10 border-red-400/20";
    default:
      return "text-orden-400 bg-orden-400/10 border-orden-400/20";
  }
};

export const getStatusIcon = (status: AsassinStatus) => {
  switch (status) {
    case "Activo":
      return Shield;
    case "Retirado":
      return ShieldOff;
    case "Excommunicado":
      return UserX;
    default:
      return Shield;
  }
};

export const getStatusActions = (status: AsassinStatus) => {
  if (status === "Activo") {
    return [
      { status: "Retirado" as AsassinStatus, color: "text-yellow-400 hover:text-yellow-300", icon: ShieldOff, title: "Marcar como Retirado" },
      { status: "Excommunicado" as AsassinStatus, color: "text-red-400 hover:text-red-300", icon: UserX, title: "Excommunicar" }
    ];
  }

  return [
    { status: "Activo" as AsassinStatus, color: "text-green-400 hover:text-green-300", icon: Shield, title: "Reactivar" }
  ];
};

export const filterAssassins = (
  assassins: Assassin[],
  searchTerm: string,
  statusFilter: AsassinStatus | "Todos"
) => {
  return assassins.filter((assassin) => {
    const matchesSearch =
      assassin.alias.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assassin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (assassin.realName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesStatus =
      statusFilter === "Todos" || assassin.status === statusFilter;

    return matchesSearch && matchesStatus;
  });
};

export const getAssassinStats = (assassins: Assassin[]) => {
  return {
    active: assassins.filter((a) => a.status === "Activo").length,
    retired: assassins.filter((a) => a.status === "Retirado").length,
    excommunicated: assassins.filter((a) => a.status === "Excommunicado").length,
    total: assassins.length,
  };
};
