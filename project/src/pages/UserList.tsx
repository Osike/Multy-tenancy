import React from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, UsersIcon } from '@heroicons/react/24/outline';

function UserList() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage company users and their roles
          </p>
        </div>
        <Link
          to="/users/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New User
        </Link>
      </div>

      {/* Placeholder */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center py-12">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">User management coming soon</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              This feature will be available in the next update.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserList;