import React, { useState, useEffect } from "react";
import {
  FileText,
  Search,
  Building2,
  Calendar,
  Trash2,
  ArrowRight,
  ShieldCheck,
  DollarSign,
  Package,
} from "lucide-react";
import { FaRupeeSign } from "react-icons/fa";

export default function PurchaseBillsDashboard() {
  const [bills, setBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBill, setSelectedBill] = useState(null);
  const [filteredBills, setFilteredBills] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Load saved purchase bills from localStorage on mount
  useEffect(() => {
    loadBillsFromStorage();

    const handleStorageChange = () => loadBillsFromStorage();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Safely convert empty strings, null, or undefined to 0 for calculations
  const parseNum = (val) => {
    if (val === "" || val === null || val === undefined) return 0;
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  };
  useEffect(() => {
    const safeBills = Array.isArray(bills) ? bills : [];

    const filtered = safeBills.filter((bill) => {
      // Search term matching (supplier, invoice no, GSTIN)
      const matchesSearch =
        bill.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.supplierGSTIN?.toLowerCase().includes(searchTerm.toLowerCase());

      // Date range matching
      const billDate = bill.invoiceDate ? new Date(bill.invoiceDate) : null;

      let matchesDateRange = true;
      if (startDate && billDate) {
        matchesDateRange = matchesDateRange && billDate >= new Date(startDate);
      }
      if (endDate && billDate) {
        // Set end date to end of the day for inclusive comparison
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        matchesDateRange = matchesDateRange && billDate <= endDateTime;
      }

      return matchesSearch && matchesDateRange;
    });

    setFilteredBills(filtered);
  }, [bills, searchTerm, startDate, endDate]);
  const loadBillsFromStorage = () => {
    try {
      const localData = localStorage.getItem("invoice_simplify_saved_bills");
      if (localData) {
        const parsedData = JSON.parse(localData);

        let validBillsArray = [];
        if (Array.isArray(parsedData)) {
          validBillsArray = parsedData;
        } else if (parsedData && typeof parsedData === "object") {
          // If it was saved as a single object, wrap it in an array
          validBillsArray = [parsedData];
        }

        setBills(validBillsArray);
        setFilteredBills(validBillsArray);
      } else {
        setBills([]);
        setFilteredBills([]);
      }
    } catch (error) {
      console.error("Error reading saved bills from localStorage:", error);
      setBills([]);
      setFilteredBills([]);
    }
  };

  // Properly update filtered bills using useEffect when bills or search term changes
  useEffect(() => {
    const filtered = bills.filter(
      (bill) =>
        bill.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.supplierGSTIN?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBills(filtered);
  }, [bills, searchTerm]);

  // Delete a saved bill
  const handleDeleteBill = (id, e) => {
    e.stopPropagation(); // Prevent opening modal
    if (
      window.confirm(
        "Are you sure you want to delete this purchase bill record?"
      )
    ) {
      const updated = bills.filter((bill) => bill.id !== id);
      setBills(updated);
      localStorage.setItem(
        "invoice_simplify_saved_bills",
        JSON.stringify(updated)
      );
      if (selectedBill && selectedBill.id === id) {
        setSelectedBill(null);
      }
    }
  };

  const safeBills = Array.isArray(bills) ? bills : [];

  const totalSpend = safeBills.reduce(
    (acc, curr) => acc + parseNum(curr.totalAmount),
    0
  );

  const totalTaxPaid = safeBills.reduce((acc, curr) => {
    const cgst = parseNum(curr.cgstAmount);
    const sgst = parseNum(curr.sgstAmount);
    const igst = parseNum(curr.igstAmount);
    // Fallback to totalTax if individual tax fields are empty
    const fallbackTax = parseNum(curr.totalTax);

    const taxSum = cgst + sgst + igst;
    return acc + (taxSum > 0 ? taxSum : fallbackTax);
  }, 0);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans pb-12">
      {/* Header */}
      <header className="bg-blue-700 text-white p-4 shadow-md">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-wide flex items-center gap-2">
              <FileText className="w-6 h-6" /> Purchase Dashboard
            </h1>
            <p className="text-blue-100 text-xs mt-0.5">
              Manage & Review Saved Wholesale Bills
            </p>
          </div>
          <span className="bg-blue-800 text-blue-100 text-xs font-bold px-3 py-1 rounded-full border border-blue-600">
            {bills.length} Invoices
          </span>
        </div>
      </header>

      <div className="max-w-xl mx-auto p-4 space-y-4">
        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-1">
              <FaRupeeSign className="w-4 h-4 text-emerald-600" /> Total
              Purchases
            </div>
            <p className="text-xl font-extrabold text-slate-900">
              ₹{" "}
              {totalSpend.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-1">
              <ShieldCheck className="w-4 h-4 text-blue-600" /> Total Tax Paid
            </div>
            <p className="text-xl font-extrabold text-slate-900">
              ₹{" "}
              {totalTaxPaid.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

        {/* Search & Date Filter Section */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by supplier, invoice #, or GSTIN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Date Range Inputs & Clear Button */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-slate-500 font-bold mb-1">
                From Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-bold mb-1">
                To Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700"
              />
            </div>
          </div>

          {(startDate || endDate || searchTerm) && (
            <div className="flex justify-end pt-1">
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setSearchTerm("");
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                Clear Filters ✕
              </button>
            </div>
          )}
        </div>

        {/* Invoices List */}
        <div className="space-y-3">
          <h2 className="font-bold text-slate-700 text-sm px-1">
            Recent Saved Bills
          </h2>

          {filteredBills.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-sm space-y-3">
              <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto border">
                <Package className="w-8 h-8" />
              </div>
              <p className="font-bold text-slate-700 text-sm">
                No purchase bills found
              </p>
              <p className="text-xs text-slate-500">
                Scan or upload a wholesale bill to view it here.
              </p>
            </div>
          ) : (
            filteredBills.map((bill) => (
              <div
                key={bill.id}
                onClick={() => setSelectedBill(bill)}
                className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-400 transition cursor-pointer flex justify-between items-center group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {bill.supplierName}
                    </span>
                    {bill.invoiceNumber && (
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-mono text-slate-600">
                        #{bill.invoiceNumber}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />{" "}
                      {bill.invoiceDate || "N/A"}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-[11px]">
                      {bill.supplierGSTIN || "No GSTIN"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div>
                    <p className="text-sm font-extrabold text-blue-900">
                      ₹ {bill.totalAmount}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {bill.items?.length || 0} items
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteBill(bill.id, e)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bill Details Modal */}
      {selectedBill && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-5 shadow-xl space-y-4">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  {selectedBill.supplierName}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  GSTIN: {selectedBill.supplierGSTIN || "N/A"}
                </p>
              </div>
              <button
                onClick={() => setSelectedBill(null)}
                className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border">
              <div>
                <span className="text-slate-500 block">Invoice Number</span>
                <span className="font-bold text-slate-800">
                  {selectedBill.invoiceNumber || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Invoice Date</span>
                <span className="font-bold text-slate-800">
                  {selectedBill.invoiceDate || "N/A"}
                </span>
              </div>
            </div>

            {/* Line Items List */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wide">
                Purchased Items
              </h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {selectedBill.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-2.5 bg-slate-50 border rounded-xl text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{item.name}</p>
                      <p className="text-[10px] text-slate-500">
                        Qty: {item.qty} | Rate: ₹{item.rate}
                      </p>
                    </div>
                    <span className="font-extrabold text-slate-900">
                      ₹ {item.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tax Breakdown */}
            <div className="bg-blue-50/60 p-3 rounded-2xl border border-blue-100 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Taxable Value:</span>
                <span className="font-bold">
                  ₹ {selectedBill.subTotal || "0"}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>CGST:</span>
                <span className="font-bold">
                  ₹{" "}
                  {selectedBill.cgstAmount !== "" &&
                  selectedBill.cgstAmount !== null
                    ? selectedBill.cgstAmount
                    : "0"}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>SGST:</span>
                <span className="font-bold">
                  ₹{" "}
                  {selectedBill.sgstAmount !== "" &&
                  selectedBill.sgstAmount !== null
                    ? selectedBill.sgstAmount
                    : "0"}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>IGST:</span>
                <span className="font-bold">
                  ₹{" "}
                  {selectedBill.igstAmount !== "" &&
                  selectedBill.igstAmount !== null
                    ? selectedBill.igstAmount
                    : "0"}
                </span>
              </div>
              <div className="flex justify-between text-blue-900 font-extrabold text-sm border-t border-blue-200 pt-2 mt-1">
                <span>Grand Total:</span>
                <span>₹ {selectedBill.totalAmount}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedBill(null)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md text-sm transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
