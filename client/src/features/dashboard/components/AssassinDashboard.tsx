import React from "react";
import { AssassinStats } from "./AssassinStats";
import { AssassinMissions } from "./AssassinMissions";
import { AvailableMissionsSection } from "./AvailableMissionsSection";
import { ActivityFeed } from "./ActivityFeed";
import { QuickActions } from "./QuickActions";
import { SystemStatus } from "./SystemStatus";
import { BloodMarkersSection } from "./BloodMarkersSection";
import { DebtsSummaryCard } from "../../blood-markers/components/DebtsSummaryCard";
import type {
  AssassinDashboard as AssassinDashboardData,
  BloodMarker,
  Assassin,
} from "../../../shared/types";
import { Button } from "../../../shared/components/Button";
import { useNavigation } from "../../../shared/hooks/useNavigation";
import { ExternalLink, Bell } from "lucide-react";

interface AssassinDashboardProps {
  data: AssassinDashboardData;
  bloodMarkers: BloodMarker[];
  assassins: Assassin[];
  onPayMarker: (markerId: string) => void;
  onConfirmPayment: (markerId: string) => void;
  isProcessingPayment: boolean;
}

export const AssassinDashboard = React.memo(function AssassinDashboard({
  data,
  bloodMarkers,
  assassins,
  onPayMarker,
  onConfirmPayment,
  isProcessingPayment,
}: AssassinDashboardProps) {
  const { navigateTo } = useNavigation();

  const handleViewAllDebts = () => {
    // Navigate to blood markers page with "owed_by_me" filter
    navigateTo("/blood-markers?filter=owed_by_me");
  };

  return (
    <>
      {/* Quick Actions - Mobile Priority (top on mobile, sidebar on desktop) */}
      <div className="lg:hidden mb-6">
        <QuickActions role="assassin" />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AssassinStats data={data} />
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Primary Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Available Missions Section */}
          <AvailableMissionsSection onNavigate={navigateTo} />

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-orden-100">
                Misiones Activas
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateTo("/my-missions")}
                className="text-gold-400 hover:text-gold-300"
              >
                Ver todas <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              <AssassinMissions data={data} onNavigate={navigateTo} />
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-orden-100 mb-4 flex items-center">
              <Bell className="h-5 w-5 mr-2 text-gold-400" />
              Actividad Reciente
            </h3>
            <div className="space-y-3">
              <ActivityFeed data={data} type="assassin" />
            </div>
          </div>
        </div>

        {/* Sidebar - Desktop Only Quick Actions, Always Visible Other Components */}
        <div className="space-y-6">
          {/* Quick Actions - Desktop Only (hidden on mobile) */}
          <div className="hidden lg:block">
            <QuickActions role="assassin" />
          </div>

          {/* Priority Debts Summary */}
          <DebtsSummaryCard
            debts={bloodMarkers}
            assassins={assassins}
            currentUserId={data.profile.id}
            onPayDebt={onPayMarker}
            onViewAll={handleViewAllDebts}
            isProcessing={isProcessingPayment}
          />

          <BloodMarkersSection
            bloodMarkers={bloodMarkers}
            assassins={assassins}
            onPayMarker={onPayMarker}
            onConfirmPayment={onConfirmPayment}
            isProcessingPayment={isProcessingPayment}
            currentUserId={data.profile.id}
            onNavigate={navigateTo}
          />

          <SystemStatus />
        </div>
      </div>
    </>
  );
});
