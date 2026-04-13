import React, { useState } from "react";

import { ShieldCheck } from "lucide-react";

import { NavLink } from "react-router-dom";

const Header = () => {
  const [isUserExists, setIsUserExists] = useState(
    localStorage.getItem("gstUser") ? true : false
  );
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
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <NavLink
            to="/gst/owndashboard"
            className="hover:text-blue-600 transition-colors"
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/gst/sellerdashboard"
            className="hover:text-blue-600 transition-colors"
          >
            Trust Dashboard
          </NavLink>
          <NavLink
            to="/gst/itc"
            className="hover:text-blue-600 transition-colors"
          >
            ITC Reconciliation
          </NavLink>
          <a href="#" className="hover:text-blue-600 transition-colors">
            Vendor Tracking
          </a>
          {!isUserExists ? (
            <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-blue-600 transition-all shadow-md">
              Login to Portal
            </button>
          ) : (
            <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-blue-600 transition-all shadow-md">
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
export default Header;
