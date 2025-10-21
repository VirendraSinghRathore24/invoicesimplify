import React, { useEffect } from "react";
import { Check } from "lucide-react";
import Footer1 from "./Footer1";
import { NavLink, useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Free",
    price: "0",
    days: "month",
    description: "Ideal for individuals and freelancers starting out.",
    features: [
      "Create Unlimited invoices",
      "Dashboard to Manage Invoices",
      "Dowanlodable PDF Invoices",
      "Send Invoices via Email",
      "Mobile Web Support",
      "Free for 1 month only",
    ],
    button: "Start for Free",
    highlight: false,
  },
  {
    name: "Monthly",
    price: "299",
    days: "month",
    description: "Perfect for content creators.",
    features: [
      "Create Unlimited invoices",
      "Dashboard to Manage Invoices",
      "Dowanlodable PDF Invoices",
      "Send Invoices via Email",
      "Payment Reminders",
      "Mobile Web Support",
    ],
    button: "Choose Standard",
    highlight: true,
  },
  {
    name: "Yearly",
    price: "2999",
    days: "year",
    description: "Perfect for content creators.",
    features: [
      "Create Unlimited invoices",
      "Dashboard to Manage Invoices",
      "Dowanlodable PDF Invoices",
      "Send Invoices via Email",
      "Payment Reminders",
      "Mobile Web Support",
    ],
    button: "Choose Standard",
    highlight: false,
  },
];

const PricingPlans = () => {
  const navigate = useNavigate();

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
              width={125}
              loading="lazy"
            />
          </NavLink>
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
