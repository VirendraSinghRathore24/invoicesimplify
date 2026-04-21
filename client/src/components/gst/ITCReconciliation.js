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
  TrendingUp,
} from "lucide-react";
import Header from "./Header";
import { collection, doc, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";
import Loader from "../Loader";

const ITCReconciliation = () => {
  const [reconData, setReconData] = useState([]);
  const [loss, setLoss] = useState(0);
  const [totalBooksTax, setTotalBooksTax] = useState(0);
  const [totalPortalTax, setTotalPortalTax] = useState(0);
  const [reportData, setReportData] = useState({ report: [], totalLoss: 0 });
  const [gstr2bData, setGstr2bData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isUserExists, setIsUserExists] = useState(
    localStorage.getItem("gstUser") ? true : false
  );

  const gstin = localStorage.getItem("verified_gstin");
  const filingFrequency = localStorage.getItem("gstfilingfreq");
  const navigate = useNavigate();

  // Dropdown selection states
  const [selectedMonth, setSelectedMonth] = useState("03");
  const [selectedYear, setSelectedYear] = useState("2024");

  // Display states (updates only after successful sync)
  const [displayMonth, setDisplayMonth] = useState("03");
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

  const monthsForQuarterly = [
    { label: "March", value: "03" },
    { label: "June", value: "06" },
    { label: "September", value: "09" },
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

    if (filingFrequency === "monthly") {
      const targetMonthYear = selectedMonth + selectedYear;
      return purchaseInfo.filter((item) => item.monthYear === targetMonthYear);
    }
    return getThreeMonthData(purchaseInfo, selectedMonth, selectedYear);
    // Filter the array based on the passed monthYear
  };

  const getThreeMonthData = (purchaseInfo, selectedMonth, selectedYear) => {
    // 1. Convert inputs to numbers
    let month = parseInt(selectedMonth);
    let year = parseInt(selectedYear);

    const targetPeriods = [];

    // 2. Generate target month and the 2 preceding months
    for (let i = 0; i < 3; i++) {
      // Format month to 2 digits (e.g., 4 -> "04")
      const mm = month.toString().padStart(2, "0");
      targetPeriods.push(`${mm}${year}`);

      // Move to the previous month
      month--;
      if (month === 0) {
        month = 12;
        year--;
      }
    }

    // targetPeriods now looks like ["042026", "032026", "022026"]

    // 3. Filter the array
    const result = purchaseInfo.filter((item) =>
      targetPeriods.includes(item.monthYear)
    );
    return result;
  };
  const handleReconcile = (purchaseRegister, gstr2bData) => {
    const booksSummary = new Map();
    let totalBooksTaxCalculated = 0;

    // 1. Group Books by GSTIN (The Source of Truth for your expenses)
    purchaseRegister.forEach((inv) => {
      const existing = booksSummary.get(inv.vendorGstin) || {
        totalTax: 0,
        count: 0,
      };
      booksSummary.set(inv.vendorGstin, {
        totalTax: existing.totalTax + (inv.totalTax || 0),
        count: existing.count + 1,
      });
      totalBooksTaxCalculated += inv.totalTax || 0;
    });
    setTotalBooksTax(totalBooksTaxCalculated);

    // 2. Group Portal by GSTIN
    const portalSummary = new Map();
    let totalPortalTaxCalculated = 0;

    if (gstr2bData?.b2b) {
      gstr2bData.b2b.forEach((vendor) => {
        const vendorTax = vendor.inv.reduce(
          (sum, inv) =>
            sum + (inv.cgst || 0) + (inv.sgst || 0) + (inv.igst || 0),
          0
        );
        portalSummary.set(vendor.ctin, {
          portalTax: vendorTax,
          vendorName: vendor.trdnm,
        });
        totalPortalTaxCalculated += vendorTax;
      });
    }
    setTotalPortalTax(totalPortalTaxCalculated);

    const finalReport = [];
    let totalPotentialLoss = 0;

    // --- STEP 1: Loop through ALL Books (This finds MATCHED and MISSING_IN_PORTAL) ---
    booksSummary.forEach((bookData, gstin) => {
      const portalMatch = portalSummary.get(gstin);
      let status = "";
      let creditGap = 0;
      let pTax = portalMatch ? portalMatch.portalTax : 0;

      if (!portalMatch) {
        // MANDATORY: If it's in books but NOT in portal, it shows up here
        status = "MISSING_IN_PORTAL";
        creditGap = bookData.totalTax;
      } else {
        const diff = bookData.totalTax - pTax;
        if (Math.abs(diff) > 1) {
          status = "VALUE_MISMATCH";
          creditGap = diff > 0 ? diff : 0;
        } else {
          status = "MATCHED";
          creditGap = 0;
        }
      }

      totalPotentialLoss += creditGap;

      finalReport.push({
        vendorGstin: gstin,
        vendorName: portalMatch?.vendorName || "Not Found in Portal",
        booksTax: bookData.totalTax,
        portalTax: pTax,
        status: status,
        creditGap: creditGap,
      });
    });

    // --- STEP 2: Loop through Portal (To find MISSING_IN_BOOKS) ---
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

    // 3. Final State Update
    setReportData(finalReport); // This updates your table rows
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

      console.log(
        "GSTR-2B Response:",
        response.data.data.data.data.docdata.b2b
      );
      //const data = response.data.gstr2bData[0];
      const data = response.data.data.data.data.docdata;

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
    setLoading(true);
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
    setLoading(false);
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
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:border-red-200 transition-all">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-red-50 rounded-2xl text-red-600">
                <TrendingUp size={28} color="green" />
              </div>
            </div>
            <h3 className="mt-6 text-slate-400 font-bold text-xs uppercase tracking-widest">
              Total Books Tax
            </h3>
            <div className="mt-1">
              <span className="text-4xl font-black text-green-600">
                ₹{parseFloat(totalBooksTax).toFixed(2)}
              </span>
            </div>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:border-red-200 transition-all">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-red-50 rounded-2xl text-red-600">
                <TrendingUp size={28} color="blue" />
              </div>
            </div>
            <h3 className="mt-6 text-slate-400 font-bold text-xs uppercase tracking-widest">
              Total Portal Tax
            </h3>
            <div className="mt-1">
              <span className="text-4xl font-black text-blue-600">
                ₹{parseFloat(totalPortalTax).toFixed(2)}
              </span>
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
            {/* <p className="mt-4 text-sm text-slate-500 font-medium flex items-center gap-1">
              <AlertCircle size={14} className="text-red-500" /> 8 Suppliers
              haven't filed GSTR-1
            </p> */}
          </div>

          {/* Quick Reports */}
          {/* <div className="bg-slate-900 p-8 rounded-3xl shadow-xl text-white">
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
          </div> */}
        </div>
      </section>

      <div className="p-6 bg-gray-50 min-h-screen w-10/12 mx-auto mt-10 rounded-lg">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            ITC Loss Dashboard
          </h1>
          <p className="text-red-600 font-semibold text-lg">
            Total Potential ITC Loss: ₹{loss.toFixed(2)}
          </p>
          <div className="mt-4">Select Filing Month & Year:</div>
          <div className="flex justify-between items-center mt-1">
            {filingFrequency === "monthly" ? (
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
            ) : (
              <div className="flex gap-2 bg-white p-2 rounded-lg shadow-sm border">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent outline-none text-sm font-medium text-gray-600"
                >
                  {monthsForQuarterly.map((m) => (
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
            )}

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

        <div className="flex justify-between items-center mb-1">
          <p className="text-blue-600 font-medium mb-2">
            Showing results for:{" "}
            {months.find((m) => m.value === displayMonth)?.label} {displayYear}
          </p>
          <p className="text-blue-600 font-medium mb-2">
            Total Records found: {reportData.length}
          </p>
        </div>

        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b text-center">
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
                  <tr
                    key={idx}
                    className="border-b hover:bg-gray-50  text-center"
                  >
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
      {loading && <Loader />}
    </div>
  );
};

export default ITCReconciliation;
