import React, { useState, useEffect } from "react";

import { Smartphone, ShieldCheck, ArrowRight, RefreshCcw } from "lucide-react";
import { signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { auth } from "../../config/firebase";
import { NavLink, useNavigate } from "react-router-dom";
import { m } from "framer-motion";
import Header from "./Header";

const LoginPage = () => {
  const [phone, setPhone] = useState("+91");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isUserExists, setIsUserExists] = useState(
    localStorage.getItem("gstUser") ? true : false
  );

  const navigate = useNavigate();

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
        }
      );
    }
  };

  const onSendOTP = async () => {
    setLoading(true);
    setError("");
    setupRecaptcha();
    const appVerifier = window.recaptchaVerifier;

    try {
      const confirmation = await signInWithPhoneNumber(
        auth,
        phone,
        appVerifier
      );
      setConfirmationResult(confirmation);
    } catch (err) {
      setError("Failed to send OTP. Check phone number format.");
      console.error(err);
    }
    setLoading(false);
  };

  const onVerifyOTP = async () => {
    setLoading(true);
    setError("");
    try {
      await confirmationResult.confirm(otp);
      localStorage.setItem("gstUser", phone);

      if (!localStorage.getItem("gstin_data")) {
        alert(
          "No GSTIN data found. Please complete GSTIN onboarding to proceed."
        );

        navigate("/gst/onboarding");
        return;
      }
      navigate("/gst/owndashboard");
      // 08AFLPR4165H1Z1

      // Redirect to Dashboard here
    } catch (err) {
      setError("Invalid OTP. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      {/* --- TOP BANNER (Sticky) --- */}
      <Header />
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
        <div id="recaptcha-container"></div>

        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
              <Smartphone className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-black text-slate-800">
              Invoice Simplify
            </h1>
            <p className="text-slate-500 text-sm">Secure Shopkeeper Login</p>
          </div>

          {error && (
            <p className="text-red-500 text-xs font-bold mb-4 bg-red-50 p-2 rounded text-center">
              {error}
            </p>
          )}

          {!confirmationResult ? (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Mobile Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-bold text-slate-700"
                />
              </div>
              <button
                onClick={onSendOTP}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-100 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCcw className="animate-spin" />
                ) : (
                  <>
                    Send OTP <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Enter 6-Digit OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  autoFocus
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="000000"
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 text-center tracking-[1em] font-black text-xl outline-none"
                  maxLength={6}
                />
              </div>
              <button
                onClick={onVerifyOTP}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-xl shadow-lg shadow-green-100 flex items-center justify-center gap-2 transition-all"
              >
                <ShieldCheck size={20} /> Verify & Enter Dashboard
              </button>
              <button
                onClick={() => setConfirmationResult(null)}
                className="w-full text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-blue-600 transition-colors"
              >
                Change Phone Number
              </button>
            </div>
          )}

          <p className="mt-8 text-center text-[10px] text-slate-400 leading-relaxed uppercase font-bold tracking-tighter">
            By continuing, you agree to receive a one-time SMS for verification.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
