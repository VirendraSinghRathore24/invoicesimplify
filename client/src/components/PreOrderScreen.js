import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header1 from "./Header1";
import { BASE_URL } from "./Constant";
import axios from "axios";

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
        console.log("Payment ID:", response.razorpay_payment_id);
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
