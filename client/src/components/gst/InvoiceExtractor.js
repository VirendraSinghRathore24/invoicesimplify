import React, { useState } from "react";
import {
  Upload,
  FileSearch,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";

const InvoiceExtractor = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const processInvoice = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("invoice", image);

    try {
      // Replace with your actual backend endpoint
      const response = await fetch("/api/extract-invoice", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setExtractedData(data);
    } catch (error) {
      console.error("Extraction failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
          AI Invoice Scanner
        </h1>
        <p className="text-slate-500 font-bold">
          Upload a photo to extract GST data automatically
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-4">
          <div className="relative border-4 border-dashed border-slate-200 rounded-[2.5rem] p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleImageChange}
            />
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="max-h-64 rounded-2xl shadow-lg"
              />
            ) : (
              <div className="text-center">
                <Upload size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-sm font-bold text-slate-400">
                  Tap to upload Purchase Bill
                </p>
              </div>
            )}
          </div>

          <button
            onClick={processInvoice}
            disabled={!image || loading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 disabled:bg-slate-300 shadow-xl shadow-blue-100"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <FileSearch size={20} />
            )}
            {loading ? "SCANNING BILL..." : "EXTRACT DATA"}
          </button>
        </div>

        {/* Results Section */}
        <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
            Extraction Result
          </h2>

          {!extractedData ? (
            <div className="h-64 flex items-center justify-center text-slate-300 font-bold">
              Scan a bill to see details
            </div>
          ) : (
            <div className="space-y-4">
              <DataField
                label="GST Number"
                value={extractedData.gstin}
                icon={<CheckCircle size={14} className="text-emerald-500" />}
              />
              <DataField label="Invoice No" value={extractedData.invoice_no} />
              <DataField label="Date" value={extractedData.date} />
              <div className="pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase">
                    Items Found
                  </span>
                  <span className="text-xs font-bold text-blue-600">
                    {extractedData.items.length} items
                  </span>
                </div>
                {extractedData.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between text-sm font-bold text-slate-700 py-1"
                  >
                    <span>{item.desc}</span>
                    <span>₹{item.total}</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 mt-4 bg-slate-900 text-white p-4 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Total Tax Amount
                </span>
                <p className="text-2xl font-black">
                  ₹{extractedData.total_tax}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DataField = ({ label, value, icon }) => (
  <div>
    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
      {label}
    </label>
    <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 font-bold text-slate-700">
      {icon} {value || "Not Found"}
    </div>
  </div>
);

export default InvoiceExtractor;
