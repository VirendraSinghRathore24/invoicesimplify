import React, { useState } from "react";
import {
  ShieldCheck,
  TrendingDown,
  AlertCircle,
  Search,
  ArrowRight,
  Download,
  History,
  LayoutDashboard,
  CheckCircle2,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../Constant";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const [gstin, setGstin] = useState("");
  const [trustScore, setTrustScore] = useState(85);
  const API = BASE_URL + "/api/sellers";
  const year = "2024-25";
  const navigate = useNavigate();

  const calculateGstDays = (s) => {
    const dof = s.dof;
    const rtntype = s.rtntype;
    const ret_prd = s.ret_prd;
    let cutoffDate = "";
    const month = parseInt(ret_prd.substring(0, 2));
    const year = parseInt(ret_prd.substring(2));

    // 1. Create a date object based on the tax period (ret_prd)
    // Note: JavaScript months are 0-indexed (0 = Jan, 11 = Dec)
    let dateObj = new Date(year, month - 1, 1);

    // 2. Add 1 month to get the filing month
    dateObj.setMonth(dateObj.getMonth() + 1);

    const filingMonth = String(dateObj.getMonth() + 1).padStart(2, "0");
    const filingYear = dateObj.getFullYear();

    // 3. Construct the specific cutoff string
    if (rtntype === "GSTR3B") {
      cutoffDate = `24-${filingMonth}-${filingYear}`;
    } else if (rtntype === "GSTR1") {
      cutoffDate = `13-${filingMonth}-${filingYear}`;
    }

    // Function to convert "DD-MM-YYYY" to a Date Object
    const parseDate = (str) => {
      const [day, month, year] = str.split("-").map(Number);
      return new Date(year, month - 1, day);
    };

    const start = parseDate(cutoffDate);
    const end = parseDate(dof);

    const diffInMs = end - start;
    const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    return days > 0 ? days : 0;
  };

  const calculateTrustIndex = (filingHistory) => {
    if (!filingHistory || filingHistory.length === 0) return 0;

    let totalScore = 0;
    const totalMonths = filingHistory.length / 2; // Assuming G1 and 3B per month

    filingHistory.forEach((record) => {
      let recordScore = 0;
      const isG1 = record.rtntype === "GSTR1";

      // Logic: 100 points for On-Time, 50 for Late, 0 for Pending
      const daysLate = calculateGstDays(record); // Using your existing method

      if (record.status === "Filed") {
        recordScore = daysLate === 0 ? 100 : 50;
      } else {
        recordScore = 0;
      }

      // Apply Weighting
      const weight = isG1 ? 0.7 : 0.3;
      totalScore += recordScore * weight;
    });

    // Average the score across the months tracked
    return Math.round(totalScore / totalMonths);
  };

  const handleAnalyse = async () => {
    if (!gstin || gstin.length !== 15) {
      alert("Enter a valid GSTIN");
      return;
    }
    const res = await axios.get(`${API}/check/${gstin}`, {
      params: { year: year },
    });

    if (res.data === "") {
      alert("No data found for GSTIN " + gstin + " for the year " + year);
      return;
    }

    const data = JSON.parse(res.data).EFiledlist;

    const score = calculateTrustIndex(data);
    setTrustScore(score);
  };

  const handleLogin = () => {
    navigate("/gst/login");
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
            <button
              onClick={() => handleLogin()}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-blue-600 transition-all shadow-md"
            >
              Login to Portal
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-16 pb-20 px-6 bg-gradient-to-b from-white to-[#f8fafc]">
        <div className="max-w-4xl mx-auto text-center">
          <span className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-blue-100">
            Trusted by 500+ Businessmen in India
          </span>
          <h1 className="text-5xl md:text-6xl font-black mt-6 leading-[1.1] text-slate-900">
            Stop Losing Your <span className="text-blue-600">Tax Credits.</span>
          </h1>
          <p className="mt-6 text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Verify supplier filing history in seconds. Our **Trust Dashboard**
            identifies high-risk vendors before you pay their invoices.
          </p>

          {/* Search Box */}
          <div className="mt-10 max-w-2xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative flex bg-white rounded-2xl shadow-xl overflow-hidden p-2 border border-slate-100">
              <div className="flex items-center px-4 text-slate-400">
                <Search size={24} />
              </div>
              <input
                type="text"
                placeholder="Enter Supplier GSTIN (e.g. 08ABCDE...)"
                className="w-full py-4 text-lg focus:outline-none font-medium"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
              />
              <button
                onClick={() => handleAnalyse()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-2"
              >
                Analyze <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- CORE METRICS DASHBOARD --- */}
      <section className="px-6 -mt-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Trust Score Card */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:border-blue-200 transition-all">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                <LayoutDashboard size={28} />
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                HEALTHY
              </span>
            </div>
            <h3 className="mt-6 text-slate-400 font-bold text-xs uppercase tracking-widest">
              Supplier Trust Index
            </h3>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-black text-slate-800">
                {trustScore}
              </span>
              <span className="text-slate-400 font-medium">/ 100</span>
            </div>
            <div className="mt-4 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 w-[84%]"></div>
            </div>
          </div>

          {/* ITC Loss Alert */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:border-red-200 transition-all">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-red-50 rounded-2xl text-red-600">
                <TrendingDown size={28} />
              </div>
              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md">
                ACTION REQUIRED
              </span>
            </div>
            <h3 className="mt-6 text-slate-400 font-bold text-xs uppercase tracking-widest">
              Total ITC At Risk
            </h3>
            <div className="mt-1">
              <span className="text-4xl font-black text-red-600">₹42,850</span>
            </div>
            <p className="mt-4 text-sm text-slate-500 font-medium flex items-center gap-1">
              <AlertCircle size={14} className="text-red-500" /> 8 Suppliers
              haven't filed GSTR-1
            </p>
          </div>

          {/* Quick Reports */}
          <div className="bg-slate-900 p-8 rounded-3xl shadow-xl text-white">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-slate-800 rounded-2xl text-blue-400">
                <History size={28} />
              </div>
            </div>
            <h3 className="mt-6 text-slate-400 font-bold text-xs uppercase tracking-widest">
              Compliance Summary
            </h3>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="opacity-70">GSTR-2B Mismatches</span>
                <span className="font-bold text-yellow-400">12 Found</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="opacity-70">Late Fees (Est)</span>
                <span className="font-bold">₹1,200</span>
              </div>
            </div>
            <button className="w-full mt-6 bg-blue-600 py-3 rounded-xl font-bold hover:bg-blue-500 transition-all flex justify-center items-center gap-2">
              <Download size={18} /> Download Report
            </button>
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="max-w-7xl mx-auto py-24 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <CheckCircle2 className="text-blue-600 mb-4" />
            <h4 className="font-bold text-lg">Auto-Sync</h4>
            <p className="text-sm text-slate-500 mt-2">
              One-click OTP sync with the GST Portal to fetch latest 2B data.
            </p>
          </div>
          <div>
            <CheckCircle2 className="text-blue-600 mb-4" />
            <h4 className="font-bold text-lg">Vendor Scores</h4>
            <p className="text-sm text-slate-500 mt-2">
              Rank suppliers based on filing punctuality over 12 months.
            </p>
          </div>
          <div>
            <CheckCircle2 className="text-blue-600 mb-4" />
            <h4 className="font-bold text-lg">Loss Prevention</h4>
            <p className="text-sm text-slate-500 mt-2">
              Identify invoices that are missing from GSTR-2B automatically.
            </p>
          </div>
          <div>
            <CheckCircle2 className="text-blue-600 mb-4" />
            <h4 className="font-bold text-lg">Tally Integration</h4>
            <p className="text-sm text-slate-500 mt-2">
              Import your purchase register and reconcile in minutes.
            </p>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-200 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-400 text-sm">
            © 2026 Invoice Simplify. Built for the Indian Taxpayer.
          </p>
          <div className="flex gap-8 text-slate-400 text-sm font-medium">
            <a href="#" className="hover:text-blue-600">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-blue-600">
              Terms of Service
            </a>
            <a href="#" className="hover:text-blue-600">
              Contact Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
