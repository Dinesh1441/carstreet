import React from 'react';
import Card from '../ui/Card';

const QuickStats = ({ summary }) => {
  const stats = [
    {
      label: 'Total Leads',
      value: summary.totalLeads || 0,
      icon: '👥',
      color: 'blue',
      change: '+12%'
    },
    {
      label: 'Opportunities',
      value: summary.totalOpportunities || 0,
      icon: '💼',
      color: 'green',
      change: '+8%'
    },
    {
      label: 'Tasks',
      value: summary.totalTasks || 0,
      icon: '✅',
      color: 'purple',
      change: '+15%'
    },
    {
      label: 'Deliveries',
      value: summary.totalDeliveries || 0,
      icon: '🚚',
      color: 'orange',
      change: '+5%'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      purple: 'bg-purple-50 text-purple-600',
      orange: 'bg-orange-50 text-orange-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                {/* <span className={`text-xs px-2 py-1 rounded-full ${getColorClasses(stat.color)}`}>
                  {stat.change}
                </span>
                <span className="text-xs text-gray-500 ml-2">from last week</span> */}
              </div>
            </div>
            <div className={`text-2xl ${getColorClasses(stat.color)} p-3 rounded-lg`}>
              {stat.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default QuickStats;