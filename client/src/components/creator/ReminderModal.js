import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import Loader from "../Loader";

const ReminderModal = ({ handleCloseReminderModal }) => {
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [brandEmail, setBrandEmail] = useState("");
  const [ccEmail, setCCEmail] = useState("");
  const [subject, setSubject] = useState("");

  const sendReminder = async () => {
    if (!brandEmail) {
      alert("Please enter brand email address !!!");
      return;
    }
    if (!subject) {
      alert("Please enter subject !!!");
      return;
    }
    const textData = [
      posts.customerInfo.customerName,
      posts.invoiceInfo.invoiceNumber,
      posts.amount,
      posts.personalInfo.name,
      getDate(posts.invoiceInfo.date),
      posts.personalInfo.phonePrimary,
      posts.personalInfo.email,
      posts.customerInfo.productName,
    ];

    const url = "https://invoicesimplify.onrender.com";
    //const url = "http://localhost:5001";
    const res = await fetch(url + "/send-reminderemail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandEmail, ccEmail, subject, textData }),
    });

    if (res.ok) {
      alert("Email sent successfully!");
      handleCloseReminderModal(true);
    } else {
      alert("Failed to send email");
    }
  };

  const getDate = (utcDate) => {
    var today = new Date(utcDate);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "July",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    var month = months[today.getMonth()];
    const date = month + " " + today.getDate() + ", " + today.getFullYear();
    return date;
  };

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("reminder_data"));
    setPosts(data);

    setBrandEmail(data.customerInfo.email);
    setCCEmail(data.personalInfo.email);
    setSubject(
      `Payment Reminder: ${data.customerInfo.productName} Collab by ${
        data.personalInfo.name
      } - (Due on ${getDate(data.invoiceInfo.date)})`
    );
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center">
      <div className="w-full max-w-lg mx-4 bg-white dark:bg-gray-900 text-black dark:text-white rounded-xl shadow-xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">📧 Send Reminder Email</h2>
          <button
            onClick={handleCloseReminderModal}
            className="text-gray-600 hover:text-red-500"
          >
            <X size={28} />
          </button>
        </div>

        <hr className="mb-4 border-gray-300 dark:border-gray-700" />

        {/* Form */}
        <form className="space-y-5">
          {/* Summary */}
          <div className="max-w-lg mx-auto p-1 lg:p-2 ">
            {/* <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
              Your Phone Number
            </h2> */}

            <label className="block text-sm font-medium text-gray-700 mb-1">
              To (Brand Email)
            </label>
            <input
              type="email"
              required
              value={brandEmail}
              onChange={(e) => {
                setBrandEmail(e.target.value);
              }}
              placeholder="Enter Brand Email"
              className="w-full px-4 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-base mb-4"
            />

            <label className="block text-sm font-medium text-gray-700 mb-1">
              CC (Your Email)
            </label>
            <input
              type="email"
              value={ccEmail}
              onChange={(e) => {
                setCCEmail(e.target.value);
              }}
              placeholder="Enter your Email"
              className="w-full px-4 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-base mb-4"
            />
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
              }}
              placeholder="Enter Subject"
              className="w-full px-4 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-base mb-4"
            />

            {/* <label className="block text-sm font-medium text-gray-700 mb-1">
              Reminder Text
            </label>
            <textarea
              type="text"
              required
              value={text}
              onChange={(e) => {
                setText(e.target.value);
              }}
              placeholder="Enter Reminder text here..."
              className="w-full px-4 h-40 text-sm py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-base mb-4"
            /> */}
            <button
              onClick={sendReminder}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
            >
              Send
            </button>
          </div>
        </form>
      </div>

      {/* Loader */}
      {loading && <Loader />}
    </div>
  );
};

export default ReminderModal;
