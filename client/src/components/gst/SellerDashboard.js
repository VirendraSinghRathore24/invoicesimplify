import React, { useEffect, useState } from "react";
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

const Dashboard = () => {
  const data = [
    {
      sellerName: "Rathore Traders",
      gstin: "27AABCA2020Q2ZR",
      status: "Not Checked",
      returnType: "NA",
      dof: "",
      gstinstatus: "",
      frequency: "",
      ret_prd: "",
    },
    {
      sellerName: "RATHORE GENERAL STORE",
      gstin: "08AFLPR4165H1Z1",
      status: "Not Checked",
      returnType: "NA",
      dof: "",
      gstinstatus: "",
      frequency: "",
      ret_prd: "",
    },
    {
      sellerName: "Gupta Electronics",
      gstin: "07LMNOP4321K1Z9",
      status: "Not Checked",
      returnType: "NA",
      dof: "",
      gstinstatus: "",
      frequency: "",
      ret_prd: "",
    },
    {
      sellerName: "Verma Textiles",
      gstin: "24WXYZA9876H1Z3",
      status: "Not Checked",
      returnType: "NA",
      dof: "",
      gstinstatus: "",
      frequency: "",
      ret_prd: "",
    },
    {
      sellerName: "Kumar Hardware",
      gstin: "33BCDEA2468J1Z7",
      status: "Not Checked",
      returnType: "NA",
      dof: "",
      gstinstatus: "",
      frequency: "",
      ret_prd: "",
    },
    {
      sellerName: "Singh Wholesale Mart",
      gstin: "09FGHIJ1357M1Z4",
      status: "Not Checked",
      returnType: "NA",
      dof: "",
      gstinstatus: "",
      frequency: "",
      ret_prd: "",
    },
    {
      sellerName: "Agarwal Foods",
      gstin: "19KLMNO9753N1Z6",
      status: "Not Checked",
      returnType: "NA",
      dof: "",
      gstinstatus: "",
      frequency: "",
      ret_prd: "",
    },
  ];
  const [sellers, setSellers] = useState(data);
  const [seller, setSeller] = useState({});
  const [name, setName] = useState("");
  const [gstin, setGstin] = useState(localStorage.getItem("verified_gstin"));
  const [year, setYear] = useState("2025-26");
  const [selectedYear, setSelectedYear] = useState("");
  const yearOptions = ["2023-24", "2024-25", "2025-26", "2026-27"];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isUserExists, setIsUserExists] = useState(
    localStorage.getItem("gstUser") ? true : false
  );
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

      const data = JSON.parse(res.data.eFilingList).EFiledlist;
      const searchResult = JSON.parse(res.data.searchResult);
      console.log("GST Status API Response for GSTIN", id, ":", searchResult);

      setName(searchResult.tradeNam || searchResult.lgnm);

      const result = processGstData(data);

      // Sort by date (using the DD/MM/YYYY logic we discussed)
      const sortedData = data
        .sort((a, b) => {
          const parse = (d) => new Date(d.split("-").reverse().join("-"));
          return parse(b.dof) - parse(a.dof); // Sort by Newest Date
        })
        .map((item, index, self) => {
          // Logic: Check if there's another entry with the same Date of Filing (dof)
          const isDateMatch = self.some(
            (other, idx) => idx !== index && other.dof === item.dof
          );

          // Logic: Check if the current item is GSTR3B
          const is3B = item.rtntype === "GSTR3B";

          return {
            ...item,
            displayHighlight: isDateMatch && is3B, // True if date matches and it's 3B
            complianceNote: isDateMatch && is3B ? "Bundled Filing" : "",
          };
        });

      setSellers((prevSellers) =>
        prevSellers.map((seller) =>
          seller.gstin === id
            ? {
                ...seller,
                newData: result,
                name: searchResult.tradeNam || searchResult.lgnm,

                // status: sortedData[0].status,
                // returnType: sortedData[0].rtntype,
                // dof: sortedData[0].dof,
                // ret_prd: sortedData[0].ret_prd,
              }
            : seller
        )
      );

      setSelectedYear(year);
    } catch (er) {
      if (er.response.data.error.message === "Invalid GSTIN pattern") {
        alert(
          "The GSTIN " +
            id +
            " is invalid. Please check the format and try again."
        );
      }
      console.error(
        "Error fetching status for GSTIN",
        id,
        ":",
        er.response.data.error.message
      );
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
  const calculateITCLoss = () => {
    // call API => get gstr2b  (your gstn)
    // get all gstr3b for (others gstn)
  };
  const viewHistory = (s) => {
    setSeller(s.newData);
    setGstin(s.gstin);
    //localStorage.setItem("historyData", JSON.stringify(s.newData));
    //console.log("History Data Set for Modal:", s.newData);
    setIsModalOpen(true);
  };

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
                GST Trust Dashboard - {gstin}
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                {localStorage.getItem("tradeName")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search GSTIN or Name..."
                  className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all w-full md:w-64"
                />
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
                Add New Seller
              </button>
            </div>
          </div>

          {/* Stats Summary (Optional but adds 'Stunning' factor) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              label="Total Sellers"
              value={sellers.length}
              color="blue"
            />
            <StatCard
              label="Filed Returns"
              value={sellers.filter((s) => s.status === "Filed").length}
              color="green"
            />
            <StatCard
              label="Pending Returns"
              value={sellers.filter((s) => s.status !== "Filed").length}
              color="red"
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-blue-600 font-medium mb-2">
              Showing results for: {selectedYear}
            </p>
            <div className="mb-4 text-right">
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
          </div>
          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    {/* Added text-center here */}
                    {/* <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    S.No.
                  </th> */}
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Seller Details
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      GSTIN
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Filing Date
                    </th>
                    {/* <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    GSTIN Status
                  </th> */}
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Return Type
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Return Period
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      History
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sellers.map((s, index) => (
                    <tr
                      key={s._id}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      {/* <td className="px-6 py-4 text-center">
                      <div className="font-semibold text-slate-800">
                        {index + 1}.
                      </div>
                    </td> */}
                      {/* 1. Center Name/Vendor ID */}
                      <td className="px-6 py-4 text-center">
                        <div className="font-semibold text-slate-800">
                          {s.name}
                        </div>
                      </td>

                      {/* 2. Center GSTIN */}
                      <td className="px-6 py-4 text-center">
                        <span className="font-mono text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded inline-block">
                          {s.gstin}
                        </span>
                      </td>

                      {/* 3. Center Status Badge */}
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          {renderStatusBadge(s)}
                        </div>
                      </td>
                      <td className=" text-center">
                        <span className="font-mono text-sm text-slate-600 ">
                          {s.newData ? s.newData[0].data[0].dof : s.dof}
                        </span>
                      </td>
                      {/* <td className="px-6 py-4 text-center">
                      <span className="font-mono text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded inline-block">
                        {s.gstinstatus}
                      </span>
                    </td> */}
                      <td className=" text-center">
                        <span className="font-mono text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded inline-block">
                          {s.newData ? s.newData[0].data[0].rtntype : s.rtntype}
                        </span>
                      </td>
                      <td className=" text-center">
                        <span className="font-mono text-sm text-slate-600 ">
                          {s.newData
                            ? formatGSTPeriod(s.newData[0].ret_prd)
                            : formatGSTPeriod(s.ret_prd)}
                        </span>
                      </td>
                      <td className=" text-center">
                        <span className="font-mono text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded inline-block">
                          {s.newData ? s.newData[0].data[0].rtntype : s.rtntype}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        {s.newData ? (
                          <span
                            onClick={() => viewHistory(s)}
                            className="font-mono text-sm  cursor-pointer px-2 py-1 rounded underline text-blue-500"
                          >
                            View
                          </span>
                        ) : (
                          <span className="font-mono text-sm  px-2 py-1 rounded  text-gray-500">
                            View
                          </span>
                        )}
                      </td>

                      {/* 4. Center Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {" "}
                          {/* Changed justify-end to justify-center */}
                          <button
                            onClick={() => checkStatus(s.gstin)}
                            className="..."
                          >
                            <RefreshCw size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Showing {sellers.length} entries
              </p>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-xs font-medium border border-slate-200 rounded bg-white hover:bg-slate-50 disabled:opacity-50">
                  Previous
                </button>
                <button className="px-3 py-1 text-xs font-medium border border-slate-200 rounded bg-white hover:bg-slate-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
        {isModalOpen && (
          <GSTReturnModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            data={seller}
            gstin={gstin}
            fy={year}
          />
        )}
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
  const status = seller.newData?.[0]?.data[0]?.status || seller.status;

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
export default Dashboard;
