import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
  Shield,
  Key,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  X,
  AlertCircle,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

function ManageApi() {
  const [apiKeys, setApiKeys] = useState([]);
  const [filteredApiKeys, setFilteredApiKeys] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, apiKey: null });
  const [exportModal, setExportModal] = useState({ isOpen: false, format: 'excel' });
  const [createModal, setCreateModal] = useState({ isOpen: false });
  const [editModal, setEditModal] = useState({ isOpen: false, apiKey: null });
  const [showSecret, setShowSecret] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [newApiKey, setNewApiKey] = useState({
    name: '',
    expiresAt: ''
  });
  
  const navigate = useNavigate();
  const { token } = useAuth();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Fetch API keys from API
  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/api/api-keys`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(data);
      if (data.status === "success") {
        setApiKeys(data.data);
        setFilteredApiKeys(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch API keys');
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter API keys based on search term
  useEffect(() => {
    const filtered = apiKeys.filter(apiKey => 
      Object.values(apiKey).some(value => 
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredApiKeys(filtered);
    setCurrentPage(1);
  }, [searchTerm, apiKeys]);

  // Sort API keys
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

    const sortedApiKeys = [...filteredApiKeys].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    setFilteredApiKeys(sortedApiKeys);
  };

  // Get current API keys for pagination
  const indexOfLastApiKey = currentPage * itemsPerPage;
  const indexOfFirstApiKey = indexOfLastApiKey - itemsPerPage;
  const currentApiKeys = filteredApiKeys.slice(indexOfFirstApiKey, indexOfLastApiKey);
  const totalPages = Math.ceil(filteredApiKeys.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  // Handle create API key
  const handleCreateApiKey = async () => {
    try {
      const response = await axios.post(`${backendUrl}/api/api-keys`, newApiKey, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.status === "success") {
        setApiKeys([...apiKeys, response.data.data]);
        setCreateModal({ isOpen: false });
        setNewApiKey({
          name: '',
          expiresAt: ''
        });
        // Show success message with API key and secret
        toast.success(`API Key created successfully!`)
        // alert(`API Key created successfully!\nKey: ${response.data.data.apiKey}\nSecret: ${response.data.data.secret}`);
      }
    } catch (error) {
      console.error('Error creating API key:', error);
      setError(error.response?.data?.message || 'Failed to create API key');
    }
  };

  // Handle edit API key
  const handleEditApiKey = async () => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/api-keys/${editModal.apiKey._id}`,
        {
          name: editModal.apiKey.name,
          expiresAt: editModal.apiKey.expiresAt,
          status: editModal.apiKey.status
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.status === "success") {
        const updatedApiKeys = apiKeys.map(key => 
          key._id === editModal.apiKey._id ? response.data.data : key
        );
        setApiKeys(updatedApiKeys);
        setEditModal({ isOpen: false, apiKey: null });
      }
    } catch (error) {
      console.error('Error updating API key:', error);
      setError(error.response?.data?.message || 'Failed to update API key');
    }
  };

  // Handle delete API key
  const confirmDeleteApiKey = (apiKey) => {
    setDeleteModal({ isOpen: true, apiKey });
  };

  const handleDeleteApiKey = async () => {
    try {
      await axios.delete(`${backendUrl}/api/api-keys/${deleteModal.apiKey._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setApiKeys(apiKeys.filter(key => key._id !== deleteModal.apiKey._id));
      setDeleteModal({ isOpen: false, apiKey: null });
    } catch (error) {
      console.error('Error deleting API key:', error);
      setError(error.response?.data?.message || 'Failed to delete API key');
    }
  };

  // Handle export to Excel
  const exportToExcel = () => {
    const dataToExport = filteredApiKeys.map(apiKey => ({
      Name: apiKey.name,
      'API Key': apiKey.apiKey,
      Permissions: apiKey.permissions.join(', '),
      Status: apiKey.status,
      Created: formatDate(apiKey.createdAt),
      Expires: apiKey.expiresAt ? formatDate(apiKey.expiresAt) : 'Never'
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'API Keys');
    XLSX.writeFile(workbook, 'api_keys_export.xlsx');
    
    setExportModal({ isOpen: false, format: 'excel' });
  };

  // Handle export to CSV
  const exportToCSV = () => {
    const dataToExport = filteredApiKeys.map(apiKey => ({
      Name: apiKey.name,
      'API Key': apiKey.apiKey,
      Permissions: apiKey.permissions.join(', '),
      Status: apiKey.status,
      Created: formatDate(apiKey.createdAt),
      Expires: apiKey.expiresAt ? formatDate(apiKey.expiresAt) : 'Never'
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'api_keys_export.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setExportModal({ isOpen: false, format: 'csv' });
  };

  // Handle export based on selected format
  const handleExport = () => {
    if (exportModal.format === 'excel') {
      exportToExcel();
    } else if (exportModal.format === 'csv') {
      exportToCSV();
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status icon and color
  const getStatusInfo = (status) => {
    switch (status) {
      case 'active':
        return { icon: <CheckCircle size={16} />, color: 'text-green-600', bgColor: 'bg-green-100' };
      case 'inactive':
        return { icon: <XCircle size={16} />, color: 'text-red-600', bgColor: 'bg-red-100' };
      default:
        return { icon: <Clock size={16} />, color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You can add a toast notification here
  };

  // Toggle secret visibility
  const toggleSecretVisibility = (id) => {
    setShowSecret(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading API keys...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading API Keys</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 md:py-0">
      <div className="mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">API Key Management</h1>
          <p className="text-gray-600">Manage your API keys and their permissions</p>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header with actions */}
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search API keys..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <button 
                className="flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                onClick={() => setExportModal({ isOpen: true, format: 'excel' })}
              >
                <Download size={16} className="mr-2" />
                Export
              </button>
              <button 
                className="flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                onClick={() => setCreateModal({ isOpen: true })}
              >
                <Plus size={16} className="mr-2" />
                Create API Key
              </button>
            </div>
          </div>

          {/* API Keys table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      <Key size={14} className="mr-1" />
                      Name
                      {sortConfig.key === 'name' && (
                        <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    API Key
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Secret
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <Shield size={14} className="mr-1" />
                      Permissions
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    Status
                    {sortConfig.key === 'status' && (
                      <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                    )}
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      Created
                      {sortConfig.key === 'createdAt' && (
                        <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentApiKeys.length > 0 ? (
                  currentApiKeys.map((apiKey) => {
                    const statusInfo = getStatusInfo(apiKey.status);
                    return (
                      <tr key={apiKey._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{apiKey.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                              {apiKey.apiKey}
                            </code>
                            <button 
                              onClick={() => copyToClipboard(apiKey.apiKey)}
                              className="ml-2 text-gray-400 hover:text-gray-600"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                              {showSecret[apiKey._id] ? apiKey.secret : '•'.repeat(20)}
                            </code>
                            <button 
                              onClick={() => toggleSecretVisibility(apiKey._id)}
                              className="ml-2 text-gray-400 hover:text-gray-600"
                            >
                              {showSecret[apiKey._id] ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                            <button 
                              onClick={() => copyToClipboard(apiKey.secret)}
                              className="ml-1 text-gray-400 hover:text-gray-600"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {apiKey.permissions.map(permission => (
                              <span 
                                key={permission}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full capitalize"
                              >
                                {permission}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`mr-1 ${statusInfo.color}`}>
                              {statusInfo.icon}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${statusInfo.color} ${statusInfo.bgColor} capitalize`}>
                              {apiKey.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(apiKey.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button 
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                              onClick={() => setEditModal({ isOpen: true, apiKey: { ...apiKey } })}
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                              onClick={() => confirmDeleteApiKey(apiKey)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                      No API keys found. Create your first API key to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6 flex flex-col sm:flex-row md:items-center justify-between">
            <div className="flex items-center mb-4 sm:mb-0">
              <span className="text-sm text-gray-700 mr-2">Show</span>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="border border-gray-300 rounded-md py-1 px-2 text-sm"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
              <span className="text-sm text-gray-700 ml-2">entries</span>
            </div>

            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">
                Showing {indexOfFirstApiKey + 1} to {Math.min(indexOfLastApiKey, filteredApiKeys.length)} of {filteredApiKeys.length} results
              </span>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeft size={16} />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => paginate(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === page
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronRight size={16} />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Create API Key Modal */}
      {createModal.isOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-300 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create API Key</h3>
              <button 
                onClick={() => setCreateModal({ isOpen: false })}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newApiKey.name}
                  onChange={(e) => setNewApiKey({...newApiKey, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter API key name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expires At (optional)</label>
                <input
                  type="datetime-local"
                  value={newApiKey.expiresAt}
                  onChange={(e) => setNewApiKey({...newApiKey, expiresAt: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setCreateModal({ isOpen: false })}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateApiKey}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
              >
                Create API Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit API Key Modal */}
      {editModal.isOpen && editModal.apiKey && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-300 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit API Key</h3>
              <button 
                onClick={() => setEditModal({ isOpen: false, apiKey: null })}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editModal.apiKey.name}
                  onChange={(e) => setEditModal({
                    ...editModal,
                    apiKey: {...editModal.apiKey, name: e.target.value}
                  })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editModal.apiKey.status}
                  onChange={(e) => setEditModal({
                    ...editModal,
                    apiKey: {...editModal.apiKey, status: e.target.value}
                  })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expires At</label>
                <input
                  type="datetime-local"
                  value={editModal.apiKey.expiresAt ? new Date(editModal.apiKey.expiresAt).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setEditModal({
                    ...editModal,
                    apiKey: {...editModal.apiKey, expiresAt: e.target.value}
                  })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditModal({ isOpen: false, apiKey: null })}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleEditApiKey}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Update API Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0  flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-300  rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
              <button 
                onClick={() => setDeleteModal({ isOpen: false, apiKey: null })}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0 pt-0.5">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-700">
                  Are you sure you want to delete API key <span className="font-semibold">{deleteModal.apiKey.name}</span>? This action cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModal({ isOpen: false, apiKey: null })}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteApiKey}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {exportModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Export API Keys</h3>
              <button 
                onClick={() => setExportModal({ isOpen: false, format: 'excel' })}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Select the format you want to export the API key data in:
            </p>
            
            <div className="mb-4">
              <label className="flex items-center mb-2">
                <input
                  type="radio"
                  checked={exportModal.format === 'excel'}
                  onChange={() => setExportModal({...exportModal, format: 'excel'})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Excel (.xlsx)</span>
              </label>
              <label className="flex items-center mb-2">
                <input
                  type="radio"
                  checked={exportModal.format === 'csv'}
                  onChange={() => setExportModal({...exportModal, format: 'csv'})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">CSV (.csv)</span>
              </label>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setExportModal({ isOpen: false, format: 'excel' })}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center"
              >
                <Download size={16} className="mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageApi;