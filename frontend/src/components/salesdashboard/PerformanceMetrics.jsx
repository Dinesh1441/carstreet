// components/salesdashboard/PerformanceMetrics.jsx
import React from 'react';
import { Target, Clock, CheckCircle, Award } from 'lucide-react';

const PerformanceMetrics = ({ metrics }) => {
  const metricCards = [
    {
      label: 'Conversion Rate',
      value: `${metrics.conversionRate || 0}%`,
      description: 'Leads converted to sales',
      icon: Target,
      color: 'green',
      progress: metrics.conversionRate || 0
    },
    {
      label: 'Avg Response Time',
      value: `${metrics.avgResponseTime || 0}h`,
      description: 'Time to first response',
      icon: Clock,
      color: 'blue',
      progress: Math.max(0, 100 - (metrics.avgResponseTime || 0) * 10)
    },
    {
      label: 'Task Completion',
      value: `${metrics.taskCompletionRate || 0}%`,
      description: 'Tasks completed on time',
      icon: CheckCircle,
      color: 'purple',
      progress: metrics.taskCompletionRate || 0
    },
    {
      label: 'Success Score',
      value: `${metrics.successScore || 0}`,
      description: 'Overall performance',
      icon: Award,
      color: 'orange',
      progress: metrics.successScore || 0
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      green: { bg: 'bg-green-100', text: 'text-green-600', progress: 'bg-green-500' },
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', progress: 'bg-blue-500' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', progress: 'bg-purple-500' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600', progress: 'bg-orange-500' }
    };
    return colors[color] || colors.green;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <Target className="h-5 w-5 mr-2 text-blue-600" />
        Performance Metrics
      </h3>
      <div className="space-y-6">
        {metricCards.map((metric, index) => {
          const colors = getColorClasses(metric.color);
          const IconComponent = metric.icon;
          
          return (
            <div key={index} className="group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${colors.bg} ${colors.text}`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                    <p className="text-xs text-gray-500">{metric.description}</p>
                  </div>
                </div>
                <span className={`text-lg font-bold ${colors.text}`}>
                  {metric.value}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${colors.progress} transition-all duration-500 ease-out`}
                  style={{ width: `${Math.min(metric.progress, 100)}%` }}
                ></div>
              </div>
              
              {/* Progress Percentage */}
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">Progress</span>
                <span className="text-xs font-medium text-gray-700">
                  {Math.min(metric.progress, 100).toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Overall Performance Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Overall Performance</span>
          <div className="text-right">
            <span className="text-2xl font-bold text-gray-900">
              {metrics.successScore || 0}
            </span>
            <span className="text-xs text-gray-500 block">/ 100 points</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;