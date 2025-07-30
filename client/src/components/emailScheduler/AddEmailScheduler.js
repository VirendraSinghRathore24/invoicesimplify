// EmailScheduler.jsx
import { addDoc, collection } from "firebase/firestore";
import React, { useState } from "react";
import { db } from "../../config/firebase";
import { SCHEDULED_EMAILS } from "../Constant";
import MobileMenu from "../MobileMenu";
import { useNavigate } from "react-router-dom";

const AddEmailScheduler = () => {
  const [email, setEmail] = useState("");
  const [frequencies, setFrequencies] = useState([]);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleFrequencyChange = (e) => {
    const { value, checked } = e.target;
    setFrequencies((prev) =>
      checked ? [...prev, value] : prev.filter((f) => f !== value)
    );
  };

  const handleSchedule = async (e) => {
    e.preventDefault();

    if (!email || frequencies.length === 0) {
      setMessage("Please complete all fields.");
      return;
    }

    try {
      const uid = localStorage.getItem("uid");
      const scheduledEmails_CollectionRef = collection(db, SCHEDULED_EMAILS);
      await addDoc(scheduledEmails_CollectionRef, {
        uid,
        email,
        frequencies,
        createdAt: new Date().toISOString(),
      });
      setMessage("✅ Email schedule saved successfully !!!");
      setEmail("");
      setFrequencies([]);
      navigate("/emailscheduler"); // Redirect to the email scheduler page
    } catch (error) {
      console.error("Firebase error:", error);
      setMessage("❌ Failed to save schedule.");
    }
  };

  return (
    <div className="flex justify-evenly w-full h-full">
      <div className="w-full lg:w-[82%] ml-0 lg:ml-[17%] border-2 my-3 rounded-lg border-gray-300 bg-white shadow-lg top-0 fixed h-[96.7%]">
        <div className="hidden lg:block">
          <div className="top-0 mx-auto w-full h-[68px] text-white border-b-2">
            <div className="font-bold text-md py-4 px-2 rounded-md w-[82%]">
              <div className="text-xl text-black">Add Email Scheduler</div>
            </div>
          </div>
        </div>
        <div className="hidden max-lg:block mb-16">
          <MobileMenu />
        </div>
        <div className="max-w-md mx-auto mt-10 p-3 bg-gradient-to-r from-blue-100 to-blue-50 shadow-lg rounded-xl">
          <h2 className="text-2xl font-semibold text-blue-800 mb-4 text-center">
            📧 Email Scheduler
          </h2>
          <form onSubmit={handleSchedule} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Frequency
              </label>
              {["daily", "weekly", "monthly"].map((freq) => (
                <label
                  key={freq}
                  className="flex items-center gap-2 text-sm text-gray-600"
                >
                  <input
                    type="checkbox"
                    value={freq}
                    checked={frequencies.includes(freq)}
                    onChange={handleFrequencyChange}
                    className="accent-blue-600"
                  />
                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                </label>
              ))}
            </div>
            <div className="flex flex-col gap-y-1">
              <div className="text-xs text-gray-500 text-left">
                Daily - The report will be automatically sent via email every
                night at 12:10 AM.
              </div>
              <div className="text-xs text-gray-500 text-left">
                Weekly – The report will be automatically sent via email at
                12:20 AM every Monday night.
              </div>
              <div className="text-xs text-gray-500 text-left">
                Monthly – The report will be automatically sent via email at
                12:30 AM on the 1st night of every month.
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-150"
            >
              Schedule
            </button>
          </form>
          {message && (
            <p className="mt-4 text-sm text-green-700 text-center">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddEmailScheduler;
