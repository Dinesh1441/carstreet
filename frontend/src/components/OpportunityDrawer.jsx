import React, { useState } from 'react';
import { X, DollarSign, Target, Percent, Calendar } from 'lucide-react';

const OpportunityDrawer = ({ onClose, lead }) => {
  const [opportunity, setOpportunity] = useState({
    name: '',
    amount: '',
    probability: '',
    closeDate: '',
    stage: 'Prospecting'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOpportunity(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    console.log('Adding opportunity:', opportunity);
    // Add API call here
    onClose();
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Add Opportunity</h2>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Opportunity Name</label>
          <input 
            type="text" 
            name="name"
            value={opportunity.name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Opportunity name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input 
              type="number" 
              name="amount"
              value={opportunity.amount}
              onChange={handleChange}
              className="w-full pl-9 p-2 border border-gray-300 rounded-md"
              placeholder="0.00"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Probability</label>
          <div className="relative">
            <Percent className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input 
              type="number" 
              name="probability"
              value={opportunity.probability}
              onChange={handleChange}
              className="w-full pl-9 p-2 border border-gray-300 rounded-md"
              placeholder="0"
              min="0"
              max="100"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Close Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input 
              type="date" 
              name="closeDate"
              value={opportunity.closeDate}
              onChange={handleChange}
              className="w-full pl-9 p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
          <select 
            name="stage"
            value={opportunity.stage}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="Prospecting">Prospecting</option>
            <option value="Qualification">Qualification</option>
            <option value="Needs Analysis">Needs Analysis</option>
            <option value="Value Proposition">Value Proposition</option>
            <option value="Decision">Decision</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Closed Won">Closed Won</option>
            <option value="Closed Lost">Closed Lost</option>
          </select>
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
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Opportunity
        </button>
      </div>
    </div>
  );
};

export default OpportunityDrawer;