import React, { useState } from "react";
import {
  PlusCircle,
  Receipt,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Header from "./Header";

const PurchaseBillManager = () => {
  const [bills, setBills] = useState([]);
  const [formData, setFormData] = useState({
    vendorName: "",
    vendorGstin: "",
    invoiceNo: "",
    invoiceDate: "",
    taxableValue: "",
    igst: "0",
    cgst: "0",
    sgst: "0",
    itcEligibility: "Inputs", // Options: Inputs, Input Services, Capital Goods, Ineligible
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addBill = (e) => {
    e.preventDefault();
    const newBill = {
      ...formData,
      id: Date.now(),
      totalTax:
        parseFloat(formData.igst) +
        parseFloat(formData.cgst) +
        parseFloat(formData.sgst),
      totalAmount:
        parseFloat(formData.taxableValue) +
        parseFloat(formData.igst) +
        parseFloat(formData.cgst) +
        parseFloat(formData.sgst),
      matchStatus: "Pending", // This will change once compared with 2B
    };
    setBills([newBill, ...bills]);
    // Reset form
    setFormData({
      vendorName: "",
      vendorGstin: "",
      invoiceNo: "",
      invoiceDate: "",
      taxableValue: "",
      igst: "0",
      cgst: "0",
      sgst: "0",
      itcEligibility: "Inputs",
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      <Header />
      <div className="p-6 bg-slate-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
            <Receipt className="text-blue-600" /> Purchase Register
          </h1>

          {/* Form Section */}
          <form
            onSubmit={addBill}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Vendor Name
                </label>
                <input
                  name="vendorName"
                  value={formData.vendorName}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-lg outline-none focus:border-blue-500"
                  placeholder="e.g. Laxmi Enterprises"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Vendor GSTIN
                </label>
                <input
                  name="vendorGstin"
                  value={formData.vendorGstin}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-lg font-mono"
                  placeholder="08AAAAA..."
                  required
                  maxLength={15}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Invoice No
                </label>
                <input
                  name="invoiceNo"
                  value={formData.invoiceNo}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-lg"
                  placeholder="INV-001"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Invoice Date
                </label>
                <input
                  type="date"
                  name="invoiceDate"
                  value={formData.invoiceDate}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Taxable Value (₹)
                </label>
                <input
                  type="number"
                  name="taxableValue"
                  value={formData.taxableValue}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-lg"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-2 md:col-span-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    IGST
                  </label>
                  <input
                    type="number"
                    name="igst"
                    value={formData.igst}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    CGST
                  </label>
                  <input
                    type="number"
                    name="cgst"
                    value={formData.cgst}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    SGST
                  </label>
                  <input
                    type="number"
                    name="sgst"
                    value={formData.sgst}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <PlusCircle size={20} /> Save Purchase Bill
            </button>
          </form>

          {/* Bill List Display */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-4 text-xs font-black text-slate-500 uppercase">
                    Vendor / Invoice
                  </th>
                  <th className="p-4 text-xs font-black text-slate-500 uppercase">
                    Date
                  </th>
                  <th className="p-4 text-xs font-black text-slate-500 uppercase">
                    Taxable
                  </th>
                  <th className="p-4 text-xs font-black text-slate-500 uppercase">
                    Total Tax
                  </th>
                  <th className="p-4 text-xs font-black text-slate-500 uppercase text-center">
                    2B Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill) => (
                  <tr
                    key={bill.id}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-bold text-slate-800">
                        {bill.vendorName}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {bill.vendorGstin} | {bill.invoiceNo}
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-600">
                      {bill.invoiceDate}
                    </td>
                    <td className="p-4 text-sm font-bold text-slate-800">
                      ₹{bill.taxableValue}
                    </td>
                    <td className="p-4 text-sm font-bold text-blue-600">
                      ₹{bill.totalTax.toFixed(2)}
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full bg-slate-100 text-slate-500 uppercase">
                        <AlertCircle size={12} /> Pending Match
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bills.length === 0 && (
              <div className="p-12 text-center text-slate-400 font-medium">
                No purchase bills added yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseBillManager;
