import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import Loader from "../Loader";

const EmailModal = ({ handleCloseEmailModal }) => {
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [brandEmail, setBrandEmail] = useState("");
  const [ccEmail, setCCEmail] = useState("");
  const [subject, setSubject] = useState("");

  const handleEmailInvoice = async (e) => {
    try {
      e.preventDefault();

      if (!brandEmail) {
        alert("Please enter email address !!!");
        document.querySelector('input[name="brandEmail"]').focus();
        return;
      }

      //const url = "https://invoicesimplify.onrender.com";
      const url = "http://localhost:5001";

      setLoading(true);
      const response = await fetch(url + "/send-email-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "virendrasinghrathore24@gmail.com",
        }),
      });

      if (response.ok) {
        // await InsertToDB();
        // await updateInvoiceNumber();
        // clearLocalStorageForPdf();
        handleCloseEmailModal();
      } else {
        console.error("PDF generation failed");
        handleCloseEmailModal();
      }
    } catch (er) {
      console.log(er);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("email_data"));
    setPosts(data);

    // setBrandEmail(data.customerInfo.email);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center">
      <div className="w-full max-w-lg mx-4 bg-white dark:bg-gray-900 text-black dark:text-white rounded-xl shadow-xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">📧 Send Email</h2>
          <button
            onClick={handleCloseEmailModal}
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
            <input
              type="email"
              required
              autoFocus
              name="brandEmail"
              value={brandEmail}
              onChange={(e) => {
                setBrandEmail(e.target.value);
              }}
              placeholder="Enter Email"
              className="w-full px-4 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-base mb-4"
            />
            <button
              onClick={handleEmailInvoice}
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

export default EmailModal;
