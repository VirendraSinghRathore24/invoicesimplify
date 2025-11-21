import { addDoc, collection, doc, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../../config/firebase";
import { CREATORS } from "../Constant";

const EditBrandModal = ({ isOpen, onClose, onSave, editData }) => {
  const [formData, setFormData] = useState({
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

  useEffect(() => {
    if (editData) setFormData(editData?.customerInfo);
    return () => {
      setFormData("");
    };
  }, [editData]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const customerInfo = editData?.customerInfo;

  // const [inputs, setInputs] = useState({});

  // const handlePhoneChange = (event) => {
  //   const { name, value } = event.target;
  //   if (/^\d{0,10}$/.test(value)) {
  //     // Allow only numeric values up to 10 digits
  //     setInputs((values) => ({ ...values, [name]: value }));
  //   }
  // };

  const handleSave = () => {
    if (!formData) return;
    onSave(formData);
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 lg:left-64">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-xl border p-6 animate-fadeIn">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Update Brand\Agency
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
            value={formData?.customerName}
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
            value={formData?.address}
            onChange={(e) => {
              handleChange(e);
            }}
          />

          <input
            type="text"
            placeholder="Address Line 2"
            className="inputBox col-span-2"
            name="address1"
            value={formData?.address1}
            onChange={(e) => {
              handleChange(e);
            }}
          />

          <input
            type="text"
            placeholder="City, State"
            className="inputBox"
            name="address2"
            value={formData?.address2}
            onChange={(e) => {
              handleChange(e);
            }}
          />

          <input
            type="text"
            placeholder="ZIP / Pincode"
            className="inputBox"
            name="address3"
            value={formData?.address3}
            onChange={(e) => {
              handleChange(e);
            }}
          />
          <input
            type="email"
            placeholder="Email Address"
            className="inputBox"
            name="customerEmail"
            value={formData?.customerEmail}
            onChange={(e) => {
              handleChange(e);
            }}
          />
          <input
            type="text"
            placeholder="Mobile Number"
            className="inputBox"
            name="customerPhone"
            value={formData?.customerPhone}
            onChange={(e) => {
              handleChange(e);
            }}
          />

          {/* Tax / ID Fields */}
          <input
            type="text"
            placeholder="GST Number"
            className="inputBox"
            name="gst"
            value={formData?.gst}
            onChange={(e) => {
              handleChange(e);
            }}
          />
          <input
            type="text"
            placeholder="PAN Number"
            className="inputBox"
            name="pan"
            value={formData?.pan}
            onChange={(e) => {
              handleChange(e);
            }}
          />
          <input
            type="text"
            placeholder="TIN Number"
            className="inputBox"
            name="tin"
            value={formData?.tin}
            onChange={(e) => {
              handleChange(e);
            }}
          />
          <input
            type="text"
            placeholder="CIN Number"
            className="inputBox"
            name="cin"
            value={formData?.cin}
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
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBrandModal;
