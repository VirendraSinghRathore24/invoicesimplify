import React, { useState } from "react";

import { ShieldCheck } from "lucide-react";

import { NavLink, useLocation, useNavigate } from "react-router-dom";

const Header = () => {
  const [isUserExists, setIsUserExists] = useState(
    localStorage.getItem("gstUser") ? true : false
  );
  const [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();
  const handleLogin = () => {
    navigate("/gst/login");
  };

  const handleLogout = () => {
    var res = window.confirm("are you sure you want to logout?");
    if (!res) return;
    localStorage.clear();
    setIsUserExists(false);
    navigate("/gst/login");
  };

  const location = useLocation();

  // Helper to define active vs inactive styles for main links
  const navLinkClasses = ({ isActive }) =>
    `transition-colors relative py-1 ${
      isActive
        ? "text-blue-600 after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-blue-600 after:rounded-full"
        : "hover:text-blue-600 text-slate-600"
    }`;

  // Check if the current URL belongs to the Purchase group
  const isPurchaseActive =
    location.pathname.includes("/gst/sales") ||
    location.pathname.includes("/gst/purchasereg");

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-blue-200 shadow-lg">
            <ShieldCheck className="text-white" size={22} />
          </div>
          <span className="text-xl font-black text-slate-800 tracking-tight">
            Invoice<span className="text-blue-600">Simplify</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
          <NavLink to="/gst/owndashboard" className={navLinkClasses}>
            Dashboard
          </NavLink>

          <NavLink to="/gst/sellerdashboard" className={navLinkClasses}>
            Trust Dashboard
          </NavLink>

          <NavLink to="/gst/itc" className={navLinkClasses}>
            ITC Reconciliation
          </NavLink>

          {/* Purchase Dropdown Group */}
          <div
            className="relative"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          >
            <button
              className={`flex items-center transition-colors py-2 focus:outline-none ${
                isPurchaseActive
                  ? "text-blue-600"
                  : "text-slate-600 hover:text-blue-600"
              }`}
            >
              Purchase
              <svg
                className={`ml-1 w-4 h-4 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isOpen && (
              <div className="absolute left-0 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-2 mt-0">
                <NavLink
                  to="/gst/sales"
                  className={({ isActive }) =>
                    `block px-4 py-2 text-sm transition-colors ${
                      isActive
                        ? "text-blue-600 bg-blue-50 font-bold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`
                  }
                >
                  Entry
                </NavLink>

                <NavLink
                  to="/gst/purchasereg"
                  className={({ isActive }) =>
                    `block px-4 py-2 text-sm transition-colors ${
                      isActive
                        ? "text-blue-600 bg-blue-50 font-bold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`
                  }
                >
                  Register
                </NavLink>
              </div>
            )}
          </div>

          {/* Auth Buttons */}
          {!isUserExists ? (
            <button
              onClick={handleLogin}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-blue-600 transition-all shadow-md"
            >
              Login to Portal
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-blue-600 transition-all shadow-md"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
export default Header;
