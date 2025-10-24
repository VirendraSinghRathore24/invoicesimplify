import React, { useState } from "react";
import { Check, ArrowRight, Sparkles, Shield, Star, Wand2 } from "lucide-react";
import Footer1 from "./Footer1";
import { toast } from "react-toastify";
import { addDoc, collection, doc } from "firebase/firestore";
import { CREATORS } from "./Constant";
import { db } from "../config/firebase";

const Home = () => {
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
      title: "Small Business Owner",
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
    const contactInfo_CollectionRef = collection(
      doc(db, "Contact_US", uid),
      "Contact_Info"
    );
    await addDoc(contactInfo_CollectionRef, {
      contactData: formData,
      messageDate: new Date().toISOString().slice(0, 10),
    });
  };

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
            onClick={() => (window.location.href = "/creator/createinvoice")}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
          >
            Start Free
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="px-8 md:px-20 grid md:grid-cols-2 items-center gap-14 py-24">
        <div className="block lg:hidden mb-8">
          <h1 className="text-2xl font-extrabold leading-tight text-gray-900">
            Create & Send Invoices in
            <p className="text-blue-600">30 Seconds</p>
          </h1>
          <p className="mt-5 text-gray-600 text-lg">
            Create & share branded invoices for your brand deals — trusted by
            influencers and creators across world.
          </p>
          <div className="mt-8 flex gap-4">
            <button
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition flex items-center gap-2"
              onClick={() => (window.location.href = "/creator/createinvoice")}
            >
              Create Invoice <ArrowRight />
            </button>
            <button
              className="px-8 py-3 border border-gray-400 rounded-xl font-semibold hover:bg-gray-200 transition"
              onClick={() =>
                document
                  .getElementById("demo-video")
                  .scrollIntoView({ behavior: "smooth" })
              }
            >
              View Demo
            </button>
          </div>
        </div>
        <div className="block max-lg:hidden mb-8">
          <h1 className="text-5xl font-extrabold leading-tight text-gray-900">
            Create & Send Invoices in
            <p className="text-blue-600">30 Seconds</p>
          </h1>
          <p className="mt-5 text-gray-600 text-lg">
            Create & share branded invoices for your brand deals — trusted by
            influencers and creators across world.
          </p>
          <div className="mt-8 flex gap-4">
            <button
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition flex items-center gap-2"
              onClick={() => (window.location.href = "/creator/createinvoice")}
            >
              Create Invoice <ArrowRight />
            </button>
            <button
              className="px-8 py-3 border border-gray-400 rounded-xl font-semibold hover:bg-gray-200 transition"
              onClick={() =>
                document
                  .getElementById("demo-video")
                  .scrollIntoView({ behavior: "smooth" })
              }
            >
              View Demo
            </button>
          </div>
        </div>
        <div className="border-2 rounded-md border-gray-400 p-4 bg-white shadow-lg">
          <img
            src={"../../images/invp2.webp"}
            alt="Hero"
            className="w-full drop-shadow-2xl"
          />
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="bg-white py-10 text-center text-gray-500 text-sm">
        Trusted by 500+ Creators, Agencies & Freelancers 🤝
      </section>

      {/* WHY INVOICESIMPLIFY */}
      <section className="px-8 py-20 bg-gray-50">
        <h2 className="text-center text-3xl font-bold text-gray-900">
          Why InvoiceSimplify?
        </h2>
        <p className="text-center text-gray-600 mt-2 max-w-xl mx-auto">
          Everything you need to streamline your creator payments
        </p>
        <div className="grid md:grid-cols-4 gap-8 mt-12 max-w-6xl mx-auto">
          {[
            "Branded Invoices",
            "Email directly to brands & agencies",
            "Download PDFs anytime",
            "Track payments & reminders",
            "Recurring invoices for brands & agencies",
            "Multi-currency support",
            "Signature support",
            "Data privacy",
          ].map((item, i) => (
            <div
              key={i}
              className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-3"
            >
              <Check className="text-green-600 w-6 h-6" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CREATOR BENEFITS */}
      <section className="px-8 py-16 bg-blue-50 text-center">
        <h3 className="text-3xl font-bold text-gray-900 mb-6">
          Create & Send Invoices Anywhere
        </h3>
        <p className="text-gray-700 max-w-xl mx-auto mb-10 text-lg">
          No need to maintain separate invoice documents or templates. Generate
          professional invoices directly from your mobile or desktop — anytime,
          anywhere.
        </p>

        <div className="flex flex-col md:flex-row justify-center gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-6 shadow-md flex flex-col items-center gap-4">
            <Sparkles className="text-blue-600 w-8 h-8" />
            <h4 className="font-semibold text-lg">Mobile Friendly</h4>
            <p className="text-gray-600 text-sm text-center">
              Generate invoices on your phone or tablet without any hassle.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md flex flex-col items-center gap-4">
            <Shield className="text-blue-600 w-8 h-8" />
            <h4 className="font-semibold text-lg">No Templates Needed</h4>
            <p className="text-gray-600 text-sm text-center">
              Everything is ready to use. No need to manage multiple invoice
              templates or docs.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md flex flex-col items-center gap-4">
            <Check className="text-blue-600 w-8 h-8" />
            <h4 className="font-semibold text-lg">Send Instantly</h4>
            <p className="text-gray-600 text-sm text-center">
              Email your invoice directly to brands and agencies with one click.
            </p>
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
          className="max-w-4xl mx-auto relative"
          style={{ paddingTop: "40.25%" /* 16:9 ratio */ }}
        >
          <iframe
            src="https://www.youtube.com/embed/your-demo-video-id" // replace with your video link
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
      <section className="px-8 py-20 bg-white">
        <h2 className="text-3xl font-bold text-center mb-12">
          Advanced Features
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            "Recurring Invoices",
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
      <section className="bg-gray-100 dark:bg-gray-800 py-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">
            Loved by Business Owners & Creators
          </h2>
          <div className="grid gap-10 md:grid-cols-3">
            {testimonials.map((user, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md hover:shadow-lg transition text-left"
              >
                <div className="flex items-center mb-4 space-x-4">
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold">{user.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user.title}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300  mb-4">
                  “{user.quote}”
                </p>
                <div className="flex space-x-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-8 py-20 bg-gray-50">
        <h3 className="text-3xl font-bold text-center mb-12">
          Frequently Asked Questions
        </h3>
        <div className="max-w-4xl mx-auto space-y-6">
          {[
            {
              q: "What are the way to get invoices?",
              a: "Download PDF or email directly to brands.",
            },
            {
              q: "Can I create invoice using mobile?",
              a: "Yes, InvoiceSimplify is mobile-friendly and works seamlessly on any device.",
            },
            {
              q: "Can I track pending payments from brands or agencies?",
              a: "Yes, Dashboard helps you track paid and unpaid invoices easily.",
            },
            {
              q: "Do you support multiple currencies?",
              a: "Yes, you can invoice in INR, USD, EUR, and more.",
            },
          ].map((item, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-md">
              <h4 className="font-semibold">{item.q}</h4>
              <p className="mt-2 text-gray-600">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="contact-section" className="py-20 bg-gray-100 mt-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
            We’re Here to Support Your Growth 🚀
          </h2>
          <p className="text-gray-600 tex-sm lg:text-lg mb-8">
            Whether you're a content creator, freelancer, influencer, or small
            business — InvoiceSimplify helps you send professional invoices and
            get paid faster.
            <br />
            Have questions, feedback, or want to work with us? Just reach out!
          </p>

          <div className="bg-white shadow-xl rounded-3xl p-8 max-w-xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                value={formData.name}
                required
                onChange={handleChange}
                name="name"
                className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                name="email"
                placeholder="Your Email"
                className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-400"
              />
              <textarea
                placeholder="Your Message"
                rows="4"
                required
                value={formData.message}
                onChange={handleChange}
                name="message"
                className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-400"
              />

              <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center px-6 py-20 bg-blue-600 text-white block lg:hidden">
        <h2 className="text-2xl font-bold">
          Start invoicing in less than 30 seconds
        </h2>
        <p className="mt-2 mb-6">
          Create your first branded invoice and impress your clients today.
        </p>
        <button
          onClick={() => (window.location.href = "/creator/createinvoice")}
          className="px-10 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition"
        >
          Start Free Now
        </button>
      </section>

      <section className="text-center px-6 py-20 bg-blue-600 text-white block max-lg:hidden">
        <h2 className="text-4xl font-bold">
          Start invoicing in less than 30 seconds
        </h2>
        <p className="mt-2 mb-6">
          Create your first branded invoice and impress your clients today.
        </p>
        <button
          onClick={() => (window.location.href = "/creator/createinvoice")}
          className="px-10 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition"
        >
          Start Free Now
        </button>
      </section>

      {/* FOOTER */}
      <Footer1 />
    </div>
  );
};

export default Home;
