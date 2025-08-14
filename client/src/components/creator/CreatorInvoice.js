import React, { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { useNavigate, useLocation } from "react-router-dom";
import { Download } from "lucide-react";
import { Printer } from "lucide-react";
import { FaRegEdit } from "react-icons/fa";
import { useReactToPrint } from "react-to-print";

import { CREATORS, INVOICE_INFO, LOGIN_INFO } from "../Constant";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import Loader from "../Loader";

function CreatorInvoice() {
  const pdfExportComponent = React.useRef(null);
  const navigate = useNavigate();
  const printRef = useRef(null);
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [enablePrint, setEnablePrint] = useState(false);

  const loggedInUser = localStorage.getItem("user");
  const uid = localStorage.getItem("uid");

  const [personalInfo, setPersonalInfo] = useState([]);
  const [accountInfo, setAccountInfo] = useState([]);
  const [customerInfo, setCustomerInfo] = useState([]);
  const [rows, setRows] = useState([]);
  const [amount, setAmount] = useState();
  const [invoiceInfo, setInvoiceInfo] = useState([]);
  const [additionalInfo, setAdditionalInfo] = useState([]);
  const [signedInfo, setSignedInfo] = useState([]);

  const isMediumScreen = window.innerWidth >= 768;
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 768);

  const handlePrint = useReactToPrint({
    documentTitle: "Invoice",
    contentRef: printRef,
  });

  const getDate = (utcDate) => {
    var today = new Date(utcDate);
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
    const date = month + " " + today.getDate() + ", " + today.getFullYear();
    return date;
  };
  const handleDownloadPdf = async (e) => {
    e.preventDefault();
    const url = "https://invoicesimplify.onrender.com";
    //const url = "http://localhost:5001";
    try {
      setLoading(true);
      const html = printRef.current.innerHTML;
      const response = await fetch(url + "/generate-pdf1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ html }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "personal-info.pdf";
        link.click();
        URL.revokeObjectURL(url);

        await InsertToDB();
        await updateInvoiceNumber();
        clearLocalStorageForPdf();
      } else {
        console.error("PDF generation failed");
      }
    } catch (error) {
      console.error("Error sending data:", error);
    } finally {
      setLoading(false);
    }
  };

  const invoiceInfo_CollectionRef = collection(
    doc(db, CREATORS, uid),
    INVOICE_INFO
  );

  const brandInfo_CollectionRef = collection(
    doc(db, CREATORS, uid),
    "Brand_Info"
  );
  const InsertToDB = async () => {
    // invoice info
    await addDoc(invoiceInfo_CollectionRef, {
      personalInfo: personalInfo,
      accountInfo: accountInfo,
      customerInfo: customerInfo,
      rows: rows,
      amount: amount,
      invoiceInfo: invoiceInfo,
      signedInfo: signedInfo,
      loggedInUser: loggedInUser,
      paymentStatus: "Pending",
    });

    // check if brand info already exist, yes-ignore
    const data = await getDocs(brandInfo_CollectionRef);
    const filteredData = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    const val = filteredData.find(
      (x) =>
        x.customerInfo.customerName.trim() === customerInfo.customerName.trim()
    );

    if (val) return;

    // brand info
    await addDoc(brandInfo_CollectionRef, {
      customerInfo: customerInfo,
      loggedInUser: loggedInUser,
    });

    await getBrands();
  };
  const login_CollectionRef = collection(db, LOGIN_INFO);
  const updateInvoiceNumber = async () => {
    const data = await getDocs(login_CollectionRef);
    const filteredData = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    const loginInfo = filteredData.filter((x) => x.code === loggedInUser)[0];

    const codeDoc = doc(db, LOGIN_INFO, loginInfo.id);
    const usedInvoiceNumbers = [
      ...loginInfo.usedInvoiceNumbers,
      parseInt(invoiceInfo?.invoiceNumber),
    ];
    localStorage.setItem("usedInvoiceNumbers", usedInvoiceNumbers);
    localStorage.setItem(
      "invoiceNumber",
      parseInt(invoiceInfo?.invoiceNumber) + 1
    );
    await updateDoc(codeDoc, {
      invoiceNumber: parseInt(invoiceInfo?.invoiceNumber + 1),
      usedInvoiceNumbers: usedInvoiceNumbers,
    });
  };

  const getBrands = async () => {
    try {
      const data = await getDocs(brandInfo_CollectionRef);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      const brandInfo = filteredData.filter(
        (x) => x.loggedInUser === loggedInUser
      );

      // get items list
      const brands = brandInfo.sort((a, b) =>
        a.customerName.localeCompare(b.customerName)
      );
      localStorage.setItem("creator_brands", JSON.stringify(brands));
    } catch (err) {
      console.log(err);
    }
  };

  const deleteLocalStoragePersonalInfo = () => {
    localStorage.removeItem("creator_signedInfo");
    localStorage.removeItem("creator_invoiceInfo");
    localStorage.removeItem("creator_amountInfo");
    localStorage.removeItem("customer_rows");
  };

  const deleteLocalStorageAccountInfo = () => {
    localStorage.removeItem("creator_customername");
    localStorage.removeItem("creator_customeremail");
    localStorage.removeItem("creator_productName");
    localStorage.removeItem("customer_address");
    localStorage.removeItem("customer_address1");
    localStorage.removeItem("customer_address2");
    localStorage.removeItem("customer_address3");
    localStorage.removeItem("customer_customerphone");
    localStorage.removeItem("customer_gst");
    localStorage.removeItem("customer_pan");
    localStorage.removeItem("customer_tin");
    localStorage.removeItem("customer_cin");
  };

  const deleteLocalStorageInvoiceInfo = () => {
    localStorage.removeItem("invoiceNumber");
    localStorage.removeItem("date");
  };

  const clearLocalStorageForPdf = () => {
    deleteLocalStoragePersonalInfo();
    deleteLocalStorageAccountInfo();
    deleteLocalStorageInvoiceInfo();

    localStorage.removeItem("rows");
  };

  const handleEditInvoice = () => {
    navigate("/creator/createinvoice");
  };

  useEffect(() => {
    const auth = localStorage.getItem("auth");
    if (auth !== "Logged In") {
      navigate("/login");
    }

    let pi = localStorage.getItem("creator_personalInfo");
    setPersonalInfo(JSON.parse(pi));

    let ci = localStorage.getItem("creator_customerInfo");
    setCustomerInfo(JSON.parse(ci));

    let ai = localStorage.getItem("creator_accountInfo");
    setAccountInfo(JSON.parse(ai));

    let cr = localStorage.getItem("customer_rows");
    setRows(JSON.parse(cr));

    let ca = localStorage.getItem("creator_amountInfo");
    setAmount(ca);

    let ii = localStorage.getItem("creator_invoiceInfo");
    setInvoiceInfo(JSON.parse(ii));

    let si = localStorage.getItem("creator_signedInfo");
    setSignedInfo(JSON.parse(si));

    let ad = localStorage.getItem("creator_additionalInfo");
    setAdditionalInfo(JSON.parse(ad));
  }, []);
  return (
    <div>
      <div className="mt-2 flex w-full md:w-6/12 p-2 mx-auto justify-between">
        <div className="flex gap-x-2">
          <button
            onClick={handleEditInvoice}
            className="flex items-center bg-[#E5E7EB] font-bold px-4 py-2 rounded-md hover:bg-blue-700 hover:text-white transition duration-300"
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
            className="flex items-center bg-[#E5E7EB]  font-bold px-4 py-2 rounded-md hover:bg-blue-700 hover:text-white transition duration-300"
          >
            <span className="mr-2">
              <Printer />
            </span>
            Print
          </button>
        </div>
        <div className="flex gap-x-2">
          {/* <button
            onClick={handleDownloadPdf}
            className="flex items-center bg-[#E5E7EB]  font-bold px-4 py-2 rounded-md hover:bg-blue-700 hover:text-white transition duration-300"
          >
            <span className="mr-2"><Mail/></span> Email Invoice
          </button> */}
          <button
            onClick={handleDownloadPdf}
            className="flex items-center font-bold bg-[#444] text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
          >
            <span className="flex items-center gap-1">
              {loading ? (
                <>
                  <Loader />
                </>
              ) : (
                <div className="flex gap-2">
                  <div>
                    <Download />{" "}
                  </div>
                  <div>PDF </div>
                </div>
              )}
            </span>
          </button>
        </div>
      </div>
      <div>
        <div className="w-full md:w-6/12 mx-auto py-2 border-2 mb-10 mt-2">
          <div
            ref={printRef}
            style={{
              padding: "2rem",
              fontFamily: "'Inter', sans-serif",
              fontSize: "14px",
              padding: "20px",
              textAlign: "left",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                  }}
                >
                  {/* <div className='text-gray-500 font-bold text-lg'>From</div> */}
                  <div style={{ fontWeight: "bold", fontSize: "1rem" }}>
                    {personalInfo.name}
                  </div>
                  <div
                    style={{
                      color: "#6B7280",
                      fontSize: "0.875rem",
                      marginTop: "0.2rem",
                    }}
                  >
                    {personalInfo.address}
                  </div>
                  {personalInfo.address1 && (
                    <div
                      style={{
                        color: "#6B7280",
                        fontSize: "0.875rem",
                        marginTop: "0.2rem",
                      }}
                    >
                      {personalInfo.address1},
                    </div>
                  )}
                  {personalInfo.address2 && (
                    <div
                      style={{
                        color: "#6B7280",
                        fontSize: "0.875rem",
                        marginTop: "0.2rem",
                      }}
                    >
                      {personalInfo.address2} - {personalInfo.address3}
                    </div>
                  )}

                  <div
                    style={{
                      color: "#6B7280",
                      fontSize: "0.875rem",
                      marginTop: "0.2rem",
                    }}
                  >
                    Phone: {personalInfo.phonePrimary}
                  </div>

                  <div
                    style={{
                      color: "#6B7280",
                      fontSize: "0.875rem",
                      marginTop: "0.2rem",
                    }}
                  >
                    Email: {personalInfo.email}
                  </div>
                  {personalInfo.socialMedia && (
                    <div
                      style={{
                        color: "#6B7280",
                        fontSize: "0.875rem",
                        marginTop: "0.2rem",
                      }}
                    >
                      {personalInfo.socialMedia}
                    </div>
                  )}
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: "1rem",
                      color: "#374151",
                      textAlign: "right",
                    }}
                  >
                    INVOICE
                  </div>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: "0.875rem",
                      color: "#6B7280",
                      textAlign: "right",
                    }}
                  >
                    {invoiceInfo && invoiceInfo.invoiceNumber}
                  </div>
                </div>
              </div>
              <div
                style={{
                  marginTop: "1.5rem",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div
                    style={{
                      textTransform: "uppercase",
                      color: "#374151",
                      fontWeight: "bold",
                      fontSize: "0.875rem",
                    }}
                  >
                    Invoice To
                  </div>

                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: "1rem",
                      marginTop: "0.25rem",
                    }}
                  >
                    {customerInfo.customerName}
                  </div>

                  <div
                    style={{
                      color: "#6B7280",
                      fontSize: "0.875rem",
                      marginTop: "0.2rem",
                    }}
                  >
                    {customerInfo.address}, {customerInfo.address1}
                  </div>

                  {customerInfo.address2 && (
                    <div
                      style={{
                        color: "#6B7280",
                        fontSize: "0.875rem",
                        marginTop: "0.2rem",
                      }}
                    >
                      {customerInfo.address2} - {customerInfo.address3}
                    </div>
                  )}
                  {customerInfo.customerPhone && (
                    <div
                      style={{
                        fontSize: "0.875rem",
                        color: "#6B7280",
                        display: "flex",
                        columnGap: "0.5rem",
                        marginTop: "0.2rem",
                      }}
                    >
                      <div>Phone:</div>
                      <div>{customerInfo.customerPhone}</div>
                    </div>
                  )}
                  {customerInfo.customerEmail && (
                    <div
                      style={{
                        fontSize: "0.875rem",
                        color: "#6B7280",
                        marginTop: "0.2rem",
                      }}
                    >
                      Email : {customerInfo.customerEmail}
                    </div>
                  )}
                  {customerInfo.gst && (
                    <div
                      style={{
                        marginTop: "0.5rem",
                        fontSize: "0.875rem",
                        color: "#6B7280",
                      }}
                    >
                      GSTIN : {customerInfo.gst}
                    </div>
                  )}
                  {customerInfo.tin && (
                    <div
                      style={{
                        fontSize: "0.875rem",
                        color: "#6B7280",
                        marginTop: "0.2rem",
                      }}
                    >
                      TIN : {customerInfo.tin}{" "}
                    </div>
                  )}
                  {customerInfo.cin && (
                    <div
                      style={{
                        fontSize: "0.875rem",
                        color: "#6B7280",
                        marginTop: "0.2rem",
                      }}
                    >
                      CIN : {customerInfo.cin}
                    </div>
                  )}
                  {customerInfo.pan && (
                    <div
                      style={{
                        fontSize: "0.875rem",
                        color: "#6B7280",
                        marginTop: "0.2rem",
                      }}
                    >
                      PAN : {customerInfo.pan}
                    </div>
                  )}
                </div>
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: "0.875rem",
                    marginTop: "0.2rem",
                  }}
                >
                  <div
                    style={{
                      textTransform: "uppercase",
                      textAlign: "right",
                    }}
                  >
                    Date
                  </div>
                  <div
                    style={{
                      color: "#6B7280",
                      textAlign: "right",
                      fontWeight: 600,
                      marginTop: "0.2rem",
                    }}
                  >
                    {getDate(invoiceInfo?.date)}
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1.2px solid black",
                  marginTop: "1.5rem",
                }}
              ></div>
              <div
                style={{
                  overflow: "hidden",
                  marginTop: "0.5rem",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    marginLeft: "auto",
                    marginRight: "auto",
                    textAlign: "center",
                    fontSize: "0.475rem",
                    fontWeight: 300,
                  }}
                >
                  <thead
                    style={{
                      fontSize: "0.85rem",
                      textTransform: "uppercase",
                    }}
                  >
                    <tr
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <th
                        style={{
                          width: "40%",
                          textAlign: "left",
                        }}
                      >
                        Description
                      </th>
                      <th
                        style={{
                          width: "20%",
                        }}
                      >
                        Rate
                      </th>
                      <th
                        style={{
                          width: "10%",
                          display: isMediumScreen ? "none" : "block",
                        }}
                      >
                        Qty
                      </th>
                      <th
                        style={{
                          width: "10%",
                          display: isSmallScreen ? "none" : "block",
                        }}
                      >
                        Quantity
                      </th>
                      <th
                        style={{
                          width: "20%",
                        }}
                      >
                        Amount
                      </th>
                    </tr>
                    <tr
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderBottom: "1.2px solid black",
                        marginTop: "0.5rem", // Tailwind's mt-2 is 0.5rem
                      }}
                    ></tr>
                  </thead>

                  <tbody>
                    {rows &&
                      rows.length > 0 &&
                      rows.map((row, index) => (
                        <div>
                          <tr
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: "0.82rem", // Tailwind's text-md ≈ 1rem
                              marginTop: "0.25rem", // Tailwind's mt-1 = 0.25rem
                              fontWeight: 300, // Tailwind's font-light = 300
                            }}
                          >
                            <td
                              style={{
                                width: "40%",
                                textAlign: "left",
                              }}
                            >
                              {row.desc}
                            </td>
                            <td
                              style={{
                                width: "20%",
                              }}
                            >
                              {row.rate}
                            </td>
                            <td
                              style={{
                                width: "10%",
                              }}
                            >
                              {row.qty}
                            </td>
                            <td
                              style={{
                                width: "20%",
                              }}
                            >
                              {" "}
                              {row.amount}
                            </td>
                          </tr>
                          {rows.length > index + 1 && (
                            <tr
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                fontSize: "1rem", // Tailwind text-md ≈ 1rem
                                marginTop: "0.5rem", // Tailwind mt-2 = 0.5rem
                                borderBottom: "1px dashed gray", // Combines border thickness & style
                              }}
                            ></tr>
                          )}
                        </div>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderBottom: "1.2px solid black",
                marginTop: "0.5rem", // Tailwind's mt-2 = 0.5rem
              }}
            ></div>

            {
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      marginTop: "0.5rem", // mt-1
                      marginBottom: "0.5rem", // mt-1
                      paddingLeft: "0.5rem", // px-2
                      paddingRight: "0.5rem", // px-2
                      fontSize: "0.95rem", // text-md ≈ 1rem
                      fontWeight: "bold", // font-bold
                      borderRadius: "0.375rem", // rounded-md = 6px or 0.375rem
                      textTransform: "uppercase", // uppercase
                    }}
                  >
                    Total{" "}
                  </div>
                  <div
                    style={{
                      marginTop: "0.5rem", // mt-1
                      marginBottom: "0.5rem", // mt-1
                      paddingLeft: "0.5rem", // px-2
                      paddingRight: "0.5rem", // px-2
                      fontSize: "0.95rem", // text-md ≈ 1rem
                      fontWeight: "bold", // font-bold
                      borderRadius: "0.375rem", // rounded-md = 6px or 0.375rem
                    }}
                  >
                    ₹ {amount}
                  </div>
                </div>
              </div>
            }

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderBottom: "1.2px solid black",
                marginTop: "0.2rem", // Tailwind's mt-2 = 0.5rem
              }}
            ></div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div>
                  <div
                    style={{
                      fontWeight: "bold", // font-bold
                      fontSize: "0.875rem", // text-sm
                      marginTop: "1.5rem", // mt-6
                      color: "#374151", // text-gray-700
                      textTransform: "uppercase", // uppercase
                    }}
                  >
                    Account Information
                  </div>
                  <div
                    style={{
                      fontSize: "0.875rem", // text-sm
                      marginTop: "1rem", // mt-4
                    }}
                  >
                    <div>
                      Bank Name :{" "}
                      <span
                        style={{
                          fontWeight: "bold",
                        }}
                      >
                        {accountInfo.bankName}
                      </span>
                    </div>
                    <div
                      style={{
                        marginTop: "0.25rem", // font-bold
                      }}
                    >
                      Name :{" "}
                      <span
                        style={{
                          fontWeight: "bold",
                        }}
                      >
                        {accountInfo.name}
                      </span>
                    </div>
                    <div
                      style={{
                        marginTop: "0.25rem", // font-bold
                      }}
                    >
                      Account Number :{" "}
                      <span
                        style={{
                          fontWeight: "bold",
                        }}
                      >
                        {accountInfo.accountNumber}
                      </span>
                    </div>
                    <div
                      style={{
                        marginTop: "0.25rem", // font-bold
                      }}
                    >
                      Account Type :{" "}
                      <span
                        style={{
                          fontWeight: "bold",
                        }}
                      >
                        {accountInfo.accountType}
                      </span>
                    </div>
                    <div
                      style={{
                        marginTop: "0.25rem", // font-bold
                      }}
                    >
                      IFSC Code :{" "}
                      <span
                        style={{
                          fontWeight: "bold",
                        }}
                      >
                        {accountInfo.ifscCode}
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop: "0.25rem", // font-bold
                      }}
                    >
                      Branch :{" "}
                      <span
                        style={{
                          fontWeight: "bold",
                        }}
                      >
                        {accountInfo.branch}
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop: "0.25rem", // font-bold
                      }}
                    >
                      PAN :{" "}
                      <span
                        style={{
                          fontWeight: "bold",
                        }}
                      >
                        {accountInfo.pan}
                      </span>
                    </div>

                    <br />
                  </div>
                </div>

                {/* {accountInfo.upi && (
                  <div className="mt-2 text-sm">
                    GPay: <span className="font-bold ">{accountInfo.upi}</span>
                  </div>
                )} */}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginTop: "2rem", // 8 * 0.25rem = 2rem
                }}
              >
                {signedInfo.signature && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      fontSize: "0.875rem", // Tailwind's text-sm = 14px = 0.875rem
                    }}
                  >
                    <div>
                      <img
                        style={{ width: "100px" }}
                        src={signedInfo.signature}
                        alt="sign"
                      />
                      <div style={{ fontWeight: "bold" }}>Date Signed</div>
                      <div>{signedInfo.signedDate}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div
              style={{
                marginTop: "0.25rem", // font-bold
              }}
            >
              {additionalInfo.additionaldesc}
            </div>
            <div
              style={{
                color: "#4B5563", // text-gray-600
                textAlign: "right", // text-right
              }}
            >
              <div
                style={{
                  fontSize: "0.75rem", // text-xs (12px)
                }}
              >
                Thank you for your business!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreatorInvoice;
