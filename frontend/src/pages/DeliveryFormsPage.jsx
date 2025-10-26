import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  ChevronDown, 
  ChevronUp,
  X,
  Users,
  TrendingUp,
  IndianRupee,
  Car,
  Phone,
  Mail,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpDown,
  SlidersHorizontal,
  FileSpreadsheet,
  MapPin,
  Target,
  Percent,
  User,
  CreditCard,
  Shield,
  FileCheck,
  AlertTriangle,
  Truck,
  Package,
  Building,
  CheckSquare,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import DeliveryFormDrawer from '../components/DeliveryFormDrawer';
import { useAuth } from '../contexts/AuthContext';

const DeliveryFormsPage = () => {
  const [deliveryForms, setDeliveryForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    soldBy: '',
    rtoTransferred: 'all',
    dateFrom: '',
    dateTo: ''
  });
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedForm, setSelectedForm] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingForm, setEditingForm] = useState(null);
  const [dropdownData, setDropdownData] = useState({
    users: [],
    cars: []
  });
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formToDelete, setFormToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { isSuperAdmin, token } = useAuth();

  const backend_url = import.meta.env.VITE_BACKEND_URL;

  // Fetch delivery forms
  const fetchDeliveryForms = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backend_url}/api/delivery`, { headers: { 'Authorization': `Bearer ${token}` } });

      if (response.data.success) {
        setDeliveryForms(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching delivery forms:', error);
      toast.error('Failed to fetch delivery forms');
    } finally {
      setLoading(false);
    }
  };

  // Fetch dropdown data
  const fetchDropdownData = async () => {
    try {
      const [usersRes, carsRes] = await Promise.all([
        axios.get(`${backend_url}/api/users/all`, { headers: { 'Authorization': `Bearer ${token}` } }),
        axios.get(`${backend_url}/api/cars`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      setDropdownData({
        users: usersRes.data.data || [],
        cars: carsRes.data.data?.cars || carsRes.data.data || []
      });
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      toast.error('Failed to load filter options');
    }
  };

  useEffect(() => {
    fetchDeliveryForms();
    fetchDropdownData();
  }, []);

  // IMPROVED: Get car display text - handles all possible car data structures
  const getCarDisplayText = (car) => {
    if (!car) return 'No car selected';
    
    // If car is just an ID string
    if (typeof car === 'string') {
      return 'Car details not available';
    }
    
    // If car is an object with populated fields
    if (typeof car === 'object') {
      const brandName = car.brand?.make || car.make || car.brand || 'Unknown Brand';
      const modelName = car.model?.name || car.model || 'Unknown Model';
      const variantName = car.variant?.name || car.variant || '';
      const color = car.color || '';
      const registration = car.registrationNumber || '';
      
      let displayText = `${brandName} ${modelName}`;
      if (variantName) displayText += ` ${variantName}`;
      if (color) displayText += ` - ${color}`;
      if (registration) displayText += ` (${registration})`;
      
      return displayText;
    }
    
    return 'Car details not available';
  };

  // FIXED: Apply filters and search with improved search logic
  const filteredForms = deliveryForms.filter(form => {
    const searchLower = searchTerm.toLowerCase().trim();
    
    // If there's a search term, check all searchable fields
    if (searchLower) {
      const searchableFields = [
        form.name?.toLowerCase() || '',
        form.phoneNumber?.toLowerCase() || '',
        form.leadId?.name?.toLowerCase() || '',
        getCarDisplayText(form.car)?.toLowerCase() || '',
        form.soldBy?.name?.toLowerCase() || '',
        form.soldBy?.username?.toLowerCase() || '',
        form.rtoTransferred?.toLowerCase() || ''
      ];

      const matchesSearch = searchableFields.some(field => 
        field.includes(searchLower)
      );

      if (!matchesSearch) return false;
    }

    // RTO Transferred filter
    if (filters.rtoTransferred !== 'all' && form.rtoTransferred !== filters.rtoTransferred) {
      return false;
    }

    // Sold By filter
    if (filters.soldBy && form.soldBy?._id !== filters.soldBy) {
      return false;
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      const formDate = new Date(form.createdAt);
      
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        if (formDate < fromDate) return false;
      }
      
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999); // End of the day
        if (formDate > toDate) return false;
      }
    }

    return true;
  });

  // Sort delivery forms (unchanged)
  const sortedForms = [...filteredForms].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (sortField === 'expectedCompletionDate' || sortField === 'createdAt') {
      const dateA = new Date(aValue);
      const dateB = new Date(bValue);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination (unchanged)
  const paginatedForms = sortedForms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // FIXED: Search handler - reset to page 1 when searching
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Filter handlers (unchanged)
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      soldBy: '',
      rtoTransferred: 'all',
      dateFrom: '',
      dateTo: ''
    });
    setSearchTerm(''); // Also clear search when clearing filters
    setCurrentPage(1);
  };

  // Sort handler (unchanged)
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Export to Excel/CSV (unchanged)
  const exportToExcel = () => {
    try {
      const data = deliveryForms.map(form => ({
        'Customer Name': form.name,
        'Phone Number': form.phoneNumber || 'N/A',
        'Lead': form.leadId?.name || 'N/A',
        'Car': getCarDisplayText(form.car),
        'Sold By': form.soldBy?.name || form.soldBy?.username || 'N/A',
        'RTO Transferred': form.rtoTransferred,
        'Expected Completion': form.expectedCompletionDate ? new Date(form.expectedCompletionDate).toLocaleDateString() : 'N/A',
        'Actual Delivery': form.actualDeliveryDate ? new Date(form.actualDeliveryDate).toLocaleDateString() : 'N/A',
        'Documents Count': form.documents?.length || 0,
        'Created Date': new Date(form.createdAt).toLocaleDateString()
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Delivery Forms');
      
      XLSX.writeFile(workbook, `delivery-forms-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  // View form details (unchanged)
  const viewFormDetails = (form) => {
    setSelectedForm(form);
    setShowDetailsModal(true);
  };

  // Edit form (unchanged)
  const editForm = (form) => {
    setEditingForm(form);
    setShowEditModal(true);
  };

  // Show delete confirmation modal (unchanged)
  const confirmDelete = (form) => {
    setFormToDelete(form);
    setShowDeleteModal(true);
  };

  // Delete form (unchanged)
  const deleteForm = async () => {
    if (!formToDelete) return;

    try {
      setDeleting(true);
      const response = await axios.delete(`${backend_url}/api/delivery/${formToDelete._id}` , { headers: { 'Authorization': `Bearer ${token}` } });
      
      if (response.data.success) {
        toast.success('Delivery form deleted successfully');
        fetchDeliveryForms();
        setShowDeleteModal(false);
        setFormToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting delivery form:', error);
      toast.error('Failed to delete delivery form');
    } finally {
      setDeleting(false);
    }
  };

  // Cancel delete (unchanged)
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setFormToDelete(null);
    setDeleting(false);
  };

  // MARK AS DELIVERED (unchanged)
  const markAsDelivered = async (form) => {
    try {
      const response = await axios.put(`${backend_url}/api/delivery/${form._id}`, {
        deliveryStatus: 'Delivered',
        actualDeliveryDate: new Date().toISOString()
      }, { headers: { 'Authorization': `Bearer ${token}` } });

      if (response.data.success) {
        toast.success('Delivery form marked as delivered');
        fetchDeliveryForms();
      }
    } catch (error) {
      console.error('Error marking as delivered:', error);
      toast.error('Failed to update delivery status');
    }
  };

  // DOWNLOAD DOCUMENT (unchanged)
  const downloadDocument = async (document) => {
    try {
      const link = document.createElement('a');
      link.href = document.fileUrl;
      link.download = document.name || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Document download started');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  // Handle successful edit (unchanged)
  const handleFormSuccess = () => {
    setShowEditModal(false);
    fetchDeliveryForms();
  };

  // Get RTO status color (unchanged)
  const getRTOColor = (status) => {
    switch (status) {
      case 'Yes': return 'bg-blue-100 text-blue-800';
      case 'No': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format currency (unchanged)
  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date (unchanged)
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Check if delivery is overdue (unchanged)
  const isOverdue = (form) => {
    if (form.deliveryStatus === 'Delivered') return false;
    
    const expectedDate = new Date(form.expectedCompletionDate);
    const now = new Date();
    return expectedDate < now;
  };

  // Active filters count - UPDATED to include search term
  const activeFiltersCount = [
    ...Object.values(filters).filter(value => value && value !== 'all'),
    searchTerm
  ].filter(Boolean).length;

  // Loading state (unchanged)
  if (loading && deliveryForms.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading delivery forms...</p>
        </div>
      </div>
    );
  }

  // The rest of your JSX remains exactly the same...
  // Only the search functionality and getCarDisplayText function have been fixed

  return (
    <div className="min-h-screen py-6 md:py-0">
      {/* Header */}
      <div className="mb-8 ">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Delivery Forms</h1>
            <p className="text-gray-600 mt-1">Manage and track all vehicle delivery forms</p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            {isSuperAdmin && (
              <button
                onClick={exportToExcel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center transition-colors"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export Excel
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Forms</p>
                <p className="text-2xl font-bold text-gray-900">{deliveryForms.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">RTO Transferred</p>
                <p className="text-2xl font-bold text-gray-900">
                  {deliveryForms.filter(form => form.rtoTransferred === 'Yes').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {deliveryForms.filter(form => isOverdue(form)).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer name, phone, car, sales person..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter Toggle and Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 border rounded-lg flex items-center text-sm transition-colors ${
                showFilters 
                  ? 'bg-blue-100 border-blue-300 text-blue-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters - Collapsible */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* RTO Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">RTO Transferred</label>
                <select
                  value={filters.rtoTransferred}
                  onChange={(e) => handleFilterChange('rtoTransferred', e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All RTO</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              {/* Sold By Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Sold By</label>
                <select
                  value={filters.soldBy}
                  onChange={(e) => handleFilterChange('soldBy', e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Sales Persons</option>
                  {dropdownData.users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.username} - {user.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date From Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date From</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Date To Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date To</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delivery Forms Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Customer Details
                    {sortField === 'name' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle Details
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('expectedCompletionDate')}
                >
                  <div className="flex items-center">
                    Delivery Schedule
                    {sortField === 'expectedCompletionDate' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('rtoTransferred')}
                >
                  <div className="flex items-center">
                    RTO Status
                    {sortField === 'rtoTransferred' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center">
                    Created
                    {sortField === 'createdAt' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedForms.map((form) => {
                const overdue = isOverdue(form);
                
                return (
                  <tr key={form._id} className="hover:bg-gray-50 transition-colors">
                    {/* Customer Column */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>
                        <div className="flex items-center">
                          <div className="h-8 w-8 flex-shrink-0 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                            {form.name?.charAt(0)}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {form.name}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center mt-1">
                              <Phone className="h-3 w-3 mr-1" />
                              {form.phoneNumber || 'N/A'}
                            </div>
                            {form.leadId && (
                              <div className="text-xs text-gray-500 flex items-center mt-1">
                                <User className="h-3 w-3 mr-1" />
                                Lead: {form.leadId.name}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Vehicle Column */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <Car className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {getCarDisplayText(form.car)}
                          </div>
                          {form.car?.color && (
                            <div className="text-xs text-gray-500">
                              Color: {form.car.color}
                            </div>
                          )}
                          {form.car?.price && (
                            <div className="text-xs text-green-600 font-medium">
                              {formatCurrency(form.car.price)}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Delivery Schedule Column */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          {formatDate(form.expectedCompletionDate)}
                        </div>
                        {overdue && (
                          <div className="flex items-center text-xs text-red-600">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Overdue
                          </div>
                        )}
                        {form.actualDeliveryDate && (
                          <div className="flex items-center text-xs text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Delivered: {formatDate(form.actualDeliveryDate)}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* RTO Status Column */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRTOColor(form.rtoTransferred)}`}>
                        RTO: {form.rtoTransferred}
                      </span>
                    </td>

                    {/* Created Date */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        {formatDate(form.createdAt)}
                      </div>
                      {form.soldBy && (
                        <div className="text-xs text-gray-500 mt-1">
                          By: {form.soldBy.name || form.soldBy.username}
                        </div>
                      )}
                    </td>

                    {/* Actions Column */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => viewFormDetails(form)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => editForm(form)}
                          className="text-green-600 hover:text-green-900 transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        
                        {/* MARK AS DELIVERED Button - Only show for Not Delivered forms */}
                        {form.deliveryStatus === 'Not Delivered' && (
                          <button
                            onClick={() => markAsDelivered(form)}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="Mark as Delivered"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        
                        {/* DOWNLOAD DOCUMENTS Button - Only show if documents exist */}
                        {form.documents && form.documents.length > 0 && (
                          <a
                            href={`${backend_url}${form.documents[0].fileUrl}`}
                            download
                            target='_blank'
                            className="text-purple-600 hover:text-purple-900 transition-colors"
                            title="Download Document"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        )}

                        {isSuperAdmin && (
                          <button
                            onClick={() => confirmDelete(form)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {paginatedForms.length === 0 && !loading && (
          <div className="text-center py-12">
            <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No delivery forms found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || activeFiltersCount > 0 
                ? 'Try adjusting your search or filters' 
                : 'No delivery forms available'
              }
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredForms.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredForms.length)}</span> of{' '}
            <span className="font-medium">{filteredForms.length}</span> results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage * itemsPerPage >= filteredForms.length}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && formToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={cancelDelete}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen " aria-hidden="true">&#8203;</span>

            <div className="inline-block border relative border-gray-300 align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Delete Delivery Form
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this delivery form? This action cannot be undone.
                    </p>
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center text-red-600 font-bold text-sm">
                          {formToDelete.name?.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {formToDelete.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getCarDisplayText(formToDelete.car)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formToDelete.phoneNumber}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={deleteForm}
                  disabled={deleting}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
                <button
                  type="button"
                  onClick={cancelDelete}
                  disabled={deleting}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingForm && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="absolute inset-0 bg-gray-300 opacity-75 transition-opacity" 
              onClick={handleFormSuccess}
            ></div>
            
            <div className="fixed inset-y-0 right-0 max-w-full flex">
              <div className="w-screen max-w-2xl">
                <div className="h-full flex flex-col bg-white shadow-xl overflow-y-auto">
                  <DeliveryFormDrawer 
                    onClose={() => setShowEditModal(false)}
                    onSuccess={handleFormSuccess}
                    deliveryForm={editingForm}
                    isEdit={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedForm && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg hide-scrollbar max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-300 overflow-hidden">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedForm.name}</h2>
                  <div className="flex items-center gap-4 mt-2">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRTOColor(selectedForm.rtoTransferred)}`}>
                      RTO: {selectedForm.rtoTransferred}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Customer Info Card */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-gray-900">{selectedForm.name}</h3>
                      <div className="flex items-center mt-1 text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-1" />
                        {selectedForm.phoneNumber || 'No phone'}
                      </div>
                      {selectedForm.leadId && (
                        <div className="flex items-center mt-1 text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-1" />
                          Lead: {selectedForm.leadId.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Vehicle Info Card */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <Car className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-gray-900">
                        {getCarDisplayText(selectedForm.car)}
                      </h3>
                      {selectedForm.car?.color && (
                        <p className="text-sm text-gray-600 mt-1">Color: {selectedForm.car.color}</p>
                      )}
                      {selectedForm.car?.price && (
                        <p className="text-lg font-bold text-gray-900 mt-1">
                          {formatCurrency(selectedForm.car.price)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sales Info Card */}
                <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-gray-900">Sales Information</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Sold By: {selectedForm.soldBy?.name || selectedForm.soldBy?.username}
                      </p>
                      <p className="text-sm text-gray-600">
                        Created By: {selectedForm.createdBy?.name || selectedForm.createdBy?.username}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Delivery Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Truck className="h-5 w-5 mr-2 text-blue-600" />
                      Delivery Information
                    </h3>
                    <div className="space-y-3">
                      <DetailItem label="Expected Completion" value={formatDate(selectedForm.expectedCompletionDate)} icon={Calendar} />
                      <DetailItem label="Actual Delivery" value={selectedForm.actualDeliveryDate ? formatDate(selectedForm.actualDeliveryDate) : 'Not Delivered'} icon={CheckCircle} />
                      <DetailItem label="RTO Transferred" value={selectedForm.rtoTransferred} icon={FileCheck} />
                      {isOverdue(selectedForm) && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
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

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Documents Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-orange-600" />
                      Documents
                    </h3>
                    <div className="space-y-3">
                      {selectedForm.documents && selectedForm.documents.length > 0 ? (
                        selectedForm.documents.map((doc, index) => (
                          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                            <div className="flex items-center text-sm text-gray-600">
                              <FileText className="h-4 w-4 mr-2" />
                              {doc.name}
                            </div>
                            <button
                              onClick={() => downloadDocument(doc)}
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              Download
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No documents uploaded</p>
                      )}
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-red-600" />
                      Additional Information
                    </h3>
                    <div className="space-y-3">
                      <DetailItem label="Created Date" value={formatDate(selectedForm.createdAt)} icon={Calendar} />
                      <DetailItem label="Last Updated" value={selectedForm.updatedAt ? formatDate(selectedForm.updatedAt) : 'Never'} icon={Clock} />
                      {selectedForm.updatedBy && (
                        <DetailItem label="Last Updated By" value={selectedForm.updatedBy?.name || selectedForm.updatedBy?.username} icon={User} />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    editForm(selectedForm);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Delivery Form
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Detail Item Component with Icons
const DetailItem = ({ label, value, icon: Icon }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
    <div className="flex items-center text-sm text-gray-600">
      {Icon && <Icon className="h-4 w-4 mr-2" />}
      {label}:
    </div>
    <span className="text-sm font-medium text-gray-900">{value || 'N/A'}</span>
  </div>
);

export default DeliveryFormsPage;