import React from "react";

const AddBrandModal = ({ isOpen, onClose, onSubmit }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-xl border p-6 animate-fadeIn">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Add Brand\Agency
          </h2>
          <button
            className="text-gray-500 hover:text-gray-700 text-xl"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form
          className="mt-4 grid grid-cols-2 gap-4 text-sm"
          onSubmit={onSubmit}
        >
          <input
            type="text"
            autoFocus
            placeholder="Brand / Agency Name *"
            className="inputBox"
            required
          />

          {/* Address Fields */}
          <input
            type="text"
            placeholder="Address Line 1"
            className="inputBox col-span-2"
          />

          <input
            type="text"
            placeholder="Address Line 2"
            className="inputBox col-span-2"
          />

          <input type="text" placeholder="City, State" className="inputBox" />

          <input type="text" placeholder="ZIP / Pincode" className="inputBox" />
          <input
            type="email"
            placeholder="Email Address"
            className="inputBox"
          />
          <input type="text" placeholder="Mobile Number" className="inputBox" />

          {/* Tax / ID Fields */}
          <input type="text" placeholder="GST Number" className="inputBox" />
          <input type="text" placeholder="PAN Number" className="inputBox" />
          <input type="text" placeholder="TIN Number" className="inputBox" />
          <input type="text" placeholder="CIN Number" className="inputBox" />

          <div className="col-span-2  flex justify-end border-t pt-3 mt-3 gap-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBrandModal;
