// src/components/layout/Layout.jsx
import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [activePage, setActivePage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      <main className="pt-16 md:ml-64 md:pt-20 p-4 md:p-6 transition-all duration-300">
        <div className="mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;