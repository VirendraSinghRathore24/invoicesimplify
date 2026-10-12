import React, { useState, useRef } from "react";
import {
  Camera,
  Upload,
  FileText,
  CheckCircle2,
  Save,
  Trash2,
  Plus,
  Building2,
  RefreshCw,
} from "lucide-react";
import { BASE_URL } from "../Constant";

export default function GSTBillScanner() {
  const [step, setStep] = useState("capture");
  const [billImage, setBillImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const [billData, setBillData] = useState({
    supplierName: "",
    supplierGSTIN: "",
    invoiceNumber: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    subTotal: "",
    cgstAmount: "",
    sgstAmount: "",
    igstAmount: "",
    totalAmount: "",
    items: [],
  });

  // Camera Management
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Unable to open camera. Please upload an image file instead.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      const file = new File([blob], "bill_capture.jpg", { type: "image/jpeg" });
      setBillImage(URL.createObjectURL(file));
      stopCamera();
      uploadToBackend(file);
    }, "image/jpeg");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBillImage(URL.createObjectURL(file));
      uploadToBackend(file);
    }
  };

  // Send Image/PDF to Express Node.js Backend
  const uploadToBackend = async (file) => {
    setIsScanning(true);
    const formData = new FormData();
    formData.append("billFile", file);

    try {
      const response = await fetch(`${BASE_URL}/api/accept-bill`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("Backend response status:", result);

      if (result.success && result.data) {
        const d = result.data;

        // Map backend response keys to React billData state
        setBillData({
          supplierName: d.supplier_name || "",
          supplierGSTIN: d.gstin || "",
          invoiceNumber: d.invoice_no || "",
          invoiceDate: d.date || new Date().toISOString().split("T")[0],
          subTotal: d.taxable_value || "",
          cgstAmount: d.cgst || "",
          sgstAmount: d.sgst || "",
          igstAmount: d.igst || "",
          totalTax: d.total_tax || "",
          totalAmount: d.total || "",
          items: (d.items || []).map((item, idx) => ({
            id: idx + 1,
            name: item.desc || "",
            qty: item.quantity || "1",
            rate: item.unit_price || "0",
            amount: item.total || "0",
          })),
        });

        setStep("review");
      } else {
        alert("Failed to parse bill data.");
      }
    } catch (error) {
      console.error("Backend upload error:", error);
      alert("Error connecting to server.");
    } finally {
      setIsScanning(false);
    }
  };

  // Helper to update tax fields (CGST, SGST, IGST)
  const handleTaxChange = (field, value) => {
    setBillData({
      ...billData,
      [field]: value,
    });
  };

  // Helper to add a new empty row
  const handleAddItem = () => {
    setBillData({
      ...billData,
      items: [
        ...billData.items,
        { id: Date.now(), name: "", qty: "1", rate: "0", amount: "0" },
      ],
    });
  };

  // Helper to update specific fields of a line item
  const handleItemChange = (id, field, value) => {
    const updated = billData.items.map((item) => {
      if (item.id === id) {
        const newItem = { ...item, [field]: value };
        // Optional: auto-recalculate total amount if quantity or rate changes and are numbers
        if (field === "qty" || field === "rate") {
          const q = parseFloat(newItem.qty) || 1;
          const r = parseFloat(newItem.rate) || 0;
          if (field === "rate") {
            newItem.amount = (q * r).toFixed(2);
          }
        }
        return newItem;
      }
      return item;
    });
    setBillData({ ...billData, items: updated });
  };

  // Helper to remove a line item row
  const handleRemoveItem = (id) => {
    setBillData({
      ...billData,
      items: billData.items.filter((item) => item.id !== id),
    });
  };

  const handleReset = () => {
    stopCamera();
    setBillImage(null);
    setStep("capture");
  };

  const handleSaveBill = () => {
    if (!billData.supplierName.trim() || !billData.totalAmount) {
      alert("Please ensure Supplier Name and Total Amount are filled.");
      return;
    }

    const newBillRecord = {
      id: Date.now(),
      ...billData,
      savedAt: new Date().toLocaleString(),
    };

    // Get existing items, ensure it's an array, then add the new bill
    const existingData = localStorage.getItem("invoice_simplify_saved_bills");
    let existingArray = [];
    try {
      const parsed = existingData ? JSON.parse(existingData) : [];
      if (Array.isArray(parsed)) {
        existingArray = parsed;
      } else if (parsed && typeof parsed === "object") {
        existingArray = [parsed];
      }
    } catch (e) {
      existingArray = [];
    }

    const updatedList = [newBillRecord, ...existingArray];

    // Save back as a proper JSON array string
    localStorage.setItem(
      "invoice_simplify_saved_bills",
      JSON.stringify(updatedList)
    );

    //setBills(updatedList);
    setStep("saved");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans pb-12">
      <header className="bg-blue-700 text-white p-4 shadow-md text-center">
        <h1 className="text-xl font-bold tracking-wide flex items-center justify-center gap-2">
          <FileText className="w-6 h-6" /> GST Bill AI Scanner
        </h1>
        <p className="text-blue-100 text-xs mt-0.5">
          Powered by Node.js & OpenAI Vision
        </p>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {step === "capture" && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4 text-center">
            {!isCameraActive ? (
              <div className="space-y-4 py-4">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto border-2 border-blue-200">
                  <FileText className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Scan Wholesale GST Bill
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload or take a photo of your purchase invoice
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md text-sm"
                  >
                    <Camera className="w-5 h-5" /> Live Camera
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="py-3.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-2 text-sm"
                  >
                    <Upload className="w-5 h-5 text-slate-600" /> Upload File
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*,application/pdf"
                    className="hidden"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative bg-black rounded-xl overflow-hidden aspect-[3/4] flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="flex-1 py-3 bg-slate-200 font-bold rounded-xl text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm shadow-md"
                  >
                    <Camera className="w-4 h-4" /> Capture Photo
                  </button>
                </div>
              </div>
            )}

            {isScanning && (
              <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex flex-col items-center justify-center z-50 text-white space-y-3 px-4">
                <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
                <p className="font-bold text-base">
                  AI is extracting GST Bill details...
                </p>
                <p className="text-xs text-blue-200 text-center">
                  OpenAI GPT-4o is reading your invoice
                </p>
              </div>
            )}
          </div>
        )}

        {step === "review" && (
          <div className="space-y-4">
            {/* Vendor & Bill Info Form */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
              <h2 className="font-bold text-slate-800 text-sm border-b pb-2 flex items-center gap-1.5">
                🏢 Supplier & Invoice Info
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Supplier Name *
                  </label>
                  <input
                    type="text"
                    value={billData.supplierName}
                    onChange={(e) =>
                      setBillData({ ...billData, supplierName: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      GSTIN
                    </label>
                    <input
                      type="text"
                      value={billData.supplierGSTIN}
                      onChange={(e) =>
                        setBillData({
                          ...billData,
                          supplierGSTIN: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Invoice No
                    </label>
                    <input
                      type="text"
                      value={billData.invoiceNumber}
                      onChange={(e) =>
                        setBillData({
                          ...billData,
                          invoiceNumber: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={billData.invoiceDate}
                    onChange={(e) =>
                      setBillData({ ...billData, invoiceDate: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Line Items Review */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <h2 className="font-bold text-slate-800 text-sm">
                  Purchased Items Breakdown
                </h2>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  + Add Item
                </button>
              </div>

              <div className="space-y-3">
                {billData.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
                  >
                    <div className="flex justify-between items-center gap-2">
                      <input
                        type="text"
                        placeholder="Item Description (desc)"
                        value={item.name}
                        onChange={(e) =>
                          handleItemChange(item.id, "name", e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 bg-white border rounded text-xs font-semibold"
                      />
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="block text-[10px] text-slate-500 font-bold">
                          Quantity
                        </span>
                        <input
                          type="text"
                          placeholder="e.g. 5 KG"
                          value={item.qty}
                          onChange={(e) =>
                            handleItemChange(item.id, "qty", e.target.value)
                          }
                          className="w-full px-2 py-1 bg-white border rounded text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-500 font-bold">
                          Unit Price (₹)
                        </span>
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) =>
                            handleItemChange(item.id, "rate", e.target.value)
                          }
                          className="w-full px-2 py-1 bg-white border rounded text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-500 font-bold">
                          Total (₹)
                        </span>
                        <input
                          type="number"
                          value={item.amount}
                          onChange={(e) =>
                            handleItemChange(item.id, "amount", e.target.value)
                          }
                          className="w-full px-2 py-1 bg-white border rounded text-xs font-extrabold text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Tax Breakdown & Total Summary */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
                <h2 className="font-bold text-slate-800 text-sm border-b pb-2">
                  Tax Breakdown & Total
                </h2>

                {/* Taxable Value */}
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs font-bold text-slate-600">
                    Taxable Value (₹):
                  </span>
                  <input
                    type="number"
                    value={billData.subTotal}
                    onChange={(e) =>
                      handleTaxChange("subTotal", e.target.value)
                    }
                    className="w-32 px-2 py-1 bg-slate-50 border rounded text-xs font-semibold text-right"
                  />
                </div>

                {/* CGST */}
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs font-bold text-slate-600">
                    CGST (₹):
                  </span>
                  <input
                    type="number"
                    value={billData.cgstAmount}
                    onChange={(e) =>
                      handleTaxChange("cgstAmount", e.target.value)
                    }
                    className="w-32 px-2 py-1 bg-slate-50 border rounded text-xs font-semibold text-right"
                  />
                </div>

                {/* SGST */}
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs font-bold text-slate-600">
                    SGST (₹):
                  </span>
                  <input
                    type="number"
                    value={billData.sgstAmount}
                    onChange={(e) =>
                      handleTaxChange("sgstAmount", e.target.value)
                    }
                    className="w-32 px-2 py-1 bg-slate-50 border rounded text-xs font-semibold text-right"
                  />
                </div>

                {/* IGST */}
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs font-bold text-slate-600">
                    IGST (₹):
                  </span>
                  <input
                    type="number"
                    value={billData.igstAmount}
                    onChange={(e) =>
                      handleTaxChange("igstAmount", e.target.value)
                    }
                    className="w-32 px-2 py-1 bg-slate-50 border rounded text-xs font-semibold text-right"
                  />
                </div>

                {/* Grand Total */}
                <div className="flex justify-between items-center py-2.5 border-t text-sm font-extrabold bg-blue-50 p-2.5 rounded-xl text-blue-900 mt-2">
                  <span>Grand Total (₹):</span>
                  <input
                    type="number"
                    value={billData.totalAmount}
                    onChange={(e) =>
                      handleTaxChange("totalAmount", e.target.value)
                    }
                    className="w-36 px-2 py-1.5 bg-white border-2 border-blue-200 rounded-lg text-sm font-extrabold text-blue-900 text-right"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-3 bg-slate-200 font-bold rounded-xl text-sm"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleSaveBill}
                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md text-sm"
              >
                <Save className="w-4 h-4" /> Save Record
              </button>
            </div>
          </div>
        )}

        {step === "saved" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Purchase Bill Saved Successfully!
            </h2>
            <button
              type="button"
              onClick={handleReset}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl text-sm"
            >
              Scan Another Bill
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
