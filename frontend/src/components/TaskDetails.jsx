import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, Clock, User, FileText, 
  Edit, Trash2, CheckCircle, Plus, Filter,
  Search, MoreVertical, ChevronDown, AlertCircle,
  Users, Briefcase, Tag, ArrowUp, ArrowDown,
  Phone, Car, Shield, Building, Target,
  X, Eye
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

const TaskDetails = ({ leadId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    taskType: '',
    search: ''
  });
  const [sortConfig, setSortConfig] = useState({ key: 'startDate', direction: 'asc' });
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const {token} = useAuth();
  
  // Add ref for search input
  const searchInputRef = useRef(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Status options with colors
  const statusOptions = [
    { value: 'Scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
    { value: 'In Progress', label: 'In Progress', color: 'bg-purple-100 text-purple-800' },
    { value: 'Completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'Cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
    { value: 'Overdue', label: 'Overdue', color: 'bg-orange-100 text-orange-800' }
  ];

  // Task type options based on your schema
  const taskTypeOptions = [
    "Call Back",
    "Follow-Up", 
    "Inspection",
    "Negotiation",
    "Pitch-Sell opportunity",
    "Test Drive",
    "Vehicle Pick-Up",
    "Finance",
    "Insurance",
    "RTO"
  ];

  // Task type icons
  const taskTypeIcons = {
    "Call Back": Phone,
    "Follow-Up": Phone,
    "Inspection": Car,
    "Negotiation": Users,
    "Pitch-Sell opportunity": Target,
    "Test Drive": Car,
    "Vehicle Pick-Up": Car,
    "Finance": Building,
    "Insurance": Shield,
    "RTO": Building
  };

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      
      // Build query parameters properly
      const params = new URLSearchParams();
      
      // Always include leadId if available
      if (leadId) {
        params.append('leadId', leadId);
      }
      
      // Add filters if they have values
      if (filters.status) {
        params.append('status', filters.status);
      }
      if (filters.taskType) {
        params.append('taskType', filters.taskType);
      }
      if (filters.search) {
        params.append('search', filters.search);
      }
      if (filters.priority) {
        params.append('priority', filters.priority);
      }

     

      const response = await axios.get(`${backendUrl}/api/task/all?${params.toString()}` , { headers: { 'Authorization': `Bearer ${token}` } });
      
      if (response.data.status === 'success') { 
        setTasks(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch tasks');
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch tasks');
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (leadId) {
        fetchTasks();
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [leadId, filters]);

  // Handle search input focus - maintain focus when clicking on the container
  const handleSearchContainerClick = (e) => {
    // Prevent the click from bubbling up and focus the input
    e.stopPropagation();
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Handle search input change with debouncing
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

  // Sort tasks - client-side sorting as fallback
  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortConfig.key === 'startDate') {
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);
      return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
    }

    const aValue = a[sortConfig.key] || '';
    const bValue = b[sortConfig.key] || '';
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Client-side search as fallback if API search doesn't work
  const filteredAndSearchedTasks = sortedTasks.filter(task => {
    if (!filters.search) return true;
    
    const searchTerm = filters.search.toLowerCase();
    return (
      task.subject?.toLowerCase().includes(searchTerm) ||
      task.description?.toLowerCase().includes(searchTerm) ||
      task.taskType?.toLowerCase().includes(searchTerm) ||
      task.owner?.username?.toLowerCase().includes(searchTerm)
    );
  });

  // Handle task completion
  const handleCompleteTask = async (taskId) => {
    try {
      const response = await axios.put(`${backendUrl}/api/task/${taskId}/complete` , {}, { headers: { 'Authorization': `Bearer ${token}` } });
      
      if (response.data.status === 'success') {
        toast.success('Task marked as completed');
        fetchTasks(); // Refresh the list
      }
    } catch (error) {
      toast.error('Failed to complete task');
      console.error('Error completing task:', error);
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (taskId) => {
    try {
      const response = await axios.delete(`${backendUrl}/api/task/${taskId}` , { headers: { 'Authorization': `Bearer ${token}` } });
      
      if (response.data.status === 'success') {
        toast.success('Task deleted successfully');
        setShowDeleteConfirm(false);
        setTaskToDelete(null);
        fetchTasks(); // Refresh the list
      }
    } catch (error) {
      toast.error('Failed to delete task');
      console.error('Error deleting task:', error);
    }
  };

  // View task details
  const handleViewTask = (task) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
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

  // Format time for display
  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Check if task is overdue
  const isOverdue = (task) => {
    if (task.status === 'Completed' || task.status === 'Cancelled') return false;
    
    const taskDateTime = new Date(`${task.startDate}T${task.startTime}`);
    const now = new Date();
    return taskDateTime < now;
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
        <span className="ml-2 text-gray-600">Loading tasks...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-700">{error}</p>
        <button 
          onClick={fetchTasks}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Use client-side filtered results if API search isn't working
  const displayTasks = filteredAndSearchedTasks;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Tasks</h2>
          <p className="text-sm text-gray-600">
            {displayTasks.length} task{displayTasks.length !== 1 ? 's' : ''} found
            {filters.search && ` for "${filters.search}"`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search - Updated with better functionality */}
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
                placeholder="Search by subject, description, type..."
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

          {/* Task Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Type</label>
            <select
              value={filters.taskType}
              onChange={(e) => setFilters(prev => ({ ...prev, taskType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              {taskTypeOptions.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: '', priority: '', taskType: '', search: '' })}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 w-full"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {displayTasks.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No tasks found</p>
            <p className="text-gray-400 text-sm">
              {filters.search 
                ? `No tasks match "${filters.search}"` 
                : 'No tasks have been created for this lead yet'
              }
            </p>
            {(filters.status || filters.taskType || filters.search) && (
              <button
                onClick={() => setFilters({ status: '', priority: '', taskType: '', search: '' })}
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
                    Task Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayTasks.map((task) => {
                  const status = statusOptions.find(s => s.value === task.status) || statusOptions[0];
                  const overdue = isOverdue(task);
                  const TaskTypeIcon = taskTypeIcons[task.taskType] || FileText;

                  return (
                    <tr key={task._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${
                            task.status === 'Completed' ? 'bg-green-100 text-green-600' :
                            overdue ? 'bg-red-100 text-red-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            <TaskTypeIcon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {task.subject}
                            </p>
                            <div className="flex items-center mt-1">
                              <Tag className="h-3 w-3 text-gray-400 mr-1" />
                              <span className="text-xs text-gray-500">{task.taskType}</span>
                            </div>
                            {task.description && (
                              <p className="text-sm text-gray-500 truncate mt-1">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="space-y-1 min-w-max">
                          <div className="flex items-center text-sm text-gray-900">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            {formatDate(task.startDate)}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                            {formatTime(task.startTime)} - {formatTime(task.endTime)}
                          </div>
                          {task.reminder && (
                            <div className="flex items-center text-xs text-blue-600">
                              <Clock className="h-3 w-3 mr-1" />
                              Reminder: {task.reminderTime} min before
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                            {status.label}
                          </span>
                          {overdue && task.status !== 'Overdue' && (
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
                            {task.owner?.username || 'Unassigned'}
                          </span>
                        </div>
                        {task.organizer && task.organizer._id !== task.owner?._id && (
                          <div className="text-xs text-gray-500 mt-1">
                            Organized by: {task.organizer.username}
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleViewTask(task)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          {task.status !== 'Completed' && task.status !== 'Cancelled' && (
                            <button
                              onClick={() => handleCompleteTask(task._id)}
                              className="text-green-600 hover:text-green-900 p-1 rounded"
                              title="Mark as completed"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => {
                              setTaskToDelete(task);
                              setShowDeleteConfirm(true);
                            }}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Delete task"
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

      {/* Rest of the modals remain the same */}
      {/* Task Details Modal */}
      {showTaskDetails && selectedTask && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowTaskDetails(false)}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block relative align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  onClick={() => setShowTaskDetails(false)}
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Task Details
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900">{selectedTask.subject}</h4>
                      <p className="text-sm text-gray-500 mt-1">{selectedTask.taskType}</p>
                    </div>

                    {selectedTask.description && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Description</label>
                        <p className="text-sm text-gray-900 mt-1">{selectedTask.description}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Start</label>
                        <p className="text-sm text-gray-900">
                          {formatDate(selectedTask.startDate)} at {formatTime(selectedTask.startTime)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">End</label>
                        <p className="text-sm text-gray-900">
                          {formatDate(selectedTask.endDate)} at {formatTime(selectedTask.endTime)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusOptions.find(s => s.value === selectedTask.status)?.color
                        }`}>
                          {selectedTask.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Owner</label>
                        <p className="text-sm text-gray-900">{selectedTask.owner?.username}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Organizer</label>
                        <p className="text-sm text-gray-900">{selectedTask.organizer?.username}</p>
                      </div>
                    </div>

                    {selectedTask.reminder && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Reminder</label>
                        <p className="text-sm text-gray-900">
                          {selectedTask.reminderTime} minutes before start
                        </p>
                      </div>
                    )}

                    {selectedTask.completedAt && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Completed</label>
                        <p className="text-sm text-gray-900">
                          {formatDate(selectedTask.completedAt)} by {selectedTask.completedBy?.username}
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
      {showDeleteConfirm && taskToDelete && (
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
                    Delete Task
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete the task "{taskToDelete.subject}"? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => handleDeleteTask(taskToDelete._id)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setTaskToDelete(null);
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

export default TaskDetails;