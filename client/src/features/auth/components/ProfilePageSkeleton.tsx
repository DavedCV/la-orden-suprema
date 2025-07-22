import React from "react";

export const ProfilePageSkeleton = React.memo(function ProfilePageSkeleton() {
  return (
    <div className="min-h-screen bg-orden-900 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-orden-800 border-b border-orden-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-32 bg-orden-700 rounded"></div>
              <div>
                <div className="h-8 w-48 bg-orden-700 rounded mb-2"></div>
                <div className="h-4 w-64 bg-orden-700 rounded"></div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-40 bg-orden-700 rounded"></div>
              <div className="h-10 w-32 bg-orden-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card Skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-orden-800 rounded-lg p-6 border border-orden-700">
              {/* Avatar */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-orden-700 rounded-full mx-auto mb-4"></div>
                <div className="h-6 w-32 bg-orden-700 rounded mx-auto mb-2"></div>
                <div className="h-4 w-48 bg-orden-700 rounded mx-auto"></div>
              </div>

              {/* Status */}
              <div className="mb-6">
                <div className="h-10 w-full bg-orden-700 rounded"></div>
              </div>

              {/* Stats */}
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="h-4 w-24 bg-orden-700 rounded"></div>
                    <div className="h-4 w-16 bg-orden-700 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Profile Details Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-orden-800 rounded-lg p-6 border border-orden-700">
              <div className="h-6 w-48 bg-orden-700 rounded mb-4"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}>
                    <div className="h-4 w-24 bg-orden-700 rounded mb-2"></div>
                    <div className="h-6 w-full bg-orden-700 rounded"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills Section */}
            <div className="bg-orden-800 rounded-lg p-6 border border-orden-700">
              <div className="h-6 w-48 bg-orden-700 rounded mb-4"></div>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-8 w-20 bg-orden-700 rounded"></div>
                ))}
              </div>
            </div>

            {/* System Information */}
            <div className="bg-orden-800 rounded-lg p-6 border border-orden-700">
              <div className="h-6 w-48 bg-orden-700 rounded mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}>
                    <div className="h-4 w-24 bg-orden-700 rounded mb-2"></div>
                    <div className="h-4 w-32 bg-orden-700 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
