import React, { useState, useEffect } from "react";
import { CheckCircle, Star, Moon, Sun } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
const features = [
  "Create invoices in seconds",
  "Print or whatsapp with one click",
  "Works great on mobile and desktop",
  "Dashboard to track invoices",
];

const testimonials = [
  {
    name: "Anjali Mehta",
    title: "Freelance Graphic Designer",
    quote:
      "This tool made my invoicing 10x faster. I can now send branded invoices to my clients within minutes!",
    image: "https://i.pravatar.cc/150?img=47",
  },
  {
    name: "Ravi Sharma",
    title: "Content Creator",
    quote:
      "I was tired of messy invoice formats. This app helped me look more professional and save time.",
    image: "https://i.pravatar.cc/150?img=12",
  },
  {
    name: "Neha Kapoor",
    title: "Small Business Owner",
    quote:
      "Super simple and mobile-friendly! I love how intuitive it is. Invoicing is no longer a chore.",
    image: "https://i.pravatar.cc/150?img=31",
  },
];

const Home = () => {
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const handleCreateInvoice = () => {
    const user = localStorage.getItem("user");

    if (user && user !== "undefined" && user !== "null") {
      navigate("/createinvoice");
    } else {
      navigate("/login");
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-indigo-600 dark:text-white">
            InvoiceSimplify
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={handleCreateInvoice}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition"
            >
              Create Invoice
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              title="Toggle Dark Mode"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
            Simplify Your Invoicing
          </h1>
          <p className="text-lg sm:text-xl mb-8">
            Generate professional invoices effortlessly – anytime, anywhere.
          </p>
          <button
            onClick={handleCreateInvoice}
            className="bg-white text-indigo-600 font-semibold px-6 py-3 rounded-xl shadow-lg hover:bg-gray-100 transition"
          >
            Create Your First Invoice
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">
            Why Use Our Invoicing Tool?
          </h2>
          <div className="grid gap-8 sm:grid-cols-2">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 bg-white dark:bg-gray-800 p-5 rounded-xl shadow hover:shadow-lg transition"
              >
                <CheckCircle className="text-green-500 mt-1" size={28} />
                <p className="text-lg font-medium">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
                <p className="text-gray-700 dark:text-gray-300 italic mb-4">
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

      {/* CTA */}
      <section className="bg-white dark:bg-gray-900 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl sm:text-3xl font-semibold mb-6">
            Start Invoicing in Just a Few Clicks
          </h3>
          <button
            onClick={handleCreateInvoice}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition"
          >
            Try It Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-6">
        <div className="max-w-6xl mx-auto grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="text-lg font-semibold mb-2">About Us</h4>
            <p className="text-sm text-gray-300">
              InvoiceSimplify is a tool designed for freelancers, creators, and
              small business owners to make invoicing simple, fast, and
              professional.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-2">Contact Us</h4>
            <p className="text-sm text-gray-300">
              Email: support@invoicesimplify.com <br />
              Phone: +91-9876543210
            </p>
          </div>
        </div>
        <div className="text-center mt-6 text-sm text-gray-400">
          &copy; {new Date().getFullYear()} InvoiceSimplify. All rights
          reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;
