import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

interface CompanyFormData {
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  businessRegistrationNumber: string;
  taxId: string;
  industry: string;
  companySize: string;
  website: string;
  subscription: {
    plan: string;
    maxUsers: number;
    maxTrucks: number;
    endDate: string;
  };
}

function CompanyForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState<CompanyFormData>({
    companyName: '',
    contactEmail: '',
    contactPhone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
    },
    businessRegistrationNumber: '',
    taxId: '',
    industry: 'Logistics',
    companySize: 'Small (1-10)',
    website: '',
    subscription: {
      plan: 'Basic',
      maxUsers: 10,
      maxTrucks: 50,
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now (YYYY-MM-DD format for date input)
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      fetchCompany();
    }
  }, [id, isEditing]);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/companies/${id}`);
      if (response.data.success) {
        const company = response.data.data.company;
        setFormData({
          companyName: company.companyName,
          contactEmail: company.contactEmail,
          contactPhone: company.contactPhone || '',
          address: {
            street: company.address?.street || '',
            city: company.address?.city || '',
            state: company.address?.state || '',
            zipCode: company.address?.zipCode || '',
            country: company.address?.country || 'USA',
          },
          businessRegistrationNumber: company.businessRegistrationNumber || '',
          taxId: company.taxId || '',
          industry: company.industry || 'Logistics',
          companySize: company.companySize || 'Small (1-10)',
          website: company.website || '',
          subscription: {
            plan: company.subscription?.plan || 'Basic',
            maxUsers: company.subscription?.maxUsers || 10,
            maxTrucks: company.subscription?.maxTrucks || 50,
            endDate: company.subscription?.endDate ? new Date(company.subscription.endDate).toISOString().split('T')[0] : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          },
        });
      }
    } catch (error) {
      console.error('Error fetching company:', error);
      setError('Failed to load company data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.includes('.')) {
      // Handle nested object properties (like address.street, subscription.plan)
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof CompanyFormData] as any),
          [child]: type === 'number' ? parseInt(value) || 0 : value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value) || 0 : value,
      }));
    }
    
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Prepare data for submission - convert date to ISO format
      const submitData = {
        ...formData,
        subscription: {
          ...formData.subscription,
          endDate: new Date(formData.subscription.endDate).toISOString()
        }
      };

      if (isEditing) {
        await api.put(`/companies/${id}`, submitData);
      } else {
        await api.post('/companies', submitData);
      }
      navigate('/companies');
    } catch (error: any) {
      setError(error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} company`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditing ? 'Edit Company' : 'Create New Company'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {isEditing ? 'Update company information' : 'Add a new company to the system'}
        </p>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Company Name *
              </label>
              <input
                type="text"
                name="companyName"
                id="companyName"
                required
                value={formData.companyName}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Contact Email *
              </label>
              <input
                type="email"
                name="contactEmail"
                id="contactEmail"
                required
                value={formData.contactEmail}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Contact Phone *
              </label>
              <input
                type="tel"
                name="contactPhone"
                id="contactPhone"
                required
                value={formData.contactPhone}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="businessRegistrationNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Business Registration Number
              </label>
              <input
                type="text"
                name="businessRegistrationNumber"
                id="businessRegistrationNumber"
                value={formData.businessRegistrationNumber}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tax ID
              </label>
              <input
                type="text"
                name="taxId"
                id="taxId"
                value={formData.taxId}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Industry
              </label>
              <select
                name="industry"
                id="industry"
                value={formData.industry}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Logistics">Logistics</option>
                <option value="Transportation">Transportation</option>
                <option value="Freight">Freight</option>
                <option value="Delivery">Delivery</option>
                <option value="Moving">Moving</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="companySize" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Company Size
              </label>
              <select
                name="companySize"
                id="companySize"
                value={formData.companySize}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Small (1-10)">Small (1-10)</option>
                <option value="Medium (11-50)">Medium (11-50)</option>
                <option value="Large (51-200)">Large (51-200)</option>
                <option value="Enterprise (200+)">Enterprise (200+)</option>
              </select>
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Website
              </label>
              <input
                type="url"
                name="website"
                id="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://example.com"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Address Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Address Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="address.street"
                  id="address.street"
                  required
                  value={formData.address.street}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  City *
                </label>
                <input
                  type="text"
                  name="address.city"
                  id="address.city"
                  required
                  value={formData.address.city}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="address.state" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  State *
                </label>
                <input
                  type="text"
                  name="address.state"
                  id="address.state"
                  required
                  value={formData.address.state}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="address.zipCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  name="address.zipCode"
                  id="address.zipCode"
                  required
                  value={formData.address.zipCode}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="address.country" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Country
                </label>
                <input
                  type="text"
                  name="address.country"
                  id="address.country"
                  value={formData.address.country}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Subscription Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Subscription Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="subscription.plan" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Subscription Plan
                </label>
                <select
                  name="subscription.plan"
                  id="subscription.plan"
                  value={formData.subscription.plan}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Basic">Basic</option>
                  <option value="Professional">Professional</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>

              <div>
                <label htmlFor="subscription.maxUsers" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Max Users
                </label>
                <input
                  type="number"
                  name="subscription.maxUsers"
                  id="subscription.maxUsers"
                  min="1"
                  max="1000"
                  value={formData.subscription.maxUsers}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="subscription.maxTrucks" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Max Trucks
                </label>
                <input
                  type="number"
                  name="subscription.maxTrucks"
                  id="subscription.maxTrucks"
                  min="1"
                  max="10000"
                  value={formData.subscription.maxTrucks}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="subscription.endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Subscription End Date *
                </label>
                <input
                  type="date"
                  name="subscription.endDate"
                  id="subscription.endDate"
                  required
                  value={formData.subscription.endDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/companies')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">{isEditing ? 'Updating...' : 'Creating...'}</span>
                </div>
              ) : (
                isEditing ? 'Update Company' : 'Create Company'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CompanyForm;