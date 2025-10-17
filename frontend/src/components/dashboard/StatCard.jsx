import React from 'react';

const StatCard = ({ title, value, change, changeType, icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    red: 'bg-red-50 text-red-600 border-red-200'
  };

  const changeColorClasses = {
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800'
  };

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              <span className={`text-xs px-2 py-1 rounded-full ${changeColorClasses[changeType] || changeColorClasses.info}`}>
                {change}
              </span>
              <span className="text-xs opacity-75 ml-2">from last week</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-2xl opacity-75">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;