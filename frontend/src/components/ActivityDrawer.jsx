import React from 'react';
import { X, Calendar, MessageSquare, User, Clock } from 'lucide-react';

const ActivityDrawer = ({ onClose, lead }) => {
  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Add Activity</h2>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
          <select className="w-full p-2 border border-gray-300 rounded-md">
            <option value="call">Phone Call</option>
            <option value="meeting">Meeting</option>
            <option value="email">Email</option>
            <option value="task">Task</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <input 
            type="text" 
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Activity subject"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
          <input 
            type="datetime-local" 
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea 
            className="w-full p-2 border border-gray-300 rounded-md"
            rows="4"
            placeholder="Activity description"
          ></textarea>
        </div>
      </div>
      
      <div className="mt-auto pt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save Activity
        </button>
      </div>
    </div>
  );
};

export default ActivityDrawer;