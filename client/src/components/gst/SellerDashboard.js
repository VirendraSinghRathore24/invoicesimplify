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

const API = BASE_URL + "/api/sellers";

const Dashboard = () => {
  const data = [
    {
      sellerName: "Rathore Traders",
      gstin: "29ABCDE1234F1Z5",
      status: "Not Checked",
      returnType: "NA",
    },
    {
      sellerName: "Sharma Enterprises",
      gstin: "27PQRSX5678L1Z2",
      status: "Not Checked",
      returnType: "NA",
    },
    {
      sellerName: "Gupta Electronics",
      gstin: "07LMNOP4321K1Z9",
      status: "Not Checked",
      returnType: "NA",
    },
    {
      sellerName: "Verma Textiles",
      gstin: "24WXYZA9876H1Z3",
      status: "Not Checked",
      returnType: "NA",
    },
    {
      sellerName: "Kumar Hardware",
      gstin: "33BCDEA2468J1Z7",
      status: "Not Checked",
      returnType: "NA",
    },
    {
      sellerName: "Singh Wholesale Mart",
      gstin: "09FGHIJ1357M1Z4",
      status: "Not Checked",
      returnType: "NA",
    },
    {
      sellerName: "Agarwal Foods",
      gstin: "19KLMNO9753N1Z6",
      status: "Not Checked",
      returnType: "NA",
    },
    {
      sellerName: "Mehta Stationers",
      gstin: "30PQRST8642P1Z1",
      status: "Not Checked",
      returnType: "NA",
    },
    {
      sellerName: "Patel Agro Supplies",
      gstin: "23UVWXY7531Q1Z8",
      status: "Not Checked",
      returnType: "NA",
    },
    {
      sellerName: "Joshi Pharma Distributors",
      gstin: "06ZABCD6420R1Z0",
      status: "Not Checked",
      returnType: "NA",
    },
  ];
  const [sellers, setSellers] = useState(data);
  const [name, setName] = useState("");
  const [gstin, setGstin] = useState("");
  const [year, setYear] = useState("2025-26");
  const yearOptions = ["2023-24", "2024-25", "2025-26"];

  const checkStatus = async (id) => {
    const res = await axios.get(`${API}/check/${id}`, {
      params: { year: year },
    });
    console.log("GST Status Check Result:", res.data.data.status);
    setSellers((prevSellers) =>
      prevSellers.map((seller) =>
        seller.gstin === id
          ? {
              ...seller,
              status: res.data.data.status,
              returnType: res.data.data.returnType,
            }
          : seller
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              GST Trust Dashboard
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Real-time compliance monitoring for your supply chain.
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
          <StatCard label="Total Sellers" value={sellers.length} color="blue" />
          <StatCard
            label="Filed Returns"
            value={sellers.filter((s) => s.status === "FILED").length}
            color="green"
          />
          <StatCard
            label="Pending Returns"
            value={sellers.filter((s) => s.status !== "FILED").length}
            color="red"
          />
        </div>
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
        {/* Table Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  {/* Added text-center here */}
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    S.No.
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Seller Details
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    GSTIN
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Filing Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Return Type
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
                    <td className="px-6 py-4 text-center">
                      <div className="font-semibold text-slate-800">
                        {index + 1}.
                      </div>
                    </td>
                    {/* 1. Center Name/Vendor ID */}
                    <td className="px-6 py-4 text-center">
                      <div className="font-semibold text-slate-800">
                        {s.sellerName}
                      </div>
                    </td>

                    {/* 2. Center GSTIN */}
                    <td className="px-6 py-4 text-center">
                      <span className="font-mono text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded inline-block">
                        {s.gstin}
                      </span>
                    </td>

                    {/* 3. Center Status Badge */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        {" "}
                        {/* Use flex-justify-center for components */}
                        {s.status === "FILED" ? (
                          <span className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                            <ShieldCheck size={14} /> FILED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                            <ShieldAlert size={14} /> PENDING
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className="font-mono text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded inline-block">
                        {s.returnType}
                      </span>
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
export default Dashboard;
