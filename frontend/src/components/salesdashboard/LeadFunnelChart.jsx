// components/salesdashboard/LeadFunnelChart.jsx
import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const LeadFunnelChart = ({ data }) => {
  // Handle different data structures
  let chartData;
  let totalLeads = 0;
  
  if (data?.individualStatusCounts) {
    // New data structure
    const statuses = Object.keys(data.individualStatusCounts);
    const counts = Object.values(data.individualStatusCounts);
    totalLeads = data.totalLeads || 0;
    
    chartData = {
      labels: statuses,
      datasets: [
        {
          label: 'Number of Leads',
          data: counts,
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(14, 165, 233, 0.8)',
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(16, 185, 129)',
            'rgb(245, 158, 11)',
            'rgb(239, 68, 68)',
            'rgb(139, 92, 246)',
            'rgb(14, 165, 233)',
          ],
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    };
  } else {
    // Default empty data
    chartData = {
      labels: [],
      datasets: [
        {
          label: 'Number of Leads',
          data: [],
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 2,
          borderRadius: 8,
        },
      ],
    };
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          color: '#6b7280',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: '#6b7280',
          precision: 0,
        },
        title: {
          display: true,
          text: 'Number of Leads',
          color: '#6b7280',
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          maxRotation: 45,
          minRotation: 45
        },
      }
    },
  };

  return (
    <div className="h-full">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default LeadFunnelChart;