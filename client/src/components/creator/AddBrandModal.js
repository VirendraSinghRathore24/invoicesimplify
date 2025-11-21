import { addDoc, collection, doc, getDocs } from "firebase/firestore";
import React, { useState } from "react";
import { db } from "../../config/firebase";
import { CREATORS } from "../Constant";

const AddBrandModal = ({ isOpen, onClose, onSave }) => {
  const [inputs, setInputs] = useState({
    customerName: "",
    address: "",
    address1: "",
    address2: "",
    address3: "",
    customerEmail: "",
    customerPhone: "",
    gst: "",
    pan: "",
    tin: "",
    cin: "",
  });

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs((values) => ({ ...values, [name]: value }));
  };

  const handlePhoneChange = (event) => {
    const { name, value } = event.target;
    if (/^\d{0,10}$/.test(value)) {
      // Allow only numeric values up to 10 digits
      setInputs((values) => ({ ...values, [name]: value }));
      localStorage.setItem(name, value);
    }
  };

  if (!isOpen) return null;

  const handleSave = () => {
    if (!inputs) return;
    onSave(inputs);

    setInputs("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 lg:left-64">
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
          onSubmit={handleSave}
        >
          <input
            type="text"
            autoFocus
            placeholder="Brand / Agency Name *"
            className="inputBox"
            required
            name="customerName"
            value={inputs?.customerName}
            onChange={(e) => {
              handleChange(e);
            }}
          />

          {/* Address Fields */}
          <input
            type="text"
            placeholder="Address Line 1"
            className="inputBox col-span-2"
            name="address"
            value={inputs?.address}
            onChange={(e) => {
              handleChange(e);
            }}
          />

          <input
            type="text"
            placeholder="Address Line 2"
            className="inputBox col-span-2"
            name="address1"
            value={inputs?.address1}
            onChange={(e) => {
              handleChange(e);
            }}
          />

          <input
            type="text"
            placeholder="City, State"
            className="inputBox"
            name="address2"
            value={inputs?.address2}
            onChange={(e) => {
              handleChange(e);
            }}
          />

          <input
            type="text"
            placeholder="ZIP / Pincode"
            className="inputBox"
            name="address3"
            value={inputs?.address3}
            onChange={(e) => {
              handleChange(e);
            }}
          />
          <input
            type="email"
            placeholder="Email Address"
            className="inputBox"
            name="customerEmail"
            value={inputs?.customerEmail}
            onChange={(e) => {
              handleChange(e);
            }}
          />
          <input
            type="text"
            placeholder="Mobile Number"
            className="inputBox"
            name="customerPhone"
            value={inputs?.customerPhone}
            onChange={(e) => {
              handlePhoneChange(e);
            }}
          />

          {/* Tax / ID Fields */}
          <input
            type="text"
            placeholder="GST Number"
            className="inputBox"
            name="gst"
            value={inputs?.gst}
            onChange={(e) => {
              handleChange(e);
            }}
          />
          <input
            type="text"
            placeholder="PAN Number"
            className="inputBox"
            name="pan"
            value={inputs?.pan}
            onChange={(e) => {
              handleChange(e);
            }}
          />
          <input
            type="text"
            placeholder="TIN Number"
            className="inputBox"
            name="tin"
            value={inputs?.tin}
            onChange={(e) => {
              handleChange(e);
            }}
          />
          <input
            type="text"
            placeholder="CIN Number"
            className="inputBox"
            name="cin"
            value={inputs?.cin}
            onChange={(e) => {
              handleChange(e);
            }}
          />

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
