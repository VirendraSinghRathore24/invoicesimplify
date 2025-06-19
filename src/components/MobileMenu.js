import React, { useState } from "react";
import { Menu, X } from "lucide-react"; // optional: or use your own icons
import { NavLink } from "react-router-dom";

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    "Home",
    "Create Invoice",
    "Dashboard",
    "Inventory",
    "Business Info",
    "Tax Info",
    "Additional Info",
    "Logout",
  ];

  return (
    <div className="relative">
      {/* Top bar */}
      <div className="flex items-center justify-between p-4 bg-[#014459] text-white shadow-md">
        <NavLink className="text-xl font-bold" to={"/"}>
          InvoiceSimplify
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
        <nav className="p-4 space-y-4">
          {menuItems.map((item, index) => (
            <NavLink
              to={`/${item.toLowerCase().replace(/\s+/g, "")}`}
              key={index}
              className="block text-gray-800 hover:text-blue-600 transition"
            >
              {item}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default MobileMenu;
