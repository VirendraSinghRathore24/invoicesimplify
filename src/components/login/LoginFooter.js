import React, { useState } from "react";
import { NavLink } from "react-router-dom";

const LoginFooter = () => {
  return (
    <div>
      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 py-6 px-4 text-center border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-center gap-6 text-sm">
          <NavLink to={"/aboutus"} className="hover:underline">
            About Us
          </NavLink>
          <NavLink to={"/contactus"} className="hover:underline">
            Contact Us
          </NavLink>
          <NavLink to={"/"} className="hover:underline">
            Home
          </NavLink>
        </div>
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} InvoiceSimplify. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LoginFooter;
