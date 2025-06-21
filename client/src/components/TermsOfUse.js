import React from "react";
import { NavLink } from "react-router-dom";

const TermsOfUse = () => {
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
        <h1 className="text-4xl font-bold mb-6 text-center">Terms of Use</h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          Last updated: June 11, 2025
        </p>

        <section className="space-y-6 text-lg leading-relaxed text-justify">
          <p>
            Welcome to <strong>InvoiceSimplify</strong>. By using our website
            and services, you agree to be bound by the following terms and
            conditions. Please read them carefully.
          </p>

          <div>
            <h2 className="text-2xl font-semibold mb-2">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using the InvoiceSimplify platform, you agree to
              comply with these Terms of Use. If you do not agree, you should
              not use our services.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-2">2. Services Offered</h2>
            <p>
              InvoiceSimplify provides tools for creating, managing, and sending
              invoices. We reserve the right to modify or discontinue any part
              of the service without notice.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-2">
              3. User Responsibilities
            </h2>
            <ul className="list-disc list-inside">
              <li>Maintain the confidentiality of your login credentials.</li>
              <li>Ensure that your information is accurate and up to date.</li>
              <li>Use the platform only for lawful purposes.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-2">
              4. Prohibited Activities
            </h2>
            <p>You may not:</p>
            <ul className="list-disc list-inside">
              <li>Use the service for fraudulent or illegal activities</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Resell or misuse the services provided</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-2">5. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your access to our
              services at any time for violation of these terms or misuse of the
              platform.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-2">
              6. Intellectual Property
            </h2>
            <p>
              All content, branding, and technology on InvoiceSimplify is the
              property of InvoiceSimplify and protected under applicable
              intellectual property laws.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-2">
              7. Limitation of Liability
            </h2>
            <p>
              InvoiceSimplify is not liable for any indirect, incidental, or
              consequential damages resulting from the use of our services.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-2">8. Changes to Terms</h2>
            <p>
              We may update these Terms of Use from time to time. Continued use
              of the platform after such updates constitutes acceptance of the
              revised terms.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-2">9. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
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

export default TermsOfUse;
