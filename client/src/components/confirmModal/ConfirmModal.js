// ConfirmModal.js
import React from "react";

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
