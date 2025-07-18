import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/shared/Header';
import Sidebar from '../components/shared/Sidebar';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen w-screen ">
      <Header toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Main content */}
        <main className=" mx-auto mt-16 w-[100%] p-4 md:p-16  overflow-y-scroll">
          <Outlet />
        </main>
    
    </div>
  );
};

export default DashboardLayout; 