// src/components/dashboard/charts/LeadSourceChart.jsx
import React from 'react';

const LeadSourceChart = ({ data }) => {
  const maxCount = Math.max(...data.map(item => item.count));

  return (
    <div className="space-y-3">
      {data.map((source, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: `hsl(${index * 60}, 70%, 50%)`
              }}
            ></div>
            <span className="text-sm text-gray-700">{source.source}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full"
                style={{
                  width: `${(source.count / maxCount) * 100}%`,
                  backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-700 w-8 text-right">
              {source.count}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LeadSourceChart;