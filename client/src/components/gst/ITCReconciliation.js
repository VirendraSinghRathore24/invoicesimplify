import React, { useEffect, useMemo, useState } from "react";
import { BASE_URL } from "../Constant";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Download,
  History,
  LayoutDashboard,
  ShieldCheck,
  TrendingDown,
} from "lucide-react";
import Header from "./Header";
import { collection, doc, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";

const ITCReconciliation = () => {
  const [reconData, setReconData] = useState([]);
  const [loss, setLoss] = useState(0);
  const [reportData, setReportData] = useState({ report: [], totalLoss: 0 });
  const [gstr2bData, setGstr2bData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isUserExists, setIsUserExists] = useState(
    localStorage.getItem("gstUser") ? true : false
  );

  const gstin = localStorage.getItem("verified_gstin");
  const navigate = useNavigate();

  // Dropdown selection states
  const [selectedMonth, setSelectedMonth] = useState("11");
  const [selectedYear, setSelectedYear] = useState("2024");

  // Display states (updates only after successful sync)
  const [displayMonth, setDisplayMonth] = useState("11");
  const [displayYear, setDisplayYear] = useState("2024");

  const [purchaseRegister, setPurchaseRegister] = useState([]);

  const months = [
    { label: "January", value: "01" },
    { label: "February", value: "02" },
    { label: "March", value: "03" },
    { label: "April", value: "04" },
    { label: "May", value: "05" },
    { label: "June", value: "06" },
    { label: "July", value: "07" },
    { label: "August", value: "08" },
    { label: "September", value: "09" },
    { label: "October", value: "10" },
    { label: "November", value: "11" },
    { label: "December", value: "12" },
  ];

  const years = ["2019", "2024", "2025", "2026"];

  const getAllPurchase = async () => {
    const purchase_CollectionRef = collection(
      doc(db, "GST", gstin),
      "Purchase"
    );
    const data = await getDocs(purchase_CollectionRef);

    const purchaseInfo = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    const targetMonthYear = selectedMonth + selectedYear;
    // Filter the array based on the passed monthYear
    return purchaseInfo.filter((item) => item.monthYear === targetMonthYear);
  };

  const handleReconcile = (purchaseRegister, gstr2bData) => {
    // 1. Aggregate BOOKS data by GSTIN
    const booksSummary = new Map();
    purchaseRegister.forEach((inv) => {
      const existing = booksSummary.get(inv.vendorGstin) || {
        totalTax: 0,
        count: 0,
      };
      booksSummary.set(inv.vendorGstin, {
        totalTax: existing.totalTax + inv.totalTax,
        count: existing.count + 1,
        vendorGstin: inv.vendorGstin,
      });
    });

    // 2. Aggregate PORTAL data by GSTIN
    const portalSummary = new Map();
    gstr2bData.data.b2b.forEach((vendor) => {
      const portalTax =
        (vendor.cgst || 0) + (vendor.sgst || 0) + (vendor.igst || 0);
      portalSummary.set(vendor.ctin, {
        portalTax: portalTax,
        vendorName: vendor.trdnm,
        ctin: vendor.ctin,
      });
    });

    const finalReport = [];
    let totalPotentialLoss = 0;

    // --- STEP 1: Check Books vs Portal ---
    booksSummary.forEach((bookData, gstin) => {
      const portalData = portalSummary.get(gstin);
      let status = "MATCHED";
      let creditGap = 0;
      let pTax = 0;

      if (!portalData) {
        status = "MISSING_IN_PORTAL";
        creditGap = bookData.totalTax;
      } else {
        pTax = portalData.portalTax;
        const diff = bookData.totalTax - pTax;

        if (Math.abs(diff) > 1) {
          // 1 Rupee tolerance
          status = "VALUE_MISMATCH";
          creditGap = diff > 0 ? diff : 0;
        }
      }

      if (creditGap > 0) totalPotentialLoss += parseFloat(creditGap);

      finalReport.push({
        vendorGstin: gstin,
        vendorName: portalData?.vendorName || "Unknown Vendor",
        booksTax: bookData.totalTax,
        portalTax: pTax,
        status: status,
        creditGap: creditGap,
      });
    });

    // --- STEP 2: Find Records ONLY in Portal ---
    portalSummary.forEach((portalData, gstin) => {
      if (!booksSummary.has(gstin)) {
        finalReport.push({
          vendorGstin: gstin,
          vendorName: portalData.vendorName,
          booksTax: 0,
          portalTax: portalData.portalTax,
          status: "MISSING_IN_BOOKS",
          creditGap: 0,
        });
      }
    });

    return { finalReport, totalPotentialLoss };
  };

  // 1. Reconciliation Logic
  const reconSummary = useMemo(() => {
    // 1. Safety Check: Return early if portal data or selection is missing
    if (!gstr2bData || !gstr2bData.data || !gstr2bData.data.b2b) {
      return { report: [], totalLoss: 0 };
    }

    // 2. Filter Purchase Register to match the selected Month/Year
    // Assuming your purchaseRegister objects have a 'date' or 'period' field
    const filteredPurchases = purchaseRegister.filter((invoice) => {
      // Logic: Match MMYYYY format (e.g., "112024")
      return invoice.period === `${selectedMonth}${selectedYear}`;
    });

    const portalDataMap = new Map(
      gstr2bData.data.b2b.map((item) => [item.ctin, item])
    );

    let totalLoss = 0;

    // 3. Map over the FILTERED list, not the entire register
    const report = filteredPurchases.map((invoice) => {
      const portalInvoice = portalDataMap.get(invoice.supplierGstin);
      let status = "MATCHED";
      let diff = 0;

      if (!portalInvoice) {
        status = "MISSING_IN_PORTAL";
        diff = invoice.taxAmount;
      } else {
        const portalTax =
          (portalInvoice.cgst || 0) +
          (portalInvoice.sgst || 0) +
          (portalInvoice.igst || 0);

        // Epsilon check for floating point precision
        if (Math.abs(portalTax - invoice.taxAmount) > 0.01) {
          status = "VALUE_MISMATCH";
          diff = invoice.taxAmount - portalTax;
        }
      }

      // Only add to loss if the difference is positive (we paid more than portal shows)
      totalLoss += diff > 0 ? diff : 0;

      return { ...invoice, portalMatch: portalInvoice, status, diff };
    });

    return { report, totalLoss };
  }, [gstr2bData, selectedMonth, selectedYear]); // Added dependencies

  // 2. Sync Function
  const fetchGSTR2B = async () => {
    setLoading(true);
    setError(null);
    const fp = `${selectedMonth}${selectedYear}`;

    try {
      const response = await axios.get(`${BASE_URL}/api/gst/gstr2b`, {
        params: { gstin, fp },
      });

      const data = response.data.gstr2bData[0];

      if (data) {
        setGstr2bData(data);
        setDisplayMonth(selectedMonth);
        setDisplayYear(selectedYear);
      } else {
        setError("No data found for the selected period.");
        setGstr2bData(null);
      }
      return data;
    } catch (err) {
      setError("Failed to sync with GST Portal.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const RunReconcialion = async () => {
    // 1. get all purchase entries
    const purchases = await getAllPurchase();
    setPurchaseRegister(purchases);
    const gstr2bData = await fetchGSTR2B();
    const { finalReport, totalPotentialLoss } = handleReconcile(
      purchases,
      gstr2bData
    );
    setReportData(finalReport);
    setLoss(totalPotentialLoss);
    // 2. get gstr2b data

    // 3. fill recon data
  };
  // Initial fetch
  useEffect(() => {
    fetchGSTR2B();
  }, []);

  useEffect(() => {
    const loggedInUser = localStorage.getItem("gstUser");
    if (!loggedInUser) {
      setIsUserExists(false);
      navigate("/gst/login");
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      {/* --- TOP BANNER (Sticky) --- */}
      <Header />
      <section className="mt-10">
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
              <span className="text-4xl font-black text-slate-800">84.5</span>
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
              <span className="text-4xl font-black text-red-600">
                ₹{parseFloat(loss).toFixed(2)}
              </span>
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
      <div className="p-6 bg-gray-50 min-h-screen">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            ITC Loss Dashboard
          </h1>
          <p className="text-red-600 font-semibold text-lg">
            Total Potential ITC Loss: ₹{loss}
          </p>

          <div className="flex justify-between items-center mt-4">
            <div className="flex gap-2 bg-white p-2 rounded-lg shadow-sm border">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent outline-none text-sm font-medium text-gray-600"
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <div className="border-l h-6 self-center"></div>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-transparent outline-none text-sm font-medium text-gray-600"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => RunReconcialion()}
              disabled={loading}
              className={`px-6 py-2 font-bold text-white rounded shadow transition ${
                loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Syncing..." : "Run Reconciliation"}
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <p className="text-blue-600 font-medium mb-2">
          Showing results for:{" "}
          {months.find((m) => m.value === displayMonth)?.label} {displayYear}
        </p>

        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-4">Supplier GSTIN</th>
                <th className="p-4">Books Tax</th>
                <th className="p-4">Portal Tax</th>
                <th className="p-4">Status</th>
                <th className="p-4">Credit Gap</th>
              </tr>
            </thead>
            <tbody>
              {reportData.length > 0 ? (
                reportData.map((item, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-mono text-sm">
                      {item.vendorGstin}
                    </td>
                    <td className="p-4">₹{item.booksTax.toFixed(2)}</td>
                    <td className="p-4">
                      ₹{item.portalTax ? item.portalTax.toFixed(2) : "0.00"}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          item.status === "MATCHED"
                            ? "bg-green-100 text-green-700"
                            : item.status === "MISSING_IN_PORTAL"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {item.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td
                      className={`p-4 font-bold ${
                        item.creditGap > 0 ? "text-red-600" : "text-gray-400"
                      }`}
                    >
                      ₹{parseFloat(item.creditGap).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-gray-500">
                    No reconciliation data found. Sync to fetch.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ITCReconciliation;
