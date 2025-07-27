import React from 'react';
import { ChartBarIcon } from '@heroicons/react/24/outline';

function Analytics() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View performance metrics and business insights
        </p>
      </div>

      {/* Placeholder */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center py-12">
            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Analytics coming soon</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Advanced analytics and reporting features will be available in the next update.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;