import React from 'react';

const UserPerformanceChart = ({ data }) => {
  const maxLeads = Math.max(...data.map(user => user.leadsAssigned));

  return (
    <div className="space-y-3">
      {data.map((user, index) => (
        <div key={user.userId} className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-medium text-sm">
              {user.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-800">{user.name}</span>
              <span className="text-gray-600">{user.conversionRate}% conversion</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(user.leadsAssigned / maxLeads) * 100}%` 
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{user.leadsAssigned} leads</span>
              <span>{user.tasksCompleted} tasks</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserPerformanceChart;