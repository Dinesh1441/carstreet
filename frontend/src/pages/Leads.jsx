import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, Filter, Download, ChevronLeft, ChevronRight, User, Phone, Mail, MapPin, 
  Briefcase, Eye, Edit, Trash2, Plus, BarChart3, Users, PhoneCall, CheckCircle, RefreshCw,
  AlertCircle, UserPlus, X, Calendar, Tag, MoreVertical, Loader
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AddLead from '../components/AddLead';
import { toast } from 'react-toastify';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    assignedTo: 'all',
    source: 'all',
    dateRange: 'all',
    dateFrom: '',
    dateTo: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [leadsPerPage] = useState(10);
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showLeadDrawer, setShowLeadDrawer] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [drawerMode, setDrawerMode] = useState('add');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Fetch leads from API with pagination using Axios - FIXED
  const fetchLeads = async (page = 1, refresh = false, search = '', filterParams = {}) => {
    try {
      if (refresh) setRefreshing(true);
      else if (page === 1) setLoading(true);
      
      const response = await axios.post(
        `${backendUrl}/api/leads/all`,
        {
          page,
          limit: leadsPerPage,
          sort: '-createdAt',
          search: search || searchTerm,
          filters: filterParams || filters
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.status === "success") {
        const leadsData = response.data.data.leads || response.data.data;
        setLeads(leadsData);
        setFilteredLeads(leadsData);
        setTotalLeads(response.data.data.total || 0);
        setTotalPages(response.data.data.pages || 1);
        setError(null);
      } else {
        throw new Error(response.data.message || 'Unknown error occurred');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch leads';
      setError(errorMessage);
      setLeads([]);
      setFilteredLeads([]);
      setTotalLeads(0);
      setTotalPages(0);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/users/all`, {
        params: {
          page: 1,
          limit: 100
        }
      });
      
      if (response.data.status === "success") {
        setUsers(response.data.data.users || response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      toast.error('Failed to load users');
    }
  };

  useEffect(() => {
    fetchLeads(currentPage);
    fetchUsers();
  }, [currentPage]);

  // Enhanced search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm || Object.values(filters).some(val => val !== 'all' && val !== '')) {
        setCurrentPage(1);
        fetchLeads(1, false, searchTerm, filters);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filters]);

  // Handle refresh
  const handleRefresh = () => {
    fetchLeads(currentPage, true);
    fetchUsers();
    toast.info('Refreshing leads...');
  };

  // Handle lead view
  const handleViewLead = (lead) => {
    navigate(`/leads/${lead._id}`);
  };

  // Handle add lead
  const handleAddLead = () => {
    setSelectedLead(null);
    setDrawerMode('add');
    setShowLeadDrawer(true);
  };

  // Handle edit lead
  const handleEditLead = (lead) => {
    setSelectedLead(lead);
    setDrawerMode('edit');
    setShowLeadDrawer(true);
  };

  // Handle delete lead
  const handleDeleteLead = (lead) => {
    setSelectedLead(lead);
    setShowDeleteModal(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!selectedLead) return;

    try {
      setDeleteLoading(true);
      const response = await axios.delete(`${backendUrl}/api/leads/delete/${selectedLead._id}`);

      if (response.data.status === 'success') {
        // Refresh leads list
        await fetchLeads(currentPage, true);
        setShowDeleteModal(false);
        setSelectedLead(null);
        toast.success('Lead deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete lead';
      toast.error(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Enhanced Export to Excel function
  const exportToExcel = async (type = 'all') => {
    try {
      setExportLoading(true);
      toast.info(`Preparing ${type} leads for export...`);

      // Fetch export data from backend
      const response = await axios.post(`${backendUrl}/api/leads/export`, {
        type,
        filters: type === 'filtered' ? filters : {}
      });

      if (response.data.status === 'success') {
        const exportData = response.data.data;
        let filename = '';

        switch (type) {
          case 'all':
            filename = 'all_leads';
            break;
          case 'filtered':
            filename = 'filtered_leads';
            break;
          case 'active':
            filename = 'active_leads';
            break;
          default:
            filename = 'leads';
        }

        // Create CSV content
        const headers = ['Name', 'Last Name', 'Email', 'Phone', 'Company', 'Job Title', 'Status', 'Lead Source', 'Assigned To', 'City', 'Country', 'Created Date'];
        
        const csvContent = [
          headers.join(','),
          ...exportData.map(lead => [
            `"${(lead.name || '').replace(/"/g, '""')}"`,
            `"${(lead.lastName || '').replace(/"/g, '""')}"`,
            `"${(lead.email || '').replace(/"/g, '""')}"`,
            `"${(lead.phone || '').replace(/"/g, '""')}"`,
            `"${(lead.company || '').replace(/"/g, '""')}"`,
            `"${(lead.jobTitle || '').replace(/"/g, '""')}"`,
            `"${(lead.status || '').replace(/"/g, '""')}"`,
            `"${(lead.leadSource || '').replace(/"/g, '""')}"`,
            `"${(lead.assignedTo ? (lead.assignedTo.name || lead.assignedTo.username) : '').replace(/"/g, '""')}"`,
            `"${(lead.cityName || lead.city || '').replace(/"/g, '""')}"`,
            `"${(lead.country || '').replace(/"/g, '""')}"`,
            `"${new Date(lead.createdAt).toLocaleDateString()}"`
          ].join(','))
        ].join('\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success(`Exported ${exportData.length} leads successfully!`);
        
      } else {
        throw new Error(response.data.message || 'Export failed');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      const errorMessage = error.response?.data?.message || 'Failed to export data';
      toast.error(errorMessage);
    } finally {
      setExportLoading(false);
      setShowExportOptions(false);
    }
  };

  // Close drawer
  const closeDrawer = () => {
    setShowLeadDrawer(false);
    setSelectedLead(null);
  };

  // Handle lead success (after add/edit)
  const handleLeadSuccess = (message = 'Lead saved successfully!') => {
    fetchLeads(currentPage, true);
    closeDrawer();
    // toast.success(message);
  };

  // Get current leads for display
  const currentLeads = filteredLeads;

  // Change page
  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages && pageNumber !== currentPage) {
      setCurrentPage(pageNumber);
    }
  };

  // Get unique values for filters
  const statusOptions = [
    'all', 'New Lead', 'Car Not Available', 'Busy/Not Reachable', 'Requested Call Back', 
    'Interested', 'Visited. Deal Ongoing', 'Advance Booking', 'Amount Recieved', 
    'Sold', 'Advance received', 'Showroom visit Customer', 'Junk Lead', 'Not Interested'
  ];

  const leadSourceOptions = [
    'all', '7070707026', 'Cartrade', 'Direct Traffic', 'FB Lead Ads', 
    'Form Ads', 'Inbound Email', 'Inbound Phone call', 'Instagram', 
    'OLX', 'Organic Search', 'Outbound Phone call', 'Pay per Click Ads', 
    'Reference', 'Referral Sites', 'Social Media', 'Unknown', 'Walk-In', 
    'Website', 'WhatsApp'
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'custom', label: 'Custom Range' }
  ];

  // Render loading state
  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <Users className="mr-2 h-8 w-8 text-blue-600" />
              Leads Management
            </h1>
            <p className="text-gray-600 mt-2">Manage and track your sales leads effectively</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <button 
              onClick={handleAddLead}
              className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Lead
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all hover:shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <User className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-gray-800">{totalLeads}</h2>
                <p className="text-gray-600">Total Leads</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all hover:shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <Phone className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-gray-800">{leads.filter(l => l.status === 'New Lead').length}</h2>
                <p className="text-gray-600">New Leads</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all hover:shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <Mail className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-gray-800">{leads.filter(l => l.status === 'Contacted').length}</h2>
                <p className="text-gray-600">Contacted</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all hover:shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-gray-800">{leads.filter(l => l.status === 'Qualified').length}</h2>
                <p className="text-gray-600">Qualified</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-grow">
              <div className="relative flex-grow max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Search leads by name, email, phone, company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`inline-flex items-center px-3 py-2.5 border rounded-lg text-sm font-medium transition-colors ${
                    showFilters 
                      ? 'border-blue-500 text-blue-600 bg-blue-50' 
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </button>
              </div>
            </div>
            
            <div className="flex space-x-2">
              {/* Export Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowExportOptions(!showExportOptions)}
                  disabled={exportLoading}
                  className="inline-flex items-center px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                >
                  {exportLoading ? (
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Export
                  <ChevronLeft className="h-4 w-4 ml-1 transform -rotate-90" />
                </button>
                
                {showExportOptions && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <div className="p-2">
                      <button
                        onClick={() => exportToExcel('all')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex justify-between items-center"
                      >
                        <span>Export All Leads</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {totalLeads}
                        </span>
                      </button>
                      <button
                        onClick={() => exportToExcel('filtered')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex justify-between items-center"
                      >
                        <span>Export Filtered Leads</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {filteredLeads.length}
                        </span>
                      </button>
                      <button
                        onClick={() => exportToExcel('active')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex justify-between items-center"
                      >
                        <span>Export Active Leads</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {leads.filter(lead => !['Junk Lead', 'Not Interested', 'Closed', 'Sold'].includes(lead.status)).length}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Enhanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Tag className="h-4 w-4 mr-1" />
                    Lead Stage
                  </label>
                  <select
                    className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                  >
                    {statusOptions.map(option => (
                      <option key={option} value={option}>
                        {option === 'all' ? 'All Stages' : option}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    Assigned To
                  </label>
                  <select
                    className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                    value={filters.assignedTo}
                    onChange={(e) => setFilters({...filters, assignedTo: e.target.value})}
                  >
                    <option value="all">All Users</option>
                    {users.map(user => (
                      <option key={user._id} value={user._id}>
                        {user.name || user.username}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lead Source
                  </label>
                  <select
                    className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                    value={filters.source}
                    onChange={(e) => setFilters({...filters, source: e.target.value})}
                  >
                    {leadSourceOptions.map(option => (
                      <option key={option} value={option}>
                        {option === 'all' ? 'All Sources' : option}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Date Range
                  </label>
                  <select
                    className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                    value={filters.dateRange}
                    onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                  >
                    {dateRangeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Custom Date Range */}
              {filters.dateRange === 'custom' && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From Date
                    </label>
                    <input
                      type="date"
                      className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      To Date
                    </label>
                    <input
                      type="date"
                      className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                      value={filters.dateTo}
                      onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                    />
                  </div>
                </div>
              )}
              
              {/* Active Filters Badges */}
              <div className="mt-4 flex flex-wrap gap-2">
                {filters.status !== 'all' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Stage: {filters.status}
                    <button 
                      onClick={() => setFilters({...filters, status: 'all'})}
                      className="ml-1 hover:bg-blue-200 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.assignedTo !== 'all' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Assigned: {users.find(user => user._id === filters.assignedTo)?.name || users.find(user => user._id === filters.assignedTo)?.username}
                    <button 
                      onClick={() => setFilters({...filters, assignedTo: 'all'})}
                      className="ml-1 hover:bg-green-200 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.source !== 'all' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Source: {filters.source}
                    <button 
                      onClick={() => setFilters({...filters, source: 'all'})}
                      className="ml-1 hover:bg-purple-200 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.dateRange !== 'all' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {dateRangeOptions.find(opt => opt.value === filters.dateRange)?.label}
                    <button 
                      onClick={() => setFilters({...filters, dateRange: 'all', dateFrom: '', dateTo: ''})}
                      className="ml-1 hover:bg-yellow-200 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.dateFrom && filters.dateTo && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Custom: {filters.dateFrom} to {filters.dateTo}
                    <button 
                      onClick={() => setFilters({...filters, dateFrom: '', dateTo: ''})}
                      className="ml-1 hover:bg-orange-200 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {(filters.status !== 'all' || filters.assignedTo !== 'all' || filters.source !== 'all' || filters.dateRange !== 'all' || filters.dateFrom || filters.dateTo) && (
                  <button 
                    onClick={() => setFilters({
                      status: 'all', 
                      assignedTo: 'all', 
                      source: 'all', 
                      dateRange: 'all',
                      dateFrom: '',
                      dateTo: ''
                    })}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Leads Table */}
        <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lead
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentLeads.length > 0 ? (
                  currentLeads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-medium uppercase">
                              {lead.name?.charAt(0)}{lead.lastName?.charAt(0)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {lead.name} {lead.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{lead.jobTitle}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Mail className="h-4 w-4 mr-1 text-gray-400" />
                          {lead.email || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="h-4 w-4 mr-1 text-gray-400" />
                          {lead.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{lead.company || 'N/A'}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                          {lead.cityName || 'N/A'}, {lead.country || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-4 font-semibold rounded-full 
                          ${lead.status === 'New Lead' ? 'bg-blue-100 text-blue-800' : ''}
                          ${lead.status === 'Contacted' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${lead.status === 'Qualified' ? 'bg-green-100 text-green-800' : ''}
                          ${['Junk Lead', 'Not Interested', 'Closed'].includes(lead.status) ? 'bg-red-100 text-red-800' : ''}
                          ${['Interested', 'Requested Call Back'].includes(lead.status) ? 'bg-teal-100 text-teal-800' : ''}
                        `}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.assignedTo ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{lead.assignedTo.name || lead.assignedTo.username}</span>
                            <span className="text-xs text-gray-500">{lead.assignedTo.email}</span>
                          </div>
                        ) : (
                          'Unassigned'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleViewLead(lead)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                            title="View lead"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEditLead(lead)}
                            className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50 transition-colors"
                            title="Edit lead"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteLead(lead)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Delete lead"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <Users className="h-12 w-12 mb-3 text-gray-300" />
                        <p className="text-base font-medium">No leads found</p>
                        <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
                        <button
                          onClick={handleRefresh}
                          className="mt-4 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Refresh Leads
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * leadsPerPage + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * leadsPerPage, totalLeads)}
                    </span>{' '}
                    of <span className="font-medium">{totalLeads}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => paginate(pageNum)}
                          className={`relative inline-flex items-center px-3 py-2 border text-sm font-medium transition-colors
                            ${currentPage === pageNum 
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' 
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lead Form Drawer */}
      {showLeadDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="absolute inset-0 bg-gray-300 opacity-75 transition-opacity" 
              onClick={closeDrawer}
            ></div>
            
            <div className="fixed inset-y-0 right-0 max-w-full flex">
              <div className="w-screen max-w-4xl">
                <div className="h-full flex flex-col bg-white shadow-xl overflow-y-auto">
                  <AddLead
                    onClose={closeDrawer}
                    onSuccess={handleLeadSuccess}
                    lead={selectedLead}
                    isEdit={drawerMode === 'edit'}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedLead && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Delete Lead
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete <span className="font-semibold">{selectedLead.name} {selectedLead.lastName}</span>? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={deleteLoading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors disabled:opacity-50"
                >
                  {deleteLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete Lead'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors"
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

export default Leads;