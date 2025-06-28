import React, { useState } from "react";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { auth } from "../../config/firebase";

const FirebasePhoneAuth = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [message, setMessage] = useState("");

  const setupRecaptcha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: () => {
          sendOtp();
        },
        "expired-callback": () => {
          setMessage("Recaptcha expired. Please try again.");
        },
      }
    );
  };

  const sendOtp = () => {
    setupRecaptcha();

    const appVerifier = window.recaptchaVerifier;
    const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`; // Add country code if missing

    signInWithPhoneNumber(auth, formattedPhone, appVerifier)
      .then((confirmationResult) => {
        setConfirmationResult(confirmationResult);
        setIsOtpSent(true);
        setMessage("OTP sent successfully!");
      })
      .catch((error) => {
        console.error("SMS not sent", error);
        setMessage("Failed to send OTP. Try again.");
      });
  };

  const verifyOtp = () => {
    if (confirmationResult && otp.length === 6) {
      confirmationResult
        .confirm(otp)
        .then((result) => {
          const user = result.user;
          setMessage("OTP verified! Login successful.");
        })
        .catch((error) => {
          setMessage("Incorrect OTP. Please try again.");
        });
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-bold">Login via OTP</h2>

      {!isOtpSent ? (
        <>
          <input
            type="text"
            placeholder="Enter phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <button
            onClick={sendOtp}
            className="w-full bg-blue-500 text-white p-2 rounded"
          >
            Send OTP
          </button>
        </>
      ) : (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <button
            onClick={verifyOtp}
            className="w-full bg-green-500 text-white p-2 rounded"
          >
            Verify OTP
          </button>
        </>
      )}

      <div id="recaptcha-container"></div>
      {message && (
        <p className="text-sm text-center text-gray-700">{message}</p>
      )}
    </div>
  );
};

export default FirebasePhoneAuth;
