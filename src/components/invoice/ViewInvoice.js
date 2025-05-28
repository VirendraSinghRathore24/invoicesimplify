import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaRegEdit } from "react-icons/fa";
import { BsWhatsapp } from "react-icons/bs";
import { Printer } from "lucide-react";
import { Download } from "lucide-react";
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

function ViewInvoice() {
  const [invoiceInfo, setInvoiceInfo] = useState({});

  const location = useLocation();
  const id = location.state.id;

  const navigate = useNavigate();

  let date = "";
  if (invoiceInfo?.invoiceInfo?.date) {
    var today = new Date(invoiceInfo?.invoiceInfo?.date);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "July",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    var month = months[today.getMonth()];
    date = month + " " + today.getDate() + ", " + today.getFullYear();
  }

  let expectedDate = "";
  if (invoiceInfo?.invoiceInfo?.expectedDate) {
    var today = new Date(invoiceInfo?.invoiceInfo?.expectedDate);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "July",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    var month = months[today.getMonth()];
    expectedDate = month + " " + today.getDate() + ", " + today.getFullYear();
  }
  const loggedInUser = localStorage.getItem("user");
  const invoiceInfo_CollectionRef = collection(db, "Invoice_Info");
  const handleDownload = async() => {

  }

  const getInvoiceData = async () => {
    const data = await getDocs(invoiceInfo_CollectionRef);
    const filteredData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  
    const allBrandsInfo = filteredData.filter(
      (x) => x.loggedInUser === loggedInUser
    );
    
    const invoiceData = allBrandsInfo.filter(x => x.id === id)[0];

    console.log(invoiceData)
    setInvoiceInfo(invoiceData);
  };
  const handleLogin = () => {
    const user = localStorage.getItem("user");

    if(!user || user === "undefined" || user === "null"){
      navigate("/login");
    } 
}

  useEffect(() => {
    handleLogin();
    getInvoiceData();
  }, []);
    return (
        <div className='my-5'>
          <div className='flex justify-between w-8/12 mx-auto'>
          {/* <div className="flex gap-x-2">
          <button
             onClick={() => navigate('/createinvoice')}
            className="flex items-center bg-[#E5E7EB] cursor-pointer font-bold px-4 py-2 rounded-md hover:bg-blue-700 hover:text-white transition duration-300"
          >
            <span className="mr-2">
              <FaRegEdit size={22} />
            </span>
            Edit
          </button>
        </div> */}
        <div>
          <button

            className="flex items-center bg-[#E5E7EB]  font-bold px-4 py-2 rounded-md hover:bg-blue-700 hover:text-white transition duration-300"
          >
            <span className="mr-2">
              <Printer />
            </span>
            Print
          </button>
        </div>
       
        <div>
          <button
            onClick={() => handleDownload()}
            className="flex items-center bg-[#E5E7EB]  font-bold px-4 py-2 rounded-md hover:bg-blue-700 hover:text-white transition duration-300"
          >
            <span className="mr-2">
              <Download />
            </span>
            Download
          </button>
        </div>

        <div>
          <button

            className="flex items-center bg-[#E5E7EB]  font-bold px-4 py-2 rounded-md hover:bg-blue-700 hover:text-white transition duration-300"
          >
            <span className="mr-2">
              <BsWhatsapp size={22} />
            </span>
            Whatsapp
          </button>
        </div>


          </div>
        <div className='w-8/12 mx-auto  border-[1.7px] mt-4 rounded-md p-4 '>
          <div className='flex justify-between'>
          <div>
              <img src='../images/matadi1.jpeg' className='h-20 w-20'/>
          </div>
          <div className='text-center'>
              <div className='text-3xl font-bold'>{invoiceInfo?.businessInfo?.name}</div>
              {/* <div className='text-3xl font-bold'>बाईसाराज पौशाक पैलेस</div> */}
              <div className='text-lg font-medium'>{invoiceInfo?.businessInfo?.subTitle1}</div>
              
          </div>
          
          <div className='flex flex-col font-semibold'>
              <div>M: {invoiceInfo?.businessInfo?.phonePrimary}</div>
              <div className='ml-6'>{invoiceInfo?.businessInfo?.phoneSecondary}</div>
          </div>
          </div>
          <div className='text-sm font-medium text-center'>GSTIN: {invoiceInfo?.taxInfo?.gstNumber}</div>
          <hr className="w-full mt-4 border-[1.1px]"></hr>
          <div className='py-2 text-center'>{invoiceInfo?.businessInfo?.address1}, {invoiceInfo?.businessInfo?.address2} - {invoiceInfo?.businessInfo?.address3}</div>
          <hr className="w-full mt-1 border-[1.1px]"></hr>
          <div className='flex justify-between'>

          <div className='w-8/12 mx-auto text-left font-semibold py-2'>
            <div className='mb-2'>To:</div>

              <div>{invoiceInfo?.customerInfo?.customerName}</div>
              <div>{invoiceInfo?.customerInfo?.customerPhone}</div>
          </div>

            <div className=' w-4/12 mx-auto flex flex-col gap-y-3 font-bold py-2'>
              <div className='w-full'>
                <div className='text-end text-sm'>INVOICE</div>
                <div className='text-end text-gray-500 text-sm'>{invoiceInfo?.invoiceInfo?.invoiceNumber}</div>
              </div>
              
              <div className='w-full'>
              <div className='text-end text-sm'>DATE</div>
              <div className='text-end text-gray-500 text-sm'>{date}</div>
              </div>
            </div>
          
          
          
          </div>
          <div className="flex justify-between border-b-[1.2px] border-black mt-6"></div>
          <div className="overflow-hidden mt-2">
          <table className=" w-full mx-auto text-center text-sm font-light">
                  <thead className="text-md uppercase">
                    <tr className="flex justify-between w-full mx-auto gap-x-4">
                      <th className="w-[10%]">S.No.</th>
                      <th className="w-[40%] text-left">Description</th>
                      <th className="w-[20%]">Rate</th>
                      <th className="w-[10%]">Quantity</th>
                      <th className="w-[20%]">Amount</th>
                    </tr>
                    <tr className="flex justify-between border-b-[1.2px] border-black mt-2"></tr>
                  </thead>
                  <tbody>
                    {invoiceInfo?.rows&&
                      invoiceInfo?.rows.length > 0 &&
                      invoiceInfo?.rows.map((row, index) => (
                        <div>
                          <tr className="flex justify-between text-md mt-1 font-light w-full mx-auto gap-x-4">
                           <td className="w-[10%] ">{index + 1}.</td>
                            <td className="w-[40%] text-left">{row?.desc}</td>
                            <td className="w-[20%] ">{row?.rate}</td>
                            <td className="w-[10%] ">{row?.qty}</td>
                            <td className="w-[20%]"> {row?.amount}</td>
                          </tr>
                          {(invoiceInfo?.rows.length > index + 1 ) && <tr className="flex justify-between text-md mt-2 border-b-2 border-dashed"></tr>}
                        </div>
                       ))} 
                  </tbody>
                  </table>
                  <div className="flex justify-between border-b-[1.2px] border-black mt-2 py-1"></div>
                  <div className="flex flex-col w-full">
                  {invoiceInfo?.taxInfo?.sgstAmount &&<div className="w-full flex justify-end gap-x-10">
                      <div className="w-11/12 flex justify-end mx-auto mt-2 px-2 text-sm font-semibold rounded-md uppercase ">
                        SubTotal{" "}
                      </div>
                      <div className="w-3/12 flex justify-end mx-auto mt-1 px-2 text-sm font-semibold rounded-md ">
                        ₹ {invoiceInfo?.amountInfo?.amount}
                      </div>
                    </div>}
                    {invoiceInfo?.taxInfo?.cgstAmount && <div className='border-b-2 border-dashed py-1'></div>}
                  {invoiceInfo?.taxInfo?.cgstAmount &&<div className="w-full flex justify-end gap-x-10">
                      <div className="w-11/12 flex justify-end mx-auto mt-2 px-2 text-sm font-semibold rounded-md uppercase ">
                        CGST {invoiceInfo?.taxInfo?.cgstAmount}%
                      </div>
                      <div className="w-3/12 flex justify-end mx-auto mt-1 px-2 text-sm font-semibold rounded-md">
                        ₹ {Math.round(invoiceInfo?.taxCalculatedInfo?.cgst)}
                      </div>
                    </div>}
                    {invoiceInfo?.taxInfo?.cgstAmount && <div className='border-b-2 border-dashed py-1'></div>}
                    {
                      invoiceInfo?.taxInfo?.sgstAmount && <div className="w-full flex justify-end gap-x-10">
                      <div className="w-11/12 flex justify-end mx-auto mt-2 px-2 text-sm font-semibold rounded-md uppercase ">
                        SGST {invoiceInfo?.taxInfo?.sgstAmount}%
                      </div>
                      <div className="w-3/12 flex justify-end mx-auto mt-1 px-2 text-sm font-semibold rounded-md ">
                        ₹ {Math.round(invoiceInfo?.taxCalculatedInfo?.sgst)}
                      </div>
                    </div>
                    }
                    { invoiceInfo?.taxInfo?.sgstAmount && <div className='border-b-2 border-dashed py-1'></div>}
                    <div className="w-full flex justify-end gap-x-12">
                      <div className="w-11/12 flex justify-end mx-auto mt-2 px-2 text-sm font-bold rounded-md uppercase text-center">
                        Total{" "}
                      </div>
                      <div className="w-3/12 flex justify-end mx-auto mt-1 px-2 text-sm font-bold rounded-md ">
                        ₹ {Math.round(invoiceInfo?.amountInfo?.amount + invoiceInfo?.taxCalculatedInfo?.sgst + invoiceInfo?.taxCalculatedInfo?.cgst)}
                      </div>
                    </div>
                    <div className='border-b-2 border-dashed py-1'></div>
                   {
                   invoiceInfo?.amountInfo?.advance > 0 &&
                    <div className="w-full flex justify-end gap-x-12">
                      <div className="w-11/12 flex justify-end mx-auto mt-1 px-2 text-sm font-bold rounded-md uppercase text-center">
                        Advance{" "}
                      </div>
                      <div className="w-3/12 flex justify-end mx-auto mt-1 px-2 text-sm font-bold rounded-md ">
                        ₹ {invoiceInfo?.amountInfo?.advance}
                      </div>
                    </div>}
                    <div className='border-b-2 border-dashed py-1'></div>
                    {invoiceInfo?.taxCalculatedInfo?.balance ? (<div className="w-full flex justify-end gap-x-10">
                      <div className="w-11/12 flex justify-end mx-auto mt-1 px-2 text-sm font-bold rounded-md uppercase text-center">
                        Balance{" "}
                      </div>
                      <div className="w-3/12 flex justify-end mx-auto mt-1 px-2 text-sm font-bold rounded-md ">
                        ₹ {invoiceInfo?.taxCalculatedInfo?.balance}
                      </div>
                    </div>) : (<div className=" mt-1 px-2 text-xl font-extrabold rounded-md  text-right text-green-700 ">Fully Paid</div>)}
                
              </div>
                  <div className="flex justify-between border-b-[1.2px] border-black mt-2"></div>
                  <div className='flex justify-between w-full mx-auto mt-2'>
                    <div className='flex flex-col text-left text-sm text-red-900'>
                      {/* <div>बिका हुआ मॉल वापस नहीं होगा |</div>
                      <div>कलर और जरी की गारंटी नहीं है |</div>
                      <div>भूल चूक लेनी देनी |</div>
                      <div>फैशन के दौर में गारंटी की इच्छा नहीं करे |</div> */}
                      {/* <div>Terms & Conditions:</div>
                      <div>1. Subject to Jaipur Jurisdiction.</div>
                      <div>2. Goods once sold will not be taken back.</div>
                      <div>3. E. & E.O.</div> */}
                      <div>{invoiceInfo?.additionalInfo?.note1}</div>
                      <div>{invoiceInfo?.additionalInfo?.note2}</div>
                      <div>{invoiceInfo?.additionalInfo?.note3}</div>
                      <div>{invoiceInfo?.additionalInfo?.note4}</div>
                      
                    </div>
                    <div className='text-sm text-blue-700 font-bold'>
                      <div>NO CHANGE</div>
                      <div>NO REFUND</div>
                      <div>NO CANCEL</div>
                    <div className='text-sm text-black mt-4'>For: {invoiceInfo?.businessInfo?.name}</div>
                    </div>
                   
                  </div>
                 { invoiceInfo?.invoiceInfo?.expectedDate && <div className='text-sm font-semibold text-blue-700 text-center'>Expected Delivery Date :  {expectedDate}</div>}
          </div>
        </div>
        </div>
    )
}

export default ViewInvoice;