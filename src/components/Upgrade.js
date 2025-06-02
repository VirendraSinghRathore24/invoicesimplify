import React, { useEffect, useState } from "react";
import Header from "./Header";
import { useNavigate } from "react-router-dom";
import { addPdfCount, getPdfCount, updatePdfPlan } from "./DatabaseHelper";

const Upgrade = () => {
  const navigate = useNavigate();
  const [basicPlan, setBasicPlan] = useState(false);
  const loggedInUser = localStorage.getItem("user");

  //const url = 'https://invoice-slxn.onrender.com';
  const url = 'http://localhost:5001';

  async function submitHandler(amount) {
    try {
      const response = await fetch(url + "/order", {
        method: "POST",
        body: JSON.stringify({
          amount: amount * 100,
          currency: "INR",
          receipt: "xyz",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const order = await response.json();

      var options = {
        key: "rzp_test_LhuOU4vc2OUsLc", // Enter the Key ID generated from the Dashboard
        amount: amount * 100, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        currency: "INR",
        name: "Invoice", //your business name
        description: "Test Transaction",
        image: "https://example.com/your_logo",
        order_id: order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        handler: async function (response) {
          const body = {
            ...response,
          };

          const validateRes = await fetch(
            url + "/order/validate",
            {
              method: "POST",
              body: JSON.stringify(body),
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          const jsonRes = await validateRes.json();

          if (jsonRes && jsonRes.msg === "success") {
            // check if user has done some trial or not
            const pdfInfo = await getPdfCount(loggedInUser);

            if(pdfInfo)
            {
              // update
              await updatePdfPlan(pdfInfo, 'basic', 10);
              setBasicPlan(true);
            }
            else{
              // add it - first time
              await addPdfCount(loggedInUser);
            }

            navigate("/success", 
             { 
              state: {
                order: order
              }}
            );
          }
        },
        prefill: {
          //We recommend using the prefill parameter to auto-fill customer's contact information, especially their phone number
          name: "Virendra Singh Rathore", //your customer's name
          email: "virendrasinghrathore@example.com",
          contact: "8095528454", //Provide the customer's phone number for better conversion rates
        },
        notes: {
          address: "Razorpay Corporate Office",
        },
        theme: {
          color: "#3399cc",
        },
      };
      var rzp1 = new window.Razorpay(options);
      rzp1.on("payment.failed", function (response) {
        alert(response.error.code);
        alert(response.error.description);
        alert(response.error.source);
        alert(response.error.step);
        alert(response.error.reason);
        alert(response.error.metadata.order_id);
        alert(response.error.metadata.payment_id);
      });
      rzp1.open();
     // e.preventDefault();
    } catch (err) {
      console.log(err);
    }
  }

  const checkPlan = async() => {
    const pdfInfo = await getPdfCount(loggedInUser);

    if(pdfInfo && pdfInfo.plan === 'basic')
    {
      setBasicPlan(true);
    }
  }

  useEffect(() => {
    checkPlan();
  },[]);
  return (
    <div>
      <Header />
      <div className="quicksand-med w-full">
        <div className="w-full mx-auto text-center text-sm md:text-md p-2 text-[#856404] bg-orange-100 ">
          <div>Thank you for using the free trial for Invoice platform</div>
          <div>To continue using invoices, subscribe to one of our plans.</div>
        </div>
        <div className="text-3xl text-center mt-6 font-bold">Invoice</div>
        <div className="text-xl text-center font-semibold mt-4 px-2">
          Exactly what you need. Nothing more, nothing less.
        </div>
        {/* <div className="text-sm text-center text-gray-500 mt-4 px-2">
          Cancel or change your plan anytime.
        </div> */}
        <div className="flex flex-col md:flex-row gap-x-4 justify-center items-center gap-y-8 md:justify-evenly mt-6 p-6">
          <div className="border-2 rounded-xl flex flex-col shadow-xl gap-y-4 p-8 w-80">
            <div className="font-bold text-2xl text-center">Basic</div>
            <div className="text-gray-500 text-md">
              Easily send invoices, receipts and receive payments
            </div>
            <div className="font-bold text-2xl">₹99.00/mo</div>
            {
              !basicPlan ? <button
              onClick={() => submitHandler(99)}
              className="bg-[#FF5721] text-md text-white p-4 font-bold rounded-md text-richblack-700 hover:scale-110 transition duration-300 ease-in cursor-pointer "
            >
              Buy Now
            </button> : <button
              className="bg-green-600 text-md text-white p-4 font-bold rounded-md text-richblack-700"
            >
              Current Plan
            </button>
            }
            
            <hr />
  
            <div>✅ 20 Invoices per month</div>
            <div>✅ QR Code & UPI Payments</div>
            <div>✅ Invoice Dashboard</div>
            <div>✅ Edit Invoice</div>
            <div>✅ Email Invoice</div>
          </div>
          <div className="border-2 rounded-xl bg-orange-50 shadow-xl flex flex-col gap-y-4 p-8 w-80">
            <div className="font-bold text-2xl text-center">Most Popular</div>
            <div className="text-gray-500 text-md">
              Add customization, reporting and automation
            </div>
            <div className="font-bold text-2xl">₹499.00/mo</div>
            <button onClick={() => submitHandler(499)} className="bg-[#FF5721] text-md text-white p-4 font-bold rounded-md text-richblack-700 hover:scale-110 transition duration-300 ease-in cursor-pointer ">
              Buy Now
            </button>
            <hr />
            <div>✅ 20 Invoices per month</div>
            <div>✅ QR Code & UPI Payments</div>
            <div>✅ Invoice Dashboard</div>
            <div>✅ Edit Invoice</div>
            <div>✅ Email Invoice</div>
          </div>
          <div className="border-2 rounded-xl shadow-xl flex flex-col gap-y-4 p-8 w-80">
            <div className="font-bold text-2xl text-center">Premium</div>
            <div className="text-gray-500 text-md">
              Grow with unlimited invoicing and priority support
            </div>
            <div className="font-bold text-2xl">₹4999.00/yr</div>
            <button onClick={() => submitHandler(4999)} className="bg-[#FF5721] text-md text-white p-4 font-bold rounded-md text-richblack-700 hover:scale-110 transition duration-300 ease-in cursor-pointer ">
              Buy Now
            </button>
            <hr />
            <div>✅ 20 Invoices per month</div>
            <div>✅ QR Code & UPI Payments</div>
            <div>✅ Invoice Dashboard</div>
            <div>✅ Edit Invoice</div>
            <div>✅ Email Invoice</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;