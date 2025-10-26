// components/ActivityTimeline.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, 
  User, 
  Clock, 
  FileText, 
  Mail, 
  Phone, 
  CheckSquare, 
  Target,
  StickyNote,
  Truck,
  Clipboard,
  File,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  MapPin,
  DollarSign,
  Tag,
  BarChart3,
  Download,
  Share2,
  MoreVertical
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

// Custom debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const ActivityTimeline = ({ leadId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [hoveredActivity, setHoveredActivity] = useState(null);
  const { token } = useAuth();
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  
  const { user } = useAuth();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Use debounced search
  const debouncedSearchTerm = useDebounce(searchInput, 500);

  // Enhanced activity type configurations with gradients and better icons
  const activityTypes = {
    note: { 
      label: 'Note', 
      icon: StickyNote, 
      color: 'bg-gradient-to-br from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
      gradient: 'from-green-50 to-emerald-50'
    },
    task: { 
      label: 'Task', 
      icon: CheckSquare, 
      color: 'bg-gradient-to-br from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200',
      gradient: 'from-amber-50 to-orange-50'
    },
    email: { 
      label: 'Email', 
      icon: Mail, 
      color: 'bg-gradient-to-br from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      gradient: 'from-blue-50 to-cyan-50'
    },
    call: { 
      label: 'Call', 
      icon: Phone, 
      color: 'bg-gradient-to-br from-indigo-500 to-purple-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700',
      borderColor: 'border-indigo-200',
      gradient: 'from-indigo-50 to-purple-50'
    },
    meeting: { 
      label: 'Meeting', 
      icon: Calendar, 
      color: 'bg-gradient-to-br from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200',
      gradient: 'from-purple-50 to-pink-50'
    },
    opportunity: { 
      label: 'Opportunity', 
      icon: Target, 
      color: 'bg-gradient-to-br from-orange-500 to-red-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-200',
      gradient: 'from-orange-50 to-red-50'
    },
    document: { 
      label: 'Document', 
      icon: File, 
      color: 'bg-gradient-to-br from-red-500 to-rose-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-200',
      gradient: 'from-red-50 to-rose-50'
    },
    delivery: { 
      label: 'Delivery', 
      icon: Truck, 
      color: 'bg-gradient-to-br from-cyan-500 to-teal-600',
      bgColor: 'bg-cyan-50',
      textColor: 'text-cyan-700',
      borderColor: 'border-cyan-200',
      gradient: 'from-cyan-50 to-teal-50'
    },
    general: { 
      label: 'Activity', 
      icon: Clipboard, 
      color: 'bg-gradient-to-br from-gray-500 to-slate-600',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-200',
      gradient: 'from-gray-50 to-slate-50'
    }
  };

  // Fetch activities with pagination
  const fetchActivities = async (page = 1) => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = {
        leadId: leadId,
        page: page,
        limit: pagination.itemsPerPage,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      // Add type filter if not 'all'
      if (filterType !== 'all') {
        params.type = filterType;
      }

      // Add search term if provided
      if (debouncedSearchTerm.trim()) {
        params.search = debouncedSearchTerm.trim();
      }

      const response = await axios.get(`${backendUrl}/api/activity`, {
        params: params,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setActivities(response.data.data);
        setPagination(prev => ({
          ...prev,
          currentPage: response.data.pagination.currentPage,
          totalPages: response.data.pagination.totalPages,
          totalItems: response.data.pagination.totalItems
        }));
        setError(null);
      } else {
        setError('Failed to fetch activities');
        toast.error('Failed to load activities');
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
      const errorMessage = err.response?.data?.message || 'Failed to fetch activities';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchInput('');
  };

  // Refresh activities when filters or search changes
  useEffect(() => {
    if (leadId) {
      fetchActivities(1);
    }
  }, [leadId, filterType, debouncedSearchTerm, pagination.itemsPerPage]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchActivities(newPage);
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setPagination(prev => ({
      ...prev,
      itemsPerPage: newItemsPerPage,
      currentPage: 1
    }));
  };

  // Format time
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  // Handle activity click
  const handleActivityClick = (activity) => {
    setSelectedActivity(activity);
    setShowDetailsModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowDetailsModal(false);
    setSelectedActivity(null);
  };

  // Render activity content based on type
  const renderActivityContent = (activity) => {
    const config = activityTypes[activity.type] || activityTypes.general;

    return (
      <div className="flex items-start space-x-2">
        <div className="flex-1">
          <p className="text-sm text-gray-800 leading-relaxed">{activity.content}</p>
        </div>
      </div>
    );
  };

  // Render metadata in modal
  const renderMetadata = (metadata, activityType) => {
    if (!metadata || Object.keys(metadata).length === 0) {
      return null;
    }

    const renderMetadataField = (key, value) => {
      const specialRenders = {
        amount: (
          <div key={key} className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Amount:</span>
            <span className="text-sm font-bold text-green-700">${value}</span>
          </div>
        ),
        opportunityType: (
          <div key={key} className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
            <Tag className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Type:</span>
            <span className="text-sm font-semibold text-blue-700 capitalize">{value}</span>
          </div>
        ),
        status: (
          <div key={key} className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
            <BarChart3 className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <span className={`text-sm font-semibold capitalize px-2 py-1 rounded-full ${
              value === 'won' ? 'bg-green-100 text-green-800' :
              value === 'lost' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {value}
            </span>
          </div>
        ),
        dueDate: (
          <div key={key} className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-100">
            <Calendar className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-gray-700">Due Date:</span>
            <span className="text-sm font-semibold text-amber-700">{new Date(value).toLocaleDateString()}</span>
          </div>
        ),
        priority: (
          <div key={key} className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-red-50 to-rose-50 rounded-lg border border-red-100">
            <Target className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-gray-700">Priority:</span>
            <span className={`text-sm font-semibold capitalize px-2 py-1 rounded-full ${
              value === 'high' ? 'bg-red-100 text-red-800' :
              value === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {value}
            </span>
          </div>
        ),
        location: (
          <div key={key} className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-cyan-50 to-teal-50 rounded-lg border border-cyan-100">
            <MapPin className="h-4 w-4 text-cyan-600" />
            <span className="text-sm font-medium text-gray-700">Location:</span>
            <span className="text-sm font-semibold text-cyan-700">{value}</span>
          </div>
        ),
        duration: (
          <div key={key} className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
            <Clock className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">Duration:</span>
            <span className="text-sm font-semibold text-indigo-700">{value} minutes</span>
          </div>
        )
      };

      if (specialRenders[key]) {
        return specialRenders[key];
      }

      return (
        <div key={key} className="flex justify-between items-center px-3 py-1 bg-gray-50 rounded-md border border-gray-300">
          <span className="text-sm font-medium text-gray-700 capitalize block w-full">{key.replace(/([A-Z])/g, ' $1')}:</span>
          <span className="text-sm text-gray-900 font-semibold  capitalize w-full">{String(value)}</span>
        </div>
      );
    };

    return (
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Activity Details</h4>
        <div className="grid gap-1">
          {Object.entries(metadata).map(([key, value]) => 
            value != null && renderMetadataField(key, value)
          )}
        </div>
      </div>
    );
  };

  // Group activities by date
  const groupedActivities = activities.reduce((groups, activity) => {
    const date = new Date(activity.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {});

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (pagination.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= pagination.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisiblePages / 2));
      const endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-600 font-medium">Loading activities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <X className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-red-500 font-medium">Error loading activities</p>
          <p className="text-sm text-gray-600 max-w-sm">{error}</p>
          <button 
            onClick={() => fetchActivities(1)}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-3 border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-800">Activity</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Live updates</span>
              </div>
              <span>•</span>
              <span>{pagination.totalItems} total activities</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Enhanced Search with clear button */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors group-focus-within:text-blue-500" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchInput}
                onChange={handleSearchChange}
                className="pl-10 pr-10 py-2 border border-gray-300 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full lg:w-64 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
              />
              {searchInput && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter and Items per page */}
            <div className="grid grid-cols-1 gap-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 hidden rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:shadow-md transition-all"
              >
                <option value="all">All Activities</option>
                {Object.entries(activityTypes).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>

              <select
                value={pagination.itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:shadow-md transition-all"
              >
                <option value="5">5/page</option>
                <option value="10">10/page</option>
                <option value="20">20/page</option>
                <option value="50">50/page</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Search Results Indicator */}
      {debouncedSearchTerm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-blue-700">
                Showing results for: <strong>"{debouncedSearchTerm}"</strong>
              </span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {pagination.totalItems} found
              </span>
            </div>
            <button
              onClick={handleClearSearch}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Clear search
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Activity Timeline */}
      <div className="space-y-8">
        {Object.keys(groupedActivities).length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border-2 border-dashed border-gray-300">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clipboard className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg font-medium">
              {debouncedSearchTerm ? 'No activities found matching your search' : 'No activities found'}
            </p>
            <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto">
              {debouncedSearchTerm 
                ? 'Try adjusting your search terms or filters' 
                : 'Start tracking your lead interactions by adding the first activity'
              }
            </p>
            {debouncedSearchTerm && (
              <button
                onClick={handleClearSearch}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          Object.entries(groupedActivities).map(([date, dateActivities]) => (
            <div key={date} className="relative">
              {/* Enhanced Date Header */}
              <div className="flex items-center mb-8">
                <div className="flex items-center space-x-3 bg-white px-4 py-2  rounded-full shadow-sm border border-gray-200">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-semibold text-gray-700">{date}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {dateActivities.length} activities
                  </span>
                </div>
                <div className="ml-4 flex-1 h-0.5 bg-gradient-to-r from-gray-200 to-transparent"></div>
              </div>

              {/* Enhanced Activities */}
              <div className="space-y-3 relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 to-purple-200"></div>
                
                {dateActivities.map((activity, index) => {
                  const config = activityTypes[activity.type] || activityTypes.general;
                  const IconComponent = config.icon;
                  const isRecent = new Date(activity.createdAt) > new Date(Date.now() - 5 * 60 * 1000);
                  
                  return (
                    <div
                      key={activity._id}
                      className="relative group cursor-pointer"
                      onMouseEnter={() => setHoveredActivity(activity._id)}
                      onMouseLeave={() => setHoveredActivity(null)}
                      onClick={() => handleActivityClick(activity)}
                    >
                      {/* Enhanced Activity Card */}
                      <div className={`
                        relative flex items-start space-x-3 px-2 py-2 md:px-4 rounded-lg border-2 transition-all duration-300 bg-white
                        ${hoveredActivity === activity._id 
                          ? `border-${config.textColor.split('-')[1]}-300 shadow-xl scale-[1.001] transform` 
                          : 'border-blue-500 shadow-sm hover:shadow-lg hover:border-gray-200'
                        }
                      `}>
                        {/* Enhanced Icon with glow effect */}
                        <div className={`
                          relative flex-shrink-0 w-8 h-8 p-1 md:p-2 rounded-lg flex items-center justify-center 
                          shadow-lg transition-all duration-300 
                          ${config.color} ${hoveredActivity === activity._id ? ' ring-opacity-50' : ''}
                          ${hoveredActivity === activity._id ? `ring-${config.textColor.split('-')[1]}-50` : ''}
                        `}>
                          <IconComponent className="h-4 w-4 md:h-6 md:w-6 text-white" />
                          
                          {/* Online indicator for recent activities */}
                          {isRecent && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2">
                           
                            </div>
                            
                          
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>{formatTime(activity.createdAt)}</span>
                              <span className="text-gray-400">•</span>
                              <span>{formatRelativeTime(activity.createdAt)}</span>
                            </div>
                          </div> */}
                      
                          {/* Activity content */}
                          {renderActivityContent(activity)}

                          {/* User info and actions */}
                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-100">
                            <div className="flex items-center space-x-2">
                              <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold uppercase">
                                {activity.user?.username?.charAt(0) || 'S'}
                              </div>
                              <span className="text-sm text-gray-600 font-medium capitalize">
                                {activity.user?.username || 'System'} 
                              </span>
                              {isRecent && (
                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                                  New
                                </span>
                              )}
                               
                              <div className="flex items-center space-x-1 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                <span>{formatTime(activity.createdAt)}</span>
                                <span className="text-gray-400">•</span>
                                <span>{formatRelativeTime(activity.createdAt)}</span>
                              </div>
                            </div>

                            {/* Action buttons */}
                            <div className={`flex items-center space-x-2 transition-opacity duration-200 ${
                              hoveredActivity === activity._id ? 'opacity-100' : 'opacity-0'
                            }`}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleActivityClick(activity);
                                }}
                                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Enhanced Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600 font-medium">
              Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
              {pagination.totalItems} activities
            </div>
            
            <div className="flex items-center space-x-2">
              {/* First Page */}
              <button
                onClick={() => handlePageChange(1)}
                disabled={pagination.currentPage === 1}
                className="p-1 rounded-sm border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>

              {/* Previous Page */}
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="p-1 rounded-sm border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Page Numbers */}
              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-2 py-1 rounded-sm text-sm font-medium transition-all duration-200 ${
                    pagination.currentPage === page
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-200'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow-md'
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* Next Page */}
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              {/* Last Page */}
              <button
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Activity Details Modal */}
      {showDetailsModal && selectedActivity && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Enhanced Backdrop */}
            <div 
              className="fixed inset-0 transition-opacity" 
              aria-hidden="true"
              onClick={closeModal}
            >
              <div className="absolute inset-0 bg-gray-900 opacity-75 backdrop-blur-sm"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Enhanced Modal */}
            <div className="inline-block relative h-[90vh] hide-scrollbar overflow-y-auto align-bottom bg-white rounded-lg text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
              {/* Header with gradient */}
              <div className={`relative bg-gradient-to-r ${activityTypes[selectedActivity.type]?.gradient || activityTypes.general.gradient} p-6 border-b`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-md md:rounded-2xl ${activityTypes[selectedActivity.type]?.color || activityTypes.general.color} shadow-lg`}>
                      {React.createElement(activityTypes[selectedActivity.type]?.icon || activityTypes.general.icon, {
                        className: "h-4 w-4 md:h-6 md:w-6 text-white"
                      })}
                    </div>
                    <div>
                      <h3 className="text-md md:text-xl font-bold text-gray-900 capitalize">
                        {selectedActivity.type} Details
                      </h3>
                      <p className="text-gray-700 text-sm md:text-base font-medium">
                        {new Date(selectedActivity.createdAt).toLocaleString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-xl transition-colors duration-200"
                  >
                    <X className="h-5 w-5 text-gray-700" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-3">
                {/* Content Section */}
                <div className="bg-gray-50 rounded-sm p-2 border border-gray-200">
                  <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1 block">
                    Content
                  </label>
                  <p className="text-gray-900 text-sm leading-relaxed">{selectedActivity.content}</p>
                </div>

                {/* User Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2 block">
                      Created By
                    </label>
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-semibold text-sm uppercase">
                        {selectedActivity.user?.username?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900 capitalize">
                          {selectedActivity.user?.username || 'System'}
                        </p>
                        {selectedActivity.user?.email && (
                          <p className="text-xs  text-gray-600">{selectedActivity.user.email}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2 block">
                      Activity Type
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 border border-gray-300 rounded-full ${activityTypes[selectedActivity.type]?.bgColor || activityTypes.general.bgColor}`}>
                        {React.createElement(activityTypes[selectedActivity.type]?.icon || activityTypes.general.icon, {
                          className: `h-4 w-4 ${activityTypes[selectedActivity.type]?.textColor || activityTypes.general.textColor}`
                        })}
                      </div>
                      <span className="font-semibold text-sm text-gray-900 capitalize">
                        {selectedActivity.type}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Metadata Section */}
                {selectedActivity.metadata && Object.keys(selectedActivity.metadata).length > 0 && (
                  <div className="space-y-4">
                    {renderMetadata(selectedActivity.metadata, selectedActivity.type)}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex hidden items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors duration-200">
                    <Share2 className="h-4 w-4" />
                    <span>Share</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-xl transition-colors duration-200">
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityTimeline;
