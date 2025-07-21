export type BloodMarkerFilter =
  | "all"
  | "owed_by_me"
  | "owed_to_me"
  | "pending"
  | "paid"
  | "requests"
  | "sent_requests";

export interface BloodMarkerStats {
  owedByMe: number;
  owedToMe: number;
  pendingConfirmation: number;
  incomingRequests: number;
  sentRequests: number;
}

export interface BloodMarkerCardProps {
  marker: import("../../../shared/types").BloodMarker;
  currentUserId: string;
  otherPartyName: string;
  onPayMarker: (id: string) => void;
  onConfirmPayment: (id: string) => void;
  onViewDetails: (marker: import("../../../shared/types").BloodMarker) => void;
  onAcceptRequest?: (id: string) => void;
  onRejectRequest?: (id: string, reason: string) => void;
}

export interface CreateBloodMarkerModalProps {
  assassins: import("../../../shared/types").Assassin[];
  currentUserId: string;
  onClose: () => void;
  onSuccess: (data: { debtorId: string; description: string }) => void;
}

export interface BloodMarkerDetailsModalProps {
  marker: import("../../../shared/types").BloodMarker;
  otherPartyName: string;
  currentUserId: string;
  onClose: () => void;
  onPayMarker: (id: string) => void;
  onConfirmPayment: (id: string) => void;
}

export interface BloodMarkerFiltersProps {
  activeFilter: BloodMarkerFilter;
  searchQuery: string;
  onFilterChange: (filter: BloodMarkerFilter) => void;
  onSearchChange: (query: string) => void;
}
