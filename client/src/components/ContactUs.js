import React, { useState } from "react";
import { NavLink } from "react-router-dom";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add form submission logic here (e.g., send to backend or email)
    alert("Thank you for contacting us!");
    setFormData({ name: "", email: "", message: "" });
  };

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
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md mt-20 mb-5">
        <h2 className="text-3xl font-bold mb-4 text-center">Contact Us</h2>
        <p className="text-center mb-8 text-gray-600 dark:text-gray-300">
          Have questions or feedback? We’d love to hear from you.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium">Your Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 border rounded-md bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Your Email</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 border rounded-md bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Your Message</label>
              <textarea
                name="message"
                rows="4"
                required
                value={formData.message}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 border rounded-md bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-md transition"
            >
              Send Message
            </button>
          </form>

          {/* Contact Info */}
          <div className="flex flex-col justify-center space-y-6">
            <div>
              <h4 className="text-lg font-semibold">📧 Email</h4>
              <p className="text-gray-600 dark:text-gray-400">
                support@invoicesimplify.com
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold">📍 Address</h4>
              <p className="text-gray-600 dark:text-gray-400">
                InvoiceSimplify, Bhartiya City, Bengaluru, India - 560067
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold">📱 Phone</h4>
              <p className="text-gray-600 dark:text-gray-400">
                +91 98765 43210
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold">🕒 Working Hours</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Mon - Fri: 9 AM to 6 PM IST
              </p>
            </div>
          </div>
        </div>
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

export default ContactUs;
