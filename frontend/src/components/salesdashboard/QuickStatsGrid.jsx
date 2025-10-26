// components/salesdashboard/QuickStatsGrid.jsx
import React from 'react';
import { 
  Users, TrendingUp, CheckCircle, AlertTriangle, 
  Target, Clock, DollarSign, BarChart3 
} from 'lucide-react';

const QuickStatsGrid = ({ data, dateRange }) => {
  const stats = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Total Leads",
      value: data?.summaryStats?.totalLeads || 0,
      subtitle: "All assigned leads",
      color: "blue",
      trend: "+12%"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "New Leads",
      value: data?.summaryStats?.newLeads || 0,
      subtitle: "New this period",
      color: "green",
      trend: "+8%"
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: "Pending Tasks",
      value: data?.taskStats?.scheduled || 0,
      subtitle: "To complete",
      color: "orange",
      trend: "-5%"
    },
    {
      icon: <AlertTriangle className="h-6 w-6" />,
      title: "Overdue Tasks",
      value: data?.overdueTasks?.length || 0,
      subtitle: "Requires attention",
      color: "red",
      trend: "+2%"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Conversion Rate",
      value: `${data?.performanceMetrics?.conversionRate || 0}%`,
      subtitle: "Lead to opportunity",
      color: "purple",
      trend: "+3%"
    },
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: "Opportunities",
      value: data?.summaryStats?.totalOpportunities || 0,
      subtitle: "Active deals",
      color: "green",
      trend: "+15%"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-lg ${
              stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
              stat.color === 'green' ? 'bg-green-100 text-green-600' :
              stat.color === 'orange' ? 'bg-orange-100 text-orange-600' :
              stat.color === 'red' ? 'bg-red-100 text-red-600' :
              'bg-purple-100 text-purple-600'
            }`}>
              {stat.icon}
            </div>
            {/* <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              stat.trend?.startsWith('+') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {stat.trend}
            </span> */}
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
          <p className="text-sm font-medium text-gray-600">{stat.title}</p>
          <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
        </div>
      ))}
    </div>
  );
};

export default QuickStatsGrid;