import React, { useState, useMemo } from "react";
import { X, Calendar, FileText, ArrowUpDown } from "lucide-react";

const GSTReturnModal = ({ isOpen, onClose, data, gstin }) => {
  const [sortConfig, setSortConfig] = useState({
    key: "ret_prd",
    direction: "desc",
  });

  //const data = JSON.parse(localStorage.getItem("historyData"));
  // Sorting Logic
  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    sortableItems.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
    return sortableItems;
  }, [data, sortConfig]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Return Filing History - {gstin}
            </h2>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mt-0.5">
              Verification Records
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                  <div className="flex items-center gap-2">
                    <FileText size={14} /> Return Type
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-center">
                  <div
                    className="flex items-center justify-center gap-2 cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() =>
                      setSortConfig({
                        key: "returnDate",
                        direction:
                          sortConfig.direction === "asc" ? "desc" : "asc",
                      })
                    }
                  >
                    <Calendar size={14} /> Return Date <ArrowUpDown size={12} />
                  </div>
                </th>
                {/* <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">
                  Status
                </th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sortedData.map((item, index) => (
                <tr
                  key={index}
                  className="hover:bg-blue-50/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-700 bg-blue-50 px-2 py-1 rounded border border-blue-100 text-sm">
                      {item.rtntype}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center font-mono text-slate-600 text-sm">
                    {/* Format 052025 as May-2025 */}
                    {item.ret_prd}
                  </td>
                  {/* <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Filed Successfully
                    </span>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium transition-all shadow-sm"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default GSTReturnModal;
