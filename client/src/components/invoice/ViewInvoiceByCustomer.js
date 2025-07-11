import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { collection, doc, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "react-toastify";
import Loader from "../Loader";
import { INVOICE_LINK_INFO, USERS } from "../Constant";

function ViewInvoiceByCustomer() {
  const [invoiceInfo, setInvoiceInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const printRef = useRef(null);

  const location = useLocation();
  const linkid = location.pathname.split("/")[2];
  const uid = localStorage.getItem("uid");

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
  const invoiceInfo_CollectionRef = collection(
    doc(db, USERS, uid),
    INVOICE_LINK_INFO
  );
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

      const infoData = localStorage.getItem(linkid);
      if (infoData) {
        const infoData1 = JSON.parse(infoData);
        setInvoiceInfo(infoData1);
        return;
      }
      const data = await getDocs(invoiceInfo_CollectionRef);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      const allBrandsInfo = filteredData.filter((x) => x.linkStr === linkid);

      if (allBrandsInfo.length > 0) {
        setInvoiceInfo(allBrandsInfo[0]);
        localStorage.setItem(linkid, JSON.stringify(allBrandsInfo[0]));
      } else {
        alert("No invoice found for this link.");
      }
    } catch (error) {
      alert("Failed to fetch invoice data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getInvoiceData();
    window.scroll(0, 0);
  }, []);
  return (
    <div>
      <div className="my-1 lg:my-5 p-2 lg:p-6">
        {/* <div className="flex justify-between w-8/12 mx-auto">
          <div>
            <button
              onClick={handlePrint}
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
        </div> */}
        <div
          id="invoice"
          className="w-full lg:w-8/12 mx-auto border-[1.7px] mt-4 rounded-md p-0 lg:p-4 "
        >
          <div ref={printRef} className="p-1 lg:p-4">
            <div className="flex justify-between">
              <div>
                <img
                  src="../images/logo14.webp"
                  className="h-10 lg:h-20 w-16 lg:w-[155px]"
                />
              </div>
              <div className="text-center">
                <div className="text-md lg:text-3xl font-bold">
                  {invoiceInfo?.businessInfo?.name}
                </div>
                {/* <div className='text-3xl font-bold'>बाईसाराज पौशाक पैलेस</div> */}
                <div className="text-sm lg:text-lg font-medium">
                  {invoiceInfo?.businessInfo?.subTitle1}
                </div>
                <div className="text-sm lg:text-lg font-medium">
                  {invoiceInfo?.businessInfo?.subTitle2}
                </div>
                <div className="text-sm lg:text-md font-normal mt-1">
                  {invoiceInfo?.businessInfo?.email}
                </div>
              </div>

              <div className="flex flex-col font-semibold text-xs lg:text-md">
                <div>M: {invoiceInfo?.businessInfo?.phonePrimary}</div>
                <div className="ml-4 lg:ml-6">
                  {invoiceInfo?.businessInfo?.phoneSecondary}
                </div>
              </div>
            </div>
            {invoiceInfo?.taxInfo?.gstNumber && (
              <div className="text-sm font-medium text-center mt-2">
                GSTIN: {invoiceInfo?.taxInfo?.gstNumber}
              </div>
            )}
            <hr className="w-full mt-4 border-[1.1px]"></hr>
            <div className="py-2 text-sm lg:text-md text-center">
              {invoiceInfo?.businessInfo?.address}
            </div>
            <hr className="w-full mt-1 border-[1.1px]"></hr>
            <div className="flex justify-between">
              <div className="w-full lg:w-8/12 mx-auto text-left font-semibold py-2">
                <div className="mb-2 text-sm lg:text-[16px]">To:</div>

                <div className="text-sm lg:text-[16px]">
                  {invoiceInfo?.customerInfo?.customerName}
                </div>
                <div className="text-sm lg:text-[16px] mt-1">
                  {invoiceInfo?.customerInfo?.customerPhone}
                </div>
              </div>

              <div className="w-full lg:w-4/12 mx-auto flex flex-col gap-y-3 font-bold py-2">
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
            <div className="flex justify-between border-b-[1.2px] border-black mt-2 lg:mt-6"></div>
            <div className="overflow-hidden mt-2">
              <div className="overflow-hidden mt-2 hidden max-lg:block">
                <table className=" w-full mx-auto text-center text-sm font-light ">
                  <thead className="text-sm lg:text-md uppercase">
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
                          <tr className="flex justify-between text-sm lg:text-md mt-1 font-light w-full mx-auto gap-x-4">
                            <td className="w-[40%] text-left text-xs">
                              {row?.desc}
                            </td>
                            <td className="w-[20%] text-xs">{row?.rate}</td>
                            <td className="w-[15%] text-xs">
                              {row?.qty}{" "}
                              <span className="ml-1 uppercase text-xs">
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
              <div className="overflow-hidden mt-2 hidden lg:block">
                <table className=" w-full mx-auto text-center text-sm font-light ">
                  <thead className="text-sm lg:text-md uppercase">
                    <tr className="flex justify-between w-full mx-auto gap-x-4">
                      <th className="w-[10%]">S.No.</th>
                      <th className="w-[40%] hidden lg:block text-xs text-left">
                        Description
                      </th>
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
                          <tr className="flex justify-between text-sm lg:text-md mt-1 font-light w-full mx-auto gap-x-4">
                            <td className="w-[10%]">{index + 1}.</td>
                            <td className="w-[40%] text-left ">{row?.desc}</td>
                            <td className="w-[10%] ">{row?.rate}</td>
                            <td className="w-[15%] ">
                              {row?.qty}{" "}
                              <span className="ml-1 uppercase ">
                                {row?.selectedUnit}
                              </span>
                            </td>
                            <td className="w-[20%] "> {row?.amount}</td>
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
                      CGST ({invoiceInfo?.taxInfo?.cgstAmount}%)
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
                      SGST ({invoiceInfo?.taxInfo?.sgstAmount}%)
                    </div>
                    <div className="w-3/12 flex justify-end mx-auto mt-1 px-2 text-xs lg:text-sm font-semibold rounded-md ">
                      ₹ {Math.round(invoiceInfo?.taxCalculatedInfo?.sgst)}
                    </div>
                  </div>
                )}
                {invoiceInfo?.taxInfo?.igstAmount && (
                  <div className="w-full flex justify-end gap-x-10">
                    <div className="w-11/12 flex justify-end mx-auto mt-2 px-2 text-xs lg:text-sm font-semibold rounded-md uppercase ">
                      IGST ({invoiceInfo?.taxInfo?.igstAmount}%)
                    </div>
                    <div className="w-3/12 flex justify-end mx-auto mt-1 px-2 text-xs lg:text-sm font-semibold rounded-md">
                      ₹ {Math.round(invoiceInfo?.taxCalculatedInfo?.igst)}
                    </div>
                  </div>
                )}
                {invoiceInfo?.taxInfo?.igstAmount && (
                  <div className="border-b-2 border-dashed py-1"></div>
                )}
                {invoiceInfo?.taxInfo?.ugstAmount && (
                  <div className="w-full flex justify-end gap-x-10">
                    <div className="w-11/12 flex justify-end mx-auto mt-2 px-2 text-xs lg:text-sm font-semibold rounded-md uppercase ">
                      UGST ({invoiceInfo?.taxInfo?.ugstAmount}%)
                    </div>
                    <div className="w-3/12 flex justify-end mx-auto mt-1 px-2 text-xs lg:text-sm font-semibold rounded-md">
                      ₹ {Math.round(invoiceInfo?.taxCalculatedInfo?.ugst)}
                    </div>
                  </div>
                )}
                {invoiceInfo?.taxInfo?.ugstAmount && (
                  <div className="border-b-2 border-dashed py-1"></div>
                )}
                {invoiceInfo?.taxInfo?.taxAmount && (
                  <div className="w-full flex justify-end gap-x-10">
                    <div className="w-11/12 flex justify-end mx-auto mt-2 px-2 text-xs lg:text-sm font-semibold rounded-md uppercase ">
                      Tax ({invoiceInfo?.taxInfo?.taxAmount}%)
                    </div>
                    <div className="w-3/12 flex justify-end mx-auto mt-1 px-2 text-xs lg:text-sm font-semibold rounded-md">
                      ₹ {Math.round(invoiceInfo?.taxCalculatedInfo?.tax)}
                    </div>
                  </div>
                )}
                {invoiceInfo?.taxInfo?.taxAmount && (
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
                {invoiceInfo?.amountInfo?.advance > 0 && (
                  <div className="w-full flex justify-end gap-x-12">
                    <div className="w-11/12 flex justify-end mx-auto mt-1 px-2 text-xs lg:text-sm font-bold rounded-md uppercase text-center">
                      Advance{" "}
                    </div>
                    <div className="w-3/12 flex justify-end mx-auto mt-1 px-2 text-xs lg:text-sm font-bold rounded-md ">
                      ₹ {invoiceInfo?.amountInfo?.advance}
                    </div>
                  </div>
                )}
                <div className="border-b-2 border-dashed py-1"></div>
                {invoiceInfo?.taxCalculatedInfo?.balance ? (
                  <div className="w-full flex justify-end gap-x-10 text-red-700 ">
                    <div className="w-11/12 flex justify-end mx-auto mt-1 px-2 text-xs lg:text-sm font-extrabold rounded-md uppercase text-center">
                      Balance{" "}
                    </div>
                    <div className="w-3/12 flex justify-end mx-auto mt-1 px-2 text-xs lg:text-sm font-extrabold rounded-md ">
                      ₹ {invoiceInfo?.taxCalculatedInfo?.balance}
                    </div>
                  </div>
                ) : (
                  <div className=" mt-1 px-2 text-md lg:text-xl font-extrabold rounded-md text-right text-green-700 ">
                    Fully Paid
                  </div>
                )}
              </div>
              <div className="flex justify-between border-b-[1.2px] border-black mt-2"></div>
              {invoiceInfo?.invoiceInfo?.expectedDate && (
                <div className="text-xs lg:text-sm font-semibold text-blue-700 text-center">
                  Expected Delivery Date : {expectedDate}
                </div>
              )}
              <div className="flex justify-between w-full mx-auto mt-2 gap-x-2 mt-4">
                <div className="flex flex-col text-left text-[10px] lg:text-sm text-red-900">
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

              <div className="mt-2"></div>
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

export default ViewInvoiceByCustomer;
