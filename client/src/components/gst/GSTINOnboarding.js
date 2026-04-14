import React, { useEffect, useState } from "react";
import {
  Search,
  Building2,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  RefreshCcw,
  ChevronDown,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { BASE_URL } from "../Constant";
import axios from "axios";

const GSTINOnboarding = ({ onComplete }) => {
  const [gstin, setGstin] = useState("");
  const [shopDetails, setShopDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isUserExists, setIsUserExists] = useState(
    localStorage.getItem("gstUser") ? true : false
  );
  const [filingFrequency, setFilingFrequency] = useState("monthly");
  const [turnoverRange, setTurnoverRange] = useState("below_5cr");
  const navigate = useNavigate();

  const API = BASE_URL + "/api/gst";
  // 1. Logic to fetch details from your API
  const handleFetchDetails = async () => {
    if (gstin.length !== 15) {
      setError("Please enter a valid 15-digit GSTIN");
      return;
    }

    try {
      if (turnoverRange === "above_5cr" && filingFrequency === "quarterly") {
        alert(
          "Quarterly filing is only available for businesses with turnover up to ₹5 Cr. Please select monthly filing or update turnover range."
        );
        return;
      }

      setLoading(true);
      setError("");
      const res = await axios.get(`${API}/searchgst/${gstin}`);

      if (res.data === "") {
        alert("No data found for GSTIN " + gstin + " for the year ");
        return;
      }

      const data = JSON.parse(res.data);

      // MOCK DATA for demonstration
      setTimeout(() => {
        const mockData = {
          tradeName: data.tradeNam,
          legalName: data.lgnm,
          address:
            data.pradr.addr.bnm +
            ", " +
            data.pradr.addr.bno +
            ", " +
            data.pradr.addr.loc +
            ", " +
            data.pradr.addr.dst +
            ", " +
            data.pradr.addr.stcd,
          status: data.sts,
          state: data.stjCd,
          registrationDate: data.rgdt,
        };
        setShopDetails(mockData);
        setLoading(false);
      }, 1500);
    } catch (err) {
      setError("Unable to find GSTIN. Please check and try again.");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const getFilingGstr1DueDate = (filingFrequency) => {
    if (filingFrequency === "monthly") {
      return { dueDate: 11 };
    } else {
      return { dueDate: 13 };
    }
  };

  const getFilingGstr3BDueDate = (gstin, filingFrequency) => {
    const code = gstin.substring(0, 2);
    const groupA = [
      "22",
      "23",
      "24",
      "27",
      "29",
      "30",
      "31",
      "32",
      "33",
      "34",
      "35",
      "36",
      "37",
      "26",
    ];

    if (groupA.includes(code)) {
      return { group: "A", dueDate: filingFrequency === "monthly" ? 20 : 22 };
    } else {
      return { group: "B", dueDate: filingFrequency === "monthly" ? 20 : 24 };
    }
  };

  // Usage

  // 2. Logic to save and move to dashboard
  const handleConfirmAndSave = () => {
    // Save to your DB/LocalStorage
    const finalData = { gstin, ...shopDetails };
    localStorage.setItem("gstin_data", finalData);
    localStorage.setItem("tradeName", shopDetails.tradeName);
    localStorage.setItem("gstfilingfreq", filingFrequency);
    localStorage.setItem("turnoverRange", turnoverRange);
    localStorage.setItem("verified_gstin", gstin);

    // calculate gstr1 and gstr3b based on state code using first two digits of GSTIN
    const gstr1DueDate = getFilingGstr1DueDate(filingFrequency).dueDate;
    const gstr3bDueDate = getFilingGstr3BDueDate(gstin, filingFrequency);

    localStorage.setItem("gstr1DueDate", gstr1DueDate);
    localStorage.setItem("gstr3bDueDate", gstr3bDueDate.dueDate);

    navigate("/gst/owndashboard");

    // Callback to parent component (e.g., App.js) to trigger dashboard redirect
    //onComplete(finalData);
  };

  useEffect(() => {
    const loggedInUser = localStorage.getItem("gstUser");
    if (!loggedInUser) {
      alert("Please login to continue with GSTIN onboarding.");
      navigate("/gst/login");
      return;
    }
  }, []);

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
            {!isUserExists ? (
              <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-blue-600 transition-all shadow-md">
                Login to Portal
              </button>
            ) : (
              <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-blue-600 transition-all shadow-md">
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>
      <div className="max-w-xl mx-auto mt-12 p-4">
        <div className="bg-white rounded-[2rem] shadow-2xl shadow-blue-900/5 border border-slate-100 overflow-hidden">
          {/* Header Section */}
          <div className="bg-slate-900 p-8 text-white">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <ShieldCheck className="text-blue-400" /> Link Your Business
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Verify your GSTIN to enable automated tracking.
            </p>
          </div>

          <div className="p-8">
            {!shopDetails ? (
              <div className="space-y-6">
                <div className="space-y-6">
                  {/* GSTIN Input Field */}
                  <div className="relative">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      GST Number (GSTIN)
                    </label>
                    <input
                      type="text"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      placeholder="08AAAAA0000A1Z5"
                      className="w-full mt-2 px-5 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-mono font-bold text-lg tracking-wider"
                      maxLength={15}
                    />
                    <div className="absolute right-4 bottom-4">
                      <Search size={20} className="text-slate-300" />
                    </div>
                  </div>

                  {/* New Fields: Filing Frequency & Turnover */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Filing Frequency */}
                    <div className="relative">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                        Filing Frequency
                      </label>
                      <div className="relative">
                        <select
                          value={filingFrequency}
                          onChange={(e) => setFilingFrequency(e.target.value)}
                          className="w-full mt-2 px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-blue-500 outline-none font-bold text-slate-700 appearance-none cursor-pointer pr-10"
                        >
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly (QRMP)</option>
                        </select>
                        <div className="absolute right-3 top-1/2 mt-1 -translate-y-1/2 pointer-events-none">
                          <ChevronDown size={18} className="text-slate-400" />
                        </div>
                      </div>
                    </div>

                    {/* Annual Turnover */}
                    <div className="relative">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                        Annual Turnover
                      </label>
                      <div className="relative">
                        <select
                          value={turnoverRange}
                          onChange={(e) => setTurnoverRange(e.target.value)}
                          className="w-full mt-2 px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-blue-500 outline-none font-bold text-slate-700 appearance-none cursor-pointer pr-10"
                        >
                          <option value="below_5cr">Up to ₹5 Cr</option>
                          <option value="above_5cr">Above ₹5 Cr</option>
                        </select>
                        <div className="absolute right-3 top-1/2 mt-1 -translate-y-1/2 pointer-events-none">
                          <ChevronDown size={18} className="text-slate-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl">
                    {error}
                  </p>
                )}

                <button
                  onClick={handleFetchDetails}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-200 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCcw className="animate-spin" />
                  ) : (
                    "Verify GSTIN"
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400">
                        Trade Name
                      </p>
                      <h3 className="text-lg font-black text-slate-800 leading-tight">
                        {shopDetails.tradeName}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm text-slate-400">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400">
                        Registered Address
                      </p>
                      <p className="text-sm font-bold text-slate-600">
                        {shopDetails.address}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="bg-white p-3 rounded-2xl">
                      <p className="text-[9px] font-black uppercase text-slate-400">
                        GST Status
                      </p>
                      <span className="text-green-600 text-xs font-black flex items-center gap-1">
                        <CheckCircle2 size={12} /> {shopDetails.status}
                      </span>
                    </div>
                    <div className="bg-white p-3 rounded-2xl">
                      <p className="text-[9px] font-black uppercase text-slate-400">
                        State
                      </p>
                      <span className="text-slate-700 text-xs font-black">
                        {shopDetails.state}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShopDetails(null)}
                    className="flex-1 py-4 text-slate-500 font-bold text-sm hover:bg-slate-50 rounded-2xl transition-colors"
                  >
                    Edit GSTIN
                  </button>
                  <button
                    onClick={handleConfirmAndSave}
                    className="flex-[2] bg-slate-900 text-white font-black py-4 rounded-2xl shadow-lg shadow-slate-200 transition-transform active:scale-95"
                  >
                    Yes, This is My Shop
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-center mt-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
          Secure Verification Powered by <br /> Invoice Simplify Compliance
          Engine
        </p>
      </div>
    </div>
  );
};

export default GSTINOnboarding;
