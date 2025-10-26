import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import StatCard from '../components/dashboard/StatCard';
import LeadSourceChart from '../components/dashboard/LeadSourceChart';
import LeadTrendChart from '../components/dashboard/LeadTrendChart';
import UserPerformanceChart from '../components/dashboard/UserPerformanceChart';
import TaskCompletionChart from '../components/dashboard/TaskCompletionChart';
import DeliveryTimelineChart from '../components/dashboard/DeliveryTimelineChart';
import RecentActivities from '../components/dashboard/RecentActivities';
import QuickStats from '../components/dashboard/QuickStats';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('this_month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [error, setError] = useState(null);
  const { token } = useAuth();

  // Function to calculate date ranges
  const getDateRange = (range) => {
    const now = new Date();
    const start = new Date();
    
    switch (range) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        return {
          startDate: start.toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0]
        };
      
      case 'yesterday':
        start.setDate(now.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        const yesterdayEnd = new Date(start);
        yesterdayEnd.setHours(23, 59, 59, 999);
        return {
          startDate: start.toISOString().split('T')[0],
          endDate: yesterdayEnd.toISOString().split('T')[0]
        };
      
      case 'this_week':
        start.setDate(now.getDate() - now.getDay());
        start.setHours(0, 0, 0, 0);
        return {
          startDate: start.toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0]
        };
      
      case 'last_week':
        start.setDate(now.getDate() - now.getDay() - 7);
        start.setHours(0, 0, 0, 0);
        const lastWeekEnd = new Date(start);
        lastWeekEnd.setDate(start.getDate() + 6);
        return {
          startDate: start.toISOString().split('T')[0],
          endDate: lastWeekEnd.toISOString().split('T')[0]
        };
      
      case 'this_month':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        return {
          startDate: start.toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0]
        };
      
      case 'last_month':
        start.setMonth(now.getMonth() - 1, 1);
        start.setHours(0, 0, 0, 0);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        return {
          startDate: start.toISOString().split('T')[0],
          endDate: lastMonthEnd.toISOString().split('T')[0]
        };
      
      case 'this_quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        start.setMonth(quarter * 3, 1);
        start.setHours(0, 0, 0, 0);
        return {
          startDate: start.toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0]
        };
      
      case 'this_year':
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        return {
          startDate: start.toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0]
        };
      
      case 'custom':
        return {
          startDate: customStartDate,
          endDate: customEndDate
        };
      
      default:
        return {};
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange, customStartDate, customEndDate]);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      const dateRange = getDateRange(timeRange);
      
      if (dateRange.startDate) {
        params.append('startDate', dateRange.startDate);
      }
      if (dateRange.endDate) {
        params.append('endDate', dateRange.endDate);
      }

      const url = `${backendUrl}/api/dashboard/stats?${params.toString()}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const result = await response.json();
      setDashboardData(result.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeRangeChange = (newRange) => {
    setTimeRange(newRange);
  };

  const handleCustomDateApply = () => {
    if (customStartDate && customEndDate) {
      setTimeRange('custom');
    } else {
      alert('Please select both start and end dates');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-red-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-red-800 font-medium">Error loading dashboard</h3>
            <p className="text-red-700 text-sm">{error}</p>
            <button 
              onClick={fetchDashboardData}
              className="mt-2 text-red-600 hover:text-red-500 text-sm font-medium"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { leadStats, opportunityStats, userPerformance, taskStats, deliveryStats, recentActivities, summary } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex justify-between items-center mt-4 lg:mt-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your business overview.</p>
        </div>
        <div className="flex items-center space-x-4 mt-3 md:mt-0">
          {/* Time Range Selector */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Time Range:</label>
            <select 
              value={timeRange}
              onChange={(e) => handleTimeRangeChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="this_week">This Week</option>
              <option value="last_week">Last Week</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              {/* <option value="this_quarter">This Quarter</option> */}
              <option value="this_year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Range */}
          {timeRange === 'custom' && (
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleCustomDateApply}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Apply
              </button>
            </div>
          )}

          <button 
            onClick={fetchDashboardData}
            className="bg-blue-600 hidden text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <QuickStats summary={summary} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Lead Statistics */}
        <Card className="xl:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Lead Statistics</h2>
            <Badge variant="success">{leadStats.total} Total Leads</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-blue-600 text-sm font-medium">New Leads</p>
              <p className="text-2xl font-bold text-blue-800">{leadStats.byStatus.new}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-green-600 text-sm font-medium">Qualified</p>
              <p className="text-2xl font-bold text-green-800">{leadStats.byStatus.qualified}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-purple-600 text-sm font-medium">Contacted</p>
              <p className="text-2xl font-bold text-purple-800">{leadStats.byStatus.contacted}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-orange-600 text-sm font-medium">Converted</p>
              <p className="text-2xl font-bold text-orange-800">{leadStats.byStatus.converted}</p>
            </div>
          </div>
          <LeadTrendChart data={leadStats.trend} />
        </Card>

        {/* Lead Sources */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Lead Sources</h2>
          <LeadSourceChart data={leadStats.bySource} />
        </Card>

        {/* User Performance */}
        <Card className="xl:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">User Performance</h2>
          <UserPerformanceChart data={userPerformance} />
        </Card>

        {/* Task Completion */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Task Completion</h2>
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-gray-800">{taskStats.completionRate}%</div>
            <p className="text-gray-600 text-sm">Completion Rate</p>
          </div>
          <TaskCompletionChart data={taskStats} />
        </Card>

        {/* Delivery Performance */}
        <Card className="xl:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Delivery Performance</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-green-600 text-sm font-medium">Delivered</p>
              <p className="text-2xl font-bold text-green-800">{deliveryStats.delivered}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <p className="text-yellow-600 text-sm font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-800">{deliveryStats.pending}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <p className="text-red-600 text-sm font-medium">Overdue</p>
              <p className="text-2xl font-bold text-red-800">{deliveryStats.overdue}</p>
            </div>
          </div>
          <DeliveryTimelineChart data={deliveryStats.trend} />
        </Card>

        {/* Recent Activities */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h2>
          <RecentActivities data={recentActivities} />
        </Card>

      </div>
    </div>
  );
};

export default Dashboard;