// EmailScheduler.jsx
import {
  addDoc,
  collection,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../../config/firebase";
import { SCHEDULED_EMAILS } from "../Constant";
import MobileMenu from "../MobileMenu";
import { useLocation, useNavigate } from "react-router-dom";

const EditEmailScheduler = () => {
  const [email, setEmail] = useState("");
  const [frequencies, setFrequencies] = useState([]);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const location = useLocation();
  const id = location.state?.id || null;

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
      const codeDoc = doc(db, SCHEDULED_EMAILS, id);
      await updateDoc(codeDoc, {
        email,
        frequencies,
        createdAt: new Date().toISOString(),
      });
      setMessage("✅ Email schedule saved successfully !!!");
      navigate("/emailscheduler"); // Redirect to the email scheduler page
    } catch (error) {
      console.error("Firebase error:", error);
      setMessage("❌ Failed to save schedule.");
    }
  };

  useEffect(() => {
    // get email info from db
    const fetchEmailInfo = async () => {
      try {
        const uid = localStorage.getItem("uid");
        const scheduledEmails_CollectionRef = collection(db, SCHEDULED_EMAILS);
        const querySnapshot = await getDocs(scheduledEmails_CollectionRef);
        const emailData = querySnapshot.docs
          .map((doc) => ({ ...doc.data(), id: doc.id }))
          .find((data) => data.uid === uid);

        if (emailData) {
          setEmail(emailData.email);
          setFrequencies(emailData.frequencies || []);
        }
      } catch (error) {
        console.error("Error fetching email info:", error);
      }
    };
    fetchEmailInfo();
  }, []);

  return (
    <div>
      <div className="hidden max-lg:block mb-16">
        <MobileMenu />
      </div>
      <div className="max-w-md mx-auto mt-10 p-6 bg-gradient-to-r from-blue-100 to-blue-50 shadow-lg rounded-xl">
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
              Daily - Report will be shared to email at every day in the night
              12:10 AM
            </div>
            <div className="text-xs text-gray-500 text-left">
              Weekly - Report will be shared to email at Monday in the night
              12:20 AM
            </div>
            <div className="text-xs text-gray-500 text-left">
              Monthly - Report will be shared to email at 1st of every month in
              the night 12:30 AM
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-150"
          >
            Update Schedule
          </button>
        </form>
        {message && (
          <p className="mt-4 text-sm text-green-700 text-center">{message}</p>
        )}
      </div>
    </div>
  );
};

export default EditEmailScheduler;
