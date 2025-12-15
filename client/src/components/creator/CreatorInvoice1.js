import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, Edit, Download } from "lucide-react";
import { FaRegEdit } from "react-icons/fa";
import { useReactToPrint } from "react-to-print";

import { BASE_URL, CREATORS, INVOICE_INFO, LOGIN_INFO } from "../Constant";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import Loader from "../Loader";
import EmailModal from "./EmailModal";
import CreatorMobileMenu from "./CreatorMobileMenu";

function CreatorInvoice1() {
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

  const [openEmailModal, setOpenEmailModal] = useState(false);
  const [logoBase64, setLogoBase64] = useState("");

  const currencySymbol = localStorage.getItem("invoiceCurrency") || "₹";

  const handleCloseEmailModal = () => {
    setOpenEmailModal(false);
  };

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

  const handleEmail = () => {
    try {
      const isActivePlan = getCurrentPlanStatus();

      if (!isActivePlan) {
        return;
      }

      setOpenEmailModal(true);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDownloadPdf = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const url = BASE_URL;
      const isActivePlan = getCurrentPlanStatus();

      if (!isActivePlan) {
        return;
      }

      const invoiceData = {
        invoiceInfo: invoiceInfo,
        personalInfo: personalInfo,
        customerInfo: customerInfo,
        rows: rows,
        amountInfo: amount,
        accountInfo: accountInfo,
        signedInfo: signedInfo,
        logoBase64: logoBase64,
        additionalInfo: additionalInfo,
        currencySymbol: currencySymbol,
        // taxCalculatedInfo: taxCalculatedInfo,
      };

      const response = await fetch(url + "/generate-pdf1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ invoiceData: invoiceData }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = customerInfo.productName + ".pdf";
        link.click();
        URL.revokeObjectURL(url);

        if (await checkIfInvoiceAlreadyDownloadOrEmailed()) {
          setLoading(false);
          return;
        }

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

  const getCurrentPlanStatus = () => {
    const isPlanExpired = localStorage.getItem("subscriptionPlan");

    if (isPlanExpired === "Expired") {
      alert("There is no Active Plan, Please upgrade your plan to continue.");

      navigate("/plans");
      return false;
    }
    return true;
  };
  const checkIfInvoiceAlreadyDownloadOrEmailed = async () => {
    const printedInvoiceNumber = localStorage.getItem(
      "downloadedInvoiceNumber"
    );
    if (
      printedInvoiceNumber &&
      parseInt(printedInvoiceNumber) === invoiceInfo.invoiceNumber
    ) {
      return true;
    }
    return false;
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
      logoBase64: logoBase64,
      paymentStatus: "Pending",
      invoiceCurrency: currencySymbol ? currencySymbol : "₹",
    });

    localStorage.setItem("downloadedInvoiceNumber", invoiceInfo?.invoiceNumber);

    // // check if brand info already exist, yes-ignore
    // const data = await getDocs(brandInfo_CollectionRef);
    // const filteredData = data.docs.map((doc) => ({
    //   ...doc.data(),
    //   id: doc.id,
    // }));
    // const val = filteredData.find(
    //   (x) =>
    //     x.customerInfo.customerName.trim() === customerInfo.customerName.trim()
    // );

    // if (val) return;

    // // brand info
    // await addDoc(brandInfo_CollectionRef, {
    //   customerInfo: customerInfo,
    //   loggedInUser: loggedInUser,
    // });

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
      invoiceNumber:
        invoiceInfo?.invoiceNumberMode === "automatic"
          ? parseInt(invoiceInfo?.invoiceNumber + 1)
          : invoiceInfo?.invoiceNumber,
      invoiceNumberMode: invoiceInfo?.invoiceNumberMode,
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
    localStorage.removeItem("creator_customerInfo");
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
    localStorage.removeItem("creator_signedInfo");
  };

  const deleteLocalStorageInvoiceInfo = () => {
    localStorage.removeItem("invoiceNumber");
    localStorage.removeItem("date");
    localStorage.removeItem("sign");
  };

  const clearLocalStorageForPdf = () => {
    deleteLocalStoragePersonalInfo();
    deleteLocalStorageAccountInfo();
    deleteLocalStorageInvoiceInfo();

    localStorage.removeItem("rows");
  };

  const handleEditInvoice = () => {
    navigate("/creator/createinvoice1");
  };

  useEffect(() => {
    fetch("/invlogo2.png")
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoBase64(reader.result); // base64 string
        };
        reader.readAsDataURL(blob);
      });
  }, []);

  useEffect(() => {
    const auth = localStorage.getItem("auth");
    if (auth !== "Logged In") {
      navigate("/login");
      return;
    }

    // let pi = localStorage.getItem("creator_personalInfo");
    // setPersonalInfo(JSON.parse(pi));

    // let ci = localStorage.getItem("creator_customerInfo");
    // const custData = JSON.parse(ci);
    // custData.productName = localStorage.getItem("creator_productName");
    // setCustomerInfo(custData);

    // let ai = localStorage.getItem("creator_accountInfo");
    // setAccountInfo(JSON.parse(ai));

    let cr = localStorage.getItem("customer_rows");
    setRows(JSON.parse(cr));

    let ca = localStorage.getItem("creator_amountInfo");
    setAmount(ca);

    // let ii = localStorage.getItem("creator_invoiceInfo");
    // setInvoiceInfo(JSON.parse(ii));

    // let si = localStorage.getItem("creator_signedInfo");
    // setSignedInfo(JSON.parse(si));

    // let ad = localStorage.getItem("creator_additionalInfo");
    // setAdditionalInfo(JSON.parse(ad));
  }, []);
  return (
    <div className="">
      <div className="lg:left-64 right-0 top-0 left-0 lg:fixed bg-white">
        <div className="hidden max-lg:block mb-16">
          <CreatorMobileMenu />
        </div>
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b shadow-sm">
          <div className="max-w-6xl mx-auto flex justify-between items-center h-[56px] lg:h-[62.5px]">
            <h1 className="text-xl font-semibold tracking-wide text-gray-800 hidden md:block">
              Invoice Preview
            </h1>
            <div className="hidden lg:block">
              <div className="flex justify-between gap-x-4 text-sm text-black font-bold mt-1">
                <div
                  onClick={handleEditInvoice}
                  className="flex items-center cursor-pointer gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 transition font-medium text-gray-700"
                >
                  <FaRegEdit size={18} />
                  <button>Edit</button>
                </div>
                <div
                  onClick={handleEmail}
                  className="flex items-center cursor-pointer gap-2 px-4 py-2 rounded-lg border border-blue-600 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white transition font-medium"
                >
                  <Mail size={18} />
                  <button>Email</button>
                </div>
                <div
                  onClick={handleDownloadPdf}
                  className="flex items-center cursor-pointer gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition font-medium shadow-sm"
                >
                  <Download size={18} />
                  <button>PDF</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden max-lg:block fixed lg:sticky top-[61px] w-full bg-white z-10 border-2 py-2">
          <div className="flex justify-between w-full lg:w-8/12 mx-auto px-2">
            <div>
              <button onClick={handleEditInvoice}>
                <Edit />
              </button>
            </div>
            <div>
              <button onClick={handleEmail}>
                <Mail />
              </button>
            </div>

            <div>
              <button onClick={handleDownloadPdf}>
                <Download size={22} />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-24 lg:mt-0 p-0 lg:p-2">
          <div className="w-full mx-auto py-2 mb-10 px-1 lg:overflow-y-auto lg:h-[calc(100vh-120px)]">
            <div
              ref={printRef}
              style={{
                padding: "2rem",
                fontFamily: "'Inter', sans-serif",
                fontSize: "14px",
                padding: "10px",
                textAlign: "left",
              }}
            >
              <div>
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
                          Qty
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
                                {currencySymbol} {row.rate}
                              </td>
                              <td>
                                {row.qty}
                                <span>{row.type}</span>
                              </td>

                              <td
                                style={{
                                  width: "20%",
                                }}
                              >
                                {" "}
                                {currencySymbol} {row.amount}
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
                      {currencySymbol} {amount}
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
      {loading && <Loader />}
    </div>
  );
}

export default CreatorInvoice1;
