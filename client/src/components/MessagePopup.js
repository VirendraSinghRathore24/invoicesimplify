import React, { useState } from "react";
import { X } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import Loader from "./Loader";

const MessagePopup = ({
  handleCloseMessagePopup,
  customerPhone,
  customerName,
  businessName,
  businessPhone,
  invoiceNumber,
  amount,
}) => {
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState(customerPhone);

  const getLinkStr = async () => {
    const invoiceInfo_CollectionRef2 = collection(db, "Invoice_Info");
    const data = await getDocs(invoiceInfo_CollectionRef2);
    const filteredData = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    const loggedInUser = localStorage.getItem("user");
    const allBrandsInfo = filteredData.filter(
      (x) => x.loggedInUser === loggedInUser
    );

    const invoiceData = allBrandsInfo.filter(
      (x) => x.invoiceInfo.invoiceNumber === parseInt(invoiceNumber)
    )[0];

    return invoiceData.linkStr;
  };

  const getCurrentDate = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    const formatted = `${day}/${month}/${year}  ${hours}:${minutes}`;
    return formatted;
  };

  const handleSendMessage = async (e) => {
    try {
      e.preventDefault();

      if (!customerName || !phone || !businessName || !businessPhone) {
        alert("Required information is missing to send message !!!");
        return;
      }

      if (phone.length !== 10) {
        alert("Customer phone number is not valid !!!");
        return;
      }

      setLoading(true);

      const linkStr = await getLinkStr();

      const response = await fetch(
        "https://invoicesimplify.onrender.com/send-sms",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: customerName,
            to: "+91" + phone,
            businessname: businessName,
            amount: amount,
            message:
              "Dear " +
              customerName +
              ",\n\nThank you for your purchase! Your invoice is ready.\n\n" +
              "You can view your invoice using the link below:\n\n" +
              "https://invoicesimplify.com/ci/" +
              linkStr +
              "\n\nIf you have any questions, feel free to contact us.\n\n" +
              "Best regards,\n" +
              businessName +
              "\n" +
              businessPhone,
            urllink: "https://invoicesimplify.com/ci/" + linkStr,
            date: getCurrentDate(),
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        alert("Message sent successfully!");
      } else {
        alert("Failed to send message.");
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error sending message", error);
      alert("Error sending message.", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center">
      <div className="w-full max-w-md mx-4 bg-white dark:bg-gray-900 text-black dark:text-white rounded-xl shadow-xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">☎️ Send Message</h2>
          <button
            onClick={handleCloseMessagePopup}
            className="text-gray-600 hover:text-red-500"
          >
            <X size={28} />
          </button>
        </div>

        <hr className="mb-4 border-gray-300 dark:border-gray-700" />

        {/* Form */}
        <form onSubmit={handleSendMessage} className="space-y-5">
          {/* Summary */}
          <div className="max-w-md mx-auto p-1 lg:p-6 mt-10 ">
            {/* <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
              Your Phone Number
            </h2> */}

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              required
              minLength={10}
              maxLength={10}
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
              }}
              placeholder="10 digit phone number"
              className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-base mb-4"
            />

            <button
              // onClick={handleSend}
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

export default MessagePopup;
