import React, { useEffect } from "react";
import { Check, Sparkles, Rocket, Zap, ShieldCheck } from "lucide-react";
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
    <div className="bg-[#F8FAFC] min-h-screen font-sans">
      {/* --- Elegant Header with Glassmorphism --- */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 fixed top-0 left-0 w-full z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <NavLink
            to={"/"}
            className="transition-transform hover:scale-105 active:scale-95"
          >
            <img
              src="../../images/invlogo2.png"
              alt="Logo"
              width={90}
              className="object-contain"
            />
          </NavLink>

          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate("/creator/createinvoice")}
              className="group relative px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-2xl overflow-hidden transition-all hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">
                Create Invoice <Zap size={14} className="fill-current" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>
      </header>

      {/* --- Pricing Section --- */}
      <section className="pt-32 pb-24 px-6 relative">
        {/* Subtle Background Glow */}
        <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-100/40 rounded-full blur-[120px] -z-10" />

        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-blue-100">
            <Sparkles size={12} /> Flexible Billing
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4 tracking-tighter">
            Choose Your <span className="text-blue-600">Plan</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto mb-16 leading-relaxed">
            From solo influencers to scaling agencies. No hidden fees, just
            simple scaling.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative group rounded-[2.5rem] p-10 transition-all duration-500 hover:-translate-y-2 ${
                  plan.highlight
                    ? "bg-white shadow-[0_30px_70px_-10px_rgba(59,130,246,0.15)] border-2 border-blue-500 ring-4 ring-blue-50"
                    : "bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)] hover:border-blue-100"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-[10px] font-black rounded-full shadow-lg shadow-blue-600/30 uppercase tracking-widest">
                    Most Popular
                  </div>
                )}

                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  {plan.name}
                </h3>

                <div className="mt-6 mb-2 flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-black text-slate-900 tracking-tight">
                    ₹{plan.price}
                  </span>
                  <span className="text-slate-400 text-sm font-medium">
                    /month
                  </span>
                </div>

                <p className="text-slate-500 text-sm mb-8 leading-relaxed h-12">
                  {plan.description}
                </p>

                <div className="h-px w-full bg-slate-100 mb-8" />

                <ul className="text-left mb-10 space-y-4">
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-slate-600 text-sm font-medium"
                    >
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                        <Check className="text-emerald-500 w-3 h-3 stroke-[3]" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* --- Action Buttons --- */}
                {plan.isFreePlan ? (
                  <button className="w-full py-4 rounded-2xl font-bold bg-slate-100 text-slate-400 cursor-not-allowed text-sm">
                    {planName === "Free" ? "Active Now" : "Standard Access"}
                  </button>
                ) : planName === plan.name ? (
                  <button className="w-full py-4 rounded-2xl font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center gap-2 text-sm shadow-sm">
                    <ShieldCheck size={18} /> Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handlePayment1(plan)}
                    className={`w-full py-4 rounded-2xl font-bold text-sm transition-all duration-300 ${
                      plan.highlight
                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20"
                        : "bg-slate-900 text-white hover:bg-slate-800"
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
