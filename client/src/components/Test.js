import React, { useState } from "react";
import {
  Check,
  ArrowRight,
  Sparkles,
  Shield,
  Star,
  Wand2,
  MoveUpRight,
  MousePointer2,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Mail,
  Download,
  PieChart,
  Globe,
  PenTool,
  ShieldCheck,
  Zap,
  Smartphone,
  SendHorizontal,
  CircleX,
  Repeat,
  CreditCard,
  BellRing,
  Globe2,
  LayoutDashboard,
  Quote,
  HelpCircle,
  MessageCircle,
  Send,
  MessageSquare,
} from "lucide-react";
import Footer1 from "./Footer1";
import { toast } from "react-toastify";
import { addDoc, collection, doc } from "firebase/firestore";
import { CREATORS } from "./Constant";
import { db } from "../config/firebase";
import { create } from "canvas-confetti";
import { useNavigate } from "react-router-dom";
import PricingPlans from "./PricingPlans";
import FAQItem from "./FAQItem";

const Home = () => {
  const navigate = useNavigate();
  const testimonials = [
    {
      name: "Sanju Shekhawat",
      title: "Content Creator",
      quote:
        "I was tired of messy invoice formats. This app helped me look more professional and save time.",
      image: "../images/sanju.png",
    },
    {
      name: "Soniya Pachauri",
      title: "Content Creator",
      quote:
        "Super simple and mobile-friendly! I love how intuitive it is. Invoicing is no longer a chore.",
      image: "../images/soniya.png",
    },
    {
      name: "Amit Rathore",
      title: "Startup Business Owner",
      quote:
        "This tool made my invoicing 10x faster. I can now send branded invoices to my clients within minutes!",
      image: "../images/amit.png",
    },
  ];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Add form submission logic here (e.g., send to backend or email)
    await addContactUsDataToDB();
    toast("Thank you for contacting us!");
    setFormData({ name: "", email: "", message: "" });
  };

  const addContactUsDataToDB = async () => {
    const uid = localStorage.getItem("uid");
    const contactInfo_CollectionRef = collection(db, "Contact_US");
    await addDoc(contactInfo_CollectionRef, {
      contactData: formData,
      messageDate: new Date().toISOString().slice(0, 10),
    });
  };

  const gstDashboard = () => {
    const user = localStorage.getItem("user");

    if (!user || user === "undefined" || user === "null") {
      navigate("/login");
    } else {
      navigate("/gst/sellerdashboard");
    }
  };
  const createInvoice = () => {
    const user = localStorage.getItem("user");

    if (!user || user === "undefined" || user === "null") {
      navigate("/login");
    } else {
      navigate("/creator/createinvoice");
    }
  };

  const tryWithoutLogin = () => {
    localStorage.setItem("user", "demo_user");
    navigate("/creator/createinvoice");
  };

  const [invoiceData, setInvoiceData] = useState({
    name: "Virendra Singh",
    address: "14, Bhartiya City,",
    address1: "Bengaluru, Karnataka - 560087",
    email: "abcd1234@gmail.com",
    mobile: "9876543210",
    social: "@virendra_singh",
    clientName: "ABC Company Pvt Ltd",
    clientAddress: "44, Saradaroad, MI Palaza",
    clientAddress1: "Jaipur, Rajasthan - 302001",
    clientGST: "22ACDFG88776654",
    items: [
      { desc: "Reel", rate: 5000, qty: 3 },
      { desc: "Story", rate: 3000, qty: 1 },
    ],
    bankName: "HDFC Bank",
    accNo: "123456678976",
    ifsc: "HDFC00000238",
  });

  const features = [
    {
      title: "Branded Invoices",
      icon: <Zap className="text-blue-600" />,
      desc: "Custom themes that match your brand.",
    },
    {
      title: "Email PDF",
      icon: <Mail className="text-indigo-600" />,
      desc: "Direct delivery to your client's inbox.",
    },
    {
      title: "Download PDF",
      icon: <Download className="text-slate-600" />,
      desc: "Offline copies for your records.",
    },
    {
      title: "Track Payments",
      icon: <PieChart className="text-emerald-600" />,
      desc: "Visual insights into your cash flow.",
    },
    {
      title: "Pro Dashboard",
      icon: <CheckCircle2 className="text-blue-500" />,
      desc: "Manage all brand deals in one view.",
    },
    {
      title: "Multi-Currency",
      icon: <Globe className="text-purple-600" />,
      desc: "Get paid in USD, INR, or GBP.",
    },
    {
      title: "Digital Signatures",
      icon: <PenTool className="text-orange-600" />,
      desc: "Legally binding e-signatures built-in.",
    },
    {
      title: "Data Privacy",
      icon: <ShieldCheck className="text-emerald-500" />,
      desc: "Bank-grade encryption for your data.",
    },
  ];
  const advancedFeatures = [
    {
      title: "Recurring Invoices",
      icon: <Repeat className="text-indigo-600" />,
      desc: "Set it and forget it for monthly retainers.",
    },
    {
      title: "Smart Payment Status",
      icon: <CreditCard className="text-emerald-600" />,
      desc: "One-click updates from Pending to Paid.",
    },
    {
      title: "Automated Reminders",
      icon: <BellRing className="text-amber-500" />,
      desc: "Gently nudge brands when a payment is due.",
    },
    {
      title: "Global Currency",
      icon: <Globe2 className="text-blue-600" />,
      desc: "Bill in USD, INR, or GBP with ease.",
    },
    {
      title: "Stunning Dashboard",
      icon: <LayoutDashboard className="text-purple-600" />,
      desc: "Visual analytics for your creator income.",
    },
    {
      title: "Cloud Accessibility",
      icon: <Smartphone className="text-slate-600" />,
      desc: "Your data is synced and ready on any device.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: "How do I deliver my invoices?",
      a: "Generate a professional PDF for local records or use our one-click 'Direct-to-Brand' email feature. Your clients receive a branded, secure link to view and pay.",
    },
    {
      q: "Can I bill while on a creator shoot?",
      a: "Absolutely. InvoiceSimplify is a cloud-native progressive app. Whether you're on an iPhone, Android, or iPad, the dashboard is fully optimized for mobile creators on the go.",
    },
    {
      q: "How does the payment tracking work?",
      a: "Your central dashboard acts as a financial command center. It automatically categorizes invoices as 'Paid', 'Pending', or 'Overdue', giving you a real-time pulse on your business.",
    },
    {
      q: "Is international billing supported?",
      a: "Yes! Scale your creator business globally. We support all major currencies including INR, USD, EUR, and GBP with real-time conversion features.",
    },
  ];

  const calculateTotal = () =>
    invoiceData.items.reduce((sum, item) => sum + item.rate * item.qty, 0);

  return (
    <div className="bg-gray-50 text-gray-800">
      {/* HEADER */}
      <header className="flex items-center justify-between px-8 py-4 bg-white shadow fixed top-0 left-0 w-full z-50">
        <div className="flex items-center gap-2">
          <img
            src={"../../images/invlogo2.png"}
            alt="InvoiceSimplify"
            className="h-10"
          />
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => createInvoice()}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
          >
            Start Free
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="px-4 md:px-20 grid md:grid-cols-2  gap-x-4 md:gap-x-14 py-16 md:py-24 mt-20">
        <div className="mb-8">
          <h1 className="text-2xl md:text-5xl font-extrabold leading-tight text-gray-900">
            Create & Send Invoices in
            <p className="text-blue-600">30 Seconds</p>
          </h1>
          <p className="mt-5 text-gray-600 text-base md:text-lg">
            Create & share branded invoices for your brand deals — trusted by
            influencers and creators across world.
          </p>
          <div className="mt-8 flex flex-wrap gap-2 md:gap-4">
            <button
              className="px-4 md:px-8 py-2 md:py-3 bg-blue-600 text-white text-sm md:text-base rounded-xl font-semibold hover:bg-blue-700 transition flex items-center gap-2"
              onClick={() => createInvoice()}
            >
              Create Invoice <ArrowRight size={18} />
            </button>
            <button
              className="px-4 md:px-8 py-2 md:py-3 border border-gray-400 text-sm md:text-base rounded-xl font-semibold hover:bg-gray-200 transition"
              onClick={() =>
                document
                  .getElementById("demo-video")
                  .scrollIntoView({ behavior: "smooth" })
              }
            >
              View Demo
            </button>
            <button
              className="px-4 md:px-8 py-2 md:py-3 border border-gray-400 bg-orange-600 text-white text-sm md:text-base rounded-xl font-semibold hover:bg-orange-700 transition flex items-center gap-2"
              onClick={() => tryWithoutLogin()}
            >
              Try Without Login <MoveUpRight size={18} />
            </button>
          </div>
          <button
            onClick={() => gstDashboard()}
            className="px-6 mt-4 py-2 bg-gray-900 text-white rounded-xl font-medium hover:bg-blue-700 transition"
          >
            GST Dashboard
          </button>
          <div className="mt-10 max-w-5xl mx-auto px-4">
            {/* Header Section */}
            <div className="text-center md:text-left mb-12">
              <span className="bg-indigo-100 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                Command Center
              </span>
              <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                Everything in <span className="text-indigo-600">One View.</span>
              </h2>
              <p className="mt-4 text-gray-500 text-lg max-w-2xl leading-relaxed">
                Ditch the messy spreadsheets. Track every invoice, payment, and
                client interaction through a powerful, real-time dashboard
                designed for growth.
              </p>
            </div>

            {/* Image Container with Modern Styling */}
            <div className="relative group">
              {/* Decorative Background Gradient Blobs */}
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>

              <div className="relative bg-white border border-gray-200 rounded-2xl p-2 shadow-2xl overflow-hidden">
                {/* Top Bar Decoration (Browser Look) */}
                <div className="flex gap-1.5 mb-2 px-4 py-2 border-b border-gray-100">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                </div>

                {/* The Actual Image */}
                <img
                  src="../../images/dashboard.png"
                  alt="Invoice Simplify Dashboard Preview"
                  className="w-full rounded-b-xl object-cover hover:scale-[1.01] transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="p-2 w-full overflow-hidden">
          <div className="relative w-full">
            <div className="absolute -top-6 -right-6 bg-yellow-400 p-3 md:p-4 rounded-2xl shadow-lg z-10">
              <MousePointer2 className="text-white fill-current w-5 h-5 md:w-6 md:h-6" />
              <p className="text-[10px] font-bold text-slate-900">
                LIVE PREVIEW
              </p>
            </div>

            <motion.div
              layout
              className="bg-white border mx-auto rounded-md p-6 md:p-12  min-h-[500px] md:min-h-[800px] origin-top w-full"
              style={{ transform: "scale(0.95)" }}
            >
              <img
                src={"../../images/invlogo2.png"}
                alt="InvoiceSimplify"
                className="h-10"
              />
              {/* Header */}
              <div className="flex justify-between items-start mb-8 mt-2 ">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 leading-tight">
                    {invoiceData.name}
                  </h2>
                  <p className="text-[11px] text-slate-500 w-64 mt-1 leading-relaxed">
                    {invoiceData.address}
                  </p>
                  <p className="text-[11px] text-slate-500 w-64 mt-1 leading-relaxed">
                    {invoiceData.address1}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Mobile: {invoiceData.mobile}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Email: {invoiceData.email}
                  </p>
                </div>
                <div className="text-right">
                  <h1 className="text-[11px] lg:text-2xl font-bold text-slate-400 uppercase tracking-tighter">
                    INVOICE
                  </h1>
                  <p className="text-xs font-bold">121</p>
                </div>
              </div>

              {/* Client Info */}
              <div className="flex justify-between items-end mb-2 pb-4">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase">
                    INVOICE TO
                  </h4>
                  <p className="text-sm font-bold mt-1">
                    {invoiceData.clientName}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {invoiceData.clientAddress}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {invoiceData.clientAddress1}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    GSTIN: {invoiceData.clientGST}
                  </p>
                </div>
                <div className="text-right">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase">
                    DATE
                  </h4>
                  <p className="text-sm font-bold mt-1">Feb 26, 2026</p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left mb-2">
                <thead>
                  <tr className="border-b-2 border-t-2 border-slate-900 text-[10px] uppercase font-black">
                    <th className="py-2">Description</th>
                    <th className="py-2">Rate</th>
                    <th className="py-2">Quantity</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {invoiceData.items.map((item, i) => (
                    <tr
                      key={i}
                      className="border-b border-dashed border-slate-200"
                    >
                      <td className="py-3 font-medium">{item.desc}</td>
                      <td className="py-3">₹{item.rate}</td>
                      <td className="py-3 px-5">{item.qty}</td>
                      <td className="py-3 text-right font-bold">
                        ₹{item.rate * item.qty}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total Row */}
              <div className="flex justify-between items-center bg-slate-50 p-4 border-y-2 border-slate-900 mb-10">
                <span className="font-black text-xs uppercase">TOTAL</span>
                <span className="font-black text-xl">₹{calculateTotal()}</span>
              </div>

              {/* Footer / Bank Info */}
              <div className="flex justify-between">
                <div className="text-[10px] space-y-1">
                  <h4 className="text-slate-400 uppercase mb-2">
                    Account Information
                  </h4>
                  <p>
                    Bank Name:{" "}
                    <span className="font-bold">{invoiceData.bankName}</span>
                  </p>
                  <p>
                    Account Number:{" "}
                    <span className="font-bold">{invoiceData.accNo}</span>
                  </p>
                  <p>
                    IFSC Code:{" "}
                    <span className="font-bold">{invoiceData.ifsc}</span>
                  </p>
                  <p>
                    Account Type: <span className="font-bold">Saving</span>
                  </p>
                  <p>
                    GPay: <span className="font-bold">abcd@okhdfcbank</span>
                  </p>
                </div>
                <div className="text-center">
                  <div
                    className="font-cursive text-3xl text-slate-700 italic opacity-80"
                    style={{ fontFamily: "Dancing Script, cursive" }}
                  >
                    Viren
                  </div>
                  <div className="h-[1px] w-24 bg-slate-900 mx-auto mt-1"></div>
                  <p className="text-[10px] font-bold mt-2">Date Signed</p>
                  <p className="text-[10px]">Feb 26, 2026</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="bg-white py-10 text-center text-gray-500 text-sm">
        Trusted by 500+ Creators, Agencies & Freelancers 🤝
      </section>

      {/* WHY INVOICESIMPLIFY */}
      <section className="px-6 py-24 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto">
          {/* Elegant Header */}
          <div className="text-center mb-16">
            <span className="text-blue-600 font-bold text-xs uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
              Feature-Rich Powerhouse
            </span>
            <h2 className="mt-6 text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Why{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                InvoiceSimplify?
              </span>
            </h2>
            <p className="mt-4 text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
              Everything you need to streamline your creator payments, built for
              the modern digital economy.
            </p>
          </div>

          {/* The Bento-Inspired Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((item, i) => (
              <div
                key={i}
                className="group p-8 bg-white rounded-[2rem] border border-slate-100 hover:border-blue-200 hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-50 transition-all duration-300">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CREATOR BENEFITS */}
      <section className="px-6 py-20 bg-blue-50/30 text-center border-y border-blue-100">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">
            Invoicing Without the Headache
          </h3>
          <p className="text-slate-600 max-w-2xl mx-auto mb-16 text-lg">
            We built
            <span className="text-blue-600 font-bold">Invoice Simplify</span> to
            replace messy folders and manual docs with one clean workflow.
          </p>

          {/* Triple Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 1. Mobile - The Solution */}
            <div className="group bg-white rounded-3xl p-8 shadow-[0_15px_40px_rgba(59,130,246,0.06)] border-2 border-transparent hover:border-blue-500 transition-all duration-300 relative overflow-hidden">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <Smartphone className="text-blue-600 w-12 h-12 stroke-[1.5]" />
                  <Check className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1 w-6 h-6 border-2 border-white" />
                </div>
              </div>
              <h4 className="font-extrabold text-slate-900 text-xl mb-3">
                Mobile Friendly
              </h4>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                Not just a "smaller website." Our interface is fully optimized
                for thumb-navigation so you can bill while on a shoot.
              </p>
            </div>

            {/* 2. No Templates - The Crossing Sign */}
            <div className="bg-white rounded-3xl p-8 shadow-[0_15px_40px_rgba(59,130,246,0.06)] border-2 border-transparent hover:border-red-100 transition-all duration-300">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="opacity-20">
                    <div className="w-12 h-12 border-2 border-slate-300 rounded-lg flex items-center justify-center font-bold text-slate-300 text-xs">
                      DOCX
                    </div>
                  </div>
                  <CircleX className="absolute inset-0 m-auto text-red-500 w-12 h-12 stroke-[2]" />
                </div>
              </div>
              <h4 className="font-extrabold text-slate-900 text-xl mb-3 tracking-tight">
                Zero Templates
              </h4>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                Stop hunting for{" "}
                <span className="line-through text-slate-400 font-normal underline decoration-red-400">
                  old Word docs
                </span>
                . Our smart engine generates professional layouts instantly.
              </p>
            </div>

            {/* 3. Send Instantly - The Action */}
            <div className="bg-white rounded-3xl p-8 shadow-[0_15px_40px_rgba(59,130,246,0.06)] border-2 border-transparent hover:border-blue-500 transition-all duration-300">
              <div className="flex justify-center mb-6">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <SendHorizontal className="text-white w-7 h-7" />
                </div>
              </div>
              <h4 className="font-extrabold text-slate-900 text-xl mb-3 tracking-tight">
                Direct Delivery
              </h4>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                No need to download, rename, and attach. Email the brand deal
                invoice directly to your manager or client with one tap.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DEMO VIDEO */}
      <section id="demo-video" className="px-8 py-24 bg-gray-50 text-center">
        <h3 className="text-3xl font-bold text-gray-900 mb-6">
          See InvoiceSimplify in Action
        </h3>
        <p className="text-gray-600 mb-10 max-w-xl mx-auto">
          Watch a quick demo to see how easy it is to create and send
          professional invoices.
        </p>

        <div
          className="max-w-4xl mx-auto relative block lg:hidden"
          style={{ paddingTop: "70.25%" /* 16:9 ratio */ }}
        >
          <iframe
            src="https://www.youtube.com/embed/EduBdKIbYgE" // replace with your video link
            title="InvoiceSimplify Demo"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full rounded-xl shadow-lg"
          ></iframe>
        </div>

        <div
          className="max-w-5xl mx-auto relative block max-lg:hidden"
          style={{ paddingTop: "40.25%" /* 16:9 ratio */ }}
        >
          <iframe
            src="https://www.youtube.com/embed/EduBdKIbYgE" // replace with your video link
            title="InvoiceSimplify Demo"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full rounded-xl shadow-lg"
          ></iframe>
        </div>
      </section>

      {/* INVOICE PREVIEW */}
      {/* <section className="px-8 py-24 bg-white text-center flex ">
        <div>
          <h3 className="text-3xl font-bold text-gray-900 mb-6">
            Invoice Templates
          </h3>
          <p className="text-gray-600 mb-10">
            Show your brand professionalism with clean, modern templates
          </p>
        </div>
        <img
          src={"../images/invpreview.png"}
          alt="Invoice Preview"
          className="max-w-4xl mx-auto rounded-xl shadow-2xl w-64 h-[400px]"
        />
      </section> */}

      {/* SUPPORTED PAYMENT METHODS */}
      {/* <section className="px-8 py-20 bg-gray-100 text-center">
        <h3 className="text-3xl font-bold mb-8">Payments Made Easy</h3>
        <div className="flex flex-wrap justify-center gap-8 items-center">
          <CreditCard className="w-12 h-12 text-blue-600" />
          <img
            src="https://img.icons8.com/color/48/000000/upi.png"
            alt="UPI"
            className="w-12 h-12"
          />
          <img
            src="https://img.icons8.com/color/48/000000/razorpay.png"
            alt="Razorpay"
            className="w-12 h-12"
          />
          <img
            src="https://img.icons8.com/color/48/000000/paypal.png"
            alt="Paypal"
            className="w-12 h-12"
          />
        </div>
      </section> */}

      {/* ADVANCED FEATURES */}
      <section className="px-6 py-24 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Elegant Centered Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-blue-100">
              <Sparkles size={12} /> Pro Capabilities
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Advanced <span className="text-blue-600">Workflow</span> Tools
            </h2>
            <p className="mt-4 text-slate-500 text-lg max-w-xl mx-auto">
              Powerful automation designed to let you focus on creating, not
              chasing paperwork.
            </p>
          </div>

          {/* The Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {advancedFeatures.map((feature, i) => (
              <div
                key={i}
                className="group p-8 bg-white rounded-3xl border border-slate-100 hover:border-blue-200 hover:shadow-[0_20px_50px_rgba(59,130,246,0.05)] transition-all duration-500 flex flex-col items-start"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-blue-50 group-hover:scale-110 transition-all duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      {/* <section className="px-8 py-20 bg-gray-900 text-white">
        <h3 className="text-3xl font-bold text-center mb-12">
          Creators ❤️ InvoiceSimplify
        </h3>
        <div className="grid md:grid-cols-4 gap-10 max-w-6xl mx-auto">
          {[
            { name: "Aditi Sharma", role: "Fashion Influencer" },
            { name: "Manav Singh", role: "YouTube Creator" },
            { name: "SocialCrush Agency", role: "Marketing Agency" },
            { name: "Riya Kapoor", role: "Travel Blogger" },
          ].map((p, i) => (
            <div key={i} className="p-6 bg-gray-800 rounded-xl shadow-md">
              <Star className="text-yellow-400 w-6 h-6 mb-3" />
              <p className="text-gray-300">
                “Invoices look premium. Brands pay faster now!”
              </p>
            "Update Payment Status",
            "Payment Reminders",
            "Access Anywhere",
            "Currency Support",
            "Stunning Dashboard",
          ].map((feature, i) => (
            <div
              key={i}
              className="p-6 bg-gray-50 rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-3"
            >
              <Wand2 className="text-blue-600 w-6 h-6" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      {/* <section className="px-8 py-20 bg-gray-900 text-white">
        <h3 className="text-3xl font-bold text-center mb-12">
          Creators ❤️ InvoiceSimplify
        </h3>
        <div className="grid md:grid-cols-4 gap-10 max-w-6xl mx-auto">
          {[
            { name: "Aditi Sharma", role: "Fashion Influencer" },
            { name: "Manav Singh", role: "YouTube Creator" },
            { name: "SocialCrush Agency", role: "Marketing Agency" },
            { name: "Riya Kapoor", role: "Travel Blogger" },
          ].map((p, i) => (
            <div key={i} className="p-6 bg-gray-800 rounded-xl shadow-md">
              <Star className="text-yellow-400 w-6 h-6 mb-3" />
              <p className="text-gray-300">
                “Invoices look premium. Brands pay faster now!”
              </p>
              <p className="mt-4 font-bold">{p.name}</p>
              <p className="text-sm text-gray-400">{p.role}</p>
            </div>
          ))}
        </div>
      </section> */}

      {/* Testimonials */}
      <section className="px-6 py-24 bg-gray-100/70 text-center">
        <div className="max-w-6xl mx-auto">
          {/* Header - Refined Typography */}
          <h2 className="text-4xl md:text-5xl font-black text-slate-950 mb-16 tracking-tighter">
            Loved by Business Owners &{" "}
            <span className="text-blue-600">Creators</span>
          </h2>

          {/* The New Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((user, index) => (
              <div
                key={index}
                className="group relative flex flex-col p-9 bg-white rounded-[2rem] shadow-[0_15px_40px_-10px_rgba(0,0,0,0.03)] border border-slate-100 hover:border-blue-100 hover:shadow-[0_25px_60px_-15px_rgba(59,130,246,0.06)] hover:-translate-y-1.5 transition-all duration-500 text-left"
              >
                {/* Floating Quote Icon Accent */}
                <div className="absolute -top-4 -right-2 w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:rotate-12 transition-transform duration-500">
                  <Quote size={18} className="text-white fill-current" />
                </div>

                {/* User Content - Layout Update */}
                <div className="flex items-center gap-5 mb-8">
                  <div className="relative">
                    <img
                      src={user.image}
                      alt={user.name}
                      className="w-16 h-16 rounded-2xl object-cover ring-4 ring-slate-100"
                    />
                    {/* Active Status Dot */}
                    <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
                  </div>
                  <div>
                    <h4 className="text-lg font-extrabold text-slate-950 tracking-tight leading-tight">
                      {user.name}
                    </h4>
                    <p className="text-sm text-blue-600 font-semibold tracking-wide">
                      {user.title}
                    </p>
                  </div>
                </div>

                {/* The Quote itself */}
                <p className="text-slate-600 leading-relaxed font-medium mb-10 italic">
                  “{user.quote}”
                </p>

                {/* Bottom Bar - Rating & Verified Badge */}
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-100">
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={15} fill="currentColor" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-24 bg-white relative overflow-hidden">
        {/* Decorative Accents */}
        <div className="absolute top-20 right-[-10%] w-96 h-96 bg-blue-50 rounded-full blur-3xl -z-10 opacity-60" />

        <div className="max-w-4xl mx-auto">
          {/* Header Block */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              <HelpCircle size={14} className="text-blue-600" /> Support Center
            </div>
            <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Got <span className="text-blue-600">Questions?</span>
            </h3>
            <p className="mt-4 text-slate-500 text-lg">
              Everything you need to know about scaling your creator finances.
            </p>
          </div>

          {/* The Interactive Accordion */}
          <div className="border-t border-slate-200/60">
            {faqs.map((item, i) => (
              <FAQItem
                key={i}
                {...item}
                isOpen={openIndex === i}
                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
              />
            ))}
          </div>

          {/* Dynamic CTA Footer */}
          <div className="mt-16 p-8 rounded-[2rem] bg-slate-900 text-center relative overflow-hidden group">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-left">
                <h4 className="text-white font-bold text-xl">
                  Still have a specific question?
                </h4>
                <p className="text-slate-400 text-sm">
                  Our creator success team is online 24/7.
                </p>
              </div>
              <button className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2">
                <MessageCircle size={18} /> Chat with Us
              </button>
            </div>
            {/* Subtle Gradient Glow inside CTA */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl -z-0" />
          </div>
        </div>
      </section>
      <PricingPlans />

      <section
        id="contact-section"
        className="relative py-24 bg-gray-50/50 overflow-hidden"
      >
        {/* Decorative Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/30 rounded-full blur-[120px] -z-10" />

        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left Side: Editorial Content */}
            <div className="lg:w-1/2 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-blue-600/10">
                <Sparkles size={12} /> Get in Touch
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">
                Supporting your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Exponential Growth.
                </span>
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-8 max-w-lg">
                Whether you're an influencer scaling your brand or an agency
                managing 100+ creators — we’re here to ensure you **get paid
                faster.**
              </p>

              {/* Value Props */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-700 font-semibold text-sm">
                  <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-blue-600 border border-slate-100">
                    <MessageSquare size={16} />
                  </div>
                  Quick Response: Usually under 2 hours
                </div>
                <div className="flex items-center gap-3 text-slate-700 font-semibold text-sm">
                  <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-indigo-600 border border-slate-100">
                    <Zap size={16} />
                  </div>
                  Direct access to our Founders
                </div>
              </div>
            </div>

            {/* Right Side: The Premium Form */}
            <div className="lg:w-1/2 w-full max-w-xl">
              <div className="relative p-1 rounded-[2.5rem] bg-gradient-to-b from-white to-slate-100 shadow-[0_30px_100px_rgba(0,0,0,0.08)]">
                <div className="bg-white rounded-[2.3rem] p-8 md:p-10 border border-white">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          name="name"
                          className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          placeholder="hello@creator.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          name="email"
                          className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Your Message
                      </label>
                      <textarea
                        placeholder="How can we help your business?"
                        rows="4"
                        required
                        value={formData.message}
                        onChange={handleChange}
                        name="message"
                        className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 resize-none"
                      />
                    </div>

                    <button className="group relative w-full py-4 bg-slate-900 text-white rounded-2xl font-bold transition-all hover:bg-blue-600 hover:shadow-[0_20px_40px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2 overflow-hidden">
                      <span className="relative z-10 flex items-center gap-2">
                        Send Message{" "}
                        <Send
                          size={18}
                          className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                        />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer1 />
    </div>
  );
};

export default Home;
