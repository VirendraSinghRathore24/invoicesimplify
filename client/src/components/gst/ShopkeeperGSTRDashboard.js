import React, { use, useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../Constant";
import {
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  Search,
  ExternalLink,
  MoreVertical,
} from "lucide-react";
import GSTReturnModal from "./GSTReturnModal";
import Loader from "../Loader";
import { NavLink, useNavigate } from "react-router-dom";
import Header from "./Header";

const API = BASE_URL + "/api/sellers";

const ShopkeeperGSTRDashboard = () => {
  const [sellers, setSellers] = useState([]);
  const [seller, setSeller] = useState({});
  const [name, setName] = useState("");
  const [gstin, setGstin] = useState(localStorage.getItem("verified_gstin"));
  const [year, setYear] = useState("2025-26");
  const [selectedYear, setSelectedYear] = useState("");
  const yearOptions = ["2023-24", "2024-25", "2025-26", "2026-27"];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalLateDays, setTotalLateDays] = useState(0);
  const [isUserExists, setIsUserExists] = useState(
    localStorage.getItem("gstUser") ? true : false
  );
  const gstr1DueDate = localStorage.getItem("gstr1DueDate"); // Default to 13 if not set
  const gstr3bDueDate = localStorage.getItem("gstr3bDueDate"); // Default to 24 if not set
  const navigate = useNavigate();
  const processGstData = (data) => {
    // Helper to convert "DD-MM-YYYY" string to a Date object for comparison
    const parseDof = (dStr) => {
      const [day, month, year] = dStr.split("-");
      return new Date(`${year}-${month}-${day}`);
    };

    // 1. Group by ret_prd
    const groups = data.reduce((acc, item) => {
      const period = item.ret_prd;
      if (!acc[period]) acc[period] = [];
      acc[period].push(item);
      return acc;
    }, {});

    // 2. Map groups to an array and sort
    return Object.keys(groups)
      .map((period) => {
        // Sort items inside the group by DOF (latest date first)
        const sortedItems = groups[period].sort(
          (a, b) => parseDof(b.dof) - parseDof(a.dof)
        );

        return {
          ret_prd: period,
          data: sortedItems,
        };
      })
      .sort((a, b) => {
        // Sort the groups themselves by period (latest period first)
        // Logic: Convert "MMYYYY" to "YYYYMM" for numerical comparison
        const formatPeriod = (p) => p.substring(2) + p.substring(0, 2);
        return formatPeriod(b.ret_prd) - formatPeriod(a.ret_prd);
      });
  };

  const sortGstDataByPeriod = (dataString) => {
    const data = JSON.parse(dataString);

    data.EFiledlist.sort((a, b) => {
      const formatForSort = (prd) => {
        const month = prd.substring(0, 2);
        const year = prd.substring(2);
        return parseInt(year + month);
      };

      const periodA = formatForSort(a.ret_prd);
      const periodB = formatForSort(b.ret_prd);

      // 1. Primary Sort: By Period (Latest first)
      if (periodB !== periodA) {
        return periodB - periodA;
      }

      // 2. Secondary Sort: If periods are same, GSTR3B comes first
      // We give 3B a lower weight so it sorts to the top
      const typeOrder = { GSTR3B: 1, GSTR1: 2 };
      const weightA = typeOrder[a.rtntype] || 99;
      const weightB = typeOrder[b.rtntype] || 99;

      return weightA - weightB;
    });

    return data;
  };
  const checkStatus = async (id) => {
    try {
      setLoading(true);

      const res = await axios.get(`${API}/check/${id}`, {
        params: { year: year },
      });

      if (res.data === "") {
        alert("No data found for GSTIN " + id + " for the year " + year);
        return;
      }

      const result = sortGstDataByPeriod(res.data.eFilingList);

      setSellers(result.EFiledlist);

      setSelectedYear(year);
    } catch (er) {
      console.error("Error fetching status for GSTIN", id, ":", er);
    } finally {
      setLoading(false);
    }
  };
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

  const formatGSTPeriod = (mmyyyy) => {
    if (!mmyyyy || mmyyyy.length !== 6) return "";

    const mm = mmyyyy.substring(0, 2);
    const yyyy = mmyyyy.substring(2);

    const monthObj = months.find((m) => m.value === mm);
    const monthLabel = monthObj ? monthObj.label : "Unknown";

    return `${monthLabel}`;
  };

  let totalLateDaysCount = 0;
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
      cutoffDate = `${gstr3bDueDate}-${filingMonth}-${filingYear}`;
    } else if (rtntype === "GSTR1") {
      cutoffDate = `${gstr1DueDate}-${filingMonth}-${filingYear}`;
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

    if (days > 0) {
      totalLateDaysCount += days;
    }

    //console.log("Days late for this filing:", totalLateDaysCount);

    // Return 0 if filed before or on cutoff, otherwise return days late
    return days > 0 ? days : 0;
  };

  useEffect(() => {
    setTotalLateDays(totalLateDaysCount / 2);
  }, [sellers]);

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
      <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Dashboard - {gstin}
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                {localStorage.getItem("tradeName")}
              </p>
            </div>
          </div>

          {/* Stats Summary (Optional but adds 'Stunning' factor) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              label="Total Filings"
              value={sellers.length}
              color="blue"
            />
            <StatCard
              label="Filed Returns"
              value={sellers.filter((s) => s.status === "Filed").length}
              color="green"
            />
            <StatCard
              label="Late Filings (Total Days)"
              value={totalLateDays}
              color="red"
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-blue-600 font-medium mb-2">
              Showing results for: {selectedYear}
            </p>
            <div className="flex gap-x-2 items-center mb-4">
              <div className=" text-right">
                <label className="mr-2 font-medium">Select Year:</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="border p-1 rounded"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => checkStatus(gstin)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
              >
                Get Status
              </button>
            </div>
          </div>
          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Return Period
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Return Type
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Filing Date
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Late Filing
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sellers &&
                    sellers.map((s, index) => {
                      // Check if this row belongs to the same period as the previous one
                      const isSamePeriodAsPrevious =
                        index > 0 && s.ret_prd === sellers[index - 1].ret_prd;

                      // Determine background color logic:
                      // This applies a light blue tint if it's a "paired" row (same period)
                      // and keeps the base white for the first entry of that period.
                      const rowBgColor = isSamePeriodAsPrevious
                        ? "bg-blue-50/20"
                        : "bg-white";

                      return (
                        <tr
                          key={index}
                          className={`${rowBgColor} hover:bg-blue-50/50 transition-colors group py-2 cursor-pointer`}
                        >
                          <td className="text-center py-2">
                            <span className="font-mono text-sm text-slate-600">
                              {formatGSTPeriod(s.ret_prd)}
                            </span>
                          </td>
                          <td className="text-center py-2">
                            <span className="font-mono text-sm text-slate-600">
                              {s.rtntype}
                            </span>
                          </td>
                          <td className="text-center py-2">
                            <span className="font-mono text-sm text-slate-600">
                              {s.dof}
                            </span>
                          </td>
                          <td className="text-center py-2">
                            {calculateGstDays(s) > 0 ? (
                              <span className="font-mono text-sm text-red-600 font-bold">
                                {`${calculateGstDays(s)} Days Late`}
                              </span>
                            ) : (
                              <span className="font-mono text-sm text-green-600 font-bold">
                                On Time
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {loading && <Loader />}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color }) => {
  const colors = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    green: "text-emerald-600 bg-emerald-50 border-emerald-100",
    red: "text-rose-600 bg-rose-50 border-rose-100",
  };
  return (
    <div className={`p-5 rounded-2xl border shadow-sm ${colors[color]}`}>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
    </div>
  );
};

const renderStatusBadge = (seller) => {
  // 1. Determine the status string
  // Checks newData first, then falls back to the original status
  const status = seller.newData?.[0]?.status || seller.status;

  // 2. Normalize to uppercase for consistent checking
  const normalizedStatus = status?.toUpperCase();

  if (normalizedStatus === "FILED") {
    return (
      <span className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm">
        <ShieldCheck size={14} /> FILED
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200 shadow-sm">
      <ShieldAlert size={14} /> PENDING
    </span>
  );
};
export default ShopkeeperGSTRDashboard;
