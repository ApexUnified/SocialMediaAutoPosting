import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Bell, User } from "lucide-react";
import { useAuth } from "../../hook/useAuth";

const Header = ({ toggleSidebar }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="fixed top-0 z-30 w-full bg-white shadow-sm">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={toggleSidebar}
              className="inline-flex items-center justify-center p-2 text-gray-400 rounded-md lg:hidden hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center flex-shrink-0">
              <span className="text-xl font-bold text-primary">
                Hospital Social
              </span>
            </Link>
          </div>

          <div className="flex items-center">
            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary">
              <span className="sr-only">View notifications</span>
              <Bell className="w-6 h-6" />
            </button>

            {/* User menu */}
            <div className="relative ml-3">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center max-w-xs rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <span className="sr-only">Open user menu</span>
                <div className="flex items-center justify-center w-8 h-8 text-white rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
                  <User className="w-5 h-5" />
                </div>
              </button>

              {/* User dropdown menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 w-48 py-1 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <p className="font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-gray-500">{user.role}</p>
                  </div>
                  <Link
                    to="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Your Profile
                  </Link>
                  <Link
                    to="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
