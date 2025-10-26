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
  AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import BuyOpportunity from '../components/BuyOpportunity'; // Your existing component
import { useAuth } from '../contexts/AuthContext';

const BuyOpportunityPage = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    owner: '',
    source: '',
    status: 'all',
    stage: 'all',
    make: '',
    model: '',
    carAvailabilityStatus: 'all',
    finance: 'all',
    rto: 'all',
    insurance: 'all'
  });
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState(null);
  const { isSuperAdmin, token } = useAuth();
  const [dropdownData, setDropdownData] = useState({
    owners: [],
    brands: [],
    models: [],
    sources: []
  });
  
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [opportunityToDelete, setOpportunityToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const backend_url = import.meta.env.VITE_BACKEND_URL;

  // Fetch opportunities
  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm || undefined,
        sortBy: sortField,
        sortOrder: sortOrder,
        page: currentPage,
        limit: itemsPerPage
      };

      // Add filters to params
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== 'all') {
          params[key] = filters[key];
        }
      });

    const response = await axios.get(`${backend_url}/api/buyopportunity/all`, {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

      if (response.data.status === 'success') {
        setOpportunities(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      toast.error('Failed to fetch opportunities');
    } finally {
      setLoading(false);
    }
  };

  console.log('Opportunities:', opportunities);

  // Fetch dropdown data
  const fetchDropdownData = async () => {
    try {
      const [ownersRes, brandsRes, modelsRes] = await Promise.all([
        axios.get(`${backend_url}/api/users/all` , { headers: { 'Authorization': `Bearer ${token}` } }),
        axios.get(`${backend_url}/api/makes/all`, { headers: { 'Authorization': `Bearer ${token}` } }),
        axios.get(`${backend_url}/api/models/all`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      setDropdownData({
        owners: ownersRes.data.data || [],
        brands: brandsRes.data.makes || [],
        models: modelsRes.data.models || [],
        sources: ['Cartrade', 'Website', 'Referral', 'Walk-in', 'Social Media', 'Other']
      });
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      toast.error('Failed to load filter options');
    }
  };

  useEffect(() => {
    fetchOpportunities();
    fetchDropdownData();
  }, [searchTerm, filters, sortField, sortOrder, currentPage]);

  // Search handler
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Filter handlers
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      owner: '',
      source: '',
      status: 'all',
      stage: 'all',
      make: '',
      model: '',
      carAvailabilityStatus: 'all',
      finance: 'all',
      rto: 'all',
      insurance: 'all'
    });
  };

  // Sort handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Export to Excel/CSV
  const exportToExcel = () => {
    try {
      const data = opportunities.map(opp => ({
        'Opportunity Name': opp.name,
        'Email': opp.email || 'N/A',
        'Phone': opp.phoneNumber || 'N/A',
        'Owner': opp.owner?.username || 'N/A',
        'Source': opp.source,
        'Status': opp.status,
        'Stage': opp.stage,
        'Make': opp.make?.name || 'N/A',
        'Model': opp.model?.name || 'N/A',
        'Variant': opp.variant?.name || 'N/A',
        'Min Budget': opp.minBudget || 'N/A',
        'Max Budget': opp.maxBudget || 'N/A',
        'Finance': opp.finance,
        'RTO': opp.rto,
        'Insurance': opp.insurance,
        'Created Date': new Date(opp.createdAt).toLocaleDateString()
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Buy Opportunities');
      
      // Export as Excel
      XLSX.writeFile(workbook, `buy-opportunities-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  // View opportunity details
  const viewOpportunityDetails = (opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowDetailsModal(true);
  };

  // Edit opportunity
  const editOpportunity = (opportunity) => {
    setEditingOpportunity(opportunity);
    setShowEditModal(true);
  };

  // Show delete confirmation modal
  const confirmDelete = (opportunity) => {
    setOpportunityToDelete(opportunity);
    setShowDeleteModal(true);
  };

  // Delete opportunity
  const deleteOpportunity = async () => {
    if (!opportunityToDelete) return;

    try {
      setDeleting(true);
      const response = await axios.delete(`${backend_url}/api/buyopportunity/${opportunityToDelete._id}` , { headers: { 'Authorization': `Bearer ${token}` } });
      
      if (response.data.status === 'success') {
        toast.success('Opportunity deleted successfully');
        fetchOpportunities();
        setShowDeleteModal(false);
        setOpportunityToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      toast.error('Failed to delete opportunity');
    } finally {
      setDeleting(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setOpportunityToDelete(null);
    setDeleting(false);
  };

  // Update opportunity status
  const updateStatus = async (id, newStatus) => {
    try {
      const response = await axios.patch(`${backend_url}/api/buyopportunity/${id}/status`, {
        status: newStatus
      } , { headers: { 'Authorization': `Bearer ${token}` } });

      if (response.data.status === 'success') {
        toast.success(`Opportunity marked as ${newStatus}`);
        fetchOpportunities();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  // Handle successful add/edit
  const handleOpportunitySuccess = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    fetchOpportunities();
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Won': return 'bg-green-100 text-green-800 border-green-200';
      case 'Lost': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get stage color
  const getStageColor = (stage) => {
    switch (stage) {
      case 'Fresh Lead': return 'bg-purple-100 text-purple-800';
      case 'Lead': return 'bg-indigo-100 text-indigo-800';
      case 'Negotiation': return 'bg-yellow-100 text-yellow-800';
      case 'Test Drive': return 'bg-orange-100 text-orange-800';
      case 'Showroom Visit': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Active filters count
  const activeFiltersCount = Object.values(filters).filter(value => 
    value && value !== 'all'
  ).length;

  if (loading && opportunities.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 md:py-0">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Buy Opportunities</h1>
            <p className="text-gray-600 mt-1">Manage and track all buy opportunities</p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            {isSuperAdmin && ( <button
              onClick={exportToExcel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center transition-colors"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export Excel
            </button> )}
            {/* <button 
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Opportunity
            </button> */}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Opportunities</p>
                <p className="text-2xl font-bold text-gray-900">{opportunities.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Won</p>
                <p className="text-2xl font-bold text-gray-900">
                  {opportunities.filter(opp => opp.status === 'Won').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Open</p>
                <p className="text-2xl font-bold text-gray-900">
                  {opportunities.filter(opp => opp.status === 'Open').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <IndianRupee className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Lost</p>
                <p className="text-2xl font-bold text-gray-900">
                  {opportunities.filter(opp => opp.status === 'Lost').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search - Small Size */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search opportunities..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Owner Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Owner</label>
                <select
                  value={filters.owner}
                  onChange={(e) => handleFilterChange('owner', e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Owners</option>
                  {dropdownData.owners.map(owner => (
                    <option key={owner._id} value={owner._id}>{owner.username}</option>
                  ))}
                </select>
              </div>

              {/* Source Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Source</label>
                <select
                  value={filters.source}
                  onChange={(e) => handleFilterChange('source', e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Sources</option>
                  {dropdownData.sources.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="Open">Open</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              {/* Stage Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Stage</label>
                <select
                  value={filters.stage}
                  onChange={(e) => handleFilterChange('stage', e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Stages</option>
                  <option value="Fresh Lead">Fresh Lead</option>
                  <option value="Lead">Lead</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Test Drive">Test Drive</option>
                  <option value="Showroom Visit">Showroom Visit</option>
                </select>
              </div>

              {/* Make Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Make</label>
                <select
                  value={filters.make}
                  onChange={(e) => handleFilterChange('make', e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Makes</option>
                  {dropdownData.brands.map(brand => (
                    <option key={brand._id} value={brand._id}>{brand.make}</option>
                  ))}
                </select>
              </div>

              {/* Additional Filters Row */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Finance</label>
                <select
                  value={filters.finance}
                  onChange={(e) => handleFilterChange('finance', e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Finance</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Maybe">Maybe</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">RTO</label>
                <select
                  value={filters.rto}
                  onChange={(e) => handleFilterChange('rto', e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All RTO</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Maybe">Maybe</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Insurance</label>
                <select
                  value={filters.insurance}
                  onChange={(e) => handleFilterChange('insurance', e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Insurance</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Availability</label>
                <select
                  value={filters.carAvailabilityStatus}
                  onChange={(e) => handleFilterChange('carAvailabilityStatus', e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Availability</option>
                  <option value="Available">Available</option>
                  <option value="Not Available">Not Available</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Opportunities Table */}
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
                    Customer
                    {sortField === 'name' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('stage')}
                >
                  <div className="flex items-center">
                    Stage
                    {sortField === 'stage' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    Status
                    {sortField === 'status' && (
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
              {opportunities.map((opportunity) => (
                <tr key={opportunity._id} className="hover:bg-gray-50 transition-colors">
                  {/* Customer Column */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div>
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex-shrink-0 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                          {opportunity.name?.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {opportunity.name}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center mt-1">
                            <Phone className="h-3 w-3 mr-1" />
                            {opportunity.phoneNumber || 'N/A'}
                          </div>
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
                          {opportunity.make?.name} {opportunity.model?.name}
                        </div>
                        {opportunity.variant && (
                          <div className="text-xs text-gray-500">
                            {opportunity.variant.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Budget Column */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatCurrency(opportunity.minBudget)} - {formatCurrency(opportunity.maxBudget)}
                    </div>
                  </td>

                  {/* Stage Column */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStageColor(opportunity.stage)}`}>
                      {opportunity.stage}
                    </span>
                  </td>

                  {/* Status Column */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(opportunity.status)}`}>
                      {opportunity.status}
                    </span>
                  </td>

                  {/* Created Date */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      {formatDate(opportunity.createdAt)}
                    </div>
                  </td>

                  {/* Actions Column */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => viewOpportunityDetails(opportunity)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => editOpportunity(opportunity)}
                        className="text-green-600 hover:text-green-900 transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {opportunity.status === 'Open' && (
                        <>
                          <button
                            onClick={() => updateStatus(opportunity._id, 'Won')}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="Mark as Won"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => updateStatus(opportunity._id, 'Lost')}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Mark as Lost"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {isSuperAdmin && (
                        <button
                          onClick={() => confirmDelete(opportunity)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                      </button> )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {opportunities.length === 0 && !loading && (
          <div className="text-center py-12">
            <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || activeFiltersCount > 0 
                ? 'Try adjusting your search or filters' 
                : 'Get started by creating your first buy opportunity'
              }
            </p>
            {/* <button 
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center mx-auto transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Opportunity
            </button> */}
          </div>
        )}
      </div>

      {/* Pagination */}
      {opportunities.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-medium">{Math.min(currentPage * itemsPerPage, opportunities.length)}</span> of{' '}
            <span className="font-medium">{opportunities.length}</span> results
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
              disabled={currentPage * itemsPerPage >= opportunities.length}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )} 

      {/* Delete Confirmation Modal */}
      {showDeleteModal && opportunityToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center z  sm:block sm:p-0">
       

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block border border-gray-300 align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Delete Opportunity
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this opportunity? This action cannot be undone.
                    </p>
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center text-red-600 font-bold text-sm">
                          {opportunityToDelete.name?.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {opportunityToDelete.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {opportunityToDelete.make?.name} {opportunityToDelete.model?.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatCurrency(opportunityToDelete.minBudget)} - {formatCurrency(opportunityToDelete.maxBudget)}
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
                  onClick={deleteOpportunity}
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

      {/* Add Opportunity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="absolute inset-0 bg-gray-300 opacity-75 transition-opacity" 
              onClick={handleOpportunitySuccess}
            ></div>
            
            <div className="fixed inset-y-0 right-0 max-w-full flex">
              <div className="w-screen max-w-2xl">
                <div className="h-full flex flex-col bg-white shadow-xl overflow-y-auto">
                 <BuyOpportunity 
                  onClose={() => setShowAddModal(false)}
                  onSuccess={handleOpportunitySuccess}
                  isEdit={false}
                />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Opportunity Modal */}
      {showEditModal && editingOpportunity && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="absolute inset-0 bg-gray-300 opacity-75 transition-opacity" 
              onClick={handleOpportunitySuccess}
            ></div>
            
            <div className="fixed inset-y-0 right-0 max-w-full flex">
              <div className="w-screen max-w-2xl">
                <div className="h-full flex flex-col bg-white shadow-xl overflow-y-auto">
                  <BuyOpportunity 
                    onClose={() => setShowEditModal(false)}
                    onSuccess={handleOpportunitySuccess}
                    opportunity={editingOpportunity}
                    isEdit={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedOpportunity && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50 ">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar border border-gray overflow-hidden">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedOpportunity.name}</h2>
                  <div className="flex items-center gap-4 mt-2">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(selectedOpportunity.status)}`}>
                      {selectedOpportunity.status}
                    </span>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStageColor(selectedOpportunity.stage)}`}>
                      {selectedOpportunity.stage}
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
                      <h3 className="font-semibold text-gray-900">{selectedOpportunity.name}</h3>
                      <div className="flex items-center mt-1 text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-1" />
                        {selectedOpportunity.email || 'No email'}
                      </div>
                      <div className="flex items-center mt-1 text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-1" />
                        {selectedOpportunity.phoneNumber || 'No phone'}
                      </div>
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
                        {selectedOpportunity.make?.name} {selectedOpportunity.model?.name}
                      </h3>
                      {selectedOpportunity.variant && (
                        <p className="text-sm text-gray-600 mt-1">{selectedOpportunity.variant.name}</p>
                      )}
                      {selectedOpportunity.year && (
                        <p className="text-sm text-gray-600">Year: {selectedOpportunity.year}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Budget Card */}
                <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <IndianRupee className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-gray-900">Budget Range</h3>
                      <p className="text-lg font-bold text-gray-900 mt-1">
                        {formatCurrency(selectedOpportunity.minBudget)} - {formatCurrency(selectedOpportunity.maxBudget)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Process Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Target className="h-5 w-5 mr-2 text-blue-600" />
                      Process Information
                    </h3>
                    <div className="space-y-3">
                      <DetailItem label="Source" value={selectedOpportunity.source} icon={MapPin} />
                      <DetailItem label="Stage" value={selectedOpportunity.stage} icon={Target} />
                      <DetailItem label="Buying Intent" value={selectedOpportunity.buyingIntent} icon={Calendar} />
                      <DetailItem label="Car Availability" value={selectedOpportunity.carAvailabilityStatus} icon={Car} />
                    </div>
                  </div>

                  {/* Financial Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <CreditCard className="h-5 w-5 mr-2 text-green-600" />
                      Financial Information
                    </h3>
                    <div className="space-y-3">
                      <DetailItem label="Finance" value={selectedOpportunity.finance} icon={CreditCard} />
                      {selectedOpportunity.financeAmount && (
                        <DetailItem label="Finance Amount" value={formatCurrency(selectedOpportunity.financeAmount)} icon={IndianRupee} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* RTO Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FileCheck className="h-5 w-5 mr-2 text-orange-600" />
                      RTO Information
                    </h3>
                    <div className="space-y-3">
                      <DetailItem label="RTO Required" value={selectedOpportunity.rto} icon={FileCheck} />
                      {selectedOpportunity.rtoTransferName && (
                        <DetailItem label="RC Transfer Name" value={selectedOpportunity.rtoTransferName} />
                      )}
                      {selectedOpportunity.rtoChoiceNumber && (
                        <DetailItem label="Choice Number" value={selectedOpportunity.rtoChoiceNumber} />
                      )}
                      {selectedOpportunity.rtoProcessToBeDone && (
                        <DetailItem label="Process to be Done" value={selectedOpportunity.rtoProcessToBeDone} />
                      )}
                      {selectedOpportunity.rtoRequiredState && (
                        <DetailItem label="Required State" value={selectedOpportunity.rtoRequiredState} />
                      )}
                    </div>
                  </div>

                  {/* Insurance & Additional Info */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-red-600" />
                      Additional Information
                    </h3>
                    <div className="space-y-3">
                      <DetailItem label="Insurance" value={selectedOpportunity.insurance} icon={Shield} />
                      <DetailItem label="Colour" value={selectedOpportunity.colour} />
                      <DetailItem label="Car Status" value={selectedOpportunity.carStatus} />
                      <DetailItem label="Created" value={formatDate(selectedOpportunity.createdAt)} icon={Calendar} />
                      <DetailItem label="Owner" value={selectedOpportunity.owner?.username} icon={User} />
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
                    editOpportunity(selectedOpportunity);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Opportunity
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

export default BuyOpportunityPage;