import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  DocumentTextIcon,
  ClockIcon,
  TruckIcon,
  CheckCircleIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

function DriverDashboard() {
  const { user } = useAuth();

  const tripStatusCards = [
    {
      name: 'Assigned to Me',
      count: '0',
      icon: ClockIcon,
      color: 'text-yellow-600',
      href: '/trips?status=Assigned',
    },
    {
      name: 'In Transit',
      count: '0',
      icon: TruckIcon,
      color: 'text-blue-600',
      href: '/trips?status=In Transit',
    },
    {
      name: 'Completed',
      count: '0',
      icon: CheckCircleIcon,
      color: 'text-green-600',
      href: '/trips?status=Delivered',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Driver Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back, {user?.fullName}
        </p>
        {user?.licenseNumber && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            License: {user.licenseNumber}
          </p>
        )}
      </div>

      {/* Trip Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tripStatusCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.name}
              to={card.href}
              className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        {card.name}
                      </dt>
                      <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {card.count}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Current Trip Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
            Current Trip
          </h3>
          <div className="text-center py-8">
            <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No active trip</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              You don't have any trips assigned at the moment.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Access */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
            Quick Access
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/trips"
              className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <DocumentTextIcon className="h-6 w-6 text-blue-500 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">My Trips</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">View all assigned trips</p>
              </div>
            </Link>

            <div className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg opacity-50">
              <TruckIcon className="h-6 w-6 text-gray-400 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Vehicle Info</h4>
                <p className="text-sm text-gray-400">Coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="text-center py-8">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No recent activity</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Your trip history will appear here once you start completing deliveries.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DriverDashboard;