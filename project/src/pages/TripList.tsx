import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../contexts/AuthContext';
import { useAuth } from '../contexts/AuthContext';
import {
  PlusIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';

interface Trip {
  _id: string;
  truck: {
    _id: string;
    truckIdCode: string;
    make: string;
    model: string;
  };
  customer: {
    _id: string;
    customerName: string;
  };
  assignedDriver?: {
    _id: string;
    fullName: string;
    username: string;
  };
  rate: number;
  fuelCostUsd: number;
  fuelLiters: number;
  mileage: number;
  driverSalary: number;
  maintenanceCost: number;
  roadTolls: number;
  totalExpenses: number;
  netProfit: number;
  fuelEfficiency: number;
  tripDurationHours: number;
  routeDetails: {
    startLocation: string;
    endLocation: string;
  };
  loadDetails: {
    weight: number;
    goodsType: string;
  };
  tripStartDate: string;
  tripEndDate: string;
  status: string;
  comments?: string;
  attachments: any[];
  createdAt: string;
}

interface TripSummary {
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  avgFuelEfficiency: number;
  totalMileage: number;
}

function TripList() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [summary, setSummary] = useState<TripSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filters
  const [filters, setFilters] = useState({
    truck: '',
    customer: '',
    status: '',
    startDate: '',
    endDate: '',
    assignedDriver: '',
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTrips, setTotalTrips] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter options
  const [trucks, setTrucks] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);

  useEffect(() => {
    fetchTrips();
    fetchFilterOptions();
  }, [currentPage, filters, sortField, sortOrder, itemsPerPage]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortBy: sortField,
        sortOrder: sortOrder,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        ),
      });

      const response = await api.get(`/trips?${params}`);
      if (response.data.success) {
        setTrips(response.data.data.trips);
        setSummary(response.data.data.summary);
        setTotalPages(response.data.data.pagination.pages);
        setTotalTrips(response.data.data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const [trucksRes, customersRes] = await Promise.all([
        api.get('/trucks'),
        api.get('/customers'),
      ]);

      setTrucks(trucksRes.data.data?.trucks || []);
      setCustomers(customersRes.data.data?.customers || []);
      
      // Fetch drivers for company admin and dispatcher
      if (user?.role === 'company_admin' || user?.role === 'dispatcher') {
        const driversRes = await api.get('/users?role=driver');
        setDrivers(driversRes.data.data?.users || []);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({
      truck: '',
      customer: '',
      status: '',
      startDate: '',
      endDate: '',
      assignedDriver: '',
    });
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? (
      <ArrowUpIcon className="h-4 w-4" />
    ) : (
      <ArrowDownIcon className="h-4 w-4" />
    );
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) {
      return;
    }

    try {
      setDeleting(tripId);
      await api.delete(`/trips/${tripId}`);
      fetchTrips(); // Refresh the list
    } catch (error: any) {
      console.error('Error deleting trip:', error);
      alert(error.response?.data?.message || 'Failed to delete trip');
    } finally {
      setDeleting(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200';
      case 'Assigned':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200';
      case 'In Transit':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200';
      case 'Delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canEditTrip = (trip: Trip) => {
    if (user?.role === 'company_admin' || user?.role === 'dispatcher') {
      return true;
    }
    if (user?.role === 'driver') {
      return trip.assignedDriver?._id === user._id;
    }
    return false;
  };

  const canDeleteTrip = () => {
    return user?.role === 'company_admin';
  };

  if (loading && trips.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {user?.role === 'driver' ? 'My Trips' : 'Trip Management'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {user?.role === 'driver' 
              ? 'View and update your assigned trips'
              : 'Manage and track all company trips'
            }
          </p>
        </div>
        
        <div className="flex space-x-3">
          {summary && (
            <div className="flex items-center space-x-4 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow">
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(summary.totalProfit)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Total Profit</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {summary.totalMileage.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Total Miles</div>
              </div>
            </div>
          )}
          
            {(user?.role === 'dispatcher' || user?.role === 'company_admin') && (
              <Link
                to="/trips/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Trip
              </Link>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Truck
              </label>
              <select
                value={filters.truck}
                onChange={(e) => handleFilterChange('truck', e.target.value)}
                className="block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="">All Trucks</option>
                {trucks.map((truck) => (
                  <option key={truck._id} value={truck._id}>
                    {truck.truckIdCode}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Customer
              </label>
              <select
                value={filters.customer}
                onChange={(e) => handleFilterChange('customer', e.target.value)}
                className="block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="">All Customers</option>
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.customerName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Assigned">Assigned</option>
                <option value="In Transit">In Transit</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {(user?.role === 'company_admin' || user?.role === 'dispatcher') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Driver
                </label>
                <select
                  value={filters.assignedDriver}
                  onChange={(e) => handleFilterChange('assignedDriver', e.target.value)}
                  className="block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">All Drivers</option>
                  {drivers.map((driver) => (
                    <option key={driver._id} value={driver._id}>
                      {driver.fullName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              Clear all filters
            </button>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Items per page:
              </label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {trips.length} of {totalTrips} trips
            </div>
            {summary && (
              <div className="flex items-center space-x-6 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Revenue: </span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {formatCurrency(summary.totalRevenue)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Expenses: </span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {formatCurrency(summary.totalExpenses)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Avg Efficiency: </span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {summary.avgFuelEfficiency.toFixed(2)} L/mi
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Trips Table */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th 
                    onClick={() => handleSort('truck')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Truck</span>
                      {getSortIcon('truck')}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('customer')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Customer</span>
                      {getSortIcon('customer')}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('rate')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Rate</span>
                      {getSortIcon('rate')}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('netProfit')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Net Profit</span>
                      {getSortIcon('netProfit')}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('status')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      {getSortIcon('status')}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('tripStartDate')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Trip Date</span>
                      {getSortIcon('tripStartDate')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {trips.map((trip) => (
                  <tr key={trip._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {trip.truck.truckIdCode}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {trip.truck.make} {trip.truck.model}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {trip.customer.customerName}
                      </div>
                      {trip.assignedDriver && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Driver: {trip.assignedDriver.fullName}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(trip.rate)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Expenses: {formatCurrency(trip.totalExpenses)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        trip.netProfit >= 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatCurrency(trip.netProfit)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {trip.fuelEfficiency.toFixed(2)} L/mi
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(trip.status)}`}>
                        {trip.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatDate(trip.tripStartDate)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {trip.tripDurationHours.toFixed(1)}h • {trip.mileage.toLocaleString()} mi
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/trips/${trip._id}`}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                          title="View details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                        
                        {canEditTrip(trip) && (
                          <Link
                            to={`/trips/${trip._id}/edit`}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                            title="Edit trip"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                        )}
                        
                        {canDeleteTrip() && (
                          <button
                            onClick={() => handleDeleteTrip(trip._id)}
                            disabled={deleting === trip._id}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 disabled:opacity-50"
                            title="Delete trip"
                          >
                            {deleting === trip._id ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <TrashIcon className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {trips.length === 0 && !loading && (
            <div className="text-center py-12">
              <DocumentArrowDownIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No trips found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {Object.values(filters).some(v => v !== '') 
                  ? 'Try adjusting your filters to see more results.'
                  : 'Get started by creating your first trip.'
                }
              </p>
              {(user?.role === 'dispatcher' || user?.role === 'company_admin') && (
                <div className="mt-6">
                  <Link
                    to="/trips/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create New Trip
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6 rounded-lg shadow">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing{' '}
                  <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                  {' '}to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, totalTrips)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium">{totalTrips}</span>
                  {' '}results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pageNum === currentPage
                            ? 'z-10 bg-blue-50 dark:bg-blue-900/50 border-blue-500 text-blue-600 dark:text-blue-200'
                            : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {loading && trips.length > 0 && (
          <div className="flex justify-center py-4">
            <LoadingSpinner size="md" />
          </div>
        )}
      </div>
    );
  }

export default TripList;