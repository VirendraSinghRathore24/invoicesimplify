import React, { useState } from "react";
import { Plus, Trash2, Save } from "lucide-react"; // Optional: for icons

const PurchaseEntryForm = ({ onDataSubmit }) => {
  const [invoices, setInvoices] = useState([
    {
      id: Date.now(),
      invoiceNo: "",
      supplierGstin: "",
      taxableValue: "",
      taxAmount: "",
    },
  ]);

  const handleInputChange = (id, field, value) => {
    const updatedInvoices = invoices.map((inv) =>
      inv.id === id ? { ...inv, [field]: value } : inv
    );
    setInvoices(updatedInvoices);
  };

  const addRow = () => {
    setInvoices([
      ...invoices,
      {
        id: Date.now(),
        invoiceNo: "",
        supplierGstin: "",
        taxableValue: "",
        taxAmount: "",
      },
    ]);
  };

  const removeRow = (id) => {
    if (invoices.length > 1) {
      setInvoices(invoices.filter((inv) => inv.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convert strings to numbers before passing to the reconciliation logic
    const formattedData = invoices.map((inv) => ({
      ...inv,
      taxableValue: parseFloat(inv.taxableValue) || 0,
      taxAmount: parseFloat(inv.taxAmount) || 0,
    }));
    onDataSubmit(formattedData);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">
        Manual Purchase Entry
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="flex gap-4 items-end animate-in fade-in slide-in-from-top-1"
            >
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                  Inv No
                </label>
                <input
                  type="text"
                  placeholder="INV-001"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  value={inv.invoiceNo}
                  onChange={(e) =>
                    handleInputChange(inv.id, "invoiceNo", e.target.value)
                  }
                  required
                />
              </div>

              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                  Supplier GSTIN
                </label>
                <input
                  type="text"
                  placeholder="24ABC..."
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                  value={inv.supplierGstin}
                  onChange={(e) =>
                    handleInputChange(
                      inv.id,
                      "supplierGstin",
                      e.target.value.toUpperCase()
                    )
                  }
                  required
                />
              </div>

              <div className="w-32">
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                  Taxable Val
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  value={inv.taxableValue}
                  onChange={(e) =>
                    handleInputChange(inv.id, "taxableValue", e.target.value)
                  }
                  required
                />
              </div>

              <div className="w-32">
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                  GST Amount
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  value={inv.taxAmount}
                  onChange={(e) =>
                    handleInputChange(inv.id, "taxAmount", e.target.value)
                  }
                  required
                />
              </div>

              <button
                type="button"
                onClick={() => removeRow(inv.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-between items-center border-t pt-6">
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-all"
          >
            <Plus size={18} /> Add Invoice
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 shadow-md transition-all"
          >
            <Save size={18} /> Run Reconciliation
          </button>
        </div>
      </form>
    </div>
  );
};

export default PurchaseEntryForm;
