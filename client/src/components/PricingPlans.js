import React, { useEffect } from "react";
import { Check } from "lucide-react";
import Footer1 from "./Footer1";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "./Constant";

const plans = [
  {
    name: "Free",
    price: "0",
    days: "month",
    description: "Ideal for individuals and freelancers starting out.",
    features: [
      "Up to 20 invoices/month",
      "Basic invoice templates",
      "Custom logo",
      "Inventory management",
      "Email support",
    ],
    button: "Start for Free",
    highlight: false,
  },
  {
    name: "Standard",
    price: "499",
    days: "month",
    description: "Perfect for small businesses.",
    features: [
      "Unlimited invoices",
      "Custom logo & branding",
      "Send message to customers",
      "Create and manage invoices",
      "Inventory management",
    ],
    button: "Choose Standard",
    highlight: true,
  },
  {
    name: "Pro",
    price: "4999",
    days: "year",
    description: "Advanced features for growing businesses.",
    features: [
      "All Standard features",
      "Settle Payments",
      "Automated reports",
      "Schedule reports",
      "Email support",
    ],
    button: "Go Pro",
    highlight: false,
  },
];

const PricingPlans = () => {
  const navigate = useNavigate();

  //const url = "http://localhost:5001";
  const url = BASE_URL;

  const loadRazorpay = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment1 = async (plan) => {
    const res = await loadRazorpay(
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    // Create order on backend
    const order = await axios.post(url + "/create-order", {
      amount: plan.price, // ₹499
    });

    const options = {
      key: "rzp_test_kkMM3XGefJOEFm", // from Razorpay dashboard
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
        name: "Virendra Singh",
        email: "virendra@example.com",
        contact: "8095528424",
      },
      theme: {
        color: "#3399cc",
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  useEffect(() => {
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

      <section className="bg-gray-50 py-12 px-1 px-2 mt-20">
        <div className="w-full lg:max-w-5xl mx-auto text-center px-4 lg:px-0">
          <h2 className="text-2xl lg:text-4xl font-bold text-gray-800 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-sm lg:text-md text-gray-600 mb-10">
            Simple pricing for every stage of your business.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`rounded-3xl p-8 shadow-lg border transition hover:scale-105 ${
                  plan.highlight
                    ? "bg-white border-blue-600 ring-2 ring-blue-500"
                    : "bg-white border-gray-200"
                }`}
              >
                <h3 className="text-lg lg:text-xl font-bold text-gray-800">
                  {plan.name}
                </h3>
                <p className="text-2xl lg:text-3xl font-extrabold text-blue-600 mt-4 mb-2">
                  ₹{plan.price}/{plan.days}
                </p>
                <p className="text-gray-500 text-sm mb-6">{plan.description}</p>

                <ul className="text-left mb-6 space-y-2">
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-gray-700"
                    >
                      <Check className="text-green-500 w-4 h-4" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePayment1(plan)}
                  className={`w-full py-2 rounded-xl font-semibold ${
                    plan.highlight
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {plan.button}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer1 />
    </div>
  );
};

export default PricingPlans;
