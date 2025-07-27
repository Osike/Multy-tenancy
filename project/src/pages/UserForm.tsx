import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UsersIcon } from '@heroicons/react/24/outline';

function UserForm() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          User Form
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create or edit user information
        </p>
      </div>

      {/* Placeholder */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center py-12">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">User form coming soon</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              This feature will be available in the next update.
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/users')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Back to Users
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserForm;