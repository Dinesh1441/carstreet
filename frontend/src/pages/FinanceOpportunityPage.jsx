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
    Building,
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
    Banknote,
    AlertTriangle,
    AlertCircle
  } from 'lucide-react';
  import axios from 'axios';
  import { toast } from 'react-toastify';
  import * as XLSX from 'xlsx';
  import FinanceOpportunity from '../components/FinanceOpportunity';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

  const FinanceOpportunityPage = () => {
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
      owner: '',
      status: 'all',
      stage: 'all',
      financeStatus: 'all',
      loanType: 'all',
      loanSanctioned: 'all'
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
    const { isSuperAdmin, token } = useAuth();
    const navigate = useNavigate();
    const [dropdownData, setDropdownData] = useState({
      owners: [],
      loanTypes: [],
      financeStatuses: [],
      stages: []
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

        const response = await axios.get(`${backend_url}/api/financeopportunity/all`, { 
          params,
           headers: { 'Authorization': `Bearer ${token}` } 


        } );

        if (response.data.status === 'success') {
          setOpportunities(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching finance opportunities:', error);
        toast.error('Failed to fetch finance opportunities');
      } finally {
        setLoading(false);
      }
    };

    // Fetch dropdown data
    const fetchDropdownData = async () => {
      try {
        const [ownersRes] = await Promise.all([
          axios.get(`${backend_url}/api/users/all` , { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        setDropdownData({
          owners: ownersRes.data.data || [],
          loanTypes: [
            'Individual',
            'Company', 
            'Salaried Persons',
            'Limited Company',
            'Private Limited Company',
            'Limited Liability Partnership',
            'Partnership',
            'Society/Trust'
          ],
          financeStatuses: [
            'Documents Pending',
            'Under Process/Application',
            'Loan Approved',
            'Loan Rejected',
            'Loan Disbursed'
          ],
          stages: [
            'Document Pending',
            'Under Process/Application',
            'Loan Approved'
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
        financeStatus: 'all',
        loanType: 'all',
        loanSanctioned: 'all'
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
          'Loan Amount': opp.loanAmount ? formatCurrency(opp.loanAmount) : 'N/A',
          'Loan Type': opp.loanType,
          'Finance Status': opp.financeStatus,
          'Banks Applied To': opp.banksAppliedTo?.join(', ') || 'N/A',
          'Approved Bank': opp.approvedBank || 'N/A',
          'Rate of Interest': opp.rateOfInterest ? `${opp.rateOfInterest}%` : 'N/A',
          'Period of Repayment': opp.periodOfRepayment || 'N/A',
          'Loan Number': opp.loanNumber || 'N/A',
          'Loan Sanctioned': opp.loanSanctioned ? 'Yes' : 'No',
          'Documents Pending': opp.documentsPending || 'N/A',
          'Created Date': new Date(opp.createdAt).toLocaleDateString()
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Finance Opportunities');
        
        XLSX.writeFile(workbook, `finance-opportunities-${new Date().toISOString().split('T')[0]}.xlsx`);
        
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
        const response = await axios.delete(`${backend_url}/api/financeopportunity/${opportunityToDelete._id}` , { headers: { 'Authorization': `Bearer ${token}` } });
        
        if (response.data.status === 'success') {
          toast.success('Finance opportunity deleted successfully');
          fetchOpportunities();
          setShowDeleteModal(false);
          setOpportunityToDelete(null);
        }
      } catch (error) {
        console.error('Error deleting finance opportunity:', error);
        toast.error('Failed to delete finance opportunity');
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
        const response = await axios.patch(`${backend_url}/api/financeopportunity/${id}/status`, {
          status: newStatus
        } , { headers: { 'Authorization': `Bearer ${token}` } });

        if (response.data.status === 'success') {
          toast.success(`Finance opportunity marked as ${newStatus}`);
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
        case 'Document Pending': return 'bg-yellow-100 text-yellow-800';
        case 'Under Process/Application': return 'bg-orange-100 text-orange-800';
        case 'Loan Approved': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    // Get finance status color
    const getFinanceStatusColor = (status) => {
      switch (status) {
        case 'Documents Pending': return 'bg-yellow-100 text-yellow-800';
        case 'Under Process/Application': return 'bg-blue-100 text-blue-800';
        case 'Loan Approved': return 'bg-green-100 text-green-800';
        case 'Loan Rejected': return 'bg-red-100 text-red-800';
        case 'Loan Disbursed': return 'bg-purple-100 text-purple-800';
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
            <p className="mt-4 text-gray-600">Loading finance opportunities...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Finance Opportunities</h1>
              <p className="text-gray-600 mt-1">Manage and track all finance opportunities</p>
            </div>
            <div className="flex gap-2 mt-4 sm:mt-0">
              {isSuperAdmin && (<button
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
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {opportunities.filter(opp => opp.financeStatus === 'Loan Approved').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Banknote className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Loan Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(opportunities.reduce((sum, opp) => sum + (opp.loanAmount || 0), 0))}
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
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {opportunities.filter(opp => opp.financeStatus === 'Loan Rejected').length}
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
                placeholder="Search finance opportunities..."
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
                  <label className="block text-xs font-medium text-gray-700 mb-1">Finance Status</label>
                  <select
                    value={filters.financeStatus}
                    onChange={(e) => handleFilterChange('financeStatus', e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Finance Status</option>
                    {dropdownData.financeStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Loan Type</label>
                  <select
                    value={filters.loanType}
                    onChange={(e) => handleFilterChange('loanType', e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Loan Types</option>
                    {dropdownData.loanTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Loan Sanctioned</label>
                  <select
                    value={filters.loanSanctioned}
                    onChange={(e) => handleFilterChange('loanSanctioned', e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
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
                    Loan Details
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('loanAmount')}
                  >
                    <div className="flex items-center">
                      Loan Amount
                      {sortField === 'loanAmount' && (
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
                    onClick={() => handleSort('financeStatus')}
                  >
                    <div className="flex items-center">
                      Finance Status
                      {sortField === 'financeStatus' && (
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
                        <Building className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {opportunity.loanType}
                          </div>
                          {opportunity.approvedBank && (
                            <div className="text-xs text-gray-500">
                              {opportunity.approvedBank}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(opportunity.loanAmount)}
                      </div>
                      {opportunity.rateOfInterest && (
                        <div className="text-xs text-gray-500">
                          {opportunity.rateOfInterest}% ROI
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStageColor(opportunity.stage)}`}>
                        {opportunity.stage}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getFinanceStatusColor(opportunity.financeStatus)}`}>
                        {opportunity.financeStatus}
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
                          onClick={() => navigate(`/leads/${opportunity.leadId._id}`)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="View Lead Details"
                        >
                          <User className="h-4 w-4" />
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
                            onClick={() => showDeleteConfirmation(opportunity)}
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

          {opportunities.length === 0 && !loading && (
            <div className="text-center py-12">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No finance opportunities found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || activeFiltersCount > 0 
                  ? 'Try adjusting your search or filters' 
                  : 'Get started by creating your first finance opportunity'
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
                onClick={() =>  setShowAddModal(false)}
              ></div>
              
              <div className="fixed inset-y-0 right-0 max-w-full flex">
                <div className="w-screen max-w-2xl">
                  <div className="h-full flex flex-col bg-white shadow-xl overflow-y-auto">
                  <FinanceOpportunity 
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
                    <FinanceOpportunity 
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
                    Delete Finance Opportunity
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Are you sure you want to delete the finance opportunity for{' '}
                    <span className="font-semibold text-gray-900">{opportunityToDelete.name}</span>?
                    This action cannot be undone.
                  </p>

                  {/* Opportunity Details */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Loan Amount:</span>
                        <p className="font-medium text-gray-900">
                          {formatCurrency(opportunityToDelete.loanAmount)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Loan Type:</span>
                                            <p className="font-medium text-gray-900">
                          {opportunityToDelete.loanType}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <p className="font-medium text-gray-900">
                          {opportunityToDelete.status}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Finance Status:</span>
                        <p className="font-medium text-gray-900">
                          {opportunityToDelete.financeStatus}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Warning Message */}
                  <div className="flex items-start p-3 bg-yellow-50 rounded-lg mb-6">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-sm text-yellow-800 text-left">
                      This will permanently delete the finance opportunity and all associated data. 
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
          <div className="fixed inset-0  flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-gray-300 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getFinanceStatusColor(selectedOpportunity.financeStatus)}`}>
                        {selectedOpportunity.financeStatus}
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
                        <IndianRupee className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold text-gray-900">Loan Details</h3>
                        <p className="text-lg font-bold text-gray-900 mt-1">
                          {formatCurrency(selectedOpportunity.loanAmount)}
                        </p>
                        {selectedOpportunity.rateOfInterest && (
                          <p className="text-sm text-gray-600">
                            {selectedOpportunity.rateOfInterest}% Interest
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <Building className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold text-gray-900">Bank Information</h3>
                        <p className="text-sm text-gray-900 mt-1">
                          {selectedOpportunity.approvedBank || 'No approved bank'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedOpportunity.banksAppliedTo?.length || 0} banks applied
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <IndianRupee className="h-5 w-5 mr-2 text-green-600" />
                        Loan Information
                      </h3>
                      <div className="space-y-3">
                        <DetailItem label="Loan Type" value={selectedOpportunity.loanType} icon={FileText} />
                        <DetailItem label="Loan Amount" value={formatCurrency(selectedOpportunity.loanAmount)} icon={IndianRupee} />
                        <DetailItem label="Rate of Interest" value={selectedOpportunity.rateOfInterest ? `${selectedOpportunity.rateOfInterest}%` : 'N/A'} icon={Percent} />
                        <DetailItem label="Period of Repayment" value={selectedOpportunity.periodOfRepayment} icon={Calendar} />
                        <DetailItem label="Loan Number" value={selectedOpportunity.loanNumber} icon={CreditCard} />
                        <DetailItem label="Loan Sanctioned" value={selectedOpportunity.loanSanctioned ? 'Yes' : 'No'} icon={CheckCircle} />
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Target className="h-5 w-5 mr-2 text-blue-600" />
                        Process Information
                      </h3>
                      <div className="space-y-3">
                        <DetailItem label="Stage" value={selectedOpportunity.stage} icon={Target} />
                        <DetailItem label="Finance Status" value={selectedOpportunity.financeStatus} icon={TrendingUp} />
                        <DetailItem label="Status" value={selectedOpportunity.status} icon={Shield} />
                        <DetailItem label="Owner" value={selectedOpportunity.owner?.username} icon={User} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Building className="h-5 w-5 mr-2 text-orange-600" />
                        Bank Information
                      </h3>
                      <div className="space-y-3">
                        <DetailItem label="Approved Bank" value={selectedOpportunity.approvedBank} icon={Building} />
                        <div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <div className="flex items-center text-sm text-gray-600">
                              <Building className="h-4 w-4 mr-2" />
                              Banks Applied To:
                            </div>
                          </div>
                          {selectedOpportunity.banksAppliedTo && selectedOpportunity.banksAppliedTo.length > 0 ? (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {selectedOpportunity.banksAppliedTo.map((bank, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {bank}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">No banks applied</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-red-600" />
                        Documents & Additional Information
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-start py-2 border-b border-gray-100">
                            <div className="flex items-center text-sm text-gray-600">
                              <FileText className="h-4 w-4 mr-2" />
                              Documents Pending:
                            </div>
                          </div>
                          <p className="text-sm text-gray-900 mt-1">
                            {selectedOpportunity.documentsPending || 'No pending documents'}
                          </p>
                        </div>
                        <DetailItem label="Created" value={formatDate(selectedOpportunity.createdAt)} icon={Calendar} />
                        {selectedOpportunity.updatedAt && (
                          <DetailItem label="Last Updated" value={formatDate(selectedOpportunity.updatedAt)} icon={Calendar} />
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

  export default FinanceOpportunityPage;