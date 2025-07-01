import React from "react";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import { NavLink } from "react-router-dom";

const Footer1 = () => {
  return (
    <footer className="bg-gradient-to-r from-indigo-800 to-blue-800 text-white py-10 px-6 mt-10">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between  gap-8">
        {/* Contact Us */}
        <div>
          <h3 className="text-lg font-semibold mb-3">
            <NavLink to={"/contactus"} className="hover:underline text-white">
              Contact Us
            </NavLink>
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <FaEnvelope className="text-blue-200" />
              support@invoicesimplify.com
            </li>
            <li className="flex items-center gap-2">
              <FaPhone className="text-blue-200" />
              +91 91106 74036
            </li>
            <li className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-blue-200" />
              Bengaluru, India - 560064
            </li>
          </ul>
        </div>

        {/* About */}
        <div className="w-full lg:w-3/12">
          <h3 className="text-lg font-semibold mb-3">
            <NavLink to={"/aboutus"} className="hover:underline text-white">
              About Us
            </NavLink>
          </h3>
          <p className="text-sm leading-relaxed text-gray-200">
            We help individuals and businesses simplify their invoicing process
            with fast, mobile-friendly tools that save time and effort.
          </p>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Legal</h3>
          <ul className="text-sm space-y-2">
            <li>
              <NavLink
                to={"/termsofuse"}
                className="hover:underline text-gray-200"
              >
                Terms of Use
              </NavLink>
            </li>
            <li>
              <NavLink
                to={"/privacypolicy"}
                className="hover:underline text-gray-200"
              >
                Privacy Policy
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Copyright */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Powered By</h3>
          <p className="text-sm text-gray-200">InvoiceSimplify.com</p>
          <p className="mt-2 text-xs text-gray-400">
            &copy; {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </div>

      <div className="mt-8 border-t border-indigo-500 pt-4 text-center text-xs text-gray-400">
        Made with ❤️ In India
      </div>
    </footer>
  );
};

export default Footer1;
