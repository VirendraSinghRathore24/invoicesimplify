import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Mail, ChevronLeft, Download } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { toast } from "react-toastify";
import Loader from "../Loader";
import { BASE_URL } from "../Constant";
import CreatorMobileMenu from "./CreatorMobileMenu";
import EmailViewModal from "./EmailViewModal";

function CreatorViewInvoice() {
  const [invoiceInfo, setInvoiceInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const printRef = useRef(null);
  const [logoBase64, setLogoBase64] = useState("");

  const location = useLocation();
  const id = location.state.id;

  const isMediumScreen = window.innerWidth >= 768;
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 768);

  const type = localStorage.getItem("type");

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

  const handleDownloadPdf = async (e) => {
    e.preventDefault();

    const isActivePlan = getCurrentPlanStatus();

    if (!isActivePlan) {
      return;
    }

    const url = BASE_URL;
    try {
      setLoading(true);

      const invoiceData = {
        invoiceInfo: invoiceInfo.invoiceInfo,
        personalInfo: invoiceInfo.personalInfo,
        customerInfo: invoiceInfo.customerInfo,
        rows: invoiceInfo.rows,
        amountInfo: invoiceInfo.amount,
        accountInfo: invoiceInfo.accountInfo,
        signedInfo: invoiceInfo.signedInfo,
        logoBase64: invoiceInfo.logoBase64,
        additionalInfo: invoiceInfo.additionalInfo,
        currencySymbol: invoiceInfo.currencySymbol,
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
        link.download = invoiceInfo.customerInfo.productName + ".pdf";
        link.click();
        URL.revokeObjectURL(url);
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

  const handleEmail = () => {
    const isActivePlan = getCurrentPlanStatus();

    if (!isActivePlan) {
      return;
    }

    setOpenEmailModal(true);
  };
  const handlePrint = useReactToPrint({
    documentTitle: "Invoice",
    contentRef: printRef,
  });

  const getInvoiceData = async () => {
    try {
      setLoading(true);
      const allBrandsInfo = JSON.parse(
        localStorage.getItem("creator_dashboardInfo")
      );

      const invoiceData = allBrandsInfo.filter((x) => x.id === id)[0];

      setInvoiceInfo(invoiceData);
    } catch (error) {
      toast.error("Failed to load invoice data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const [openEmailModal, setOpenEmailModal] = useState(false);
  const handleCloseEmailModal = () => {
    setOpenEmailModal(false);
  };

  const handleLogin = () => {
    const user = localStorage.getItem("user");

    if (!user || user === "undefined" || user === "null") {
      navigate("/login");
    }
    const type = localStorage.getItem("type");
    if (!type || type === "undefined" || type === "null") {
      navigate("/selectbusinesstype");
    }
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
    handleLogin();
    getInvoiceData();
    window.scroll(0, 0);
  }, []);
  return (
    <div className="">
      <div className="lg:left-64 right-0 top-0 left-0 lg:fixed bg-white">
        <div className="hidden max-lg:block mb-16">
          <CreatorMobileMenu />
        </div>

        <div className="hidden max-lg:block fixed lg:sticky top-[61px] w-full bg-white z-10 border-2 py-2">
          <div className="flex justify-between w-full lg:w-8/12 mx-auto px-2">
            <div>
              <button onClick={() => navigate(-1)}>
                <ChevronLeft />
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
        <div className="top-14 lg:top-0 mx-auto w-full h-[56px] lg:h-[64px] text-white fixed lg:sticky border-b-2">
          <div className="flex justify-between mx-auto font-bold text-md p-2 rounded-md  w-full ">
            <div className="text-xl text-black hidden lg:block mt-1">
              Invoice
            </div>
            <div className="hidden lg:block">
              <div className="flex justify-between gap-x-4 text-sm text-black font-bold mt-1">
                <div>
                  <button
                    onClick={() => navigate(-1)}
                    className="flex items-center bg-[#E5E7EB] font-bold px-4 py-2 rounded-md hover:bg-blue-700 hover:text-white transition duration-300"
                  >
                    <span className="mr-2">
                      <ChevronLeft />
                    </span>
                    Back
                  </button>
                </div>
                <div>
                  <button
                    onClick={handleEmail}
                    className="flex items-center bg-[#E5E7EB]  font-bold px-2 lg:px-4 py-2 rounded-md hover:bg-blue-700 hover:text-white transition duration-300"
                  >
                    <span className="mr-2">
                      <Mail />
                    </span>
                    Email
                  </button>
                </div>

                <div>
                  <button
                    onClick={handleDownloadPdf}
                    className="flex items-center bg-[#444] text-white font-bold px-2 lg:px-4 py-2 rounded-md hover:bg-blue-700 hover:text-white transition duration-300"
                  >
                    <span className="mr-2">
                      <Download size={22} />
                    </span>
                    PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-24 lg:mt-0 p-0 lg:p-2">
          <div className="w-full mx-auto py-2 mb-10 px-1 lg:overflow-y-auto lg:h-[calc(100vh-137px)]">
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
                <img
                  src={logoBase64}
                  alt="Company Logo"
                  style={{ width: "100px", marginBottom: "1rem" }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-start",
                    }}
                  >
                    {/* <div className='text-gray-500 font-bold text-lg'>From</div> */}
                    <div style={{ fontWeight: "bold", fontSize: "1rem" }}>
                      {invoiceInfo?.personalInfo?.name}
                    </div>
                    {invoiceInfo?.personalInfo?.address && (
                      <div
                        style={{
                          color: "#6B7280",
                          fontSize: "0.875rem",
                          marginTop: "0.2rem",
                        }}
                      >
                        {invoiceInfo?.personalInfo?.address},
                      </div>
                    )}
                    {invoiceInfo?.personalInfo?.address1 && (
                      <div
                        style={{
                          color: "#6B7280",
                          fontSize: "0.875rem",
                          marginTop: "0.2rem",
                        }}
                      >
                        {invoiceInfo?.personalInfo?.address1},
                      </div>
                    )}
                    {invoiceInfo?.personalInfo?.address2 && (
                      <div
                        style={{
                          color: "#6B7280",
                          fontSize: "0.875rem",
                          marginTop: "0.2rem",
                        }}
                      >
                        {invoiceInfo?.personalInfo?.address2} -{" "}
                        {invoiceInfo?.personalInfo?.address3}
                      </div>
                    )}
                    {invoiceInfo?.personalInfo?.phonePrimary && (
                      <div
                        style={{
                          color: "#6B7280",
                          fontSize: "0.875rem",
                          marginTop: "0.2rem",
                        }}
                      >
                        Phone: {invoiceInfo?.personalInfo?.phonePrimary}
                      </div>
                    )}

                    {invoiceInfo?.personalInfo?.email && (
                      <div
                        style={{
                          color: "#6B7280",
                          fontSize: "0.875rem",
                          marginTop: "0.2rem",
                        }}
                      >
                        Email: {invoiceInfo?.personalInfo?.email}
                      </div>
                    )}
                    {invoiceInfo?.personalInfo?.socialMedia && (
                      <div
                        style={{
                          color: "#6B7280",
                          fontSize: "0.875rem",
                          marginTop: "0.2rem",
                        }}
                      >
                        {invoiceInfo?.personalInfo?.socialMedia}
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
                      {invoiceInfo?.invoiceInfo &&
                        invoiceInfo?.invoiceInfo?.invoiceNumber}
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
                      {invoiceInfo?.customerInfo?.customerName}
                    </div>

                    {invoiceInfo?.customerInfo?.address && (
                      <div
                        style={{
                          color: "#6B7280",
                          fontSize: "0.875rem",
                          marginTop: "0.2rem",
                        }}
                      >
                        {invoiceInfo?.customerInfo?.address},{" "}
                        {invoiceInfo?.customerInfo?.address1}
                      </div>
                    )}

                    {invoiceInfo?.customerInfo?.address2 && (
                      <div
                        style={{
                          color: "#6B7280",
                          fontSize: "0.875rem",
                          marginTop: "0.2rem",
                        }}
                      >
                        {invoiceInfo?.customerInfo?.address2} -{" "}
                        {invoiceInfo?.customerInfo?.address3}
                      </div>
                    )}
                    {invoiceInfo?.customerInfo?.customerPhone && (
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
                        <div>{invoiceInfo?.customerInfo?.customerPhone}</div>
                      </div>
                    )}
                    {invoiceInfo?.customerInfo?.customerEmail && (
                      <div
                        style={{
                          fontSize: "0.875rem",
                          color: "#6B7280",
                          marginTop: "0.2rem",
                        }}
                      >
                        Email : {invoiceInfo?.customerInfo?.customerEmail}
                      </div>
                    )}
                    {invoiceInfo?.customerInfo?.gst && (
                      <div
                        style={{
                          marginTop: "0.5rem",
                          fontSize: "0.875rem",
                          color: "#6B7280",
                        }}
                      >
                        GSTIN : {invoiceInfo?.customerInfo?.gst}
                      </div>
                    )}
                    {invoiceInfo?.customerInfo?.tin && (
                      <div
                        style={{
                          fontSize: "0.875rem",
                          color: "#6B7280",
                          marginTop: "0.2rem",
                        }}
                      >
                        TIN : {invoiceInfo?.customerInfo?.tin}{" "}
                      </div>
                    )}
                    {invoiceInfo?.customerInfo?.cin && (
                      <div
                        style={{
                          fontSize: "0.875rem",
                          color: "#6B7280",
                          marginTop: "0.2rem",
                        }}
                      >
                        CIN : {invoiceInfo?.customerInfo?.cin}
                      </div>
                    )}
                    {invoiceInfo?.customerInfo?.pan && (
                      <div
                        style={{
                          fontSize: "0.875rem",
                          color: "#6B7280",
                          marginTop: "0.2rem",
                        }}
                      >
                        PAN : {invoiceInfo?.customerInfo?.pan}
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
                      {date}
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
                      {invoiceInfo?.rows &&
                        invoiceInfo?.rows.length > 0 &&
                        invoiceInfo?.rows.map((row, index) => (
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
                                {invoiceInfo?.invoiceCurrency
                                  ? invoiceInfo?.invoiceCurrency
                                  : "₹"}{" "}
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
                                {invoiceInfo?.invoiceCurrency
                                  ? invoiceInfo?.invoiceCurrency
                                  : "₹"}{" "}
                                {row.amount}
                              </td>
                            </tr>
                            {invoiceInfo?.rows.length > index + 1 && (
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
                      {invoiceInfo?.invoiceCurrency
                        ? invoiceInfo?.invoiceCurrency
                        : "₹"}{" "}
                      {invoiceInfo?.amount}
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
                  {invoiceInfo?.accountInfo && (
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
                            {invoiceInfo?.accountInfo?.bankName}
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
                            {invoiceInfo?.accountInfo?.name}
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
                            {invoiceInfo?.accountInfo?.accountNumber}
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
                            {invoiceInfo?.accountInfo?.accountType}
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
                            {invoiceInfo?.accountInfo?.ifscCode}
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
                            {invoiceInfo?.accountInfo?.branch}
                          </span>
                        </div>

                        {invoiceInfo?.accountInfo?.pan && (
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
                              {invoiceInfo?.accountInfo?.pan}
                            </span>
                          </div>
                        )}

                        {invoiceInfo?.accountInfo?.upi && (
                          <div
                            style={{
                              marginTop: "0.25rem", // font-bold
                            }}
                          >
                            UPI :{" "}
                            <span
                              style={{
                                fontWeight: "bold",
                              }}
                            >
                              {invoiceInfo?.accountInfo?.upi}
                            </span>
                          </div>
                        )}
                        <br />
                      </div>
                    </div>
                  )}

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
                  {invoiceInfo?.signedInfo?.signature && (
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
                          src={invoiceInfo?.signedInfo?.signature}
                          alt="sign"
                        />
                        <div style={{ fontWeight: "bold" }}>Date Signed</div>
                        <div>{invoiceInfo?.signedInfo?.signedDate}</div>
                      </div>
                    </div>
                  )}
                </div>
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

        {loading && <Loader />}
      </div>
      {openEmailModal && (
        <EmailViewModal
          handleCloseEmailModal={handleCloseEmailModal}
          invoiceInfo={invoiceInfo}
          email={invoiceInfo?.personalInfo?.email}
          logoBase64={logoBase64}
        />
      )}
    </div>
  );
}

export default CreatorViewInvoice;
