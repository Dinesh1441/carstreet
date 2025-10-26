import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, Clock, User, FileText, 
  Edit, Trash2, CheckCircle, Plus, Filter,
  Search, MoreVertical, ChevronDown, AlertCircle,
  Users, Car, Truck, MapPin, Shield,
  X, Eye, Download, Phone, Mail,
  Building, Target, Package, CheckSquare
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

const DeliveryFormsDetails = ({ leadId }) => {
  const [deliveryForms, setDeliveryForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    deliveryStatus: '',
    search: ''
  });
  const [sortConfig, setSortConfig] = useState({ key: 'expectedCompletionDate', direction: 'asc' });
  const [selectedForm, setSelectedForm] = useState(null);
  const [showFormDetails, setShowFormDetails] = useState(false);
  const [formToDelete, setFormToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { token } = useAuth();
  
  const searchInputRef = useRef(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Status options with colors
  const statusOptions = [
    { value: 'Pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'In Progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    { value: 'Completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'Cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
  ];

  // Delivery status options
  const deliveryStatusOptions = [
    { value: 'Delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
    { value: 'Not Delivered', label: 'Not Delivered', color: 'bg-orange-100 text-orange-800' }
  ];

  // RTO options
  const rtoOptions = [
    { value: 'Yes', label: 'Yes', color: 'bg-blue-100 text-blue-800' },
    { value: 'No', label: 'No', color: 'bg-gray-100 text-gray-800' }
  ];

  // Fetch delivery forms
  const fetchDeliveryForms = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      
      if (leadId) {
        params.append('leadId', leadId);
      }
      
      if (filters.status) {
        params.append('status', filters.status);
      }
      if (filters.deliveryStatus) {
        params.append('deliveryStatus', filters.deliveryStatus);
      }
      if (filters.search) {
        params.append('search', filters.search);
      }

      const response = await axios.get(`${backendUrl}/api/delivery/lead/${leadId}`);
      
      if (response.data.success) {
        setDeliveryForms(response.data.data || []);
      } else {
        setError(response.data.message || 'Failed to fetch delivery forms');
      }
    } catch (err) {
      console.error('Error fetching delivery forms:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch delivery forms');
      toast.error('Failed to fetch delivery forms');
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (leadId) {
        fetchDeliveryForms();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [leadId, filters]);

  // Handle search input focus
  const handleSearchContainerClick = (e) => {
    e.stopPropagation();
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setFilters(prev => ({ ...prev, search: value }));
  };

  // Handle sort
  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Sort delivery forms
  const sortedForms = [...deliveryForms].sort((a, b) => {
    if (sortConfig.key === 'expectedCompletionDate') {
      const dateA = new Date(a.expectedCompletionDate);
      const dateB = new Date(b.expectedCompletionDate);
      return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
    }

    if (sortConfig.key === 'createdAt') {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
    }

    const aValue = a[sortConfig.key] || '';
    const bValue = b[sortConfig.key] || '';
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Client-side search as fallback
  const filteredAndSearchedForms = sortedForms.filter(form => {
    if (!filters.search) return true;
    
    const searchTerm = filters.search.toLowerCase();
    return (
      form.name?.toLowerCase().includes(searchTerm) ||
      form.phoneNumber?.toLowerCase().includes(searchTerm) ||
      form.leadId?.name?.toLowerCase().includes(searchTerm) ||
      form.car?.make?.toLowerCase().includes(searchTerm) ||
      form.car?.model?.toLowerCase().includes(searchTerm)
    );
  });

  // Handle delivery form deletion
  const handleDeleteForm = async (formId) => {
    try {
      const response = await axios.delete(`${backendUrl}/api/delivery/${formId}` , { headers: { 'Authorization': `Bearer ${token}` } });
      
      if (response.data.success) {
        toast.success('Delivery form deleted successfully');
        setShowDeleteConfirm(false);
        setFormToDelete(null);
        fetchDeliveryForms();
      }
    } catch (error) {
      toast.error('Failed to delete delivery form');
      console.error('Error deleting delivery form:', error);
    }
  };

  // View form details
  const handleViewForm = (form) => {
    setSelectedForm(form);
    setShowFormDetails(true);
  };

  // Download document
  const handleDownloadDocument = async (fileUrl, fileName) => {
    try {
      const response = await axios.get(`${backendUrl}${fileUrl}`, {
        responseType: 'blob',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'document');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Check if delivery is overdue
  const isOverdue = (form) => {
    if (form.deliveryStatus === 'Delivered') return false;
    
    const expectedDate = new Date(form.expectedCompletionDate);
    const now = new Date();
    return expectedDate < now;
  };

  // Get car display text
  const getCarDisplayText = (car) => {
    if (!car) return 'No car selected';
    
    const brandName = car.brand?.make || car.brand || car.make || 'Unknown Brand';
    const modelName = car.model?.name || car.model || 'Unknown Model';
    const variantName = car.variant?.name || car.variant || '';
    const color = car.color || 'Unknown Color';
    const year = car.year || '';
    
    return `${brandName} ${modelName} ${variantName ? `- ${variantName}` : ''} ${year ? `(${year})` : ''} - ${color}`;
  };

  // Clear search
  const clearSearch = () => {
    setFilters(prev => ({ ...prev, search: '' }));
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading delivery forms...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-700">{error}</p>
        <button 
          onClick={fetchDeliveryForms}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  const displayForms = filteredAndSearchedForms;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Delivery Forms</h2>
          <p className="text-sm text-gray-600">
            {displayForms.length} form{displayForms.length !== 1 ? 's' : ''} found
            {filters.search && ` for "${filters.search}"`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div 
            className="cursor-text"
            onClick={handleSearchContainerClick}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by name, phone, car..."
                value={filters.search}
                onChange={handleSearchChange}
                className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-text"
              />
              {filters.search && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Delivery Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Status</label>
            <select
              value={filters.deliveryStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, deliveryStatus: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Delivery Status</option>
              {deliveryStatusOptions.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: '', deliveryStatus: '', search: '' })}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 w-full"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Delivery Forms Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {displayForms.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No delivery forms found</p>
            <p className="text-gray-400 text-sm">
              {filters.search 
                ? `No delivery forms match "${filters.search}"` 
                : 'No delivery forms have been created for this lead yet'
              }
            </p>
            {(filters.status || filters.deliveryStatus || filters.search) && (
              <button
                onClick={() => setFilters({ status: '', deliveryStatus: '', search: '' })}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer & Car Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sales Person
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayForms.map((form) => {
                  const status = statusOptions.find(s => s.value === form.status) || statusOptions[0];
                  const deliveryStatus = deliveryStatusOptions.find(s => s.value === form.deliveryStatus) || deliveryStatusOptions[1];
                  const rtoStatus = rtoOptions.find(s => s.value === form.rtoTransferred) || rtoOptions[1];
                  const overdue = isOverdue(form);

                  return (
                    <tr key={form._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${
                            form.deliveryStatus === 'Delivered' ? 'bg-green-100 text-green-600' :
                            overdue ? 'bg-red-100 text-red-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            <Truck className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {form.name}
                            </p>
                            <div className="flex items-center mt-1">
                              <Phone className="h-3 w-3 text-gray-400 mr-1" />
                              <span className="text-xs text-gray-500">{form.phoneNumber}</span>
                            </div>
                            <div className="flex items-center mt-1">
                              <Car className="h-3 w-3 text-gray-400 mr-1" />
                              <span className="text-xs text-gray-500 truncate">
                                {getCarDisplayText(form.car)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-900">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            {formatDate(form.expectedCompletionDate)}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Shield className="h-4 w-4 text-gray-400 mr-2" />
                            RTO: <span className={`ml-1 ${rtoStatus.color} px-1.5 py-0.5 rounded text-xs`}>
                              {rtoStatus.label}
                            </span>
                          </div>
                          {form.documents && form.documents.length > 0 && (
                            <div className="flex items-center text-xs text-blue-600">
                              <FileText className="h-3 w-3 mr-1" />
                              {form.documents.length} document{form.documents.length !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                            {status.label}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${deliveryStatus.color}`}>
                            {deliveryStatus.label}
                          </span>
                          {overdue && form.deliveryStatus === 'Not Delivered' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Overdue
                            </span>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {form.soldBy?.name || form.soldBy?.username || 'Unassigned'}
                          </span>
                        </div>
                        {form.createdBy && (
                          <div className="text-xs text-gray-500 mt-1">
                            Created by: {form.createdBy.name || form.createdBy.username}
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleViewForm(form)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          {form.documents && form.documents.length > 0 && (
                            <button
                              onClick={() => form.documents[0] && handleDownloadDocument(form.documents[0].fileUrl, form.documents[0].name)}
                              className="text-green-600 hover:text-green-900 p-1 rounded"
                              title="Download documents"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => {
                              setFormToDelete(form);
                              setShowDeleteConfirm(true);
                            }}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Delete delivery form"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delivery Form Details Modal */}
      {showFormDetails && selectedForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowFormDetails(false)}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block relative align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  onClick={() => setShowFormDetails(false)}
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Delivery Form Details
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Customer Information */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Customer Name</label>
                        <p className="text-sm text-gray-900 mt-1">{selectedForm.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Phone Number</label>
                        <p className="text-sm text-gray-900 mt-1">{selectedForm.phoneNumber}</p>
                      </div>
                    </div>

                    {/* Car Information */}
                    <div>
                      <label className="text-sm font-medium text-gray-500">Car Details</label>
                      <p className="text-sm text-gray-900 mt-1">{getCarDisplayText(selectedForm.car)}</p>
                      {selectedForm.car?.price && (
                        <p className="text-sm text-green-600 mt-1">
                          Price: ₹{selectedForm.car.price.toLocaleString()}
                        </p>
                      )}
                    </div>

                    {/* Delivery Information */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Expected Completion</label>
                        <p className="text-sm text-gray-900 mt-1">
                          {formatDate(selectedForm.expectedCompletionDate)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Delivery Status</label>
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            deliveryStatusOptions.find(s => s.value === selectedForm.deliveryStatus)?.color
                          }`}>
                            {selectedForm.deliveryStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* RTO Information */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">RTO Transferred</label>
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            rtoOptions.find(s => s.value === selectedForm.rtoTransferred)?.color
                          }`}>
                            {selectedForm.rtoTransferred}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Form Status</label>
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            statusOptions.find(s => s.value === selectedForm.status)?.color
                          }`}>
                            {selectedForm.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Sales Information */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Sold By</label>
                        <p className="text-sm text-gray-900 mt-1">
                          {selectedForm.soldBy?.name || selectedForm.soldBy?.username}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Created By</label>
                        <p className="text-sm text-gray-900 mt-1">
                          {selectedForm.createdBy?.name || selectedForm.createdBy?.username}
                        </p>
                      </div>
                    </div>

                    {/* Documents */}
                    {selectedForm.documents && selectedForm.documents.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Documents</label>
                        <div className="mt-2 space-y-2">
                          {selectedForm.documents.map((doc, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-700">{doc.name}</span>
                              </div>
                              <button
                                onClick={() => handleDownloadDocument(doc.fileUrl, doc.name)}
                                className="text-blue-600 hover:text-blue-700 text-sm"
                              >
                                Download
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Overdue Warning */}
                    {isOverdue(selectedForm) && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center">
                          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                          <span className="text-sm font-medium text-red-800">Delivery Overdue</span>
                        </div>
                        <p className="text-sm text-red-600 mt-1">
                          Expected delivery date has passed. Please update the delivery status.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && formToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowDeleteConfirm(false)}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block relative align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Delete Delivery Form
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete the delivery form for "{formToDelete.name}"? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => handleDeleteForm(formToDelete._id)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setFormToDelete(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryFormsDetails;