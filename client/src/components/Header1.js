import React from "react";
import { NavLink } from "react-router-dom";

const Header1 = () => {
  const handleCreateInvoice = () => {
    const user = localStorage.getItem("user");

    if (user && user !== "undefined" && user !== "null") {
      const newWindow = window.open("/createinvoice", "_blank");
      if (newWindow) newWindow.opener = null;
    } else {
      const newWindow = window.open("/login", "_blank");
      if (newWindow) newWindow.opener = null;
    }
  };

  return (
    /* Header */
    <header className="bg-white dark:bg-gray-800 shadow-md fixed top-0 left-0 w-full z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <NavLink
          to={"/"}
          className="text-xl font-bold text-indigo-600 dark:text-white"
        >
          <img
            src="../../images/invlogo.png"
            alt="Logo"
            width={55}
            loading="lazy"
          />
        </NavLink>
        <div className="flex items-center gap-4">
          <button
            onClick={handleCreateInvoice}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition"
          >
            Create Invoice
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header1;
