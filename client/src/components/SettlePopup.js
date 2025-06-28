import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import Loader from "./Loader";

const SettlePopup = ({ handleCloseSettlePopup }) => {
  const [amount, setAmount] = useState(0);
  const [advance, setAdvance] = useState(0);
  const [balance, setBalance] = useState(0);
  const [docId, setDocId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState();
  const [payment, setPayment] = useState();
  const [loading, setLoading] = useState(false);

  const handleSettleChange = (e) => {
    const val = e.target.value;
    setPayment(val);
  };

  const handleSettlePayment = async (e) => {
    try {
      setLoading(true);

      e.preventDefault();

      if (parseInt(payment) > parseInt(balance)) {
        alert("Settle amount can not be more than remaining balance !!!");
        document.querySelector('input[name="payment"]').focus();
        setLoading(false);
        return;
      }

      await updateInvoiceInfo();
      await updateInvoiceLinkInfo();

      // Close popup
      handleCloseSettlePopup();
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const updateInvoiceInfo = async () => {
    // Update advance and balance in the database
    const updatedAdvance = parseInt(advance) + parseInt(payment);
    const updatedBalance = parseInt(balance) - parseInt(payment);

    const codeDoc = doc(db, "Invoice_Info", docId);
    await updateDoc(codeDoc, {
      "amountInfo.advance": updatedAdvance,
      "taxCalculatedInfo.balance": updatedBalance,
      "invoiceInfo.settledDate": new Date().toISOString().slice(0, 10),
    });

    // update dashboard info back
    await getUpdatedInvoiceInfo();
  };

  const invoiceInfo_CollectionRef = collection(db, "Invoice_Info");
  const getUpdatedInvoiceInfo = async () => {
    const data = await getDocs(invoiceInfo_CollectionRef);
    const filteredData = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    const loggedInUser = localStorage.getItem("user");
    const invoiceInfo = filteredData.filter(
      (x) => x.loggedInUser === loggedInUser
    );
    localStorage.setItem("dashboardInfo", JSON.stringify(invoiceInfo));
  };

  const updateInvoiceLinkInfo = async () => {
    const invoiceLinkInfo_CollectionRef = collection(db, "Invoice_LinkInfo");
    const data = await getDocs(invoiceLinkInfo_CollectionRef);
    const filteredData = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    const linkInfo = filteredData.filter(
      (x) => x.invoiceInfo.invoiceNumber === invoiceNumber
    )[0];

    // Update advance and balance in the database
    const updatedAdvance = parseInt(advance) + parseInt(payment);
    const updatedBalance = parseInt(balance) - parseInt(payment);

    const codeDoc = doc(db, "Invoice_LinkInfo", linkInfo.id);
    await updateDoc(codeDoc, {
      "amountInfo.advance": updatedAdvance,
      "taxCalculatedInfo.balance": updatedBalance,
    });
  };

  useEffect(() => {
    const settleInfo = JSON.parse(localStorage.getItem("settleInfo"));
    setAmount(settleInfo.amount);
    setBalance(settleInfo.balance);
    setAdvance(settleInfo.advance);
    setDocId(settleInfo.docid);
    setInvoiceNumber(settleInfo.invoicenumber);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center">
      <div className="w-full max-w-md mx-4 bg-white dark:bg-gray-900 text-black dark:text-white rounded-xl shadow-xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">💰 Settle Payment</h2>
          <button
            onClick={handleCloseSettlePopup}
            className="text-gray-600 hover:text-red-500"
          >
            <X size={28} />
          </button>
        </div>

        <hr className="mb-4 border-gray-300 dark:border-gray-700" />

        {/* Invoice Info */}
        <div className="text-right font-medium text-gray-700 dark:text-gray-300 mb-2">
          Invoice: <span className="font-bold">{invoiceNumber}</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSettlePayment} className="space-y-5">
          {/* Summary */}
          <div className="grid gap-3 text-md">
            <div className="flex justify-between">
              <span>Amount:</span>
              <span className="font-semibold">₹ {amount}</span>
            </div>
            <div className="flex justify-between">
              <span>Advance:</span>
              <span className="font-semibold">₹ {advance}</span>
            </div>
            <div className="flex justify-between">
              <span>Balance:</span>
              <span className="font-semibold text-red-600 dark:text-red-400">
                ₹ {balance}
              </span>
            </div>
          </div>

          {/* Input */}
          <div>
            <label htmlFor="payment" className="block text-sm mb-1 font-medium">
              Settle Amount
            </label>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">₹</span>
              <input
                id="payment"
                name="payment"
                type="text"
                pattern="^[0-9]*$"
                required
                autoFocus
                value={payment}
                onChange={handleSettleChange}
                className="w-full border border-gray-400 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCloseSettlePopup}
              className="px-5 py-2 rounded-md border border-gray-500 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              Save
            </button>
          </div>
        </form>
      </div>

      {/* Loader */}
      {loading && <Loader />}
    </div>
  );
};

export default SettlePopup;
