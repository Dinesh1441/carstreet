import React from 'react';

const TaskCompletionChart = ({ data }) => {
  const totalTasks = data.total || 1;
  const completedPercentage = data.completionRate || 0;
  const overduePercentage = totalTasks > 0 ? Math.round((data.overdue / totalTasks) * 100) : 0;
  const pendingPercentage = 100 - completedPercentage - overduePercentage;

  return (
    <div className="space-y-4">
      {/* Progress bars */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Completed</span>
          <span className="font-medium text-green-600">{completedPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completedPercentage}%` }}
          ></div>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Pending</span>
          <span className="font-medium text-yellow-600">{pendingPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${pendingPercentage}%` }}
          ></div>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Overdue</span>
          <span className="font-medium text-red-600">{overduePercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-red-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${overduePercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-green-50 rounded p-2">
          <div className="text-green-600 font-bold">{data.completed || 0}</div>
          <div className="text-green-600 text-xs">Done</div>
        </div>
        <div className="bg-yellow-50 rounded p-2">
          <div className="text-yellow-600 font-bold">{data.total - data.completed - data.overdue || 0}</div>
          <div className="text-yellow-600 text-xs">Pending</div>
        </div>
        <div className="bg-red-50 rounded p-2">
          <div className="text-red-600 font-bold">{data.overdue || 0}</div>
          <div className="text-red-600 text-xs">Overdue</div>
        </div>
      </div>
    </div>
  );
};

export default TaskCompletionChart;