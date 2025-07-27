import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  HomeIcon,
  TruckIcon,
  UsersIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  Cog6ToothIcon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavigationItems = () => {
    if (!user) return [];

    const baseItems = [
      {
        name: 'Dashboard',
        href: getDashboardPath(),
        icon: HomeIcon,
        current: location.pathname === getDashboardPath(),
      },
    ];

    switch (user.role) {
      case 'super_admin':
        return [
          ...baseItems,
          {
            name: 'Companies',
            href: '/companies',
            icon: BuildingOfficeIcon,
            current: location.pathname.startsWith('/companies'),
          },
        ];

      case 'company_admin':
        return [
          ...baseItems,
          {
            name: 'Users',
            href: '/users',
            icon: UsersIcon,
            current: location.pathname.startsWith('/users'),
          },
          {
            name: 'Trucks',
            href: '/trucks',
            icon: TruckIcon,
            current: location.pathname.startsWith('/trucks'),
          },
          {
            name: 'Customers',
            href: '/customers',
            icon: BuildingOfficeIcon,
            current: location.pathname.startsWith('/customers'),
          },
          {
            name: 'Trips',
            href: '/trips',
            icon: DocumentTextIcon,
            current: location.pathname.startsWith('/trips'),
          },
          {
            name: 'Analytics',
            href: '/analytics',
            icon: ChartBarIcon,
            current: location.pathname.startsWith('/analytics'),
          },
        ];

      case 'dispatcher':
        return [
          ...baseItems,
          {
            name: 'Customers',
            href: '/customers',
            icon: BuildingOfficeIcon,
            current: location.pathname.startsWith('/customers'),
          },
          {
            name: 'Trips',
            href: '/trips',
            icon: DocumentTextIcon,
            current: location.pathname.startsWith('/trips'),
          },
          {
            name: 'Analytics',
            href: '/analytics',
            icon: ChartBarIcon,
            current: location.pathname.startsWith('/analytics'),
          },
        ];

      case 'driver':
        return [
          ...baseItems,
          {
            name: 'My Trips',
            href: '/trips',
            icon: DocumentTextIcon,
            current: location.pathname.startsWith('/trips'),
          },
        ];

      default:
        return baseItems;
    }
  };

  const getDashboardPath = () => {
    switch (user?.role) {
      case 'super_admin':
        return '/super-admin';
      case 'company_admin':
        return '/company-admin';
      case 'dispatcher':
        return '/dispatcher';
      case 'driver':
        return '/driver';
      default:
        return '/';
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-200 dark:border-gray-700">
            <TruckIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
              TDMS
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    item.current
                      ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-200'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info and actions */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            {/* User info */}
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.fullName?.charAt(0) || 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.fullName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.role.replace('_', ' ')}
                </p>
                {user?.companyId && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.companyId.companyName}
                  </p>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? (
                  <MoonIcon className="h-5 w-5" />
                ) : (
                  <SunIcon className="h-5 w-5" />
                )}
              </button>
              
              <button
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Notifications"
              >
                <BellIcon className="h-5 w-5" />
              </button>

              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Sign out"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="py-8 px-8">
          {/* Error banner */}
          {user?.companyId?.status !== 'Active' && user?.role !== 'super_admin' && (
            <div className="mb-6 rounded-md bg-yellow-50 dark:bg-yellow-900/50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Company Account Status
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                    <p>
                      Your company account is currently {user.companyId.status.toLowerCase()}. 
                      Some features may be limited. Please contact your administrator.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;