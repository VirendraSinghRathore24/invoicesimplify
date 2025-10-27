import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header1 from "./Header1";
import { BASE_URL, CREATORS, LOGIN_INFO } from "./Constant";
import axios from "axios";
import { db } from "../config/firebase";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

const PlanSummaryWithDiscount = () => {
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const location = useLocation();
  const plan = location.state.plan;

  // Example coupon list (can later be fetched from your backend)
  const coupons = {
    SAVE10: { type: "percent", value: 15 },
  };

  const handleApplyCoupon = () => {
    const entered = coupon.trim().toUpperCase();
    const found = coupons[entered];

    if (!found) {
      setMessage("❌ Invalid coupon code");
      setDiscount(0);
      return;
    }

    let discountValue = 0;
    if (found.type === "percent") {
      discountValue = (plan.price * found.value) / 100;
    } else {
      discountValue = found.value;
    }

    setDiscount(discountValue);
    setMessage(`✅ Coupon applied! You saved ₹${discountValue}`);
  };

  const handleRemoveCoupon = () => {
    setCoupon("");
    setDiscount(0);
    setMessage("");
  };

  const finalTotal = Math.max(Math.floor(plan.price - discount), 0);

  const url = BASE_URL;

  const email = localStorage.getItem("user");
  const name = localStorage.getItem("userName");

  const loadRazorpay = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleProceed = async () => {
    const res = await loadRazorpay(
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    // Create order on backend
    const order = await axios.post(url + "/create-order", {
      amount: finalTotal, // ₹499
    });

    const options = {
      key: process.env.RAZORPAY_KEY, // from Razorpay dashboard
      amount: order.data.amount,
      currency: "INR",
      name: "Invoice Simplify",
      description: plan.name + " Plan",
      image: "/logo.png",
      order_id: order.data.id,
      handler: function (response) {
        // update login db with plan details
        updateLoginDBForPlanDetail(plan.name);
        // update cache
        localStorage.setItem("isFreePlan", false);
        localStorage.setItem("subscription", plan.name);
        localStorage.setItem(
          "subStartDate",
          new Date().toISOString().slice(0, 10)
        );

        // update payment history db
        updatePaymentHistory(response);

        // Navigate to success page with order details
        navigate("/success", {
          state: {
            order: response,
            plan: plan, // Pass the selected plan details
          },
        });
      },
      prefill: {
        name: name,
        email: email,
        //contact: "8095528424",
      },
      theme: {
        color: "#3399cc",
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  const login_CollectionRef = collection(db, LOGIN_INFO);
  const updateLoginDBForPlanDetail = async (planName) => {
    const data = await getDocs(login_CollectionRef);
    const filteredData = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    const loggedInUser = localStorage.getItem("user");
    const loginInfo = filteredData.filter((x) => x.code === loggedInUser)[0];

    const codeDoc = doc(db, LOGIN_INFO, loginInfo.id);
    await updateDoc(codeDoc, {
      subscription: planName,
      subStarts: new Date().toISOString().slice(0, 10),
      subEnds: getNextDate(planName),
    });
  };

  const getNextDate = (planName) => {
    const oldEndDate = localStorage.getItem("subEndDate");
    const today = new Date().toISOString().slice(0, 10);
    let remainingDays = 0;
    if (oldEndDate && oldEndDate > today) {
      const date1 = new Date(today);
      const date2 = new Date(oldEndDate);
      const diffTime = Math.abs(date2 - date1);
      remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    if (planName === "Monthly") {
      const date = new Date();
      date.setDate(date.getDate() + 30 + remainingDays);
      const nextDate = date.toISOString().slice(0, 10);
      localStorage.setItem("subEndDate", nextDate);
      return nextDate;
    } else if (planName === "Yearly") {
      const date = new Date();
      date.setDate(date.getDate() + 365 + remainingDays);
      const nextDate = date.toISOString().slice(0, 10);
      localStorage.setItem("subEndDate", nextDate);
      return nextDate;
    }
  };

  const updatePaymentHistory = async (response) => {
    const paymentHistory_CollectionRef = collection(
      doc(db, CREATORS, localStorage.getItem("uid")),
      "Payment_History"
    );

    await addDoc(paymentHistory_CollectionRef, {
      planName: plan.name,
      amountPaid: finalTotal,
      paymentDate: new Date().toISOString().slice(0, 10),
      planStartsDate: new Date().toISOString().slice(0, 10),
      planEndsDate: localStorage.getItem("subEndDate"),
      razorpayPaymentId: response.razorpay_payment_id,
      loggedInUser: localStorage.getItem("user"),
    });
  };

  return (
    <div>
      <Header1 />

      <div className="max-w-md mx-auto bg-white shadow-lg rounded-2xl p-6 mt-28 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Plan Summary
        </h2>

        {/* Plan details */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <h3 className="text-lg font-semibold text-blue-700 mb-2">
            {plan.name}
          </h3>
          {plan.features.length > 0 && (
            <ul className="list-disc list-inside text-gray-700 text-sm mb-2">
              {plan.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Discount Section */}
        <div className="mb-3">
          <label className="block text-gray-700 text-sm mb-1">
            Have a coupon?
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter coupon code"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              onClick={handleApplyCoupon}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Apply
            </button>
          </div>
          {message && (
            <p
              className={`text-sm mt-2 ${
                message.includes("✅") ? "text-green-600" : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}
          {discount > 0 && (
            <button
              onClick={handleRemoveCoupon}
              className="text-sm text-red-600 mt-1 underline"
            >
              Remove coupon
            </button>
          )}
        </div>

        {/* Final amount summary */}
        <div className="border-t border-gray-200 mt-4 pt-3">
          <div className="flex justify-between text-gray-700 mb-1">
            <span>Subtotal:</span>
            <span>₹{plan.price}</span>
          </div>
          <div className="flex justify-between text-gray-700 mb-1">
            <span>Discount:</span>
            <span className="text-green-600">- ₹{discount}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg text-gray-800">
            <span>Total:</span>
            <span className="text-blue-600">₹{finalTotal}</span>
          </div>
        </div>

        <div className="flex justify-between gap-16">
          <button
            onClick={() => navigate(-1)}
            className="w-full mt-5 bg-blue-600 hover:bg-yellow-700 text-white font-medium py-2 rounded-lg transition-all"
          >
            Back
          </button>
          <button
            onClick={handleProceed}
            className="w-full mt-5 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-all"
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanSummaryWithDiscount;
