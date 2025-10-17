// Example page: src/pages/Sales.jsx
import React from 'react';
import Card from '../components/ui/Card';

const Sales = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sales Dashboard</h1>
        <p className="text-gray-600">Manage your sales pipeline and track performance.</p>
      </div>
      
      <Card>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Sales Overview</h2>
        <p className="text-gray-600">Sales content goes here...</p>
      </Card>
    </div>
  );
};

export default Sales;