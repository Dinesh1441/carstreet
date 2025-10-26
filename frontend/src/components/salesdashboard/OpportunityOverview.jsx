// components/salesdashboard/OpportunityOverview.jsx
import React from 'react';
import { Car, TrendingUp, DollarSign, Shield, FileText, AlertCircle } from 'lucide-react';

const OpportunityOverview = ({ stats, loading = false, error = null }) => {

    // console.log(stats)

  const opportunityTypes = [
    { 
      key: 'buy', 
      label: 'Buy Opportunities', 
      color: 'blue', 
      icon: Car,
      description: 'Vehicle purchases'
    },
    { 
      key: 'sell', 
      label: 'Sell Opportunities', 
      color: 'green', 
      icon: TrendingUp,
      description: 'Vehicle sales'
    },
    { 
      key: 'finance', 
      label: 'Finance', 
      color: 'purple', 
      icon: DollarSign,
      description: 'Loan opportunities'
    },
    { 
      key: 'insurance', 
      label: 'Insurance', 
      color: 'orange', 
      icon: Shield,
      description: 'Insurance policies'
    },
    { 
      key: 'rto', 
      label: 'RTO', 
      color: 'red', 
      icon: FileText,
      description: 'Registration transfers'
    }
  ];

  const getStatusCounts = (typeStats) => {
    if (!typeStats || !Array.isArray(typeStats)) {
      return { open: 0, won: 0, lost: 0, total: 0 };
    }
    
    const open = typeStats.find(s => s._id === 'Open')?.count || 0;
    const won = typeStats.find(s => s._id === 'Won')?.count || 0;
    const lost = typeStats.find(s => s._id === 'Lost')?.count || 0;
    const total = open + won + lost;

    return { open, won, lost, total };
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: { 
        bg: 'bg-blue-50', 
        icon: 'bg-blue-100 text-blue-600', 
        text: 'text-blue-700',
        border: 'border-blue-200'
      },
      green: { 
        bg: 'bg-green-50', 
        icon: 'bg-green-100 text-green-600', 
        text: 'text-green-700',
        border: 'border-green-200'
      },
      purple: { 
        bg: 'bg-purple-50', 
        icon: 'bg-purple-100 text-purple-600', 
        text: 'text-purple-700',
        border: 'border-purple-200'
      },
      orange: { 
        bg: 'bg-orange-50', 
        icon: 'bg-orange-100 text-orange-600', 
        text: 'text-orange-700',
        border: 'border-orange-200'
      },
      red: { 
        bg: 'bg-red-50', 
        icon: 'bg-red-100 text-red-600', 
        text: 'text-red-700',
        border: 'border-red-200'
      }
    };
    return colors[color] || colors.blue;
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Opportunity Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {opportunityTypes.map((type) => (
            <div key={type.key} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg p-4 h-40"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center text-red-600 py-8">
          <AlertCircle className="h-6 w-6 mr-2" />
          <span>Failed to load opportunity data</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Opportunity Overview
        </h3>
        {stats?.totals?.opportunityCounts?.total && (
          <div className="text-sm text-gray-500">
            Total Opportunities: <span className="font-semibold text-gray-900">
              {stats.totals.opportunityCounts.total}
            </span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {opportunityTypes.map((type) => {
          const typeStats = stats?.[type.key] || [];
          const { open, won, lost, total } = getStatusCounts(typeStats);
          const colors = getColorClasses(type.color);
          const IconComponent = type.icon;

          return (
            <div 
              key={type.key} 
              className={`${colors.bg} rounded-lg p-4 border ${colors.border} hover:shadow-md transition-shadow cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${colors.icon}`}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-gray-500">Total</span>
              </div>
              
              <h4 className={`font-semibold ${colors.text} mb-1`}>{type.label}</h4>
              <p className="text-xs text-gray-600 mb-4">{type.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Open</span>
                  <span className="font-semibold text-gray-900">{open}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-green-600">Won</span>
                  <span className="font-semibold text-green-600">{won}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-red-600">Lost</span>
                  <span className="font-semibold text-red-600">{lost}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">{total}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total Values Summary */}
      {stats?.totals && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Total Opportunity Values</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-gray-600">Buy Value</div>
              <div className="font-semibold text-blue-600">
                ₹{(stats.totals.totalBuyValue || 0).toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-600">Sell Value</div>
              <div className="font-semibold text-green-600">
                ₹{(stats.totals.totalSellValue || 0).toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-600">Finance Value</div>
              <div className="font-semibold text-purple-600">
                ₹{(stats.totals.totalFinanceValue || 0).toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-600">Insurance Value</div>
              <div className="font-semibold text-orange-600">
                ₹{(stats.totals.totalInsuranceValue || 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpportunityOverview;