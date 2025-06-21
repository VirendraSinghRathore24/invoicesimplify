import React from "react";
import { NavLink } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white transition-colors duration-300">
      /* Header */
      <header className="bg-white dark:bg-gray-800 shadow-md fixed top-0 left-0 w-full z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <NavLink
            to={"/"}
            className="text-xl font-bold text-indigo-600 dark:text-white"
          >
            InvoiceSimplify
          </NavLink>
          <div className="flex items-center gap-4">
            <button
              //onClick={handleCreateInvoice}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition"
            >
              Create Invoice
            </button>
          </div>
        </div>
      </header>
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mt-20 mb-10">
        <h1 className="text-4xl font-bold mb-6 text-center">Privacy Policy</h1>
        <p className="mb-6 text-center text-gray-600 dark:text-gray-400">
          Effective Date: June 11, 2025
        </p>

        <section className="space-y-6 text-justify text-lg leading-relaxed">
          <p>
            At <strong>InvoiceSimplify</strong>, your privacy is our priority.
            This Privacy Policy describes how we collect, use, and protect your
            information when you use our website and services.
          </p>

          <div>
            <h2 className="text-2xl font-semibold mb-2">
              1. Information We Collect
            </h2>
            <ul className="list-disc list-inside">
              <li>
                <strong>Personal Information:</strong> Name, email address,
                billing information, etc.
              </li>
              <li>
                <strong>Usage Data:</strong> Device type, browser, pages
                visited, and time spent.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-2">
              2. How We Use Your Information
            </h2>
            <p>We use your information to:</p>
            <ul className="list-disc list-inside">
              <li>Provide and improve our invoicing services</li>
              <li>Communicate with you</li>
              <li>Ensure data security</li>
              <li>Comply with legal obligations</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-2">
              3. Sharing of Information
            </h2>
            <p>
              We do not sell your personal data. We may share your information
              with trusted third-party services for secure payment processing,
              analytics, or if required by law.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-2">4. Data Security</h2>
            <p>
              We implement strong encryption and secure hosting environments to
              protect your data from unauthorized access.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-2">5. Cookies</h2>
            <p>
              We use cookies to improve user experience and analyze website
              traffic. You can control cookie preferences through your browser.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-2">6. Your Rights</h2>
            <p>
              You can request to access, correct, or delete your personal data.
              Contact us at
              <a
                href="mailto:support@invoicesimplify.com"
                className="text-indigo-500 underline ml-1"
              >
                support@invoicesimplify.com
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-2">
              7. Changes to This Policy
            </h2>
            <p>
              We may update this policy periodically. We will notify you of
              significant changes by email or via our website.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-2">8. Contact Us</h2>
            <p>
              If you have any questions about this policy, please reach out to
              us at:
              <br />
              <a
                href="mailto:support@invoicesimplify.com"
                className="text-indigo-500 underline"
              >
                support@invoicesimplify.com
              </a>
            </p>
          </div>
        </section>
      </div>
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

export default PrivacyPolicy;
