import React, { useState, useEffect } from "react";
import SellerAddressModal from "./SellerAddressModal";

const SellerListModal = ({ isOpen, onClose, sellers = [], onSelect }) => {
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState(sellers);

  const [open, setOpen] = useState(false);
  const handleSave = (data) => {
    console.log("Seller saved:", data);
  };

  useEffect(() => {
    setFiltered(
      sellers.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.address.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, sellers]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-lg p-6 animate-fadeIn">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-lg font-semibold text-gray-800">Select Seller</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Search + Add Button */}
        <div className="flex items-center justify-between mt-4 mb-3">
          <input
            type="text"
            placeholder="Search seller by name or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-3/4 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add New
          </button>
        </div>

        {/* Seller List */}
        <div className="max-h-72 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300">
          {filtered.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No sellers found.</p>
          ) : (
            filtered.map((seller, i) => (
              <div
                key={i}
                className="border rounded-lg p-4 mb-3 hover:bg-gray-50 cursor-pointer transition"
                onClick={() => {
                  onSelect(seller);
                  onClose();
                }}
              >
                <h3 className="font-semibold text-gray-800 text-sm">
                  {seller.name}
                </h3>
                <p className="text-gray-600 text-xs">{seller.address}</p>
                <p className="text-gray-500 text-xs">
                  {seller.city}, {seller.state} - {seller.pincode}
                </p>
                {seller.gstin && (
                  <p className="text-gray-500 text-xs mt-1">
                    GSTIN: {seller.gstin}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t pt-3 mt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
      <SellerAddressModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
};

export default SellerListModal;
