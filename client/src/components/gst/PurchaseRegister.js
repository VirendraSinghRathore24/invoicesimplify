import React, { useEffect, useState } from "react";
import { Edit3, Trash2, CheckCircle, AlertCircle, Save, X } from "lucide-react";
import Header from "./Header";
import { db } from "../../config/firebase";
import { collection, doc, getDocs } from "firebase/firestore";
import Loader from "../Loader";

const PurchaseRegister = () => {
  const [purchases, setPurchases] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(false);
  const gstin = localStorage.getItem("verified_gstin");

  const getAllPurchase = async () => {
    try {
      setLoading(true);
      const purchase_CollectionRef = collection(
        doc(db, "GST", gstin),
        "Purchase"
      );

      const data = await getDocs(purchase_CollectionRef);
      const purchaseInfo = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      const info = purchaseInfo.sort((a, b) => {
        // Helper to convert "MMYYYY" to "YYYYMM" for proper numerical comparison
        const getSortableValue = (dateStr) => {
          if (!dateStr || dateStr.length !== 6) return 0;
          const mm = dateStr.substring(0, 2);
          const yyyy = dateStr.substring(2, 6);
          return parseInt(yyyy + mm); // Converts "042026" -> 202604
        };

        const valA = getSortableValue(a.monthYear);
        const valB = getSortableValue(b.monthYear);

        // For Latest First (Descending Order):
        return valB - valA;
      });
      setPurchases(info);
    } catch (error) {
      console.error("Error fetching purchase data:", error);
      alert("Failed to load purchase data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllPurchase();
  }, []);

  // --- Actions ---
  const handleDelete = (id) => {
    if (window.confirm("Remove this invoice from your register?")) {
      setPurchases(purchases.filter((p) => p.id !== id));
    }
  };

  const startEdit = (record) => {
    setEditingId(record.id);
    setEditForm(record);
  };

  const handleSave = () => {
    setPurchases(purchases.map((p) => (p.id === editingId ? editForm : p)));
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans ">
      {/* --- TOP BANNER --- */}
      <Header />
      <div className="flex flex-col items-center w-full">
        {/* Added mx-auto and flex-col items-center to parent to center the card itself */}
        <div className="w-10/12 bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden mt-10">
          <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">
                Purchase Register
              </h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                Ready for GSTR-2B Reconciliation
              </p>
            </div>
            <div className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
              <span className="text-xs font-bold text-slate-400">
                Total Records:
              </span>
              <span className="ml-2 font-black text-blue-400">
                {purchases.length}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {/* Changed all th to text-center */}
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase text-center">
                    Vendor GSTIN
                  </th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase text-center">
                    Inv Name
                  </th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase text-center">
                    Inv Number
                  </th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase text-center">
                    Period
                  </th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase text-center">
                    Taxable Val
                  </th>
                  <th className="p-4 text-[10px] font-black text-blue-600 uppercase text-center">
                    Total Tax
                  </th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchases.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    {editingId === row.id ? (
                      <>
                        <td className="p-3 text-center">
                          <input
                            name="vendorGstin"
                            value={editForm.vendorGstin}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-lg text-sm font-bold text-center"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            name="vendorGstin"
                            value={editForm.vendorName}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-lg text-sm font-bold text-center"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            name="invoiceNo"
                            value={editForm.invoiceNo}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-lg text-sm font-bold text-center"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="date"
                            name="invoiceDate"
                            value={editForm.monthYear}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-lg text-sm font-bold text-center"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            name="taxableValue"
                            value={parseFloat(editForm.taxableValue).toFixed(2)}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-lg text-sm font-bold text-center"
                          />
                        </td>
                        <td className="p-3 text-center font-black text-blue-600">
                          ₹
                          {parseFloat(editForm.cgst) +
                            parseFloat(editForm.sgst) +
                            parseFloat(editForm.igst)}
                        </td>
                        <td className="p-3">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={handleSave}
                              className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200"
                            >
                              <Save size={16} />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        {/* Changed all td to text-center */}
                        <td className="p-4 text-sm font-black text-slate-700 text-center">
                          {row.vendorGstin}
                        </td>
                        <td className="p-4 text-sm font-black text-slate-700 text-center">
                          {row.vendorName}
                        </td>
                        <td className="p-4 text-sm font-bold text-slate-500 text-center">
                          {row.invoiceNo}
                        </td>
                        <td className="p-4 text-sm font-medium text-slate-500 text-center">
                          {row.monthYear}
                        </td>
                        <td className="p-4 text-sm font-bold text-slate-700 text-center">
                          ₹{row.taxableValue}
                        </td>
                        <td className="p-4 text-sm font-black text-blue-600 text-center">
                          ₹{row.cgst + row.sgst + row.igst}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => startEdit(row)}
                              className="text-slate-400 hover:text-blue-600"
                            >
                              <Edit3 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(row.id)}
                              className="text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {purchases.length === 0 && (
            <div className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest italic">
              No records found. Upload a bill to begin.
            </div>
          )}
        </div>
      </div>
      {loading && <Loader />}
    </div>
  );
};

export default PurchaseRegister;
