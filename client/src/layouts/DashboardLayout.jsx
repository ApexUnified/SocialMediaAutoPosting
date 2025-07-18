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
    <div className="flex w-screen h-screen ">
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
