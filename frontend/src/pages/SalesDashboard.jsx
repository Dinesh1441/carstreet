import React, { useState, useEffect } from 'react';
import {
  Users, TrendingUp, CheckCircle, Clock, AlertTriangle,
  BarChart3, Activity, Target, Calendar, FileText,
  DollarSign, Shield, Car, TrendingDown, Eye,
  Filter, Download, RefreshCw, MoreHorizontal
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

// Enhanced Chart Components
import LeadGrowthChart from '../components/salesdashboard/LeadGrowthChart';
import LeadFunnelChart from '../components/salesdashboard/LeadFunnelChart';
import PerformanceMetrics from '../components/salesdashboard/PerformanceMetrics';
import QuickStatsGrid from '../components/salesdashboard/QuickStatsGrid';
import OpportunityOverview from '../components/salesdashboard/OpportunityOverview';

const SalesDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('30days');
  const [refreshing, setRefreshing] = useState(false);
  const { token, user } = useAuth();
  const backend_url = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${backend_url}/api/salesdashboard/user-dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params: { period: dateRange }
      });
      
      if (response.data.success) {
        setDashboardData(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  console.log(dashboardData);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => setError(null)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, <span className="font-semibold text-blue-600">{user?.username || 'User'}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-3 mt-4 sm:mt-0">
              {/* Date Range Filter */}
              <div className="relative">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="90days">Last 90 Days</option>
                  <option value="6months">Last 6 Months</option>
                  <option value="1year">Last 1 Year</option>
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                title="Refresh data"
              >
                <RefreshCw className={`h-4 w-4 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Quick Stats Grid */}
        <QuickStatsGrid 
          data={dashboardData} 
          dateRange={dateRange}
        />

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Lead Growth Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                Lead Growth Trend
              </h3>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {dateRange}
              </span>
            </div>
            <div className="h-80">
              <LeadGrowthChart data={dashboardData?.leadGrowth || []} />
            </div>
          </div>

          {/* Lead Funnel Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                Lead Distribution
              </h3>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.leadFunnel?.totalLeads || 0}</p>
                <p className="text-sm text-gray-500">Total Leads</p>
              </div>
            </div>
            <div className="h-80">
              <LeadFunnelChart data={dashboardData?.leadFunnel} />
            </div>
          </div>
        </div>

        {/* Performance & Tasks Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Metrics */}
          <div className="lg:col-span-1">
            <PerformanceMetrics 
              metrics={dashboardData?.performanceMetrics || {}} 
            />
          </div>

          {/* Overdue Tasks */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                Priority Tasks
                {dashboardData?.overdueTasks?.length > 0 && (
                  <span className="ml-2 bg-red-100 text-red-800 text-sm px-2.5 py-0.5 rounded-full font-medium">
                    {dashboardData.overdueTasks.length} urgent
                  </span>
                )}
              </h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View All Tasks
              </button>
            </div>
            <TaskList tasks={dashboardData?.overdueTasks || []} />
          </div>
        </div>

        {/* Opportunity Overview */}
        <OpportunityOverview 
          stats={dashboardData?.opportunityStats || {}} 
        />

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-purple-600" />
              Recent Activities
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View Activity Log
            </button>
          </div>
          <ActivityList activities={dashboardData?.recentActivities || []} />
        </div>
      </div>
    </div>
  );
};

// Enhanced Stat Card Component
const StatCard = ({ icon, title, value, subtitle, trend, color, onClick }) => {
  const colorClasses = {
    blue: { bg: 'bg-blue-50', icon: 'bg-blue-100 text-blue-600', trend: 'text-blue-600' },
    green: { bg: 'bg-green-50', icon: 'bg-green-100 text-green-600', trend: 'text-green-600' },
    orange: { bg: 'bg-orange-50', icon: 'bg-orange-100 text-orange-600', trend: 'text-orange-600' },
    red: { bg: 'bg-red-50', icon: 'bg-red-100 text-red-600', trend: 'text-red-600' },
    purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600', trend: 'text-purple-600' }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div 
      className={`${colors.bg} rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 group`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">{subtitle}</p>
            {trend && (
              <div className={`flex items-center text-xs font-medium ${colors.trend}`}>
                <TrendingUp className="h-3 w-3 mr-1" />
                {trend}
              </div>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-xl ${colors.icon} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Enhanced Task List Component
const TaskList = ({ tasks }) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h4 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h4>
        <p className="text-gray-500">No overdue tasks at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {tasks.map((task, index) => {
        const dueDate = new Date(`${task.startDate}T${task.startTime}`);
        const isToday = dueDate.toDateString() === new Date().toDateString();
        const isTomorrow = new Date(dueDate.getTime() - 24 * 60 * 60 * 1000).toDateString() === new Date().toDateString();
        
        return (
          <div 
            key={task._id} 
            className="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-gray-900 truncate">{task.subject}</p>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                  isToday 
                    ? 'bg-orange-100 text-orange-800' 
                    : isTomorrow
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : dueDate.toLocaleDateString()}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-1 capitalize">{task.taskType?.replace(/-/g, ' ')}</p>
              
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Due: {dueDate.toLocaleString()}</span>
                {task.associatedLead && (
                  <span className="text-blue-600">Lead: {task.associatedLead.name}</span>
                )}
              </div>

              {task.description && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
            
            <div className="flex-shrink-0">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Enhanced Activity List Component
const ActivityList = ({ activities }) => {
  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Activity className="h-8 w-8 text-gray-400" />
        </div>
        <h4 className="text-lg font-semibold text-gray-900 mb-2">No recent activities</h4>
        <p className="text-gray-500">Activities will appear here as you work.</p>
      </div>
    );
  }

  const getActivityIcon = (type) => {
    const icons = {
      lead_created: Users,
      task_completed: CheckCircle,
      opportunity_created: TrendingUp,
      default: Activity
    };
    return icons[type] || icons.default;
  };

  const getActivityColor = (type) => {
    const colors = {
      lead_created: 'text-blue-600 bg-blue-100',
      task_completed: 'text-green-600 bg-green-100',
      opportunity_created: 'text-purple-600 bg-purple-100',
      default: 'text-gray-600 bg-gray-100'
    };
    return colors[type] || colors.default;
  };

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const IconComponent = getActivityIcon(activity.type);
        const colorClass = getActivityColor(activity.type);
        
        return (
          <div 
            key={activity._id} 
            className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group"
          >
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
              <IconComponent className="h-5 w-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 leading-relaxed">{activity.content}</p>
              
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span>{new Date(activity.createdAt).toLocaleString()}</span>
                {activity.leadId && (
                  <span className="text-blue-600">• Lead: {activity.leadId.name}</span>
                )}
                {activity.user?.username && (
                  <span className="text-gray-600">• By {activity.user.username}</span>
                )}
              </div>

              {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(activity.metadata).slice(0, 3).map(([key, value]) => (
                    <span 
                      key={key} 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {key}: {String(value).substring(0, 20)}{String(value).length > 20 ? '...' : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <button className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-all">
              <Eye className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default SalesDashboard;