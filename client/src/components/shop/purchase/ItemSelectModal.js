import React, { useState } from "react";
import AddNewItemModal from "./AddNewItemModal";

const ItemSelectModal = ({ isOpen, onClose, items = [], onSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-xl p-5 animate-fadeIn">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-semibold text-gray-800">Select Item</h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Search bar */}
        <div className="flex gap-x-4 mt-4 w-full">
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
          />
          <button
            onClick={() => setAddOpen(true)}
            className=" w-4/12 flex items-center cursor-pointer gap-2 px-4 py-1 rounded-lg border border-blue-600 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white transition font-medium"
          >
            + Add Item
          </button>
        </div>

        {/* Items list */}
        <div className="mt-4 max-h-60 overflow-y-auto space-y-2 pr-1">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelect(item)}
                className="cursor-pointer bg-gray-50 hover:bg-gray-100 border rounded-md p-3 text-sm text-gray-700 flex justify-between items-center"
              >
                <span>{item.name}</span>
                <span className="text-xs text-gray-500"> {item.price}</span>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4 text-sm">
              No items found
            </p>
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
      <AddNewItemModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={(data) => console.log("Item Saved:", data)}
      />
    </div>
  );
};

export default ItemSelectModal;
