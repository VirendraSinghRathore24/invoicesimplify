import React, { useState } from "react";
import { FileSearch, Save, Edit3, Trash2, AlertCircle } from "lucide-react";
import { BASE_URL } from "../Constant";
import Header from "./Header";
import { db } from "../../config/firebase";
import { addDoc, collection, doc, serverTimestamp } from "firebase/firestore";
import Loader from "../Loader";

const InvoiceScanner = () => {
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);

  const handleProcess = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("invoice", file);

    try {
      const response = await fetch(`${BASE_URL}/api/extract-invoice`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setExtractedData(data);
    } catch (error) {
      alert("Error extracting data.");
    } finally {
      setLoading(false);
    }
  };

  const formatToGstPeriod = (dateString) => {
    if (!dateString) return "";

    // Matches any non-digit character as a separator (handles 18-04-2019 or 18/04/2019)
    const parts = dateString.split(/[-/]/);

    if (parts.length < 3) return "";

    const month = parts[1]; // Index 1 is MM
    const year = parts[2]; // Index 2 is YYYY

    return `${month}${year}`;
  };
  const addPurchaseToFirestore = async (purchaseData) => {
    try {
      setLoading(true);
      // Calculate final totals before saving to ensure data integrity
      const finalData = {
        id: `${purchaseData.gstin.toUpperCase()}_${purchaseData.invoice_no.toUpperCase()}_${formatToGstPeriod(
          purchaseData.date
        )}`,
        vendorGstin: purchaseData.gstin.toUpperCase(),
        invoiceNo: purchaseData.invoice_no.toUpperCase(),
        invoiceDate: purchaseData.date,
        taxableValue: parseFloat(purchaseData.taxable_value),
        cgst: parseFloat(purchaseData.cgst || 0),
        sgst: parseFloat(purchaseData.sgst || 0),
        igst: parseFloat(purchaseData.igst || 0),
        totalTax: parseFloat(purchaseData.total_tax || 0),
        total: parseFloat(purchaseData.total),
        // Adding metadata for better dashboarding later
        createdAt: serverTimestamp(),
        monthYear: formatToGstPeriod(purchaseData.date), // e.g., "2026-04"
      };

      // Reference to: Gst (Collection) -> {docId} -> Purchase (Sub-collection)
      // Or simply a top-level collection:
      const shopkeeperGst = localStorage.getItem("verified_gstin");
      await addDoc(
        collection(doc(db, "GST", shopkeeperGst), "Purchase"),
        finalData
      );
      setLoading(false);
      //console.log("Document written with ID: ", docRef.id);
      //return { success: true, id: docRef.id };
    } catch (e) {
      console.error("Error adding document: ", e);
      throw e;
    } finally {
      setLoading(false);
    }
  };
  const handleSave = (extractedData) => {
    addPurchaseToFirestore(extractedData);
  };
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      {/* --- TOP BANNER (Sticky) --- */}
      <Header />
      <div className="p-8 max-w-5xl mx-auto space-y-8">
        {/* Upload Section */}
        <div className="bg-white p-10 rounded-[2rem] border-2 border-dashed border-slate-200 text-center hover:border-blue-400 transition-colors relative">
          <input
            type="file"
            onChange={handleProcess}
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={loading}
          />
          <div className="flex flex-col items-center gap-4">
            <div className="bg-blue-50 p-4 rounded-full text-blue-600">
              <FileSearch
                size={32}
                className={loading ? "animate-pulse" : ""}
              />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 uppercase">
                {loading ? "AI is Reading Bill..." : "Upload Purchase Invoice"}
              </h3>
              <p className="text-slate-500 font-medium">
                JPEG, PNG or WEBP (Max 10MB)
              </p>
            </div>
          </div>
        </div>

        {/* Extracted Data Table */}
        {extractedData && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h2 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <AlertCircle size={18} className="text-amber-500" /> Verify
                Extracted Details
              </h2>
              <button
                onClick={() => handleSave(extractedData)}
                className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700"
              >
                <Save size={18} /> Save to Purchase Register
              </button>
            </div>

            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-100/50">
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase">
                    Field Name
                  </th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase">
                    Detected Value
                  </th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <EditableRow
                  label="Supplier GSTIN"
                  value={extractedData.gstin}
                />
                <EditableRow
                  label="Invoice Number"
                  value={extractedData.invoice_no}
                />
                <EditableRow label="Billing Date" value={extractedData.date} />
                <EditableRow
                  label="Taxable Amount"
                  value={`₹${extractedData.taxable_value}`}
                />
                <EditableRow
                  label="Total Tax (GST)"
                  value={`₹${extractedData.total_tax}`}
                  isBold
                />
              </tbody>
            </table>

            {/* Items Breakdown */}
            <div className="p-6 bg-slate-50/30">
              <h3 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">
                Line Items
              </h3>
              <div className="space-y-2">
                {extractedData.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between bg-white p-3 rounded-xl border border-slate-100 text-sm font-bold text-slate-700"
                  >
                    <span>{item.desc}</span>
                    <span className="text-blue-600">₹{item.total}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      {loading && <Loader />}
    </div>
  );
};

const EditableRow = ({ label, value, isBold }) => (
  <tr className="hover:bg-slate-50/50 transition-colors">
    <td className="p-4 text-sm font-bold text-slate-500">{label}</td>
    <td
      className={`p-4 text-sm font-black ${
        isBold ? "text-blue-600" : "text-slate-800"
      }`}
    >
      {value}
    </td>
    <td className="p-4 text-right">
      <button className="text-slate-300 hover:text-blue-500 transition-colors p-2">
        <Edit3 size={16} />
      </button>
    </td>
  </tr>
);

export default InvoiceScanner;
