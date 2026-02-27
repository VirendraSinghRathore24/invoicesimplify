import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import Loader from "../Loader";
import { BASE_URL, CREATORS, INVOICE_INFO, LOGIN_INFO } from "../Constant";
import { toast } from "react-toastify";
import { db } from "../../config/firebase";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

const EmailModal = ({
  handleCloseEmailModal,
  email,
  invoiceInfo,
  personalInfo,
  logoUrl,
  taxInfo,
  customerInfo,
  rows,
  amountInfo,
  accountInfo,
  signedInfo,
  logoBase64,
  additionalInfo,
  setUpdateCredit,
  // taxCalculatedInfo,
}) => {
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [brandEmail, setBrandEmail] = useState(email);
  const [ccEmail, setCCEmail] = useState("");
  const [subject, setSubject] = useState("");

  const loggedInUser = localStorage.getItem("user");
  const uid = localStorage.getItem("uid");
  const currencySymbol = localStorage.getItem("invoiceCurrency") || "₹";

  const handleEmailInvoice = async (e) => {
    try {
      e.preventDefault();

      if (!brandEmail) {
        alert("Please enter email address !!!");
        document.querySelector('input[name="brandEmail"]').focus();
        return;
      }

      const url = BASE_URL;

      const invoiceData = {
        email: brandEmail,
        ccEmail: ccEmail,
        subject: subject,
        invoiceInfo: invoiceInfo,
        logoUrl: logoUrl,
        taxInfo: taxInfo,
        personalInfo: personalInfo,
        customerInfo: customerInfo,
        rows: rows,
        amountInfo: amountInfo,
        accountInfo: accountInfo,
        signedInfo: signedInfo,
        logoBase64: logoBase64,
        additionalInfo: additionalInfo,
        currencySymbol: currencySymbol,
      };

      setLoading(true);
      const response = await fetch(url + "/send-email-pdf1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceData: invoiceData,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        if (await checkIfInvoiceAlreadyDownloadOrEmailed()) {
          handleCloseEmailModal();
          setLoading(false);
          toast("Email sent successfully!");
          return;
        }
        // insert to db
        await InsertToDB();
        await updateInvoiceNumber();
        clearLocalStorageForPdf();
        handleCloseEmailModal();
        toast("Email sent successfully!");
      } else {
        console.error("PDF generation failed");
        handleCloseEmailModal();
      }
    } catch (er) {
      console.log(er);
    } finally {
      setLoading(false);
    }
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
      amount: amountInfo,
      invoiceInfo: invoiceInfo,
      signedInfo: signedInfo,
      loggedInUser: loggedInUser,
      logoBase64: logoBase64,
      paymentStatus: "Pending",
      invoiceCurrency: currencySymbol ? currencySymbol : "₹",
    });

    localStorage.setItem("downloadedInvoiceNumber", invoiceInfo?.invoiceNumber);

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
    const credit = parseInt(localStorage.getItem("credit")) - 1;
    localStorage.setItem("credit", credit);
    localStorage.setItem("usedInvoiceNumbers", usedInvoiceNumbers);
    localStorage.setItem(
      "invoiceNumber",
      parseInt(invoiceInfo?.invoiceNumber) + 1
    );
    setUpdateCredit(credit);
    await updateDoc(codeDoc, {
      invoiceNumber: parseInt(invoiceInfo?.invoiceNumber + 1),
      usedInvoiceNumbers: usedInvoiceNumbers,
      credit: credit,
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

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("email_data"));
    setPosts(data);

    // setBrandEmail(data.customerInfo.email);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center lg:left-64">
      <div className="w-full max-w-lg mx-4 bg-white dark:bg-gray-900 text-black dark:text-white rounded-xl shadow-xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">📧 Send Email</h2>
          <button
            onClick={handleCloseEmailModal}
            className="text-gray-600 hover:text-red-500"
          >
            <X size={28} />
          </button>
        </div>

        <hr className="mb-4 border-gray-300 dark:border-gray-700" />
        <div className="text-sm text-gray-600 mb-2">
          To send an email to multiple accounts, add the email addresses as a
          comma-separated: (abc@gmail.com, cde@gmail.com)
        </div>

        {/* Form */}
        <form className="space-y-5">
          {/* Summary */}
          <div className="max-w-lg mx-auto p-1 lg:p-2 ">
            <input
              type="email"
              required
              autoFocus
              name="brandEmail"
              value={brandEmail}
              onChange={(e) => {
                setBrandEmail(e.target.value);
              }}
              placeholder="Enter Email"
              className="w-full px-4 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-base mb-4"
            />
            <button
              onClick={handleEmailInvoice}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
            >
              Send
            </button>
          </div>
        </form>
      </div>

      {/* Loader */}
      {loading && <Loader />}
    </div>
  );
};

export default EmailModal;
