// src/components/dashboard/RecentActivities.jsx
import React from 'react';

const RecentActivities = ({ data }) => {
  const getActivityIcon = (type) => {
    const icons = {
      'lead_created': '👤',
      'opportunity_created': '💼',
      'task_completed': '✅',
      'delivery_updated': '🚚',
      'user_login': '🔐'
    };
    return icons[type] || '📝';
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  return (
    <div className="space-y-4">
      {data.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-sm">{getActivityIcon(activity.type)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-800">
              <span className="font-medium">{activity.user}</span> {activity.content}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatTime(activity.timestamp)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentActivities;        