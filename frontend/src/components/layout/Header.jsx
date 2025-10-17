// src/components/layout/Header.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Bell,
  Settings,
  User,
  LogOut,
  HelpCircle,
  ChevronDown,
  Mail,
  Shield,
  Menu,
  X
} from 'lucide-react';

const Header = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const backend_url = import.meta.env.VITE_BACKEND_URL;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 md:px-6 fixed top-0 left-0 right-0 z-50 border-b border-gray-200">
      {/* Left Section - Logo and Mobile Menu Button */}
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="md:hidden mr-3 p-2 rounded-lg text-gray-500 hover:bg-gray-100"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="flex items-center space-x-3">
          <div className="hidden bg-gradient-to-br from-blue-600 to-blue-800 h-8 w-8 rounded-lg flex items-center justify-center shadow-md">
            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L4 8L12 12L20 8L12 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 12L12 16L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 16L12 20L20 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="hidden ">
            <h1 className="text-xl font-bold text-gray-800">CRMPro</h1>
            <p className="text-xs text-gray-500 -mt-1">Customer Relationship Management</p>
          </div>
          <img src="http://localhost:5173/src/assets/img/carstreet.png" className=" h-8" alt="" />
        </div>
      </div>
      
      {/* Right Section - Icons & Profile */}
      <div className="flex items-center space-x-3 md:space-x-5">
        {/* Notifications */}
        <div className="relative">
          <button className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              3
            </span>
          </button>
        </div>
        
        {/* Messages - Hidden on mobile */}
        {/* <div className="relative hidden md:block">
          <button className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100">
            <Mail className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              1
            </span>
          </button>
        </div> */}
        
        {/* Settings - Hidden on mobile */}
        {/* <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100 hidden md:block">
          <Settings className="h-5 w-5" />
        </button> */}
        
        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={toggleDropdown}
            className="flex items-center space-x-2 md:space-x-3 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-gray-800 uppercase">{user.username}</p>
              <p className="text-xs text-gray-500 capitalize flex items-center">
                <Shield className="h-3 w-3 mr-1" />
                {user.role}
              </p>
            </div>
            <div className="relative">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden border-2 border-white shadow-sm">
                <img src={user.profileImage ? `${backend_url}${user.profileImage}` : '../../src/assets/img/user.png'} alt={user.username} className="h-full w-full object-cover" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full h-2 w-2 md:h-3 md:w-3 border-2 border-white"></div>
            </div>
            <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 md:w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              
              {/* <div className="py-1">
                <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <User className="h-4 w-4 mr-3 text-gray-500" />
                  Your Profile
                </button>
                <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <Settings className="h-4 w-4 mr-3 text-gray-500" />
                  Settings
                </button>
                <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <HelpCircle className="h-4 w-4 mr-3 text-gray-500" />
                  Help & Support
                </button>
              </div> */}
              
              <div className="py-1 border-t border-gray-100">
                <button 
                  onClick={logout}
                  className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;