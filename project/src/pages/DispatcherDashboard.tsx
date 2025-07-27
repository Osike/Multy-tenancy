import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  DocumentTextIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  PlusIcon,
  ClockIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

function DispatcherDashboard() {
  const { user } = useAuth();

  const quickActions = [
    {
      name: 'Create New Trip',
      href: '/trips/new',
      icon: PlusIcon,
      description: 'Schedule a new delivery',
      color: 'bg-blue-500',
    },
    {
      name: 'Add Customer',
      href: '/customers/new',
      icon: BuildingOfficeIcon,
      description: 'Register new customer',
      color: 'bg-green-500',
    },
  ];

  const statusCards = [
    {
      name: 'Pending Trips',
      count: '0',
      icon: ClockIcon,
      color: 'text-yellow-600',
      href: '/trips?status=Pending',
    },
    {
      name: 'In Transit',
      count: '0',
      icon: TruckIcon,
      color: 'text-blue-600',
      href: '/trips?status=In Transit',
    },
    {
      name: 'Delivered Today',
      count: '0',
      icon: DocumentTextIcon,
      color: 'text-green-600',
      href: '/trips?status=Delivered',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dispatcher Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back, {user?.fullName}
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statusCards.map((card) => {
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

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.name}
                to={action.href}
                className="relative group bg-white dark:bg-gray-800 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div>
                  <span className={`rounded-lg inline-flex p-3 ${action.color} text-white`}>
                    <Icon className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {action.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {action.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Management Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to="/trips"
          className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    All Trips
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                    0
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage all trip records
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/customers"
          className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BuildingOfficeIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Customers
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                    0
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage customer database
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/analytics"
          className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Analytics
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                    📊
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                View performance metrics
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default DispatcherDashboard;