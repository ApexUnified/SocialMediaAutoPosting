import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Bell, User, Languages } from "lucide-react";
import { useAuth } from "../../hook/useAuth";
import useLanguage from "../../hook/useLanguage";

const Header = ({ toggleSidebar }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const { user, logout } = useAuth();
  const { lang, switchLanguage } = useLanguage();
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Flags
  const KoreanFlag = () => (
    <svg
      width="24"
      height="16"
      viewBox="0 0 640 480"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id="a">
          <path fillOpacity=".7" d="M-85.3 0h682.6v512H-85.3z" />
        </clipPath>
      </defs>
      <g clipPath="url(#a)" transform="translate(80) scale(.94)">
        <path fill="#fff" d="M-128 0h768v512h-768z" />
        <circle cx="320" cy="256" r="96" fill="#c60c30" />
        <path
          d="M320 160a96 96 0 1 0 0 192 96 96 0 0 0 0-192z"
          fill="#003478"
        />
        <path d="M224 224h192v64H224z" fill="#fff" />
        <g stroke="#000" strokeWidth="24">
          <path d="M72 72l56 56M72 128l56-56" />
          <path d="M568 72l-56 56M568 128l-56-56" />
          <path d="M72 440l56-56M72 384l56 56" />
          <path d="M568 440l-56-56M568 384l-56 56" />
        </g>
      </g>
    </svg>
  );

  const USFlag = () => (
    <svg
      width="24"
      height="16"
      viewBox="0 0 7410 3900"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="7410" height="3900" fill="#b22234" />
      <g fill="#fff">
        <path d="M0 300h7410v300H0zm0 600h7410v300H0zm0 600h7410v300H0zm0 600h7410v300H0zm0 600h7410v300H0zm0 600h7410v300H0" />
      </g>
      <rect width="2964" height="2100" fill="#3c3b6e" />
      <g fill="#fff">
        {Array.from({ length: 9 }).map((_, row) =>
          Array.from({ length: row % 2 === 0 ? 6 : 5 }).map((_, col) => {
            const x = 247 + col * 494 + (row % 2 ? 247 : 0);
            const y = 210 + row * 210;
            return (
              <polygon
                key={`${row}-${col}`}
                points={`${x},${y} ${x + 70},${y + 210} ${x - 180},${y + 75} ${
                  x + 180
                },${y + 75} ${x - 70},${y + 210}`}
              />
            );
          })
        )}
      </g>
    </svg>
  );

  return (
    <header className="fixed top-0 z-30 w-full lg:w-[calc(100%-250px)] bg-white/90 backdrop-blur-md shadow-sm">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24">
          {/* Sidebar Toggle + Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="inline-flex items-center justify-center p-2 text-gray-500 rounded-md lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-primary">
                {lang === "en"
                  ? "Metabread – Your AI-Powered Social Assistant"
                  : "메타브래드 - AI 소셜미디어 어시스턴트"}
              </span>
            </Link>
          </div>

          {/* Right Section (Language + User) */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative">
              {/* Trigger */}
              <div
                tabIndex={0}
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <span className="text-sm font-medium text-gray-600">
                  {lang === "en" ? "English" : "Korean"}
                </span>
                <Languages className="w-5 h-5 text-gray-500" />
              </div>

              {/* Dropdown */}
              {isLanguageMenuOpen && (
                <div className="absolute right-0 z-40 w-48 py-2 mt-2 rounded-md shadow-lg bg-slate-200 ring-1 ring-black ring-opacity-5">
                  <button
                    className={`block w-full px-4 
                  ${lang === "en" ? "bg-blue-200" : ""} 
                py-2 text-sm text-left text-gray-700 hover:bg-gray-100`}
                    onClick={() => {
                      switchLanguage("en");
                      setIsLanguageMenuOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span>{USFlag()}</span>
                      <span>English</span>
                    </div>
                  </button>

                  <button
                    className={`block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 ${
                      lang === "ko" ? "bg-blue-200" : ""
                    }`}
                    onClick={() => {
                      switchLanguage("ko");
                      setIsLanguageMenuOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span>{KoreanFlag()}</span>
                      <span>Korean</span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center justify-center text-white rounded-full shadow-md w-[60px] h-[60px] bg-gradient-to-r from-blue-600 to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
              >
                <span className="sr-only">Open user menu</span>
                <User className="w-5 h-5" />
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 z-40 w-48 py-2 mt-2 rounded-md shadow-lg bg-slate-200 ring-1 ring-black ring-opacity-5">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <p className="font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-gray-500">{user.role}</p>
                  </div>
                  {/* <Link
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
                  </Link> */}
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
