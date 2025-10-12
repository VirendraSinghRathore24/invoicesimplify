import React, { useEffect, useState } from "react";
import { Menu, X, CircleCheckBig, ShieldCheck } from "lucide-react"; // optional: or use your own icons
import { NavLink, useNavigate } from "react-router-dom";

const CreatorMobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const loggedInUser = localStorage.getItem("user");
  const subscription = localStorage.getItem("subscription");
  const name = localStorage.getItem("name1");
  const navigate = useNavigate();

  const handleLogout = () => {
    const res = window.confirm("Are you sure you want to logout?");

    if (res) {
      localStorage.clear();
      navigate("/login");
    }
  };

  const menuItems = [
    "Create Invoice",
    "Dashboard",
    "Brands",
    "Personal Info",
    "Account Info",
    "Additional Info",
    "Refresh",
  ];

  const getPath = (input) => {
    if (input === "Create Invoice") {
      return "creator/createinvoice";
    }
    if (input === "Dashboard") {
      return "creator/dashboard";
    }
    if (input === "Brands") {
      return "creator/brands";
    }
    if (input === "Personal Info") {
      return "creator/personalinfo";
    }
    if (input === "Account Info") {
      return "creator/accountinfo";
    }
    if (input === "Additional Info") {
      return "creator/creatoradditionalinfo";
    }
  };

  const [remainingDays, setRemainingDays] = useState(null);
  const loginDate = localStorage.getItem("loginDate");
  useEffect(() => {
    const calculateRemainingDays = () => {
      const today = new Date();
      const future = new Date(loginDate); // replace with login date
      future.setMonth(future.getMonth() + 2);

      const diff = future - today;
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

      setRemainingDays(days);
    };

    calculateRemainingDays();

    const interval = setInterval(calculateRemainingDays, 24 * 60 * 60 * 1000); // Update daily
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full z-50">
      {/* Top bar */}
      <div className="flex items-center justify-between p-4 bg-[#014459] text-white shadow-md">
        <NavLink className="text-xl font-bold" to={"/"}>
          <img
            src="../../images/invlogo2.png"
            alt="Logo"
            width={60}
            loading="lazy"
          />
        </NavLink>
        <button
          className="lg:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Sidebar overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b text-xl font-bold text-blue-600">
          InvoiceSimplify
        </div>

        <div className="text-sm font-bold py-2 border-b border-white text-center flex items-center break-all justify-start px-6 break-words">
          <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center mr-2 ">
            {name?.charAt(0).toUpperCase()}
          </div>
          {name}
        </div>
        <hr />
        <div className="text-[12px] text-center mt-2">{loggedInUser}</div>
        <hr className="mt-2" />

        <nav className="p-4 space-y-4">
          {menuItems.map((item, index) => (
            <NavLink
              to={`/${getPath(item)}`}
              key={index}
              className="block text-gray-800 hover:text-blue-600 transition"
            >
              {item}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 bottom-0 mt-auto border-t text-center">
          <button onClick={handleLogout}>Logout</button>
        </div>
        <div className="bg-white rounded-xl p-4 m-2 text-gray-800 shadow-inner">
          <h3 className="text-sm font-medium text-gray-600 mb-1">
            Plan Type :
            <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
              {subscription}
            </span>
          </h3>
          <div className="text-sm font-medium text-gray-600">
            Expires in :{" "}
            <span className="inline-block bg-yellow-100 text-green-700 text-xs font-semibold px-1 py-1 rounded-full">
              {remainingDays} days{" "}
            </span>
          </div>
          <button
            onClick={() => navigate("/plans")}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-2 rounded-lg transition-all duration-200 font-semibold"
          >
            Upgrade Plan
          </button>
        </div>

        <div className="text-xs font-bold border-t border-white flex justify-evenly mb-2 py-2">
          <div className="flex items-center space-x-1">
            <ShieldCheck size={20} />
            <div>100% Secure</div>
          </div>
          <div className="flex items-center space-x-1">
            <CircleCheckBig size={20} />
            <div>ISO Certified</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorMobileMenu;
