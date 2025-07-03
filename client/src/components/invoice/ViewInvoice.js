import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaRegEdit } from "react-icons/fa";
import { BsWhatsapp } from "react-icons/bs";
import { Printer, MessageCircle } from "lucide-react";
import { Download } from "lucide-react";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "react-toastify";
import Header from "../Header";
import MobileMenu from "../MobileMenu";
import Loader from "../Loader";

function ViewInvoice() {
  const [invoiceInfo, setInvoiceInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const printRef = useRef(null);

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
  const handleDownload = async () => {
    const input = document.getElementById("invoice");
    if (!input) return;

    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${invoiceInfo.customerInfo?.customerName + "_invoice"}.pdf`);

    toast("Invoice downloaded successfully!", {
      position: "top-center",
    });
  };

  const handlePrint = useReactToPrint({
    documentTitle: "Invoice",
    contentRef: printRef,
  });

  const getInvoiceData = async () => {
    try {
      setLoading(true);
      const allBrandsInfo = JSON.parse(localStorage.getItem("dashboardInfo"));

      const invoiceData = allBrandsInfo.filter((x) => x.id === id)[0];

      setInvoiceInfo(invoiceData);
    } catch (error) {
      toast.error("Failed to load invoice data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  const getCurrentDate = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    const formatted = `${day}/${month}/${year}  ${hours}:${minutes}`;
    return formatted;
  };
  const getLinkStr = async (invoiceNumber) => {
    const invoiceInfo_CollectionRef2 = collection(db, "Invoice_Info");
    const data = await getDocs(invoiceInfo_CollectionRef2);
    const filteredData = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    const allBrandsInfo = filteredData.filter(
      (x) => x.loggedInUser === loggedInUser
    );

    const invoiceData = allBrandsInfo.filter(
      (x) => x.invoiceInfo.invoiceNumber === parseInt(invoiceNumber)
    )[0];

    return invoiceData.linkStr;
  };
  const handleWhatsApp = async () => {
    try {
      setLoading(true);

      const linkStr = await getLinkStr(invoiceInfo.invoiceInfo.invoiceNumber);

      const response = await fetch(
        "https://invoicesimplify.onrender.com/send-sms",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: invoiceInfo.customerInfo.customerName,
            to: "+91" + invoiceInfo.customerInfo.customerPhone,
            businessname: invoiceInfo.businessInfo.name,
            amount: invoiceInfo.amountInfo?.amount,
            message:
              "Dear " +
              invoiceInfo.customerInfo.customerName +
              ",\n\nThank you for your purchase! Your invoice is ready.\n\n" +
              "You can view your invoice using the link below:\n\n" +
              "https://invoicesimplify.com/ci/" +
              linkStr +
              "\n\nIf you have any questions, feel free to contact us.\n\n" +
              "Best regards,\n" +
              invoiceInfo.businessInfo.name +
              "\n" +
              invoiceInfo.businessInfo.phonePrimary,
            urllink: "https://invoicesimplify.com/ci/" + linkStr,
            date: getCurrentDate(),
          }),
        }
      );

      const result = await response.json();

      //const res = await fetch("http://localhost:5001/send-message");
      //const data = await res.json();
      if (result.success) {
        alert("Message sent successfully!");
      } else {
        alert("Failed to send message.");
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error sending message", error);
      alert("Error sending message.", error);
    }
  };
  const handleLogin = () => {
    const user = localStorage.getItem("user");

    if (!user || user === "undefined" || user === "null") {
      navigate("/login");
    }
  };

  useEffect(() => {
    handleLogin();
    getInvoiceData();
  }, []);
  return (
    <div>
      <div className="hidden max-lg:block mb-16">
        <MobileMenu />
      </div>
      <div className="my-1 lg:my-5 p-1 lg:p-6">
        <div className="flex justify-between w-full lg:w-8/12 mx-auto">
          <div>
            <button
              onClick={handlePrint}
              className="flex items-center bg-[#E5E7EB]  font-bold px-2 lg:px-4 py-2 rounded-md hover:bg-blue-700 hover:text-white transition duration-300"
            >
              <span className="mr-2">
                <Printer />
              </span>
              Print
            </button>
          </div>

          {/* <div>
            <button
              onClick={() => handleDownload()}
              className="flex items-center bg-[#E5E7EB]  font-bold px-4 py-2 rounded-md hover:bg-blue-700 hover:text-white transition duration-300"
            >
              <span className="mr-2">
                <Download />
              </span>
              Download
            </button>
          </div> */}

          <div>
            <button
              onClick={() => handleWhatsApp()}
              className="flex items-center bg-[#E5E7EB]  font-bold px-2 lg:px-4 py-2 rounded-md hover:bg-blue-700 hover:text-white transition duration-300"
            >
              <span className="mr-2">
                <MessageCircle size={22} />
              </span>
              Message
            </button>
          </div>
        </div>
        <div
          id="invoice"
          className="w-full lg:w-8/12 mx-auto border-[1.7px] mt-4 rounded-md"
        >
          <div ref={printRef} className="p-2 lg:p-8">
            <div className="flex justify-between">
              <div>
                <img
                  src="../images/matadi1.jpeg"
                  className="h-10 lg:h-20 w-10 lg:w-20"
                />
              </div>
              <div className="text-center">
                <div className="text-md lg:text-2xl font-bold">
                  {invoiceInfo?.businessInfo?.name}
                </div>
                {/* <div className='text-3xl font-bold'>बाईसाराज पौशाक पैलेस</div> */}
                <div className="text-sm lg:text-lg font-medium">
                  {invoiceInfo?.businessInfo?.subTitle1}
                </div>
                <div className="text-sm lg:text-md font-medium">
                  {invoiceInfo?.businessInfo?.subTitle2}
                </div>
                <div className="text-sm font-normal mt-1">
                  {invoiceInfo?.businessInfo?.email}
                </div>
              </div>

              <div className="flex flex-col font-semibold text-md hidden lg:block">
                {invoiceInfo.businessInfo?.phonePrimary && (
                  <div>M: {invoiceInfo.businessInfo.phonePrimary}</div>
                )}
                <div className="ml-4 lg:ml-6">
                  {invoiceInfo.businessInfo?.phoneSecondary}
                </div>
              </div>
              <div className="flex flex-col font-semibold text-xs hidden max-lg:block">
                {invoiceInfo.businessInfo?.phonePrimary && (
                  <div>M: {invoiceInfo.businessInfo.phonePrimary}</div>
                )}
                <div className="ml-4 lg:ml-6">
                  {invoiceInfo.businessInfo?.phoneSecondary}
                </div>
              </div>
            </div>
            {invoiceInfo?.taxInfo?.gstNumber && (
              <div className="text-sm font-medium text-center mt-2">
                GSTIN: {invoiceInfo?.taxInfo?.gstNumber}
              </div>
            )}
            <hr className="w-full mt-4 border-[1.1px]"></hr>
            {invoiceInfo.businessInfo?.address && (
              <div className="py-1 text-sm lg:text-md text-center hidden max-lg:block">
                {invoiceInfo.businessInfo.address}
              </div>
            )}
            {invoiceInfo.businessInfo?.address && (
              <div className="py-1 text-md lg:text-md text-center hidden lg:block">
                {invoiceInfo.businessInfo.address}
              </div>
            )}
            <hr className="w-full mt-1 border-[1.1px]"></hr>
            <div className="flex justify-between">
              <div className="w-full lg:w-8/12 mx-auto text-left font-semibold py-2">
                <div className="mb-2 text-sm lg:text-[16px]">To:</div>

                <div className="text-sm lg:text-[16px]">
                  {invoiceInfo?.customerInfo?.customerName}
                </div>
                <div className="text-sm lg:text-[16px]">
                  {invoiceInfo?.customerInfo?.customerPhone}
                </div>
              </div>

              <div className=" w-4/12 mx-auto flex flex-col gap-y-3 font-bold py-2">
                <div className="w-full">
                  <div className="text-end text-xs lg:text-sm">INVOICE</div>
                  <div className="text-end text-gray-500 text-xs lg:text-sm">
                    {invoiceInfo?.invoiceInfo?.invoiceNumber}
                  </div>
                </div>

                <div className="w-full">
                  <div className="text-end text-xs lg:text-sm">DATE</div>
                  <div className="text-end text-gray-500 text-xs lg:text-sm">
                    {date}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-between border-b-[1.2px] border-black mt-6"></div>
            <div className="overflow-hidden">
              <div className="overflow-hidden mt-2 hidden lg:block">
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
                    {invoiceInfo?.rows &&
                      invoiceInfo?.rows.length > 0 &&
                      invoiceInfo?.rows.map((row, index) => (
                        <div>
                          <tr className="flex justify-between text-md mt-1 font-light w-full mx-auto gap-x-4">
                            <td className="w-[10%] ">{index + 1}.</td>
                            <td className="w-[40%] text-left">{row?.desc}</td>
                            <td className="w-[20%] ">{row?.rate}</td>
                            <td className="w-[10%] ">
                              {row?.qty}{" "}
                              <span className="ml-1 uppercase">
                                {row?.selectedUnit}
                              </span>
                            </td>
                            <td className="w-[20%]"> {row?.amount}</td>
                          </tr>
                          {invoiceInfo?.rows.length > index + 1 && (
                            <tr className="flex justify-between text-md mt-2 border-b-2 border-dashed"></tr>
                          )}
                        </div>
                      ))}
                  </tbody>
                </table>
              </div>
              <div className="overflow-hidden mt-2 hidden max-lg:block">
                <table className=" w-full mx-auto text-center text-sm font-light">
                  <thead className="text-sm uppercase">
                    <tr className="flex justify-between w-full mx-auto gap-x-4">
                      <th className="w-[40%] text-xs text-left">Desc</th>
                      <th className="w-[20%] text-xs">Rate</th>
                      <th className="w-[15%] text-xs">Qty</th>
                      <th className="w-[25%] text-xs">Amount</th>
                    </tr>
                    <tr className="flex justify-between border-b-[1.2px] border-black mt-2"></tr>
                  </thead>
                  <tbody>
                    {invoiceInfo?.rows &&
                      invoiceInfo?.rows.length > 0 &&
                      invoiceInfo?.rows.map((row, index) => (
                        <div>
                          <tr className="flex justify-between text-md mt-1 font-light w-full mx-auto gap-x-4">
                            <td className="w-[40%] text-left text-xs">
                              {row?.desc}
                            </td>
                            <td className="w-[20%] text-xs ">{row?.rate}</td>
                            <td className="w-[15%] text-xs ">
                              {row?.qty}{" "}
                              <span className="ml-1 uppercase">
                                {row?.selectedUnit}
                              </span>
                            </td>
                            <td className="w-[25%] text-xs"> {row?.amount}</td>
                          </tr>
                          {invoiceInfo?.rows.length > index + 1 && (
                            <tr className="flex justify-between text-md mt-2 border-b-2 border-dashed"></tr>
                          )}
                        </div>
                      ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between border-b-[1.2px] border-black mt-2 py-1"></div>
              <div className="flex flex-col w-full">
                {
                  <div className="w-full flex justify-end gap-x-10">
                    <div className="w-11/12 flex justify-end mx-auto mt-2 px-2 text-xs lg:text-sm font-semibold rounded-md uppercase ">
                      SubTotal{" "}
                    </div>
                    <div className="w-3/12 flex justify-end mx-auto mt-1 px-2 text-xs lg:text-sm font-semibold rounded-md ">
                      ₹ {invoiceInfo?.amountInfo?.amount}
                    </div>
                  </div>
                }
                {invoiceInfo?.taxInfo?.cgstAmount && (
                  <div className="border-b-2 border-dashed py-1"></div>
                )}
                {invoiceInfo?.taxInfo?.cgstAmount && (
                  <div className="w-full flex justify-end gap-x-10">
                    <div className="w-11/12 flex justify-end mx-auto mt-2 px-2 text-xs lg:text-sm font-semibold rounded-md uppercase ">
                      CGST {invoiceInfo?.taxInfo?.cgstAmount}%
                    </div>
                    <div className="w-3/12 flex justify-end mx-auto mt-1 px-2 text-xs lg:text-sm font-semibold rounded-md">
                      ₹ {Math.round(invoiceInfo?.taxCalculatedInfo?.cgst)}
                    </div>
                  </div>
                )}
                {invoiceInfo?.taxInfo?.cgstAmount && (
                  <div className="border-b-2 border-dashed py-1"></div>
                )}
                {invoiceInfo?.taxInfo?.sgstAmount && (
                  <div className="w-full flex justify-end gap-x-10">
                    <div className="w-11/12 flex justify-end mx-auto mt-2 px-2 text-xs lg:text-sm font-semibold rounded-md uppercase ">
                      SGST {invoiceInfo?.taxInfo?.sgstAmount}%
                    </div>
                    <div className="w-3/12 flex justify-end mx-auto mt-1 px-2 text-xs lg:text-sm font-semibold rounded-md ">
                      ₹ {Math.round(invoiceInfo?.taxCalculatedInfo?.sgst)}
                    </div>
                  </div>
                )}
                {invoiceInfo?.taxInfo?.sgstAmount && (
                  <div className="border-b-2 border-dashed py-1"></div>
                )}
                <div className="w-full flex justify-end gap-x-12">
                  <div className="w-11/12 flex justify-end mx-auto mt-2 px-2 text-xs lg:text-sm font-bold rounded-md uppercase text-center">
                    Total{" "}
                  </div>
                  <div className="w-3/12 flex justify-end mx-auto mt-1 px-2 text-xs lg:text-sm font-bold rounded-md ">
                    ₹{" "}
                    {Math.round(
                      invoiceInfo?.amountInfo?.amount +
                        invoiceInfo?.taxCalculatedInfo?.sgst +
                        invoiceInfo?.taxCalculatedInfo?.cgst
                    )}
                  </div>
                </div>
                <div className="border-b-2 border-dashed py-1"></div>
                {invoiceInfo?.amountInfo?.paymentType === "advance" && (
                  <div className="w-full flex justify-end gap-x-10 mt-2">
                    <div className="w-11/12 flex justify-end mx-auto mt-2 px-2 text-xs lg:text-sm font-bold rounded-md uppercase">
                      Advance
                    </div>
                    <div className="w-3/12 flex justify-end mx-auto mt-1 px-2 text-xs lg:text-sm font-bold rounded-md">
                      ₹ {invoiceInfo?.amountInfo?.advance}
                    </div>
                  </div>
                )}
                <div className="border-b-2 border-dashed py-1"></div>
                {invoiceInfo?.amountInfo?.paymentType === "advance" &&
                invoiceInfo?.taxCalculatedInfo.balance > 0 ? (
                  <div className="w-full flex justify-end gap-x-10 mt-2 text-red-700">
                    <div className="w-11/12 flex justify-end mx-auto mt-1 px-2 text-xs lg:text-sm font-bold rounded-md uppercase">
                      Balance
                    </div>
                    <div className="w-3/12 flex justify-end mx-auto mt-1 px-2 text-xs lg:text-sm font-bold rounded-md">
                      ₹{" "}
                      {Math.round(invoiceInfo?.taxCalculatedInfo.balance) ??
                        Math.round(
                          parseInt(
                            invoiceInfo?.amountInfo.amount +
                              invoiceInfo?.taxCalculatedInfo?.cgst +
                              invoiceInfo?.taxCalculatedInfo?.sgst
                          )
                        )}
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex justify-end gap-x-10 mt-2 font-bold text-md lg:text-lg text-green-800">
                    Fully Paid
                  </div>
                )}
              </div>
              <div className="flex justify-between border-b-[1.2px] border-black mt-2"></div>
              {invoiceInfo?.invoiceInfo?.expectedDate && (
                <div className="text-xs lg:text-sm font-semibold text-blue-700 text-center mt-2">
                  Expected Delivery Date : {expectedDate}
                </div>
              )}
              <div className="flex justify-between w-full gap-x-2 mx-auto mt-2">
                <div className="flex flex-col text-left text-red-900 text-[10px] lg:text-sm">
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
                <div className="text-[10px] lg:text-sm text-blue-700 font-bold">
                  <div>{invoiceInfo?.additionalInfo?.middlenote1}</div>
                  <div>{invoiceInfo?.additionalInfo?.middlenote2}</div>
                  <div>{invoiceInfo?.additionalInfo?.middlenote3}</div>
                  <div>{invoiceInfo?.additionalInfo?.middlenote4}</div>
                </div>
                <div className="text-[10px] lg:text-sm text-blue-700 font-bold">
                  <div>{invoiceInfo?.additionalInfo?.rnote1}</div>
                  <div>{invoiceInfo?.additionalInfo?.rnote2}</div>
                  <div>{invoiceInfo?.additionalInfo?.rnote3}</div>
                  <div>{invoiceInfo?.additionalInfo?.rnote4}</div>
                </div>
              </div>
              <div className="mt-4"></div>
              <div className="text-xs lg:text-sm text-gray-700 font-bold">
                <div>{invoiceInfo?.additionalInfo?.additionaldesc}</div>
              </div>
              <div className="text-xs lg:text-sm text-black mt-4 flex justify-end font-bold">
                For: {invoiceInfo?.businessInfo?.name}
              </div>
            </div>
          </div>
        </div>
      </div>
      {loading && <Loader />}
    </div>
  );
}

export default ViewInvoice;
