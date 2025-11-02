import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Edit, 
  Eye, 
  ChevronDown, 
  ChevronUp,
  X,
  Calendar,
  FileText,
  Car,
  IndianRupee,
  Shield,
  MapPin,
  Building,
  Tag,
  Download,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

// Import opportunity components
import BuyOpportunity from '../components/BuyOpportunity';
import SellOpportunity from '../components/SaleOpportunity';
import FinanceOpportunity from '../components/FinanceOpportunity';
import InsuranceOpportunity from '../components/InsuranceOpportunity';
import RtoOpportunity from '../components/RtoOpportunity';
import { useAuth } from '../contexts/AuthContext';

const OpportunityDetails = ({ leadId }) => {
  const [opportunities, setOpportunities] = useState({
    buy: [],
    sell: [],
    finance: [],
    insurance: [],
    rto: []
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    opportunityType: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: ''
  });
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [opportunityToDelete, setOpportunityToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { token } = useAuth();

  const backend_url = import.meta.env.VITE_BACKEND_URL;


   // Socket connection
    const { socket: socketInstance, isConnected: socketConnected } = useSocket(backendUrl);
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        setSocket(socketInstance);
        setIsConnected(socketConnected);
      }, [socketInstance, socketConnected]);

  // Fetch all opportunities for the lead
  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      
      const endpoints = [
        `${backend_url}/api/buyopportunity/lead/${leadId}`,
        `${backend_url}/api/sellopportunity/lead/${leadId}`,
        `${backend_url}/api/financeopportunity/lead/${leadId}`,
        `${backend_url}/api/insuranceopportunity/lead/${leadId}`,
        `${backend_url}/api/rtoopportunity/lead/${leadId}`
      ];

      const responses = await Promise.allSettled(
        endpoints.map(endpoint => axios.get(endpoint, { headers: { 'Authorization': `Bearer ${token}` } }))
      );

      const opportunitiesData = {
        buy: [],
        sell: [],
        finance: [],
        insurance: [],
        rto: []
      };

      responses.forEach((response, index) => {
        if (response.status === 'fulfilled' && response.value.data.status === 'success') {
          const type = endpoints[index].split('/')[4].replace('opportunity', '');
          opportunitiesData[type] = response.value.data.data || [];
        }
      });

      setOpportunities(opportunitiesData);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      toast.error('Failed to fetch opportunities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (leadId) {
      fetchOpportunities();
    }
  }, [leadId]);

  // Combine all opportunities and sort by creation date
  const getAllOpportunities = () => {
    const allOpps = [
      ...opportunities.buy.map(opp => ({ ...opp, type: 'buy', typeLabel: 'Buy Opportunity' })),
      ...opportunities.sell.map(opp => ({ ...opp, type: 'sell', typeLabel: 'Sell Opportunity' })),
      ...opportunities.finance.map(opp => ({ ...opp, type: 'finance', typeLabel: 'Finance Opportunity' })),
      ...opportunities.insurance.map(opp => ({ ...opp, type: 'insurance', typeLabel: 'Insurance Opportunity' })),
      ...opportunities.rto.map(opp => ({ ...opp, type: 'rto', typeLabel: 'RTO Opportunity' }))
    ];

    // Sort by creation date (newest first)
    return allOpps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  // Filter and search opportunities
  const getFilteredOpportunities = () => {
    let filtered = getAllOpportunities();

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(opp => 
        opp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.typeLabel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.stage?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Opportunity type filter
    if (filters.opportunityType !== 'all') {
      filtered = filtered.filter(opp => opp.type === filters.opportunityType);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(opp => opp.status === filters.status);
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(opp => new Date(opp.createdAt) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(opp => new Date(opp.createdAt) <= toDate);
    }

    return filtered;
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      opportunityType: 'all',
      status: 'all',
      dateFrom: '',
      dateTo: ''
    });
    setSearchTerm('');
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

  // View opportunity details
  const viewOpportunityDetails = (opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowDetailsModal(true);
  };

  // Edit opportunity - show edit drawer
  const editOpportunity = (opportunity) => {
    setEditingOpportunity(opportunity);
    setShowEditModal(true);
  };

  // Handle successful edit
  const handleOpportunitySuccess = () => {
    setShowEditModal(false);
    setEditingOpportunity(null);
    fetchOpportunities(); // Refresh the list
  };

  // Update opportunity status
  const updateStatus = async (opportunity, newStatus) => {
    try {
      const endpointMap = {
        'buy': 'buyopportunity',
        'sell': 'sellopportunity',
        'finance': 'financeopportunity',
        'insurance': 'insuranceopportunity',
        'rto': 'rtoopportunity'
      };

      const endpoint = endpointMap[opportunity.type];
      if (!endpoint) {
        toast.error('Invalid opportunity type');
        return;
      }

      let response;
      
      // Different endpoints for different opportunity types
      if (endpoint === 'buyopportunity' || endpoint === 'sellopportunity') {
        response = await axios.patch(`${backend_url}/api/${endpoint}/${opportunity._id}/status`, {
          status: newStatus
        } , { headers: { 'Authorization': `Bearer ${token}` } });
      } else if (endpoint === 'financeopportunity') {
        response = await axios.patch(`${backend_url}/api/${endpoint}/${opportunity._id}/status`, {
          status: newStatus
        } , { headers: { 'Authorization': `Bearer ${token}` } });
      } else {
        // For insurance and rto, use PUT request
        response = await axios.put(`${backend_url}/api/${endpoint}/${opportunity._id}`, {
          status: newStatus
        }, { headers: { 'Authorization': `Bearer ${token}` } });
      }

      if (response.data.status === 'success') {
        toast.success(`Opportunity marked as ${newStatus}`);
        fetchOpportunities(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
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
      
      const endpointMap = {
        'buy': 'buyopportunity',
        'sell': 'sellopportunity',
        'finance': 'financeopportunity',
        'insurance': 'insuranceopportunity',
        'rto': 'rtoopportunity'
      };

      const endpoint = endpointMap[opportunityToDelete.type];
      if (!endpoint) {
        toast.error('Invalid opportunity type');
        return;
      }

      const response = await axios.delete(`${backend_url}/api/${endpoint}/${opportunityToDelete._id}` , { headers: { 'Authorization': `Bearer ${token}` } });
      
      if (response.data.status === 'success') {
        toast.success(`${opportunityToDelete.typeLabel} deleted successfully`);
        fetchOpportunities(); // Refresh the list
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

  // Export to Excel
  const exportToExcel = () => {
    try {
      const data = getFilteredOpportunities().map(opp => ({
        'Opportunity Type': opp.typeLabel,
        'Name': opp.name || 'N/A',
        'Status': opp.status,
        'Stage': opp.stage || 'N/A',
        'Created Date': formatDate(opp.createdAt),
        'Owner': opp.owner?.username || 'N/A',
        'Email': opp.email || 'N/A',
        'Phone': opp.phoneNumber || 'N/A'
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Opportunities');
      
      XLSX.writeFile(workbook, `opportunities-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  // Get opportunity type icon
  const getOpportunityIcon = (type) => {
    switch (type) {
      case 'buy': return <Car className="h-4 w-4" />;
      case 'sell': return <Tag className="h-4 w-4" />;
      case 'finance': return <IndianRupee className="h-4 w-4" />;
      case 'insurance': return <Shield className="h-4 w-4" />;
      case 'rto': return <MapPin className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  // Get opportunity type color
  const getOpportunityColor = (type) => {
    switch (type) {
      case 'buy': return 'bg-blue-500';
      case 'sell': return 'bg-green-500';
      case 'finance': return 'bg-purple-500';
      case 'insurance': return 'bg-orange-500';
      case 'rto': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Render edit modal based on opportunity type
  const renderEditModal = () => {
    if (!editingOpportunity) return null;

    const modalProps = {
      onClose: () => setShowEditModal(false),
      onSuccess: handleOpportunitySuccess,
      opportunity: editingOpportunity,
      isEdit: true
    };

    switch (editingOpportunity.type) {
      case 'buy':
        return <BuyOpportunity {...modalProps} />;
      case 'sell':
        return <SellOpportunity {...modalProps} />;
      case 'finance':
        return <FinanceOpportunity {...modalProps} />;
      case 'insurance':
        return <InsuranceOpportunity {...modalProps} />;
      case 'rto':
        return <RtoOpportunity {...modalProps} />;
      default:
        return null;
    }
  };

  const filteredOpportunities = getFilteredOpportunities();
  const activeFiltersCount = Object.values(filters).filter(value => 
    value && value !== 'all'
  ).length + (searchTerm ? 1 : 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-600">Loading opportunities...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Opportunities</h2>
          <p className="text-gray-600 mt-1">
            Total {filteredOpportunities.length} opportunities found
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button 
            onClick={exportToExcel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center transition-colors text-sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 border rounded-lg flex items-center text-sm transition-colors ${
                showFilters 
                  ? 'bg-blue-100 border-blue-300 text-blue-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
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

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Opportunity Type</label>
                <select
                  value={filters.opportunityType}
                  onChange={(e) => handleFilterChange('opportunityType', e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="buy">Buy Opportunity</option>
                  <option value="sell">Sell Opportunity</option>
                  <option value="finance">Finance Opportunity</option>
                  <option value="insurance">Insurance Opportunity</option>
                  <option value="rto">RTO Opportunity</option>
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
                <label className="block text-xs font-medium text-gray-700 mb-1">Date From</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

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

      {/* Opportunities Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center">
                    Opportunity Type
                    {sortField === 'type' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Details
                    {sortField === 'name' && (
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
                    Created Date
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
              {filteredOpportunities.map((opportunity) => (
                <tr key={`${opportunity.type}-${opportunity._id}`} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`h-8 w-8 rounded-full ${getOpportunityColor(opportunity.type)} flex items-center justify-center text-white`}>
                        {getOpportunityIcon(opportunity.type)}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {opportunity.typeLabel}
                        </div>
                        <div className="text-xs text-gray-500">
                          by {opportunity.owner?.username || 'System'}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {opportunity.name || 'N/A'}
                      </div>
                      {opportunity.email && (
                        <div className="text-xs text-gray-500">
                          {opportunity.email}
                        </div>
                      )}
                      {opportunity.phoneNumber && (
                        <div className="text-xs text-gray-500">
                          {opportunity.phoneNumber}
                        </div>
                      )}
                      {/* Additional details based on opportunity type */}
                      {opportunity.type === 'buy' && opportunity.make && (
                        <div className="text-xs text-gray-500">
                          {opportunity.make.name} {opportunity.model?.name}
                        </div>
                      )}
                      {opportunity.type === 'finance' && opportunity.loanAmount && (
                        <div className="text-xs text-gray-500">
                          Loan: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(opportunity.loanAmount)}
                        </div>
                      )}
                      {opportunity.type === 'insurance' && opportunity.insuranceType && (
                        <div className="text-xs text-gray-500">
                          {opportunity.insuranceType}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      {opportunity.stage || 'N/A'}
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
                            onClick={() => updateStatus(opportunity, 'Won')}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="Mark as Won"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => updateStatus(opportunity, 'Lost')}
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

        {/* Empty State */}
        {filteredOpportunities.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || activeFiltersCount > 0 
                ? 'Try adjusting your search or filters' 
                : 'No opportunities have been created for this lead yet'
              }
            </p>
          </div>
        )}
      </div>

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
                  {renderEditModal()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Opportunity Details Modal */}
      {showDetailsModal && selectedOpportunity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedOpportunity.typeLabel}
                  </h2>
                  <div className="flex items-center gap-4 mt-2">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(selectedOpportunity.status)}`}>
                      {selectedOpportunity.status}
                    </span>
                    <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">
                      {selectedOpportunity.stage || 'N/A'}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                    <div className="space-y-3">
                      <DetailItem label="Opportunity Type" value={selectedOpportunity.typeLabel} />
                      <DetailItem label="Name" value={selectedOpportunity.name} />
                      <DetailItem label="Email" value={selectedOpportunity.email} />
                      <DetailItem label="Phone" value={selectedOpportunity.phoneNumber} />
                      <DetailItem label="Status" value={selectedOpportunity.status} />
                      <DetailItem label="Stage" value={selectedOpportunity.stage} />
                      <DetailItem label="Owner" value={selectedOpportunity.owner?.username} />
                    </div>
                  </div>

                  {/* Type-specific Information */}
                  {selectedOpportunity.type === 'buy' && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Information</h3>
                      <div className="space-y-3">
                        <DetailItem label="Make" value={selectedOpportunity.make?.name} />
                        <DetailItem label="Model" value={selectedOpportunity.model?.name} />
                        <DetailItem label="Variant" value={selectedOpportunity.variant?.name} />
                        <DetailItem label="Budget Range" 
                          value={selectedOpportunity.minBudget && selectedOpportunity.maxBudget ? 
                            `${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(selectedOpportunity.minBudget)} - ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(selectedOpportunity.maxBudget)}` : 
                            'N/A'} 
                        />
                      </div>
                    </div>
                  )}

                  {selectedOpportunity.type === 'finance' && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Finance Information</h3>
                      <div className="space-y-3">
                        <DetailItem label="Loan Amount" 
                          value={selectedOpportunity.loanAmount ? 
                            new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(selectedOpportunity.loanAmount) : 
                            'N/A'} 
                        />
                        <DetailItem label="Loan Type" value={selectedOpportunity.loanType} />
                        <DetailItem label="Finance Status" value={selectedOpportunity.financeStatus} />
                        <DetailItem label="Approved Bank" value={selectedOpportunity.approvedBank} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Additional Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                    <div className="space-y-3">
                      <DetailItem label="Created Date" value={formatDate(selectedOpportunity.createdAt)} />
                      {selectedOpportunity.updatedAt && (
                        <DetailItem label="Last Updated" value={formatDate(selectedOpportunity.updatedAt)} />
                      )}
                      <DetailItem label="Source" value={selectedOpportunity.source} />
                    </div>
                  </div>

                  {/* Insurance Specific */}
                  {selectedOpportunity.type === 'insurance' && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Insurance Information</h3>
                      <div className="space-y-3">
                        <DetailItem label="Insurance Type" value={selectedOpportunity.insuranceType} />
                        <DetailItem label="Insurance Cost" 
                          value={selectedOpportunity.costOfInsurance ? 
                            new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(selectedOpportunity.costOfInsurance) : 
                            'N/A'} 
                        />
                        <DetailItem label="Insurer Name" value={selectedOpportunity.insurerName} />
                        <DetailItem label="Insurance Expiry" 
                          value={selectedOpportunity.insuranceExpiryDate ? formatDate(selectedOpportunity.insuranceExpiryDate) : 'N/A'} 
                        />
                      </div>
                    </div>
                  )}

                  {/* RTO Specific */}
                  {selectedOpportunity.type === 'rto' && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">RTO Information</h3>
                      <div className="space-y-3">
                        <DetailItem label="Process to be Done" value={selectedOpportunity.processToBeDone} />
                        <DetailItem label="RTO Status" value={selectedOpportunity.rtoStatus} />
                        <DetailItem label="Transfer Type" value={selectedOpportunity.transferType} />
                        <DetailItem label="New Registration Number" value={selectedOpportunity.newRegNumber} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {selectedOpportunity.status === 'Open' && (
                  <>
                    <button
                      onClick={() => updateStatus(selectedOpportunity, 'Won')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Mark as Won
                    </button>
                    <button
                      onClick={() => updateStatus(selectedOpportunity, 'Lost')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Mark as Lost
                    </button>
                  </>
                )}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && opportunityToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-auto transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="flex-shrink-0">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Delete {opportunityToDelete.typeLabel}
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to delete this opportunity? This action cannot be undone.
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{opportunityToDelete.typeLabel}</p>
                    <p className="text-gray-600">{opportunityToDelete.name || 'N/A'}</p>
                    <p className="text-gray-600">Status: {opportunityToDelete.status}</p>
                    <p className="text-gray-600">Created: {formatDate(opportunityToDelete.createdAt)}</p>
                  </div>
                </div>
              </div>

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
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Detail Item Component
const DetailItem = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
    <div className="text-sm text-gray-600">{label}:</div>
    <span className="text-sm font-medium text-gray-900">{value || 'N/A'}</span>
  </div>
);

export default OpportunityDetails;
