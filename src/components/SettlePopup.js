import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";

const SettlePopup = ({ handleCloseSettlePopup }) => {
  const [amount, setAmount] = useState(0);
  const [advance, setAdvance] = useState(0);
  const [balance, setBalance] = useState(0);
  const [docId, setDocId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState();
  const [payment, setPayment] = useState();

  const handleSettleChange = (e) => {
    const val = e.target.value;
    setPayment(val);
  };

  const handleSettlePayment = async (e) => {
    e.preventDefault();

    if (parseInt(payment) > parseInt(balance)) {
      alert("Settle amount can not be more than remaining balance !!!");
      return;
    }

    await updateInvoiceInfo();
    await updateInvoiceLinkInfo();

    // Close popup
    handleCloseSettlePopup();
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
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center ">
      <div className="overflow-auto mt-6 bg-white p-4 text-black rounded-xl w-3/12">
        <div className="flex justify-between py-2">
          <div className=" text-lg font-bold">Settle Payment</div>
          <button onClick={handleCloseSettlePopup}>
            <X size={30} />
          </button>
        </div>
        <hr />
        <form onSubmit={handleSettlePayment}>
          <div className="flex justify-end font-bold text-lg">
            Invoice : {invoiceNumber}
          </div>
          <div className="flex flex-col gap-y-4 p-4">
            <div className="flex justify-evenly">
              <div>Amount : </div>
              <div>₹ {amount}</div>
            </div>
            <div className="flex justify-evenly">
              <div>Advance : </div>
              <div>₹ {advance}</div>
            </div>
            <div className="flex justify-evenly">
              <div>Balance : </div>
              <div>₹ {balance}</div>
            </div>
            <div className="flex justify-evenly">
              <div>Settle : </div>
              <div className="mx-auto flex gap-x-2">
                <div className="text-md font-bold mt-1">₹ </div>
                <input
                  className="form-input text-md font-bold block rounded border border-gray-400 py-2 px-4 leading-5"
                  pattern="^[0-9]*$"
                  name="payment"
                  required
                  autoFocus
                  value={payment}
                  onChange={handleSettleChange}
                />
              </div>
            </div>
          </div>
          <hr />
          <div className="flex justify-between mt-2">
            <button
              onClick={handleCloseSettlePopup}
              className=" border-[1.4px] border-black text-black py-2 px-6 font-semibold rounded-md text-richblack-700 hover:scale-110 transition duration-300 ease-in cursor-pointer "
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#444] border-[1.4px] border-gray-400 text-white py-2 px-6 font-semibold rounded-md text-richblack-700 hover:scale-110 transition duration-300 ease-in cursor-pointer "
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettlePopup;
