import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Calendar, Building2, FileText, Settings, X } from "lucide-react";
import Logo from "../icons/Logo";
import { useAuth } from "../../hook/useAuth";

const navigation = [
  // { name: 'Dashboard', href: '/#', icon: Home },
  // { name: 'Reservations', href: '/reservations', icon: Calendar },
  // { name: 'Hospitals', href: '/hospitals', icon: Building2 },
  { name: "Posts", href: "/posts", icon: FileText },
  // { name: 'Settings', href: '/settings', icon: Settings },
];

const Sidebar = ({ isOpen, onClose }) => {

  const { user } = useAuth();
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed border-r border-zinc-200  inset-y-0 left-0 z-30 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-screen flex flex-col">
          <div className="flex items-center justify-center mt-5 border-b border-zinc-200 pb-8">
            <Logo />

          </div>
          {/* Close button for mobile */}
          <div className="flex items-center justify-between h-16 px-4 border-b lg:hidden">
            <span className="text-xl font-bold text-primary">
              Hospital Social
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <span className="sr-only">Close sidebar</span>
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-2 mt-4 overflow-y-auto">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
                onClick={onClose}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    location.pathname === item.href
                      ? "text-white"
                      : "text-gray-400 group-hover:text-gray-500"
                  }`}
                />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* User info */}
          <div className="flex-shrink-0 flex border-t border-zinc-200 p-4">
            <div className="flex-shrink-0 group block">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white">
                  <span className="text-lg font-medium">
                    {user?.firstName?.[0]?.toUpperCase() ||
                      "U"}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">
                    {user?.firstName || "User"}
                  </p>
                  <p className="text-xs font-medium text-gray-500">
                    {user?.role.toUpperCase() || "Role"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
