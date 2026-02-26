import React, { useEffect } from "react";
import { Check } from "lucide-react";
import Footer1 from "./Footer1";
import { NavLink, useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Free",
    price: "0",
    days: "",
    description: "Perfect for content creators.",
    features: [
      "Create 10 invoices",
      "Dashboard to Manage Invoices",
      "Download PDF Invoices",
      "Send Invoices via Email",
      "Mobile Web Support",
    ],
    button: "Start for Free",
    isFreePlan: true,
    highlight: false,
  },
  {
    name: "Standard",
    price: "99",
    days: "",
    description: "Perfect for content creators.",
    features: [
      "Create 25 invoices",
      "Dashboard to Manage Invoices",
      "Download PDF Invoices",
      "Send Invoices via Email",
      "Payment Reminders",
      "Mobile Web Support",
    ],
    button: "Choose Standard",
    isFreePlan: false,
    highlight: true,
  },
  {
    name: "Premium",
    price: "349",
    days: "",
    description: "Perfect for content creators.",
    features: [
      "Create 100 invoices",
      "Dashboard to Manage Invoices",
      "Download PDF Invoices",
      "Send Invoices via Email",
      "Payment Reminders",
      "Mobile Web Support",
    ],
    button: "Choose Premium",
    isFreePlan: false,
    highlight: false,
  },
];

const PricingPlans = () => {
  const navigate = useNavigate();
  const planName = localStorage.getItem("subscription");

  const handlePayment1 = async (plan) => {
    navigate("/preorder", { state: { plan: plan } });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <header className="bg-white dark:bg-gray-800 shadow-md fixed top-0 left-0 w-full z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <NavLink
            to={"/"}
            className="text-xl font-bold text-indigo-600 dark:text-white"
          >
            <img
              src="../../images/invlogo2.png"
              alt="Logo"
              width={85}
              loading="lazy"
            />
          </NavLink>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/creator/createinvoice")}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition"
            >
              Create Invoice
            </button>
          </div>
        </div>
      </header>

      <section className="bg-gray-50 py-12 px-1 px-2 mt-20">
        <div className="w-full lg:max-w-5xl mx-auto text-center px-4 lg:px-0">
          <h2 className="text-2xl lg:text-4xl font-bold text-gray-800 mb-4 tracking-wide">
            Choose Your Plan
          </h2>
          <p className="text-sm lg:text-md text-gray-600 mb-10 tracking-wide">
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
                <h3 className="text-lg md:text-xl font-semibold tracking-tight text-gray-800">
                  {plan.name}
                </h3>

                <p className="text-2xl lg:text-3xl font-extrabold text-blue-600 mt-4 mb-2">
                  ₹{plan.price}
                </p>

                <p className="text-gray-600 text-[13px] tracking-wide mb-6">
                  {plan.description}
                </p>

                <ul className="text-left mb-6 space-y-2">
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-gray-700 tracking-wide"
                    >
                      <Check className="text-green-500 w-4 h-4" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* ---- Button Section ---- */}
                {plan.isFreePlan ? (
                  <button
                    disabled
                    className="w-full py-2 rounded-xl font-semibold bg-yellow-600 text-white cursor-not-allowed"
                  >
                    {planName === "Free" ? "Current Plan" : "Thanks !!!"}
                  </button>
                ) : planName === plan.name ? (
                  <button
                    onClick={() => handlePayment1(plan)}
                    className="w-full py-2 rounded-xl font-semibold bg-green-600 text-white cursor-pointer tracking-wide"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handlePayment1(plan)}
                    className={`w-full py-2 rounded-xl font-semibold tracking-wide ${
                      plan.highlight
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {plan.button}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPlans;
