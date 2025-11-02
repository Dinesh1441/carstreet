// src/components/layout/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  Users,
  User,
  FileText,
  Settings,
  ChevronDown,
  Phone,
  HelpCircle,
  LogOut,
  X
} from 'lucide-react';

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const [expandedItems, setExpandedItems] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active page based on current URL path
  const getActivePageFromPath = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';
    
    // Check for sub-pages (e.g., /sales/leads)
    const pathParts = path.split('/').filter(part => part);
    if (pathParts.length >= 2) {
      return `${pathParts[0]}-${pathParts[1]}`;
    }
    
    return pathParts[0] || 'dashboard';
  };

  const [activePage, setActivePage] = useState(getActivePageFromPath());

  // Update active page when route changes
  useEffect(() => {
    setActivePage(getActivePageFromPath());
  }, [location.pathname]);

  const navigationItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: <LayoutDashboard size={20} />, 
      roles: ['Super Admin', 'Team Member', 'Sales Executive', 'Finance Department'],
      path: '/dashboard'
    },
     { 
      id: 'leads', 
      label: 'All Leads', 
      icon: <Settings size={20} />, 
      roles: ['Super Admin' , 'Sales Executive', 'Team Member'],
      path : '/leads'
    },
     { 
      id: 'deliveryforms', 
      label: 'All Delivery', 
      icon: <Settings size={20} />, 
      roles: ['Super Admin', 'Sales Executive', 'Team Member'],
      path : '/deliveryforms'
    },
    { 
      id: 'opportunity', 
      label: 'Opportunity', 
      icon: <Users size={20} />, 
      roles: ['Super Admin', 'Sales Executive'],
      subItems: [
        { id: 'sale', label: 'Sell Opportunity', icon: <User size={16} />, path: '/opportunity/sale' },
        { id: 'buy', label: 'Buy Opportunity', icon: <User size={16} />, path: '/opportunity/buy' },
        { id: 'finance', label: 'Finance Oppxortunity', icon: <TrendingUp size={16} />, path: '/opportunity/finance' },
        { id: 'insurance', label: 'Insurance Opportunities', icon: <FileText size={16} />, path: '/opportunity/insurance' },
        { id: 'rto', label: 'RTO Opportunities', icon: <FileText size={16} />, path: '/opportunity/rto' }
      ]
    },
    { id: 'finance', label: 'Finance Opportunity',  roles: ['Finance Department'], icon: <TrendingUp size={16} />, path: '/opportunity/finance' },
    { id: 'insurance', label: 'Insurance Opportunities', roles: ['Insurance Department'], icon: <FileText size={16} />, path: '/opportunity/insurance' },
     { id: 'rto', label: 'RTO Opportunities', roles: ['RTO Department'], icon: <FileText size={16} />, path: '/opportunity/rto' },
 

    { 
      id: 'inventory', 
      label: 'Car Inventory', 
      icon: <TrendingUp size={20} />, 
      roles: ['Super Admin', 'Sales Executive'],
      subItems: [
        { id: 'all', label: 'All Cars', icon: <FileText size={16} />, path: '/inventory/all' },
        { id: 'make', label: 'Make', icon: <BarChart3 size={16} />, path: '/inventory/make' },
        { id: 'model', label: 'Model', icon: <Users size={16} />, path: '/inventory/model' },
        { id: 'variant', label: 'Variant', icon: <Users size={16} />, path: '/inventory/variant' },
        { id: 'state', label: 'State', icon: <Users size={16} />, path: '/inventory/state' },
        { id: 'city', label: 'city', icon: <Users size={16} />, path: '/inventory/city' }
      ]
    },
    // { 
    //   id: 'finance', 
    //   label: 'Finance', 
    //   icon: <BarChart3 size={20} />, 
    //   roles: ['Super Admin', 'Finance Department'],
    //   subItems: [
    //     { id: 'invoices', label: 'Invoices', icon: <FileText size={16} />, path: '/finance/invoices' },
    //     { id: 'expenses', label: 'Expenses', icon: <TrendingUp size={16} />, path: '/finance/expenses' },
    //     { id: 'revenue', label: 'Revenue Reports', icon: <BarChart3 size={16} />, path: '/finance/revenue' }
    //   ]
    // },
    
    // { 
    //   id: 'customers', 
    //   label: 'Customers', 
    //   icon: <User size={20} />, 
    //   roles: ['Super Admin', 'Sales Executive', 'Team Member'],
    //   subItems: [
    //     { id: 'directory', label: 'Customer Directory', icon: <Users size={16} />, path: '/customers/directory' },
    //     { id: 'segments', label: 'Segments', icon: <BarChart3 size={16} />, path: '/customers/segments' },
    //     { id: 'feedback', label: 'Feedback', icon: <FileText size={16} />, path: '/customers/feedback' }
    //   ]
    // },
    // { 
    //   id: 'reports', 
    //   label: 'Reports & Analytics', 
    //   icon: <FileText size={20} />, 
    //   roles: ['Super Admin', 'Finance Department'],
    //   subItems: [
    //     { id: 'sales-reports', label: 'Sales Reports', icon: <TrendingUp size={16} />, path: '/reports/sales' },
    //     { id: 'financial-reports', label: 'Financial Reports', icon: <BarChart3 size={16} />, path: '/reports/financial' },
    //     { id: 'performance-reports', label: 'Performance Reports', icon: <Users size={16} />, path: '/reports/performance' }
    //   ]
    // },
    // { 
    //   id: 'settings', 
    //   label: 'Settings', 
    //   icon: <Settings size={20} />, 
    //   roles: ['Super Admin'],
    //   subItems: [
    //     { id: 'account', label: 'Account Settings', icon: <User size={16} />, path: '/settings/account' },
    //     { id: 'billing', label: 'Billing & Plans', icon: <FileText size={16} />, path: '/settings/billing' }
    //   ]
    // },
     { id: 'users', roles: ['Super Admin'], label: 'User Management', icon: <Users size={16} />, path: '/users' },
     { id: 'apis', roles: ['Super Admin'], label: 'APIs Management', icon: <Users size={16} />, path: '/apis' },
   
  ];

  const toggleSubMenu = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const filteredNavigation = navigationItems.filter(item => 
    item.roles.includes(user.role)
  );

  const handleItemClick = (item) => {
    if (item.subItems && item.subItems.length > 0) {
      toggleSubMenu(item.id);
      // If it's the first time opening, navigate to the first sub-item
      if (!expandedItems[item.id] && item.subItems.length > 0) {
        navigate(item.subItems[0].path);
      }
    } else if (item.path) {
      navigate(item.path);
      // Close sidebar on mobile after selection
      if (window.innerWidth < 768) {
        toggleSidebar();
      }
    }
  };

  const handleSubItemClick = (subItem) => {
    navigate(subItem.path);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.querySelector('.sidebar-container');
      if (isSidebarOpen && sidebar && !sidebar.contains(event.target)) {
        toggleSidebar();
      }
    };

    if (isSidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen, toggleSidebar]);

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black opacity-50 z-40 md:hidden" onClick={toggleSidebar} />
      )}
      
      <aside className={`sidebar-container w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white fixed top-0 left-0 bottom-0 overflow-y-auto transition-all duration-300 shadow-xl flex flex-col z-40 md:translate-x-0 md:top-16 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Mobile header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 md:hidden">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 h-8 w-8 rounded-lg flex items-center justify-center shadow-md">
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L4 8L12 12L20 8L12 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 12L12 16L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 16L12 20L20 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">CRMPro</h1>
          </div>
          <button onClick={toggleSidebar} className="p-2 text-gray-300 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        {/* Scrollable content container with hidden scrollbar */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <nav className="p-4 flex-grow overflow-y-auto" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            <div className="mb-6 px-4 hidden">
              <h2 className="text-lg font-semibold text-gray-300 flex items-center">
                <LayoutDashboard size={18} className="mr-2" />
                Navigation
              </h2>
            </div>
            
            <ul className="space-y-2">
              {filteredNavigation.map(item => (
                <li key={item.id}>
                  <div
                    onClick={() => handleItemClick(item)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all cursor-pointer group ${
                      activePage.includes(item.id) 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'text-gray-300 hover:bg-gray-750 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className={`mr-3 transition-colors ${activePage.includes(item.id) ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                        {item.icon}
                      </span>
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.subItems && item.subItems.length > 0 && (
                      <span className={`transform transition-transform ${expandedItems[item.id] ? 'rotate-0' : '-rotate-90'}`}>
                        <ChevronDown size={16} />
                      </span>
                    )}
                  </div>
                  
                  {item.subItems && item.subItems.length > 0 && expandedItems[item.id] && (
                    <ul className="ml-6 mt-1 space-y-1 border-l border-gray-700 pl-3 py-1">
                      {item.subItems.map(subItem => (
                        <li key={subItem.id}>
                          <button
                            onClick={() => handleSubItemClick(subItem)}
                            className={`w-full flex items-center px-1 py-2 rounded-lg transition-all text-sm group ${
                              activePage === `${item.id}-${subItem.id}`
                                ? 'text-blue-400 font-medium bg-blue-900/20'
                                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-750/50'
                            }`}
                          >
                            <span className={`mr-2 ${activePage === `${item.id}-${subItem.id}` ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'}`}>
                              {subItem.icon}
                            </span>
                            <span>{subItem.label}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="p-4 border-t border-gray-700">
            <div className="mb-4 px-4 py-2 bg-gray-800/40 rounded-lg border border-gray-700">
              <p className="text-xs uppercase text-gray-500 mb-1">Your Role</p>
              <p className="text-sm font-medium text-blue-300 capitalize flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                {user.role}
              </p>
            </div>
            
            <div className="mb-4 hidden px-4 py-3 bg-gray-800/30 rounded-lg hover:bg-gray-750 transition-colors cursor-pointer">
              <p className="text-xs text-gray-400 flex items-center">
                <HelpCircle size={14} className="mr-2" />
                Need help?
              </p>
              <p className="text-sm text-blue-400 mt-1 flex items-center">
                <Phone size={14} className="mr-2" />
                Contact Support
              </p>
            </div>
            
            <button 
              onClick={logout}
              className="w-full flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-750 rounded-lg transition-colors"
            >
              <LogOut size={18} className="mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;