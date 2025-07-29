import confetti from "canvas-confetti";
import React, { useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer1 from "./Footer1";

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { order, plan } = location.state;
  console.log(order);
  const date = new Date().toString();
  useEffect(() => {
    confetti({
      particleCount: 500,
      spread: 75,
    });

    window.scrollTo(0, 0);
  }, []);
  return (
    <div>
      <header className="bg-white dark:bg-gray-800 shadow-md fixed top-0 left-0 w-full z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-indigo-600 dark:text-white">
            InvoiceSimplify
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/createinvoice")}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition"
            >
              Create Invoice
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-col text-center w-full mx-auto h-full quicksand-bold mt-20">
        <div className="flex flex-col gap-y-4 text-black mt-8 w-full md:w-5/12 mx-auto justify-center">
          <div className=" text-lg lg:text-[36px] font-bold">
            Payment Successful! 🎉
          </div>
          <div className="text-sm lg:text-[18px] text-left p-4">
            Thank you for your purchase! Your payment has been successfully
            processed.
          </div>
          <div className="text-lg lg:text-[20px] font-bold text-left p-4">
            Order Details:
          </div>
          <div className="text-sm font-semibold text-left px-4">
            <div>
              ✅ Order ID:{" "}
              <span className="font-normal"> {order.razorpay_payment_id} </span>
            </div>
            <div className="mt-2">
              ✅ Amount Paid:{" "}
              <span className="font-normal"> ₹{plan.price}</span>
            </div>
            <div className="mt-2">
              ✅ Plan Type:{" "}
              <span className="font-normal"> {plan.name} Plan </span>
            </div>
            <div className="mt-2">
              ✅ Date: <span className="font-normal"> {date}</span>
            </div>
          </div>
          <NavLink
            className="bg-[#FF5721] mt-10 flex justify-center mx-auto text-lg text-white py-2 md:py-4 px-4 md:px-8 font-semibold rounded-md text-richblack-700 hover:border-2 hover:border-[#FF5721] hover:bg-white hover:text-[#FF5721]"
            to={"/createinvoice"}
          >
            Create Your Invoice
          </NavLink>
        </div>
      </div>
      <Footer1 />
    </div>
  );
};

export default Success;
