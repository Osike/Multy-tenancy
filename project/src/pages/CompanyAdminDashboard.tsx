import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  TruckIcon,
  UsersIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

function CompanyAdminDashboard() {
  const { user } = useAuth();

  const quickActions = [
    {
      name: 'Add New Trip',
      href: '/trips/new',
      icon: PlusIcon,
      description: 'Create a new trip record',
      color: 'bg-blue-500',
    },
    {
      name: 'Add Truck',
      href: '/trucks/new',
      icon: TruckIcon,
      description: 'Register a new truck',
      color: 'bg-green-500',
    },
    {
      name: 'Add User',
      href: '/users/new',
      icon: UsersIcon,
      description: 'Add a new team member',
      color: 'bg-purple-500',
    },
    {
      name: 'Add Customer',
      href: '/customers/new',
      icon: BuildingOfficeIcon,
      description: 'Register a new customer',
      color: 'bg-orange-500',
    },
  ];

  const navigationCards = [
    {
      name: 'Trip Management',
      href: '/trips',
      icon: DocumentTextIcon,
      description: 'View and manage all trips',
      count: '0',
    },
    {
      name: 'Fleet Management',
      href: '/trucks',
      icon: TruckIcon,
      description: 'Manage your truck fleet',
      count: '0',
    },
    {
      name: 'User Management',
      href: '/users',
      icon: UsersIcon,
      description: 'Manage team members',
      count: '0',
    },
    {
      name: 'Customer Management',
      href: '/customers',
      icon: BuildingOfficeIcon,
      description: 'Manage customer relationships',
      count: '0',
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: ChartBarIcon,
      description: 'View performance analytics',
      count: '',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.fullName}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Company: {user?.companyId?.companyName}
        </p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Navigation Cards */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Management Areas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {navigationCards.map((card) => {
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
                      <Icon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          {card.name}
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {card.count}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {card.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="text-center py-8">
            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No recent activity</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Start by creating your first trip or adding a truck to see activity here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyAdminDashboard;