import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegEdit } from "react-icons/fa";
import { BsWhatsapp } from "react-icons/bs";
import { Printer } from "lucide-react";
import { Download, MessageCircle } from "lucide-react";
import axios from "axios";

import {
  addDoc,
  collection,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "react-toastify";
import Header from "../Header";
import MobileMenu from "../MobileMenu";
import Loader from "../Loader";

function Invoice() {
  const [businessInfo, setBusinessInfo] = useState({});
  const [taxInfo, setTaxInfo] = useState({});
  const [additionalInfo, setAdditionalInfo] = useState({});
  const [customerInfo, setCustomerInfo] = useState({});
  const [invoiceInfo, setInvoiceInfo] = useState({});
  const [amountInfo, setAmountInfo] = useState({});
  const [taxCalculatedInfo, setTaxCalculatedInfo] = useState({});
  const [rows, setRows] = useState({});
  const [total, setTotal] = useState(0);
  const printRef = useRef(null);
  const pdfExportComponent = React.useRef(null);

  const navigate = useNavigate();
  const handleNext = () => {
    navigate("/additionalinfo");
  };
  const handleBack = () => {
    navigate(-1);
  };

  let date = "";
  if (invoiceInfo?.date) {
    var today = new Date(invoiceInfo.date);
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
  if (invoiceInfo?.expectedDate) {
    var today = new Date(invoiceInfo.expectedDate);
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

  const [loading, setLoading] = useState(false);
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
    pdf.save(`${customerInfo?.customerName + "_invoice"}.pdf`);

    const linkStr = generateBase62String();
    await addInvoiceDataToDB(linkStr);
    toast("Invoice downloaded successfully!", {
      position: "top-center",
    });
  };

  const addInvoiceDataToDB = async (linkStr) => {
    // reduce the quantity of items in inventory
    const inventoryInfo_CollectionRef = collection(db, "Inventory_Info");
    const data = await getDocs(inventoryInfo_CollectionRef);
    const filteredData = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    const loggedInUser = localStorage.getItem("user");
    const inventoryInfo = filteredData.filter(
      (x) => x.loggedInUser === loggedInUser
    )[0];
    if (!inventoryInfo) return;
    const existingItems = inventoryInfo.inventory.sort((a, b) =>
      a.itemName.localeCompare(b.itemName)
    );
    // Prepare the updated item
    const updatedItems = existingItems.map((item) => {
      const row = rows.find((r) => r.desc === item.itemName);
      if (row) {
        return {
          ...item,
          itemQty: item.itemQty - row.qty,
        };
      }
      return item;
    });
    // Update the inventory in Firestore
    const codeDoc = doc(db, "Inventory_Info", inventoryInfo.id);
    await updateDoc(codeDoc, {
      inventory: updatedItems,
    });

    localStorage.setItem("inventoryItems", JSON.stringify(updatedItems));
    await addDoc(invoiceInfo_CollectionRef, {
      invoiceInfo,
      amountInfo,
      customerInfo,
      rows,
      businessInfo,
      taxInfo,
      additionalInfo,
      taxCalculatedInfo,
      loggedInUser,
    });

    const invoiceInfo_CollectionRef1 = collection(db, "Invoice_LinkInfo");
    // for link uses
    await addDoc(invoiceInfo_CollectionRef1, {
      invoiceInfo,
      amountInfo,
      customerInfo,
      rows,
      businessInfo,
      taxInfo,
      additionalInfo,
      taxCalculatedInfo,
      linkStr,
    });

    clearLocalStorage();
    await updateInvoiceNumber();
  };

  function generateBase62String(length = 35) {
    const chars =
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let result = "";
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }

    return result;
  }

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

  const handleWhatsApp = async () => {
    // 1. Generate random link - 10 char long link - whatsapp view
    // 2. Store invoice data along with the link
    // 3. Send Whatsapp meesage to customer
    // 4. When customer click on invoice button -
    // - it will show invoice and user can download if he want

    //await fetch("http://localhost:5001/invoice");

    try {
      // Render the HTML element to canvas
      // const element = printRef.current;
      // const canvas = await html2canvas(element, { scale: 2 });
      // const imgData = canvas.toDataURL("image/png");

      // // Generate PDF
      // const pdf = new jsPDF("p", "mm", "a4");
      // const pdfWidth = pdf.internal.pageSize.getWidth();
      // const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      // // Convert PDF to Blob
      // const pdfBlob = pdf.output("blob");

      // // Prepare form data for Cloudinary upload
      // const formData = new FormData();
      // formData.append("file", pdfBlob);
      // formData.append("upload_preset", "invoice");

      // //"https://res.cloudinary.com/dixqxdivr/image/upload/v1749145006/b6pomfjrylwxvog1e4bo.pdf"

      // // Upload to Cloudinary
      // const cloudName = "dixqxdivr";
      // const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

      // const response = await axios.post(url, formData, {
      //   headers: { "Content-Type": "multipart/form-data" },
      // });

      // console.log("Cloudinary upload response:", response.data);
      // alert("PDF uploaded! URL:\n" + response.data.secure_url);
      setLoading(true);

      const alreadyPrintedOnce = await checkIfInvoiceAlreadyPrintedOnce();
      if (alreadyPrintedOnce) {
        toast("Invoice sent successfully!", {
          position: "top-center",
        });
        setLoading(false);
        return;
      }

      const linkStr = generateBase62String();
      await addInvoiceDataToDB(linkStr);

      //const response = await fetch("http://localhost:5001/send-sms"
      const response = await fetch(
        "https://invoicesimplify.onrender.com/send-sms",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: customerInfo.customerName,
            to: "+91" + customerInfo.customerPhone,
            businessname: businessInfo.name,
            amount: amountInfo?.amount,
            message:
              "Dear " +
              customerInfo.customerName +
              ",\n\nThank you for your purchase! Your invoice is ready.\n\n" +
              "You can view your invoice using the link below:\n\n" +
              "https://www.invoicesimplify.netlify.com/customerinvoice/" +
              linkStr +
              "\n\nIf you have any questions, feel free to contact us.\n\n" +
              "Best regards,\n" +
              businessInfo.name +
              "\n" +
              businessInfo.phonePrimary,
            urllink:
              "https://www.invoicesimplify.netlify.com/customerinvoice/" +
              linkStr,
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
      console.error("Error generating/uploading PDF", error);
      alert("Failed to generate or upload PDF.");
    }
  };

  const sendInvoiceToNumber = async (phoneNumber) => {};

  const clearLocalStorage = () => {
    localStorage.removeItem("custname");
    localStorage.removeItem("custphone");
    localStorage.removeItem("expectedDate");
    localStorage.removeItem("advance");
    localStorage.removeItem("rows");
    localStorage.removeItem("paymentType");
    localStorage.removeItem("advanceAmount");
    localStorage.removeItem("selectedItem");
    localStorage.removeItem("selectedItemCode");
    localStorage.removeItem("selectedItemPrice");
    localStorage.removeItem("selectedItemBuyPrice");
    localStorage.removeItem("selectedItemQty");
  };

  const sendToWhatsapp = async () => {
    const html = document.getElementById("invoice").innerHTML;
    const phoneNumber = "919999999999"; // without '+'

    const response = await fetch("http://localhost:5001/send-pdf-whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html, phone: phoneNumber }),
    });

    const data = await response.json();
    alert(data.message || "Sent!");
  };

  const login_CollectionRef = collection(db, "Login_Info");
  const updateInvoiceNumber = async () => {
    const data = await getDocs(login_CollectionRef);
    const filteredData = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    const loginInfo = filteredData.filter((x) => x.code === loggedInUser)[0];

    const codeDoc = doc(db, "Login_Info", loginInfo.id);
    await updateDoc(codeDoc, {
      invoiceNumber: loginInfo.invoiceNumber + 1,
    });
  };

  const handlePrint = useReactToPrint({
    documentTitle: "Invoice",
    contentRef: printRef,
    onAfterPrint: async () => {
      try {
        const alreadyPrintedOnce = await checkIfInvoiceAlreadyPrintedOnce();
        if (alreadyPrintedOnce) {
          toast("Invoice printed successfully!", {
            position: "top-center",
          });
          return;
        }

        const linkStr = generateBase62String();
        await addInvoiceDataToDB(linkStr);
        toast("Invoice printed successfully!", {
          position: "top-center",
        });
      } catch (error) {
        console.error("Error adding invoice data to the database:", error);
        toast("Failed to add invoice data to the database.", {
          position: "top-center",
        });
      }
    },
  });

  const checkIfInvoiceAlreadyPrintedOnce = async () => {
    const data = await getDocs(invoiceInfo_CollectionRef);
    const filteredData = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    if (!filteredData) return false;

    const allBrandsInfo = filteredData.filter(
      (x) => x.loggedInUser === loggedInUser
    );

    if (!allBrandsInfo) return false;

    const invoiceData = allBrandsInfo.filter(
      (x) => x.invoiceInfo.invoiceNumber === parseInt(invoiceInfo.invoiceNumber)
    )[0];

    return invoiceData !== undefined;
  };

  useEffect(() => {
    let info1 = localStorage.getItem("businessInfo");
    setBusinessInfo(JSON.parse(info1));

    let info2 = localStorage.getItem("taxInfo");
    if (info2 !== "undefined") {
      setTaxInfo(JSON.parse(info2));
    }

    let info3 = localStorage.getItem("additionalInfo");
    if (info3 !== "undefined") {
      setAdditionalInfo(JSON.parse(info3));
    }

    let info4 = localStorage.getItem("customerInfo");
    setCustomerInfo(JSON.parse(info4));

    let info5 = localStorage.getItem("invoiceInfo");
    setInvoiceInfo(JSON.parse(info5));

    let info6 = localStorage.getItem("amountInfo");
    setAmountInfo(JSON.parse(info6));

    let info7 = localStorage.getItem("taxCalculatedInfo");
    setTaxCalculatedInfo(JSON.parse(info7));

    let info8 = localStorage.getItem("rows");
    setRows(JSON.parse(info8));

    let info9 = localStorage.getItem("total");
    setTotal(info9);
  }, []);

  const handleLogin = () => {
    const user = localStorage.getItem("user");

    if (!user || user === "undefined" || user === "null") {
      navigate("/login");
    }
  };

  useEffect(() => {
    handleLogin();
  }, []);

  return (
    <div>
      <div className="hidden max-lg:block mb-16">
        <MobileMenu />
      </div>

      <div className="my-5 p-1 lg:p-6">
        <div className="flex flex-wrap justify-between w-full lg:w-8/12 mx-auto ">
          <div className="flex gap-x-2">
            <button
              onClick={() => navigate("/createinvoice")}
              className="flex items-center bg-[#E5E7EB] cursor-pointer font-bold px-2 lg:px-4 py-2 rounded-md hover:bg-blue-700 hover:text-white transition duration-300"
            >
              <span className="mr-2">
                <FaRegEdit size={22} />
              </span>
              Edit
            </button>
          </div>
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

        <div className="w-full lg:w-8/12 mx-auto border-[1.7px] rounded-md m-2 mt-4">
          <div id="invoice" ref={printRef} className="p-2 lg:p-8 m-4">
            <div className="flex justify-between">
              <div>
                <img src="../images/matadi1.jpeg" className="h-20 w-20" />
              </div>
              <div className="text-center">
                <div className="text-xl lg:text-3xl font-bold">
                  {businessInfo?.name}
                </div>
                {/* <div className='text-3xl font-bold'>बाईसाराज पौशाक पैलेस</div> */}
                <div className="text-md lg:text-lg font-medium">
                  {businessInfo?.subTitle1}
                </div>
                <div className="text-md lg:text-lg font-medium">
                  {businessInfo?.subTitle2}
                </div>
              </div>

              <div className="flex flex-col font-semibold">
                {businessInfo?.phonePrimary && (
                  <div>M: {businessInfo.phonePrimary}</div>
                )}
                <div className="ml-6">{businessInfo?.phoneSecondary}</div>
              </div>
            </div>
            {taxInfo?.gstNumber && (
              <div className="text-sm font-medium text-center mt-1">
                GSTIN: {taxInfo.gstNumber}
              </div>
            )}
            <hr className="w-full mt-4 border-[1.1px]"></hr>
            {businessInfo?.address && (
              <div className="py-2 text-center">{businessInfo.address}</div>
            )}
            <hr className="w-full mt-1 border-[1.1px]"></hr>
            <div className="flex justify-between">
              <div className="w-8/12 mx-auto text-left font-semibold py-2">
                <div className="mb-2">To:</div>

                <div>{customerInfo?.customerName}</div>
                <div>{customerInfo?.customerPhone}</div>
              </div>

              <div className=" w-4/12 mx-auto flex flex-col gap-y-3 font-bold py-2">
                <div className="w-full">
                  <div className="text-end text-sm">INVOICE</div>
                  <div className="text-end text-gray-500 text-sm">
                    {invoiceInfo?.invoiceNumber}
                  </div>
                </div>

                <div className="w-full">
                  <div className="text-end text-sm">DATE</div>
                  <div className="text-end text-gray-500 text-sm">{date}</div>
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
                    <th className="w-[10%] hidden lg:block">Quantity</th>
                    <th className="w-[10%] hidden max-lg:block">Qty</th>
                    <th className="w-[20%]">Amount</th>
                  </tr>
                  <tr className="flex justify-between border-b-[1.2px] border-black mt-2"></tr>
                </thead>
                <tbody>
                  {rows &&
                    rows.length > 0 &&
                    rows.map((row, index) => (
                      <div>
                        <tr className="flex justify-between text-md mt-1 font-light w-full mx-auto gap-x-4">
                          <td className="w-[10%] ">{index + 1}.</td>
                          <td className="w-[40%] text-left">{row.desc}</td>
                          <td className="w-[20%] ">{row.rate}</td>
                          <td className="w-[10%] ">
                            {row.qty}{" "}
                            <span className="ml-1 uppercase">
                              {row?.selectedUnit}
                            </span>
                          </td>
                          <td className="w-[20%]"> {row.amount}</td>
                        </tr>
                        {rows.length > index + 1 && (
                          <tr className="flex justify-between text-md mt-2 border-b-2 border-dashed"></tr>
                        )}
                      </div>
                    ))}
                </tbody>
              </table>
              <div className="flex justify-between border-b-[1.2px] border-black  py-1"></div>
              <div className="flex flex-col w-full">
                <div className="w-full flex justify-end gap-x-10 mt-2">
                  <div className="w-11/12 flex justify-end mx-auto mt-1 px-2 text-sm font-semibold rounded-md uppercase">
                    SubTotal
                  </div>
                  <div className="w-3/12 flex justify-end mx-auto mt-1 px-2 text-sm font-semibold rounded-md">
                    ₹ {amountInfo?.amount}
                  </div>
                </div>

                {taxInfo?.sgstAmount && (
                  <div className="border-b-2 border-dashed py-1"></div>
                )}
                {taxInfo?.cgstAmount && (
                  <div className="w-full flex justify-end gap-x-10 mt-2">
                    <div className="w-11/12 flex justify-end mx-auto mt-2 px-2 text-sm font-semibold rounded-md uppercase">
                      CGST {taxInfo?.cgstAmount}%
                    </div>
                    <div className="w-3/12 flex justify-end mx-auto mt-1 px-2 text-sm font-semibold rounded-md">
                      ₹ {taxCalculatedInfo?.cgst}
                    </div>
                  </div>
                )}
                {taxInfo?.cgstAmount && (
                  <div className="border-b-2 border-dashed py-1"></div>
                )}
                {taxInfo?.sgstAmount && (
                  <div className="w-full flex justify-end gap-x-10 mt-2">
                    <div className="w-11/12 flex justify-end mx-auto mt-2 px-2 text-sm font-semibold rounded-md uppercase">
                      SGST {taxInfo.sgstAmount}%
                    </div>
                    <div className="w-3/12 flex justify-end mx-auto mt-1 px-2 text-sm font-semibold rounded-md">
                      ₹ {taxCalculatedInfo?.sgst}
                    </div>
                  </div>
                )}
                {taxInfo?.sgstAmount && (
                  <div className="border-b-2 border-dashed py-1"></div>
                )}
                <div className="w-full flex justify-end gap-x-10 mt-2">
                  <div className="w-11/12 flex justify-end mx-auto mt-2 px-2 text-sm font-bold rounded-md uppercase">
                    Total
                  </div>
                  <div className="w-3/12 mx-auto flex justify-end mt-1 px-2  text-sm font-bold rounded-md">
                    ₹ {total}
                  </div>
                </div>
                <div className="border-b-2 border-dashed py-1"></div>
                {amountInfo?.paymentType === "advance" && (
                  <div className="w-full flex justify-end gap-x-10 mt-2">
                    <div className="w-11/12 flex justify-end mx-auto mt-2 px-2 text-sm font-bold rounded-md uppercase">
                      Advance
                    </div>
                    <div className="w-3/12 flex justify-end mx-auto mt-1 px-2 text-sm font-bold rounded-md">
                      ₹ {amountInfo?.advance}
                    </div>
                  </div>
                )}
                <div className="border-b-2 border-dashed py-1"></div>
                {amountInfo?.paymentType === "advance" ? (
                  <div className="w-full flex justify-end gap-x-10 mt-2">
                    <div className="w-11/12 flex justify-end mx-auto mt-1 px-2 text-sm font-bold rounded-md uppercase">
                      Balance
                    </div>
                    <div className="w-3/12 flex justify-end mx-auto mt-1 px-2 text-sm font-bold rounded-md">
                      ₹{" "}
                      {Math.round(taxCalculatedInfo.balance) ??
                        Math.round(
                          parseInt(
                            amountInfo.amount +
                              taxCalculatedInfo?.cgst +
                              taxCalculatedInfo?.sgst
                          )
                        )}
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex justify-end gap-x-10 mt-2 font-bold text-lg text-green-800">
                    Fully Paid
                  </div>
                )}
              </div>
              <div className="flex justify-between border-b-[1.2px] border-black mt-2"></div>
              <div className="flex justify-between w-full mx-auto mt-2">
                <div className="flex flex-col text-left text-sm text-red-900">
                  {/* <div>बिका हुआ मॉल वापस नहीं होगा |</div>
                      <div>कलर और जरी की गारंटी नहीं है |</div>
                      <div>भूल चूक लेनी देनी |</div>
                      <div>फैशन के दौर में गारंटी की इच्छा नहीं करे |</div> */}
                  {/* <div>Terms & Conditions:</div>
                      <div>1. Subject to Jaipur Jurisdiction.</div>
                      <div>2. Goods once sold will not be taken back.</div>
                      <div>3. E. & E.O.</div> */}
                  <div>{additionalInfo?.note1}</div>
                  <div>{additionalInfo?.note2}</div>
                  <div>{additionalInfo?.note3}</div>
                  <div>{additionalInfo?.note4}</div>
                </div>
                <div className="text-sm text-blue-700 font-bold">
                  <div>{additionalInfo?.middlenote1}</div>
                  <div>{additionalInfo?.middlenote2}</div>
                  <div>{additionalInfo?.middlenote3}</div>
                  <div>{additionalInfo?.middlenote4}</div>
                </div>
                <div className="text-sm text-blue-700 font-bold">
                  <div>{additionalInfo?.rnote1}</div>
                  <div>{additionalInfo?.rnote2}</div>
                  <div>{additionalInfo?.rnote3}</div>
                  <div>{additionalInfo?.rnote4}</div>
                  <div className="text-sm text-black mt-4">
                    For: {businessInfo?.name}
                  </div>
                </div>
              </div>

              {invoiceInfo?.expectedDate && (
                <div className="text-sm font-semibold text-blue-700 text-center">
                  Expected Delivery Date : {expectedDate}
                </div>
              )}

              <div className="mt-2"></div>
              <div className="text-sm text-gray-700 font-bold">
                <div>{additionalInfo?.additionaldesc}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {loading && <Loader />}
    </div>
  );
}

export default Invoice;
