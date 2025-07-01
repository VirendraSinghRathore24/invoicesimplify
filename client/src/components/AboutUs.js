import React, { useEffect } from "react";
import Footer1 from "./Footer1";
import Header1 from "./Header1";

const AboutUs = () => {
  const handleCreateInvoice = () => {
    const user = localStorage.getItem("user");

    if (user && user !== "undefined" && user !== "null") {
      const newWindow = window.open("/createinvoice", "_blank");
      if (newWindow) newWindow.opener = null;
    } else {
      const newWindow = window.open("/login", "_blank");
      if (newWindow) newWindow.opener = null;
    }
  };

  useEffect(() => {
    window.scroll(0, 0);
  }, []);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white transition-colors duration-300">
      {/* Header */}
      <Header1 />
      <div className="max-w-5xl mx-auto py-12 mt-20">
        {/* Heading */}
        <h1 className="text-4xl font-extrabold mb-6 text-center">
          About InvoiceSimplify
        </h1>

        {/* Intro Section */}
        <p className="text-lg leading-7 mb-10 text-center max-w-3xl mx-auto">
          At InvoiceSimplify, we are dedicated to making your invoicing process
          seamless, fast, and stress-free. Whether you're a freelancer, small
          business owner, or entrepreneur — our tool lets you create and manage
          invoices in seconds.
        </p>

        {/* Mission and Vision */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">🌟 Our Mission</h2>
            <p>
              To empower individuals and businesses with a powerful yet
              easy-to-use invoicing platform, helping them save time, reduce
              errors, and get paid faster.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">🚀 Our Vision</h2>
            <p>
              To become the most trusted invoicing solution worldwide,
              especially for independent creators, freelancers, and small
              businesses.
            </p>
          </div>
        </div>

        {/* Team Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4 text-center">
            🤝 Meet the Team
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md text-center">
              <img
                src="../images/viren1.png"
                alt="Team Member"
                className="w-24 h-24 mx-auto rounded-full mb-2"
              />
              <h3 className="font-semibold text-lg">Virendra Singh Rathore</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Founder & Product Lead
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md text-center">
              <img
                src="../images/sanju1.png"
                alt="Team Member"
                className="w-24 h-24 mx-auto rounded-full mb-2"
              />
              <h3 className="font-semibold text-lg">Sanju Shekhawat</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Founder & Design Lead
              </p>
            </div>
            {/* <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md text-center">
              <img
                src="../images/sanju2.png"
                alt="Team Member"
                className="w-24 h-24 mx-auto rounded-full mb-2"
              />
              <h3 className="font-semibold text-lg">Sonam Singh</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Marketing Head
              </p>
            </div> */}
            {/* Add more team members here */}
          </div>
        </div>

        {/* Our Story */}
        <div className="mt-12 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">📖 Our Story</h2>
          <p className="leading-7">
            Founded by a passionate team who faced their own challenges with
            manual billing and tracking, InvoiceSimplify was born out of a need
            for simplicity. We’ve built a platform that requires no technical
            skills — just click, fill, and send.
          </p>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <h3 className="text-xl font-bold mb-2">
            Ready to simplify invoicing?
          </h3>
          <button
            onClick={handleCreateInvoice}
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700 transition"
          >
            Get Started Today
          </button>
        </div>
      </div>
      <Footer1 />
    </div>
  );
};

export default AboutUs;
