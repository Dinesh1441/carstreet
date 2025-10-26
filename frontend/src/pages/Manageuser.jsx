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
  Filter,
  MoreVertical,
  User,
  Mail,
  Shield,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  X,
  AlertCircle
} from 'lucide-react';

// Import SheetJS for Excel export
import * as XLSX from 'xlsx';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function ManageUser() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });
  const [exportModal, setExportModal] = useState({ isOpen: false, format: 'excel' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { token } = useAuth();

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${backendUrl}/api/users/all`, {
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
        
        if (data.status === "success") {
          setUsers(data.data);
          setFilteredUsers(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch users');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    const filtered = users.filter(user => 
      Object.values(user).some(value => 
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchTerm, users]);

  // Sort users
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

    const sortedUsers = [...filteredUsers].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    setFilteredUsers(sortedUsers);
  };

  // Get current users for pagination
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  // Handle delete user
  const confirmDeleteUser = (user) => {
    setDeleteModal({ isOpen: true, user });
    // alert(`Delete user: ${user.username}`);


  };

  const handleDeleteUser = () => {

     axios.delete(`${backendUrl}/api/users/delete/${deleteModal.user._id}` , { headers: { 'Authorization': `Bearer ${token}` } })  
      .then(response => {
        if (response.data.status == "success") {
          setUsers(users.filter(user => user._id !== deleteModal.user._id));
          setDeleteModal({ isOpen: false, user: null });
        }
      })
      .catch(error => {
        console.error('Error deleting user:', error);
      });
  };

  // Handle export to Excel
  const exportToExcel = () => {
    // Prepare data for export
    const dataToExport = filteredUsers.map(user => ({
      Username: user.username,
      Email: user.email,
      Role: user.role,
      Status: user.status,
      Created: formatDate(user.createdAt),
      'Last Updated': formatDate(user.updatedAt)
    }));
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    
    // Generate Excel file
    XLSX.writeFile(workbook, 'users_export.xlsx');
    
    setExportModal({ isOpen: false, format: 'excel' });
  };

  // Handle export to CSV
  const exportToCSV = () => {
    // Prepare data for export
    const dataToExport = filteredUsers.map(user => ({
      Username: user.username,
      Email: user.email,
      Role: user.role,
      Status: user.status,
      Created: formatDate(user.createdAt),
      'Last Updated': formatDate(user.updatedAt)
    }));
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    
    // Create CSV
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    
    // Create download link
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'users_export.csv');
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
      case 'Active':
        return { icon: <CheckCircle size={16} />, color: 'text-green-600', bgColor: 'bg-green-100' };
      case 'Inactive':
        return { icon: <Clock size={16} />, color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
      default:
        return { icon: <Clock size={16} />, color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }
  };

  // Handle add user
  const handleAddUser = () => {
    navigate('add');
  };

  // Handle edit user
  const handleEditUser = (user) => {
    // In a real app, this would navigate to an edit user form
    navigate(`edit/${user._id}`);
    // alert(`Navigate to Edit User form for ${user.username}`);
  };

  // Get profile image or first letter fallback
  const getProfileImage = (user) => {
    if (user.profileImage) {
      return (
        <img 
          src={`${backendUrl}${user.profileImage}`} 
          alt={user.username}
          className="h-10 w-10 rounded-full object-cover"
          onError={(e) => {
            // If image fails to load, show the first letter
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      );
    }
    
    return (
      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
        {user.username.charAt(0).toUpperCase()}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Users</h2>
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
      <div className=" mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-600">Manage your system users and their permissions</p>
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
                placeholder="Search users..."
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
                onClick={handleAddUser}
              >
                <Plus size={16} className="mr-2" />
                Add User
              </button>
            </div>
          </div>

          {/* Users table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('username')}
                  >
                    <div className="flex items-center">
                      <User size={14} className="mr-1" />
                      Username
                      {sortConfig.key === 'username' && (
                        <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center">
                      <Mail size={14} className="mr-1" />
                      Email
                      {sortConfig.key === 'email' && (
                        <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('role')}
                  >
                    <div className="flex items-center">
                      <Shield size={14} className="mr-1" />
                      Role
                      {sortConfig.key === 'role' && (
                        <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                      )}
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
                {currentUsers.length > 0 ? (
                  currentUsers.map((user) => {
                    const statusInfo = getStatusInfo(user.status);
                    return (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 relative">
                              {getProfileImage(user)}
                              {/* Fallback first letter (hidden by default) */}
                              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold absolute inset-0" style={{ display: user.profileImage ? 'none' : 'flex' }}>
                                {user.username.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 capitalize">{user.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`mr-1 ${statusInfo.color}`}>
                              {statusInfo.icon}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${statusInfo.color} ${statusInfo.bgColor}`}>
                              {user.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button 
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                              onClick={() => confirmDeleteUser(user)}
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
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      No users found matching your search criteria.
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
                Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} results
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

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-300 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
              <button 
                onClick={() => setDeleteModal({ isOpen: false, user: null })}
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
                  Are you sure you want to delete user <span className="font-semibold">{deleteModal.user.username}</span>? This action cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModal({ isOpen: false, user: null })}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
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
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-gray-300 max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Export Users</h3>
              <button 
                onClick={() => setExportModal({ isOpen: false, format: 'excel' })}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Select the format you want to export the user data in:
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

export default ManageUser;