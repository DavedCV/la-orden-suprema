import React from "react";
import { AdminStats } from "./AdminStats";
import { ActivityFeed } from "./ActivityFeed";
import { QuickActions } from "./QuickActions";
import { SystemStatus } from "./SystemStatus";
import type { AdminDashboard as AdminDashboardData } from "../../../shared/types";

interface AdminDashboardProps {
  data: AdminDashboardData;
}

export const AdminDashboard = React.memo(function AdminDashboard({
  data,
}: AdminDashboardProps) {
  return (
    <>
      {/* Quick Actions - Mobile Priority (top on mobile, sidebar on desktop) */}
      <div className="lg:hidden mb-6">
        <QuickActions role="admin" />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AdminStats data={data} />
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Primary Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-orden-100">
                Actividad Reciente
              </h3>
            </div>
            <div className="space-y-3">
              <ActivityFeed data={data} type="admin" />
            </div>
          </div>
        </div>

        {/* Sidebar - Desktop Only Quick Actions, Always Visible Other Components */}
        <div className="space-y-6">
          {/* Quick Actions - Desktop Only (hidden on mobile) */}
          <div className="hidden lg:block">
            <QuickActions role="admin" />
          </div>

          <SystemStatus />
        </div>
      </div>
    </>
  );
});
