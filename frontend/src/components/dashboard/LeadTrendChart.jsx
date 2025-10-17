import React from 'react';

const LeadTrendChart = ({ data }) => {
  const maxCount = Math.max(...data.map(item => item.count));
  
  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Lead Trend (Last 7 Days)</h4>
      <div className="flex items-end justify-between h-32 space-x-1">
        {data.map((day, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div 
              className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
              style={{ 
                height: maxCount > 0 ? `${(day.count / maxCount) * 80}%` : '0%',
                minHeight: day.count > 0 ? '4px' : '0px'
              }}
              title={`${day.count} leads on ${day.date}`}
            ></div>
            <span className="text-xs text-gray-500 mt-1">
              {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
            </span>
            <span className="text-xs font-medium text-gray-700">
              {day.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeadTrendChart;