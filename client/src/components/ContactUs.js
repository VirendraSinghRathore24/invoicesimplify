import React, { useEffect, useState } from "react";
import Footer1 from "./Footer1";
import Header1 from "./Header1";
import { toast } from "react-toastify";
import { addDoc, collection, doc } from "firebase/firestore";
import { db } from "../config/firebase";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Add form submission logic here (e.g., send to backend or email)
    await addContactUsDataToDB();
    toast("Thank you for contacting us!");
    setFormData({ name: "", email: "", message: "" });
  };

  const addContactUsDataToDB = async () => {
    const uid = localStorage.getItem("uid");
    const contactInfo_CollectionRef = collection(
      doc(db, "Shop", uid),
      "Contact_Info"
    );
    await addDoc(contactInfo_CollectionRef, {
      contactData: formData,
      messageDate: new Date().toISOString().slice(0, 10),
    });
  };

  useEffect(() => {
    window.scroll(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white transition-colors duration-300">
      <Header1 />
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md mt-24 mb-5">
        <h2 className="text-xl lg:text-2xl font-bold mb-4 text-center">
          Contact Us
        </h2>
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
              className="w-full bg-indigo-600 text-sm hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-md transition"
            >
              Send Message
            </button>
          </form>

          {/* Contact Info */}
          <div className="flex flex-col justify-center space-y-6">
            <div>
              <h4 className="text-md font-semibold">📧 Email</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                support@invoicesimplify.com
              </p>
            </div>
            <div>
              <h4 className="text-md font-semibold">📍 Address</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                InvoiceSimplify HQ, <br />
                Bhartiya City, Bengaluru, India - 560064
              </p>
            </div>
            <div>
              <h4 className="text-md font-semibold">📱 Phone</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                +91 80955 28424
              </p>
            </div>
            <div>
              <h4 className="text-md font-semibold">🕒 Working Hours</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Mon - Fri: 9 AM to 6 PM IST
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer1 />
    </div>
  );
};

export default ContactUs;
