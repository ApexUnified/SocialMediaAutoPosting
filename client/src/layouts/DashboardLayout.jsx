import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/shared/Header";
import Sidebar from "../components/shared/Sidebar";
import { useAuth } from "../hook/useAuth";

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/login";
    }
  }, [loading, user]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex w-screen h-screen overflow-hidden">
      {/* Sidebar - visible on large screens */}
      <div className="hidden lg:block w-[250px] flex-shrink-0">
        <div className="fixed left-0 top-0 z-[999999] h-full w-[250px] bg-white shadow">
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>
      </div>

      {/* Sidebar - visible on small screens when open */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[999999] flex lg:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black bg-opacity-40"
            onClick={() => setIsSidebarOpen(false)}
          ></div>

          {/* Sidebar itself */}
          <div className="relative w-[250px] h-full bg-white shadow z-[999999]">
            <Sidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Sidebar overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-auto">
        {/* Header */}
        <Header toggleSidebar={toggleSidebar} />

        {/* Page Content */}
        <main className="flex-1 p-4 pt-20 overflow-y-auto md:mt-20 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
