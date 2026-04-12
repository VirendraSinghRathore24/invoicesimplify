import React, { useState, useEffect } from "react";

import { Smartphone, ShieldCheck, ArrowRight, RefreshCcw } from "lucide-react";
import { signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { auth } from "../../config/firebase";
import { NavLink, useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [phone, setPhone] = useState("+91");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      navigate("/gst/owndashboard");

      // Redirect to Dashboard here
    } catch (err) {
      setError("Invalid OTP. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      {/* --- TOP BANNER (Sticky) --- */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-blue-200 shadow-lg">
              <ShieldCheck className="text-white" size={22} />
            </div>
            <span className="text-xl font-black text-slate-800 tracking-tight">
              Invoice<span className="text-blue-600">Simplify</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <NavLink
              to="/gst/owndashboard"
              className="hover:text-blue-600 transition-colors"
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/gst/sellerdashboard"
              className="hover:text-blue-600 transition-colors"
            >
              Trust Dashboard
            </NavLink>
            <NavLink
              to="/gst/itc"
              className="hover:text-blue-600 transition-colors"
            >
              ITC Reconciliation
            </NavLink>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Vendor Tracking
            </a>
            <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-blue-600 transition-all shadow-md">
              Login to Portal
            </button>
          </div>
        </div>
      </nav>
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
