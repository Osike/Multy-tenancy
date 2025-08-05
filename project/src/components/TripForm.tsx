import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  TruckIcon,
  UserIcon,
  CalendarIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  PlusIcon,
  TrashIcon,
  PaperClipIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from './LoadingSpinner';

interface MaintenanceExpense {
  itemService: string;
  cost: number;
  serviceProvider: string;
  date: string;
  notes: string;
}

interface TripFormData {
  tripId: string;
  truck: string;
  driver: string;
  tripDate: string;
  fromLocation: string;
  toLocation: string;
  cargoDetails: {
    goodsType: string;
    weight: number;
    weightUnit: string;
    description: string;
    specialRequirements: string[];
  };
  customer: string;
  rate: number;
  currency: string;
  fuelCost: number;
  mileageCost: number;
  driverSalary: number;
  roadTolls: number;
  maintenanceExpenses: MaintenanceExpense[];
  comments: string;
  status: string;
}

interface Truck {
  _id: string;
  plateNumber: string;
  model: string;
  year: number;
  status: string;
}

interface Driver {
  _id: string;
  fullName: string;
  username: string;
  email: string;
}

interface Customer {
  _id: string;
  customerName: string;
  contactPerson: string;
  email: string;
}

const TripForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, api } = useAuth();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [specialRequirement, setSpecialRequirement] = useState('');

  const [formData, setFormData] = useState<TripFormData>({
    tripId: '',
    truck: '',
    driver: '',
    tripDate: new Date().toISOString().split('T')[0],
    fromLocation: '',
    toLocation: '',
    cargoDetails: {
      goodsType: '',
      weight: 0,
      weightUnit: 'lbs',
      description: '',
      specialRequirements: []
    },
    customer: '',
    rate: 0,
    currency: 'USD',
    fuelCost: 0,
    mileageCost: 0,
    driverSalary: 0,
    roadTolls: 0,
    maintenanceExpenses: [],
    comments: '',
    status: 'Scheduled'
  });

  // Auto-generate Trip ID
  useEffect(() => {
    if (!isEdit && !formData.tripId) {
      const generateTripId = () => {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 5).toUpperCase();
        return `TRP-${timestamp}-${random}`;
      };
      setFormData(prev => ({ ...prev, tripId: generateTripId() }));
    }
  }, [isEdit, formData.tripId]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [trucksRes, driversRes, customersRes] = await Promise.all([
          api.get('/api/trucks?status=Available'),
          api.get('/api/users?role=driver&isActive=true'),
          api.get('/api/customers?isActive=true')
        ]);

        setTrucks(trucksRes.data.data || []);
        setDrivers(driversRes.data.data || []);
        setCustomers(customersRes.data.data || []);

        if (isEdit) {
          const tripRes = await api.get(`/api/trips/${id}`);
          const trip = tripRes.data.data;
          setFormData({
            tripId: trip.tripId,
            truck: trip.truck._id,
            driver: trip.driver._id,
            tripDate: new Date(trip.tripDate).toISOString().split('T')[0],
            fromLocation: trip.fromLocation,
            toLocation: trip.toLocation,
            cargoDetails: {
              goodsType: trip.cargoDetails?.goodsType || '',
              weight: trip.cargoDetails?.weight || 0,
              weightUnit: trip.cargoDetails?.weightUnit || 'lbs',
              description: trip.cargoDetails?.description || '',
              specialRequirements: trip.cargoDetails?.specialRequirements || []
            },
            customer: trip.customer._id,
            rate: trip.rate,
            currency: trip.currency,
            fuelCost: trip.fuelCost,
            mileageCost: trip.mileageCost,
            driverSalary: trip.driverSalary,
            roadTolls: trip.roadTolls,
            maintenanceExpenses: trip.maintenanceExpenses || [],
            comments: trip.comments || '',
            status: trip.status
          });
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [id, isEdit, api]);

  // Calculate totals
  const totalTripExpenses = formData.fuelCost + formData.mileageCost + formData.driverSalary + formData.roadTolls;
  const totalMaintenanceExpenses = formData.maintenanceExpenses.reduce((sum, exp) => sum + exp.cost, 0);
  const totalExpenses = totalTripExpenses + totalMaintenanceExpenses;
  const netProfit = formData.rate - totalExpenses;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('cargoDetails.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        cargoDetails: {
          ...prev.cargoDetails,
          [field]: field === 'weight' ? parseFloat(value) || 0 : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name.includes('Cost') || name === 'rate' || name === 'driverSalary' || name === 'roadTolls' 
          ? parseFloat(value) || 0 
          : value
      }));
    }
  };

  const addSpecialRequirement = () => {
    if (specialRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        cargoDetails: {
          ...prev.cargoDetails,
          specialRequirements: [...prev.cargoDetails.specialRequirements, specialRequirement.trim()]
        }
      }));
      setSpecialRequirement('');
    }
  };

  const removeSpecialRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      cargoDetails: {
        ...prev.cargoDetails,
        specialRequirements: prev.cargoDetails.specialRequirements.filter((_, i) => i !== index)
      }
    }));
  };

  const addMaintenanceExpense = () => {
    setFormData(prev => ({
      ...prev,
      maintenanceExpenses: [
        ...prev.maintenanceExpenses,
        {
          itemService: '',
          cost: 0,
          serviceProvider: '',
          date: new Date().toISOString().split('T')[0],
          notes: ''
        }
      ]
    }));
  };

  const updateMaintenanceExpense = (index: number, field: keyof MaintenanceExpense, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      maintenanceExpenses: prev.maintenanceExpenses.map((exp, i) => 
        i === index ? { ...exp, [field]: field === 'cost' ? parseFloat(value as string) || 0 : value } : exp
      )
    }));
  };

  const removeMaintenanceExpense = (index: number) => {
    setFormData(prev => ({
      ...prev,
      maintenanceExpenses: prev.maintenanceExpenses.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        recordedBy: user?._id
      };

      if (isEdit) {
        await api.put(`/api/trips/${id}`, submitData);
      } else {
        await api.post('/api/trips', submitData);
      }

      navigate('/trips');
    } catch (error) {
      console.error('Error saving trip:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setFormData({
      tripId: '',
      truck: '',
      driver: '',
      tripDate: new Date().toISOString().split('T')[0],
      fromLocation: '',
      toLocation: '',
      cargoDetails: {
        goodsType: '',
        weight: 0,
        weightUnit: 'lbs',
        description: '',
        specialRequirements: []
      },
      customer: '',
      rate: 0,
      currency: 'USD',
      fuelCost: 0,
      mileageCost: 0,
      driverSalary: 0,
      roadTolls: 0,
      maintenanceExpenses: [],
      comments: '',
      status: 'Scheduled'
    });
    setAttachments([]);
    setSpecialRequirement('');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <TruckIcon className="h-12 w-12 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Trip Tracker</h1>
        </div>
        <p className="text-gray-600">Complete Trip Expense & Profit Management</p>
        <p className="text-sm text-gray-500 mt-1">Track every expense, maximize every profit</p>
        
        <div className="flex justify-center space-x-4 mt-6">
          <button className="bg-pink-100 text-pink-800 px-4 py-2 rounded-lg font-medium">
            📄 {isEdit ? 'Edit Trip' : 'New Trip'}
          </button>
          <button className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg font-medium">
            📊 Trip History
          </button>
          <button className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-medium">
            📈 Reports
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Trip Information Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center mb-6">
            <TruckIcon className="h-6 w-6 text-orange-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Trip Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trip ID</label>
              <input
                type="text"
                name="tripId"
                value={formData.tripId}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Truck/Vehicle</label>
              <select
                name="truck"
                value={formData.truck}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Truck</option>
                {trucks.map(truck => (
                  <option key={truck._id} value={truck._id}>
                    {truck.plateNumber} - {truck.model} ({truck.year})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Driver</label>
              <select
                name="driver"
                value={formData.driver}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Driver</option>
                {drivers.map(driver => (
                  <option key={driver._id} value={driver._id}>
                    {driver.fullName} ({driver.username})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trip Date</label>
              <input
                type="date"
                name="tripDate"
                value={formData.tripDate}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From (Origin)</label>
              <input
                type="text"
                name="fromLocation"
                value={formData.fromLocation}
                onChange={handleInputChange}
                placeholder="e.g., Mombasa Port"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To (Destination)</label>
              <input
                type="text"
                name="toLocation"
                value={formData.toLocation}
                onChange={handleInputChange}
                placeholder="e.g., Nairobi CBD"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Cargo/Goods Information Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center mb-6">
            <MapPinIcon className="h-6 w-6 text-purple-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Cargo & Goods Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer/Company</label>
              <select
                name="customer"
                value={formData.customer}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Customer/Company</option>
                {customers.map(customer => (
                  <option key={customer._id} value={customer._id}>
                    {customer.customerName} - {customer.contactPerson}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type of Goods</label>
              <input
                type="text"
                name="cargoDetails.goodsType"
                value={formData.cargoDetails.goodsType}
                onChange={handleInputChange}
                placeholder="e.g., Electronics, Food Products, Machinery"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
              <div className="flex">
                <input
                  type="number"
                  name="cargoDetails.weight"
                  value={formData.cargoDetails.weight}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
                <select
                  name="cargoDetails.weightUnit"
                  value={formData.cargoDetails.weightUnit}
                  onChange={handleInputChange}
                  className="p-3 border border-l-0 border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 bg-gray-50"
                >
                  <option value="lbs">lbs</option>
                  <option value="kg">kg</option>
                  <option value="tons">tons</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
              <input
                type="text"
                name="cargoDetails.description"
                value={formData.cargoDetails.description}
                onChange={handleInputChange}
                placeholder="Additional details about the goods"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Special Requirements</label>
            <div className="flex mb-2">
              <input
                type="text"
                value={specialRequirement}
                onChange={(e) => setSpecialRequirement(e.target.value)}
                placeholder="e.g., Fragile, Temperature Controlled, Hazardous"
                className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialRequirement())}
              />
              <button
                type="button"
                onClick={addSpecialRequirement}
                className="px-4 py-3 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
            
            {formData.cargoDetails.specialRequirements.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.cargoDetails.specialRequirements.map((req, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                  >
                    {req}
                    <button
                      type="button"
                      onClick={() => removeSpecialRequirement(index)}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Revenue Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center mb-6">
            <CurrencyDollarIcon className="h-6 w-6 text-green-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Revenue</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rate (Money Offered for Trip)</label>
              <input
                type="number"
                name="rate"
                value={formData.rate}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD (C$)</option>
                <option value="AUD">AUD (A$)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Trip Expenses Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center mb-6">
            <DocumentTextIcon className="h-6 w-6 text-red-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Trip Expenses</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Cost</label>
              <input
                type="number"
                name="fuelCost"
                value={formData.fuelCost}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mileage Cost</label>
              <input
                type="number"
                name="mileageCost"
                value={formData.mileageCost}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Driver Salary</label>
              <input
                type="number"
                name="driverSalary"
                value={formData.driverSalary}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Road Tolls</label>
              <input
                type="number"
                name="roadTolls"
                value={formData.roadTolls}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Maintenance Expenses Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <UserIcon className="h-6 w-6 text-blue-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">Maintenance Expenses</h2>
            </div>
            <button
              type="button"
              onClick={addMaintenanceExpense}
              className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Maintenance Item
            </button>
          </div>
          
          {formData.maintenanceExpenses.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="p-3 text-left border">Item/Service</th>
                    <th className="p-3 text-left border">Cost ($)</th>
                    <th className="p-3 text-left border">Service Provider</th>
                    <th className="p-3 text-left border">Date</th>
                    <th className="p-3 text-left border">Notes</th>
                    <th className="p-3 text-left border">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.maintenanceExpenses.map((expense, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-3 border">
                        <input
                          type="text"
                          value={expense.itemService}
                          onChange={(e) => updateMaintenanceExpense(index, 'itemService', e.target.value)}
                          placeholder="e.g., Oil Change"
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-3 border">
                        <input
                          type="number"
                          value={expense.cost}
                          onChange={(e) => updateMaintenanceExpense(index, 'cost', e.target.value)}
                          min="0"
                          step="0.01"
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-3 border">
                        <input
                          type="text"
                          value={expense.serviceProvider}
                          onChange={(e) => updateMaintenanceExpense(index, 'serviceProvider', e.target.value)}
                          placeholder="e.g., AutoShop XYZ"
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-3 border">
                        <input
                          type="date"
                          value={expense.date}
                          onChange={(e) => updateMaintenanceExpense(index, 'date', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-3 border">
                        <input
                          type="text"
                          value={expense.notes}
                          onChange={(e) => updateMaintenanceExpense(index, 'notes', e.target.value)}
                          placeholder="Additional notes..."
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-3 border text-center">
                        <button
                          type="button"
                          onClick={() => removeMaintenanceExpense(index)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Comments & Attachments Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center mb-6">
            <PaperClipIcon className="h-6 w-6 text-gray-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Comments & Attachments</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Comments/Notes</label>
              <textarea
                name="comments"
                value={formData.comments}
                onChange={handleInputChange}
                rows={4}
                placeholder="Add any additional comments about this trip..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Attach Receipts/Proof (Optional)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Click to upload receipts, invoices, or proof documents</p>
                <p className="text-sm text-gray-500">Supported: PDF, Images, Word documents</p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="mt-4"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Trip Profit Summary */}
        <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center mb-6">
            <CurrencyDollarIcon className="h-6 w-6 text-white mr-2" />
            <h2 className="text-xl font-semibold">Trip Profit Summary</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
              <p className="text-sm font-medium mb-1">TOTAL RATE</p>
              <p className="text-2xl font-bold">${formData.rate.toFixed(2)}</p>
            </div>
            
            <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
              <p className="text-sm font-medium mb-1">TOTAL EXPENSES</p>
              <p className="text-2xl font-bold">${totalExpenses.toFixed(2)}</p>
            </div>
            
            <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
              <p className="text-sm font-medium mb-1">NET PROFIT</p>
              <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-white' : 'text-red-200'}`}>
                ${netProfit.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
          >
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            {loading ? 'Saving...' : 'Save Trip Record'}
          </button>
          
          <button
            type="button"
            onClick={clearForm}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Clear Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default TripForm;
