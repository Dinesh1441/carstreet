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
  DollarSign,
  Shield,
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
  FileCheck,
  Banknote,
  AlertTriangle,
  AlertCircle,
  Building
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import InsuranceOpportunity from '../components/InsuranceOpportunity';

const InsuranceOpportunityPage = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    owner: '',
    status: 'all',
    stage: 'all',
    currentInsuranceValidity: 'all',
    insuranceType: 'all'
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [opportunityToDelete, setOpportunityToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [dropdownData, setDropdownData] = useState({
    owners: [],
    insuranceTypes: [],
    stages: [],
    validityOptions: []
  });

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

      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== 'all') {
          params[key] = filters[key];
        }
      });

      const response = await axios.get(`${backend_url}/api/insuranceopportunity/all`, { params });

      if (response.data.status === 'success') {
        setOpportunities(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching insurance opportunities:', error);
      toast.error('Failed to fetch insurance opportunities');
    } finally {
      setLoading(false);
    }
  };

  // Fetch dropdown data
  const fetchDropdownData = async () => {
    try {
      const [ownersRes] = await Promise.all([
        axios.get(`${backend_url}/api/users/all`)
      ]);

      setDropdownData({
        owners: ownersRes.data.data || [],
        insuranceTypes: [
          'Comprehensive',
          'Third Party', 
          'Zero Depreciation'
        ],
        stages: [
          'Inspection',
          'Quotation',
          'Documentation',
          'Payment'
        ],
        validityOptions: [
          'Date',
          'Expired'
        ]
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
      status: 'all',
      stage: 'all',
      currentInsuranceValidity: 'all',
      insuranceType: 'all'
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
        'Status': opp.status,
        'Stage': opp.stage,
        'Insurance Cost': opp.costOfInsurance ? formatCurrency(opp.costOfInsurance) : 'N/A',
        'Insurance Type': opp.insuranceType,
        'Current Insurance Validity': opp.currentInsuranceValidity,
        'Insurer Name': opp.insurerName || 'N/A',
        'Insurance Term': opp.insuranceTerm || 'N/A',
        'Insurance Expiry Date': opp.insuranceExpiryDate ? formatDate(opp.insuranceExpiryDate) : 'N/A',
        'Documents Status': opp.documentsStatus?.join(', ') || 'N/A',
        'Created Date': formatDate(opp.createdAt)
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Insurance Opportunities');
      
      XLSX.writeFile(workbook, `insurance-opportunities-${new Date().toISOString().split('T')[0]}.xlsx`);
      
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

  // Show delete confirmation
  const showDeleteConfirmation = (opportunity) => {
    setOpportunityToDelete(opportunity);
    setShowDeleteModal(true);
  };

  // Delete opportunity
  const deleteOpportunity = async () => {
    if (!opportunityToDelete) return;

    try {
      setDeleting(true);
      const response = await axios.delete(`${backend_url}/api/insuranceopportunity/${opportunityToDelete._id}`);
      
      if (response.data.status === 'success') {
        toast.success('Insurance opportunity deleted successfully');
        fetchOpportunities();
        setShowDeleteModal(false);
        setOpportunityToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting insurance opportunity:', error);
      toast.error('Failed to delete insurance opportunity');
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
      const response = await axios.put(`${backend_url}/api/insuranceopportunity/${id}`, {
        status: newStatus
      });

      if (response.data.status === 'success') {
        toast.success(`Insurance opportunity marked as ${newStatus}`);
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
    setEditingOpportunity(null);
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
      case 'Inspection': return 'bg-yellow-100 text-yellow-800';
      case 'Quotation': return 'bg-orange-100 text-orange-800';
      case 'Documentation': return 'bg-blue-100 text-blue-800';
      case 'Payment': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get validity color
  const getValidityColor = (validity) => {
    switch (validity) {
      case 'Date': return 'bg-green-100 text-green-800';
      case 'Expired': return 'bg-red-100 text-red-800';
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
    if (!dateString) return 'N/A';
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
          <p className="mt-4 text-gray-600">Loading insurance opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Insurance Opportunities</h1>
            <p className="text-gray-600 mt-1">Manage and track all insurance opportunities</p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <button 
              onClick={exportToExcel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center transition-colors"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export Excel
            </button>
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
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Insurance Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(opportunities.reduce((sum, opp) => sum + (opp.costOfInsurance || 0), 0))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expired Policies</p>
                <p className="text-2xl font-bold text-gray-900">
                  {opportunities.filter(opp => opp.currentInsuranceValidity === 'Expired').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search insurance opportunities..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

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

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Stage</label>
                <select
                  value={filters.stage}
                  onChange={(e) => handleFilterChange('stage', e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Stages</option>
                  {dropdownData.stages.map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Insurance Validity</label>
                <select
                  value={filters.currentInsuranceValidity}
                  onChange={(e) => handleFilterChange('currentInsuranceValidity', e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Validity</option>
                  {dropdownData.validityOptions.map(validity => (
                    <option key={validity} value={validity}>{validity}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Insurance Type</label>
                <select
                  value={filters.insuranceType}
                  onChange={(e) => handleFilterChange('insuranceType', e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Insurance Types</option>
                  {dropdownData.insuranceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
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
                  Insurance Details
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('costOfInsurance')}
                >
                  <div className="flex items-center">
                    Insurance Cost
                    {sortField === 'costOfInsurance' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
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
                  onClick={() => handleSort('currentInsuranceValidity')}
                >
                  <div className="flex items-center">
                    Validity
                    {sortField === 'currentInsuranceValidity' && (
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

                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {opportunity.insuranceType || 'N/A'}
                        </div>
                        {opportunity.insurerName && (
                          <div className="text-xs text-gray-500">
                            {opportunity.insurerName}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatCurrency(opportunity.costOfInsurance)}
                    </div>
                    {opportunity.insuranceTerm && (
                      <div className="text-xs text-gray-500">
                        {opportunity.insuranceTerm}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStageColor(opportunity.stage)}`}>
                      {opportunity.stage}
                    </span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getValidityColor(opportunity.currentInsuranceValidity)}`}>
                      {opportunity.currentInsuranceValidity}
                    </span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(opportunity.status)}`}>
                      {opportunity.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      {formatDate(opportunity.createdAt)}
                    </div>
                  </td>

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
                      <button
                        onClick={() => showDeleteConfirmation(opportunity)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {opportunities.length === 0 && !loading && (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No insurance opportunities found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || activeFiltersCount > 0 
                ? 'Try adjusting your search or filters' 
                : 'Get started by creating your first insurance opportunity'
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

      {/* Add Opportunity Modal */}
      {showAddModal && (

        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="absolute inset-0 bg-gray-300 opacity-75 transition-opacity" 
              onClick={() => setShowAddModal(false)}
            ></div>
            
            <div className="fixed inset-y-0 right-0 max-w-full flex">
              <div className="w-screen max-w-2xl">
                <div className="h-full flex flex-col bg-white shadow-xl overflow-y-auto">
                    <InsuranceOpportunity 
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
              onClick={() => setShowEditModal(false)}
            ></div>
            
            <div className="fixed inset-y-0 right-0 max-w-full flex">
              <div className="w-screen max-w-2xl">
                <div className="h-full flex flex-col bg-white shadow-xl overflow-y-auto">
                   <InsuranceOpportunity 
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && opportunityToDelete && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-300 rounded-lg max-w-md w-full mx-auto transform transition-all">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-center mb-4">
                <div className="flex-shrink-0">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Delete Insurance Opportunity
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to delete the insurance opportunity for{' '}
                  <span className="font-semibold text-gray-900">{opportunityToDelete.name}</span>?
                  This action cannot be undone.
                </p>

                {/* Opportunity Details */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Insurance Cost:</span>
                      <p className="font-medium text-gray-900">
                        {formatCurrency(opportunityToDelete.costOfInsurance)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Insurance Type:</span>
                      <p className="font-medium text-gray-900">
                        {opportunityToDelete.insuranceType || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <p className="font-medium text-gray-900">
                        {opportunityToDelete.status}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Validity:</span>
                      <p className="font-medium text-gray-900">
                        {opportunityToDelete.currentInsuranceValidity}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Warning Message */}
                <div className="flex items-start p-3 bg-yellow-50 rounded-lg mb-6">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-yellow-800 text-left">
                    This will permanently delete the insurance opportunity and all associated data. 
                    This action cannot be reversed.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelDelete}
                  disabled={deleting}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteOpportunity}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete Opportunity
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedOpportunity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
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
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getValidityColor(selectedOpportunity.currentInsuranceValidity)}`}>
                      {selectedOpportunity.currentInsuranceValidity}
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

                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-gray-900">Insurance Cost</h3>
                      <p className="text-lg font-bold text-gray-900 mt-1">
                        {formatCurrency(selectedOpportunity.costOfInsurance)}
                      </p>
                      {selectedOpportunity.insuranceTerm && (
                        <p className="text-sm text-gray-600">
                          {selectedOpportunity.insuranceTerm}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <Shield className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-gray-900">Insurance Information</h3>
                      <p className="text-sm text-gray-900 mt-1">
                        {selectedOpportunity.insurerName || 'No insurer'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedOpportunity.insuranceType || 'No type'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-green-600" />
                      Insurance Information
                    </h3>
                    <div className="space-y-3">
                      <DetailItem label="Insurance Type" value={selectedOpportunity.insuranceType} icon={Shield} />
                      <DetailItem label="Insurance Cost" value={formatCurrency(selectedOpportunity.costOfInsurance)} icon={DollarSign} />
                      <DetailItem label="Insurance Term" value={selectedOpportunity.insuranceTerm} icon={Calendar} />
                      <DetailItem label="Insurer Name" value={selectedOpportunity.insurerName} icon={Building} />
                      <DetailItem label="Insurance Expiry Date" value={formatDate(selectedOpportunity.insuranceExpiryDate)} icon={Calendar} />
                      <DetailItem label="Current Insurance Validity" value={selectedOpportunity.currentInsuranceValidity} icon={CheckCircle} />
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Target className="h-5 w-5 mr-2 text-blue-600" />
                      Process Information
                    </h3>
                    <div className="space-y-3">
                      <DetailItem label="Stage" value={selectedOpportunity.stage} icon={Target} />
                      <DetailItem label="Status" value={selectedOpportunity.status} icon={TrendingUp} />
                      <DetailItem label="Owner" value={selectedOpportunity.owner?.username} icon={User} />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-orange-600" />
                      Documents Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <div className="flex items-center text-sm text-gray-600">
                            <FileText className="h-4 w-4 mr-2" />
                            Documents Status:
                          </div>
                        </div>
                        {selectedOpportunity.documentsStatus && selectedOpportunity.documentsStatus.length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {selectedOpportunity.documentsStatus.map((document, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {document}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">No documents selected</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-red-600" />
                      Additional Information
                    </h3>
                    <div className="space-y-3">
                      <DetailItem label="Created" value={formatDate(selectedOpportunity.createdAt)} icon={Calendar} />
                      {selectedOpportunity.updatedAt && (
                        <DetailItem label="Last Updated" value={formatDate(selectedOpportunity.updatedAt)} icon={Calendar} />
                      )}
                      {selectedOpportunity.leadId && (
                        <DetailItem label="Lead" value={selectedOpportunity.leadId?.name} icon={User} />
                      )}
                    </div>
                  </div>
                </div>
              </div>

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

export default InsuranceOpportunityPage;