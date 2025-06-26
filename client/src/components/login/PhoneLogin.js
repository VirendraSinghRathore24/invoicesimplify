import React, { useState } from "react";

import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../config/firebase";

const PhoneLogin = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [message, setMessage] = useState("");

  const setupRecaptcha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible", // or 'normal'
        callback: (response) => {
          // reCAPTCHA solved
          console.log("reCAPTCHA solved");
        },
        "expired-callback": () => {
          console.log("reCAPTCHA expired");
        },
      }
    );
  };

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      setMessage("Enter a valid phone number.");
      return;
    }

    setupRecaptcha();
    const appVerifier = window.recaptchaVerifier;
    const formattedPhone = "+91" + phone; // Change for other countries

    try {
      const result = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        appVerifier
      );
      setConfirmation(result);
      setMessage("OTP sent!");
    } catch (error) {
      console.error(error);
      setMessage("Failed to send OTP.");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || !confirmation) return;

    try {
      await confirmation.confirm(otp);
      setMessage("Phone number verified!");
    } catch (error) {
      console.error(error);
      setMessage("Invalid OTP.");
    }
  };

  return (
    <div className="p-4 max-w-sm mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Phone Login</h2>
      <input
        type="text"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Enter phone number"
        className="border p-2 w-full mb-2"
      />
      <button
        onClick={handleSendOtp}
        className="bg-blue-500 text-white p-2 w-full mb-4 rounded"
      >
        Send OTP
      </button>

      {confirmation && (
        <>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            className="border p-2 w-full mb-2"
          />
          <button
            onClick={handleVerifyOtp}
            className="bg-green-500 text-white p-2 w-full rounded"
          >
            Verify OTP
          </button>
        </>
      )}

      <div id="recaptcha-container"></div>

      {message && (
        <p className="mt-4 text-sm text-gray-700 text-center">{message}</p>
      )}
    </div>
  );
};

export default PhoneLogin;
