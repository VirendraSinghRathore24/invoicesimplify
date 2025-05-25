import React from "react";
import HeaderHome from "./HeaderHome";
import { NavLink, useNavigate } from "react-router-dom";
// import Footer from "./Footer";
// import Testimonials from "./Testimonials";
// import { LogIn, BookText, ScanEye, Download, Printer, LayoutDashboard } from 'lucide-react';


const Home = () => {
    const navigate = useNavigate();
    const handleCreateInvoice = () => {
        const user = localStorage.getItem("user");
    
        if(user && user !== "undefined" && user !== "null"){
          navigate("/createinvoice");
        }
        else{
          navigate("/login");
        }
    }
  return (
    <div className="quicksand-med w-full mx-auto">
      <HeaderHome /> 

      <div className="w-full mx-auto mt-20">
        <div className="w-full mx-auto bg-gray-100 flex flex-col  justify-center text-center p-8">
          <div className="w-full mx-auto ">
          
            <div className="text-2xl md:text-4xl text-center mt-10">
              Online Invoice Generator
            </div>
            <div className=" m-4 rounded-md text-md md:text-lg text-center items-center">
            
            <div className=" text-white mt-12">
              <button
                className="bg-[#FF5721] text-md text-white py-4 px-4 font-semibold rounded-md text-richblack-700 hover:bg-white hover:text-[#FF5721] hover:border-2 hover:border-[#FF5721] cursor-pointer uppercase tracking-wide"
                onClick={handleCreateInvoice}
              >
                Try It Free !
              </button>
            </div>
            <div className="text-gray-500 text-sm mt-4">We are using secure connection</div>
           
            <div className="mt-6 text-lg text-center">Looking for customized invoice solution</div>
            <NavLink className="text-blue-600 underline text-center" to={'/contactus'}>connect with us</NavLink>
            </div>
           
            {/* <div className="text-md md:text-lg text-gray-500 text-center md:ml-40 mt-4 p-4 md:mt-16 md:w-[700px]">
              Use our invoice generator to manage your invoicing from any
              device, anytime. Your account is always connected, and your data
              is saved securely for you.
            </div>
            <div className="text-md md:text-lg text-center items-center text-white md:ml-40 mt-20">
              <NavLink
                className="bg-[#FF5721] text-md text-white py-6 px-8 font-semibold rounded-md text-richblack-700 hover:bg-white hover:text-[#FF5721] hover:border-2 hover:border-[#FF5721] cursor-pointer uppercase tracking-wide"
                to={"/createinvoice"}
              >
                Create Your Invoice
              </NavLink>
            </div> */}
          </div>
          <div className=" text-lg mt-4"><span className="text-2xl font-bold text-blue-600">Create and Download Invoice</span> from any device</div>
          <div className=" text-lg mt-4">No more template needed</div>
          <div className=" text-lg mt-4">Dashboard to track invoices</div>
          <div className=" text-lg mt-4">Manage all saved information</div>
          <div className=" text-lg mt-4 mb-4">Add, Delete, Modify information support</div>
          {/* <div className="md:flex md:justify-end w-full mt-10 md:h-[600px]">
            <img src="../../images/img_bg1.webp" alt="img1" />
          </div> */}
        </div>

        {/* <div className="flex flex-col md:flex-row justify-evenly max-md:mt-72 w-full mx-auto">
          <div className="flex w-full h-[600px] my-20">
            <img src="../../images/img_bg2.webp" alt="img2" />
          </div>
          <div className="flex flex-col gap-y-10 p-2 text-center">
            <div className="text-2xl md:text-3xl md:mt-56 md:w-[800px]">
              What is the Online Invoice Generator?
            </div>
            <div className="md:mr-40 text-md text-gray-500">
              Unlike pre-made templates, you can customize invoices to your
              business. Short on time? Create your first invoice, and your
              details are securely stored and auto-populated on future projects.
              Work on the go? It does too. Use your mobile device to create and
              share invoices.
            </div>
            <div className="md:mr-40 text-md text-gray-500">
              In short, it’s the perfect invoice anywhere, anytime.
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between w-full mx-auto">
          <div className="flex flex-col gap-y-10 md:ml-20 text-left p-4">
            <div className="text-2xl md:text-3xl mt-32 md:mt-56 md:w-[700px]">
              Say Goodbye to Invoice Templates
            </div>
            <div className="text-md text-gray-500">
              Don’t get us wrong. Pre-made templates can be helpful—especially
              our free templates. But the online invoice generator gives you
              more of what you love.
            </div>
            <ul>
              <li className="text-md text-gray-500 list-disc ml-10">
                More automation. You’re notified when clients view emailed
                invoices.
              </li>
              <li className="text-md text-gray-500 list-disc ml-10">
                More flexibility. Invoices optimized for mobile, tablet, and
                desktop devices.
              </li>
            </ul>
            <div className="text-md text-gray-500">
              And less of what you don’t.
            </div>

            <ul>
              <li className="text-md text-gray-500 list-disc ml-10">
                Less follow-up. Clients are automatically (and politely)
                reminded of invoices.
              </li>
              <li className="text-md text-gray-500 list-disc ml-10">
                Less paperwork. Add payment links to invoices for quick, secure
                payments.
              </li>
            </ul>
          </div>

          <div className="flex w-full md:h-[600px] my-20">
            <img src="../../images/img_bg3.webp" alt="img2" />
          </div>
        </div> */}
          <div className="text-2xl md:text-4xl text-center mt-10">How-to-use Invoice Simplify</div>
          <div className="text-md text-center mt-2 text-gray-500">Create and download invoice in seconds and manage invoice data by using Dashboard feature</div>
          <div className="text-md text-center  text-gray-500">You have complete control on your data</div>
          <div className="flex flex-wrap gap-y-10 text-center justify-center w-full mx-auto gap-x-10 mt-10">
            <div className="mt-0 md:mt-56 p-4"> 
              <div className="text-3xl font-bold text-blue-600 mb-4">Create Invoice</div>
              <div className="mt-2 text-xl">✅ Add required information for your invoice.</div>
              <div className="mt-2 text-xl">✅ Information can be saved for future use</div>
              <div className="mt-2 text-xl">✅ Search previously added information</div>
              <div className="mt-2 text-xl">✅ Also add digital signature if required</div>
            </div>
            <div className="w-full md:w-[50%] p-4"><img src="../../images/is_1.png" alt="image1" className="rounded-md"/></div>
          </div>
          <div className="flex flex-wrap gap-y-10 p-4 text-center justify-center w-full mx-auto gap-x-10 mt-10">
            <div className="mt-0 md:mt-56"> 
              <div className="text-3xl font-bold text-blue-600 mb-4">Download Invoice</div>
              <div className="mt-2 text-xl">✅ Edit </div>
             
              <div className="mt-2 text-xl">✅ Print</div>
              <div className="mt-2 text-xl">✅ Download</div>
            </div>
            <div className="w-full md:w-[50%] p-4 ml-0 md:ml-48"><img src="../../images/is_2.png" alt="image2" className="rounded-md"/></div>
          </div>
          
        <div>
        </div>
        <div>
        </div>
        <div className="bg-[#444] text-yellow-200 text-center text-lg md:text-xl p-10">
          <div>We are a trusted business committed to providing reliable and high-quality services, ensuring customer satisfaction and long-term success</div>
        </div>
          <div className="bg-gray-100 py-10">
          <div className="text-center text-blue-600 text-2xl md:text-3xl mt-4">Our Happy Customers</div>
            {/* <Testimonials/> */}
        </div>
      </div>


      {/* <Footer /> */}
    </div>
  );
};

export default Home;
