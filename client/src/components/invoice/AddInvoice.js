import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import Header from "./Header";
//import { getInvoiceNumber, getUserSettings } from "./DatabaseHelper";
import { Trash2, X } from "lucide-react";
import { FaRegEdit } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import InventoryModal from "../inventory/InventoryModal";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";

import AlertModal from "../confirmModal/AlertModal";
import MobileMenu from "../MobileMenu";
//import CurrencyFlag from "react-currency-flags";
//import "./Sign.css";
//import { Textarea } from "@headlessui/react";

//import ImageUpload from './ImageUpload';

const AddInvoice = () => {
  const [signature, setSignature] = useState(null);
  const [loading, setLoading] = useState(false);

  const [isAccountInfo, setIsAccountInfo] = useState(false);
  const [isBusinessInfo, setIsBusinessInfo] = useState(false);

  const countryCode = localStorage.getItem("countryCode");
  const refreshPage = () => {
    navigate(0); // React Router v6+
  };
  useEffect(() => {
    //console.log(signature);
  }, [signature]);

  const loggedInUser = localStorage.getItem("user");

  const [invoiceName, setInvoiceName] = useState("");
  const [amount, setAmount] = useState(0);
  const [advance, setAdvance] = useState(0);

  // personal information
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [address3, setAddress3] = useState("");
  const [phone, setPhone] = useState("");
  const [savePersonal, setSavePersonal] = useState(true);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // account information
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountType, setAccountType] = useState("");
  const [branch, setBranch] = useState("");
  const [upi, setUpi] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [pan, setPan] = useState("");
  const [saveAccount, setSaveAccount] = useState(true);

  // invoice to information
  const [inv_name, setInv_Name] = useState("");
  const [inv_email, setInv_Email] = useState("");
  const [inv_address1, setInv_Address1] = useState("");
  const [inv_address2, setInv_Address2] = useState("");
  const [inv_address3, setInv_Address3] = useState("");
  const [inv_phone, setInv_Phone] = useState("");
  const [inv_gst, setInv_Gst] = useState("");
  const [inv_tin, setInv_Tin] = useState("");
  const [inv_pan, setInv_Pan] = useState("");
  const [inv_cin, setInv_Cin] = useState("");
  const [saveInvoiceTo, setSaveInvoiceTo] = useState(true);

  const [paymentType, setPaymentType] = useState("fullyPaid");
  const [advanceAmount, setAdvanceAmount] = useState("");

  const [businessType, setBusinessType] = useState("Rajputi Poshak");

  // invoice details
  const [invoiceNumber, setInvoiceNumber] = useState("");

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [settledDate, setSettledDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [expectedDate, setExpectedDate] = useState();
  const [discount, setDiscount] = useState(0.0);

  const [upiEnabled, setUpiEnabled] = useState(true);

  var today = new Date();
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
  let month = months[today.getMonth()];
  const signedDate = month + " " + today.getDate() + ", " + today.getFullYear();
  const [currency, setCurrency] = useState("INR");
  const [item, setItem] = useState("");
  const [symbol, setSymbol] = useState("₹");

  const [loss, setLoss] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // item details
  const [rows, setRows] = useState([]);
  const handleInputChange = (name, value, index) => {
    const values = [...rows];
    //const { name, value } = e.target;

    if (name === "desc") {
      values[index].desc = value;
    }

    if (name === "rate" && /^\d*(\.\d{0,2})?$/.test(value)) {
      // Allow only numbers with up to 2 decimal places
      values[index].rate = value;
      values[index].amount = values[index].qty * values[index].rate;
    }

    if (name === "quantity" && /^\d*$/.test(value)) {
      const isExceeded = isQuantityExceeded(
        value,
        values[index].totalQty,
        values[index].desc
      );
      if (!isExceeded) return;

      // Allow only whole numbers
      values[index].qty = value;
      values[index].amount = values[index].qty * values[index].rate;
    }
    if (name === "code") {
      values[index].code = value;
    }

    localStorage.setItem("rows", JSON.stringify(values));
    setRows(values);
    AddTotal();
  };

  const getAllRowsFromLocalStorage = () => {
    const items = localStorage.getItem("rows");
    if (items === null || items === "undefined" || items === "null") {
      return;
    }
    const val = JSON.parse(items);

    if (val === null) {
      setRows([]);
    } else {
      setRows(val);
    }

    AddTotal();
  };

  const AddTotal = () => {
    const total = rows.reduce(
      (acc, row) => acc + (parseInt(row.amount) || 0),
      0
    );
    setAmount(total);
  };

  const RemoveTotal = (amt) => {
    let total = amount;

    total -= amt;
    setAmount(total);
  };

  const handleAddRow = () => {
    if (rows?.length < 50) {
      //setRows([...rows, { desc: "", code: "", rate: "", qty: 1, amount: 0 }]);
      AddTotal();
    }
  };

  const handleResetRows = () => {
    localStorage.removeItem("rows");
    //if (rows.length > 0) return;
    //setRows([...rows, { desc: "", rate: "", qty: "", amount: 0 }]);
    //setRows([{ desc: "", code: "", rate: "", qty: 1, amount: 0 }]);
    //AddTotal();
  };

  const handleDeleteRow = (index, e) => {
    var res = window.confirm("Delete the item?");
    if (res) {
      const remRows = rows.filter((v, i) => i !== index);
      setRows(remRows);

      localStorage.setItem("rows", JSON.stringify(remRows));

      RemoveTotal(rows[index].amount);
    }
  };

  const isLoss = (modifiedSellValue, buyPrice) => {
    return parseInt(modifiedSellValue) < parseInt(buyPrice);
  };

  const isQuantityExceeded = (qty, itemQty, itemName) => {
    if (itemQty < parseInt(qty)) {
      alert(`Quantity of ${itemName} is not sufficient in stock !!!`);
      return false;
    }

    return true;
  };

  const navigate = useNavigate();

  const [taxInfo, setTaxInfo] = useState([]);

  const [showConfirm, setShowConfirm] = useState(false);
  const [showConfirm1, setShowConfirm1] = useState(false);
  const [showConfirm2, setShowConfirm2] = useState(false);
  const [showConfirm3, setShowConfirm3] = useState(false);

  const handleCreateInvoice = async () => {
    if (!customerName?.trim()) {
      setShowConfirm(true);
      return;
    }

    if (!customerPhone?.trim()) {
      setShowConfirm1(true);
      return;
    }

    if (customerPhone?.trim().length !== 10) {
      setShowConfirm2(true);
      return;
    }

    if (!invoiceNumber) {
      alert("Please add invoice number !!!");
      return;
    }

    if (!date) {
      alert("Please add invoice date !!!");
      return;
    }

    let info1 = localStorage.getItem("businessInfo");
    if (!info1 || info1 === null || info1 === undefined || info1 === "null") {
      alert("Please add business name to create invoice !!!");
      return;
    }

    if (
      (paymentType === "advance" && advanceAmount === "") ||
      parseInt(advanceAmount) < 0
    ) {
      alert("Please enter valid advance amount");
      document.querySelector('input[name="advanceAmount"]').focus();
      return;
    }
    if (rows.length === 0) {
      alert("Atleast one item should be added !!!");
      return;
    }
    // validate each row before creating invoice
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.desc.trim()) {
        alert("Item description can not be empty !!!");
        return;
      }
      if (!row.rate) {
        alert("Price (Rate) can not be empty !!!");
        return;
      }
      if (!row.qty) {
        alert("Quantity can not be empty !!!");
        return;
      }
    }

    if (expectedDate && new Date(expectedDate) < new Date(date)) {
      setShowConfirm3(true);
      return;
    }

    // verify invoice number
    if (await isInvoiceNumberExists(invoiceNumber)) {
      alert("Invoice number is already exists, Please change it !!!");
      return;
    }
    const customerInfo = {
      customerName: customerName,
      customerPhone: customerPhone,
    };

    localStorage.setItem("customerInfo", JSON.stringify(customerInfo));

    const invoiceInfo = {
      invoiceNumber: invoiceNumber,
      date: date,
      expectedDate: expectedDate,
      settledDate: settledDate,
    };
    localStorage.setItem("invoiceInfo", JSON.stringify(invoiceInfo));
    // const imageRef = ref(storage, `images/signature/${showTime}-${selectedFile.name}`);
    // await uploadBytes(imageRef, selectedFile);

    // const imageUrl1 = await getDownloadURL(imageRef);
    const amountInfo = {
      amount: amount,
      paymentType: paymentType,
      advance: parseInt(advanceAmount),
    };

    if (paymentType === "fullyPaid") {
      invoiceInfo.settledDate = settledDate;
    } else {
      invoiceInfo.settledDate = "";
    }
    localStorage.setItem("advanceAmount", advanceAmount);
    localStorage.setItem("paymentType", paymentType);

    localStorage.setItem("amountInfo", JSON.stringify(amountInfo));

    let info2 = localStorage.getItem("taxInfo");
    let taxData = JSON.parse(info2);

    const cgst = Math.round((taxData?.cgstAmount ?? 0) * amount) / 100;
    const sgst = Math.round((taxData?.sgstAmount ?? 0) * amount) / 100;
    const igst = Math.round((taxData?.igstAmount ?? 0) * amount) / 100;
    const ugst = Math.round((taxData?.ugstAmount ?? 0) * amount) / 100;
    const tax = Math.round((taxData?.taxAmount ?? 0) * amount) / 100;
    const balance =
      taxData?.taxType === "alltax"
        ? Math.round(
            amount + cgst + sgst + igst + ugst - parseInt(advanceAmount)
          )
        : Math.round(amount + tax - parseInt(advanceAmount));
    const taxCalculatedInfo = {
      cgst: cgst,
      sgst: sgst,
      igst: igst,
      ugst: ugst,
      tax: tax,
      balance: balance,
    };

    const total =
      taxData?.taxType === "alltax"
        ? Math.round(amount + cgst + sgst + igst + ugst)
        : Math.round(amount + tax);
    localStorage.setItem("total", total);

    if (paymentType === "advance" && parseInt(advanceAmount) > total) {
      alert("Advance amount can not be greater than total amount");
      document.querySelector('input[name="advanceAmount"]').focus();
      return;
    }

    localStorage.setItem(
      "taxCalculatedInfo",
      JSON.stringify(taxCalculatedInfo)
    );
    localStorage.setItem("rows", JSON.stringify(rows));

    navigate("/invoice");
  };

  const login_CollectionRef = collection(db, "Login_Info");
  const getInvoiceNumber = async () => {
    const data = await getDocs(login_CollectionRef);
    const filteredData = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    const loggedInUser = localStorage.getItem("user");
    const loginInfo = filteredData.filter((x) => x.code === loggedInUser)[0];

    setInvoiceNumber(loginInfo?.invoiceNumber);
  };

  const handleResetInvoice = () => {
    var res = window.confirm("Reset will delete all data. Continue?");
    if (!res) return;

    setCustomerName("");
    setCustomerPhone("");
    setExpectedDate("");
    setAdvance(0);

    setDate(new Date().toISOString().slice(0, 10));
    setAmount(0);
    setSignature(null);
    setSign(false);

    handleResetRows();

    deleteLocalStoragePersonalInfo();

    deleteLocalStorageInvoiceInfo();

    refreshPage();
  };

  const isInvoiceNumberExists = async (invoiceNumber) => {
    const invoiceInfo_CollectionRef = collection(db, "Invoice_Info");
    const data = await getDocs(invoiceInfo_CollectionRef);
    const filteredData = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    const invoiceExists = filteredData.some(
      (invoice) =>
        parseInt(invoice?.invoiceInfo?.invoiceNumber) ===
        parseInt(invoiceNumber)
    );

    return invoiceExists;
  };

  const [sign, setSign] = useState(false);

  const [open, setOpen] = React.useState(false);
  const handleClose = () => {
    setOpen(false);
  };

  const [openUpi, setOpenUpi] = React.useState(false);
  const handleCloseUpi = () => {
    setOpenUpi(false);
  };

  const [upiType, setUpiType] = useState("");
  const [upiId, setUpiId] = useState("");

  const handleSignOpen = () => {
    setSign(true);
  };
  const handleCloseSign1 = () => {
    var res = window.confirm("Removing Signature?");
    if (res) {
      setSign(false);
      localStorage.removeItem("sign");
      setSignature(null);
    } else {
      // Do nothing!
      console.log("Not deleted");
    }
  };

  const [openAccount, setOpenAccount] = React.useState(false);
  const handleCloseAccount = () => {
    setOpenAccount(false);
  };

  const [showModal, setShowModal] = React.useState(false);

  const getLocalStoragePersonalInfo = () => {
    setCustomerName(localStorage.getItem("custname"));
    setEmail(localStorage.getItem("email"));
    setAddress1(localStorage.getItem("address1"));
    setAddress2(localStorage.getItem("address2"));
    setAddress3(localStorage.getItem("address3"));
    setCustomerPhone(localStorage.getItem("custphone"));
    setAdvance(localStorage.getItem("advance"));
  };

  const getLocalStorageInvoiceInfo = async () => {
    // if (localStorage.getItem("invoiceNumber")) {
    //   setInvoiceNumber(localStorage.getItem("invoiceNumber"));
    // } else {
    //   const newInvoiceNumber = 0; //await getInvoiceNumber(loggedInUser);
    //   setInvoiceNumber(newInvoiceNumber);
    //   localStorage.setItem("invoiceNumber", newInvoiceNumber);
    // }

    const dat = localStorage.getItem("date");
    if (dat) {
      setDate(localStorage.getItem("date"));
    }

    const expecteddat = localStorage.getItem("expecteddate");
    if (expecteddat) {
      setExpectedDate(localStorage.getItem("expecteddate"));
    }
  };

  const getLocalStorageSignInfo = () => {
    const sig = localStorage.getItem("sign");
    if (sig) {
      setSignature(sig);
      setSign(true);
    }
  };

  const getLocalStorageUpiInfo = () => {
    const upiId = localStorage.getItem("upiId");

    if (upiId) {
      setUpiEnabled(false);
      setUpiType(localStorage.getItem("upiType"));
      setUpiId(upiId);
    } else {
      setUpiEnabled(true);
    }
  };

  const deleteLocalStoragePersonalInfo = () => {
    localStorage.removeItem("custname");
    localStorage.removeItem("email");
    localStorage.removeItem("address1");
    localStorage.removeItem("address2");
    localStorage.removeItem("address3");
    localStorage.removeItem("custphone");
  };

  const deleteLocalStorageInvoiceInfo = () => {
    //localStorage.removeItem("invoiceNumber");
    localStorage.removeItem("date");
    localStorage.removeItem("expecteddate");
    localStorage.removeItem("advance");
    localStorage.removeItem("paymentType");
  };

  const getUserSettingsData = async (loggedInUser) => {
    const data = null; //await getUserSettings(loggedInUser);
    if (!data || data.length === 0) {
      setIsAccountInfo(true);
      setIsBusinessInfo(true);
    } else {
      setIsAccountInfo(data[0]?.userSettingInfo?.accountInfo);
      setIsBusinessInfo(data[0]?.userSettingInfo?.invoiceToInfo);
    }
  };

  useEffect(() => {
    getLocalStoragePersonalInfo();
    getLocalStorageInvoiceInfo();
    getAllRowsFromLocalStorage();

    getLocalStorageSignInfo();
    getLocalStorageUpiInfo();
  }, [name]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [openItem, setOpenItem] = useState(false);
  const handleSearch = (index) => {
    setSelectedIndex(index);
    setOpenItem(true);
  };

  const handleCloseItem = () => {
    const selectedItem = localStorage.getItem("selectedItem");
    if (
      !selectedItem ||
      selectedItem === "undefined" ||
      selectedItem === "null"
    ) {
      setOpenItem(false);
      return;
    }

    const price = parseFloat(localStorage.getItem("selectedItemPrice"));
    const item = {
      desc: localStorage.getItem("selectedItem"),
      code: localStorage.getItem("selectedItemCode"),
      buyPrice: localStorage.getItem("selectedItemBuyPrice"),
      totalQty: localStorage.getItem("selectedItemQty"),
      selectedUnit: localStorage.getItem("selectedItemUnit"),
      rate: price,
      qty: 1,
      amount: 1 * price,
    };

    if (parseInt(item.totalQty) === 0) {
      alert("Item is out of stock. Please check the inventory.");
      return;
    }

    setRows((prevRows) => {
      if (
        prevRows.some((row) => row.code === item.code && row.desc === item.desc)
      ) {
        alert(
          "Item already exists in the invoice. Please edit the existing item."
        );
        return prevRows;
      }

      const updatedRows = [...prevRows, item];
      localStorage.setItem("rows", JSON.stringify(updatedRows));
      setAmount((prevAmount) => prevAmount + item.amount);
      return updatedRows;
    });

    setOpenItem(false);
  };

  useEffect(() => {
    setLoading(true);
    const businessType = localStorage.getItem("type");
    setBusinessType(businessType);
    getUserSettingsData(loggedInUser);
    getInvoiceNumber();

    let info2 = localStorage.getItem("taxInfo");
    let taxData = info2 === "undefined" ? null : JSON.parse(info2);
    setTaxInfo(taxData);

    let rowsInfo = localStorage.getItem("rows");
    if (rowsInfo !== null && rowsInfo !== "undefined") {
      const rowsData = JSON.parse(rowsInfo);

      var total = 0;
      for (let i = 0; i < rowsData?.length; i++) {
        total += parseInt(rowsData[i].amount);
      }

      setAmount(total);
    }

    const payType = localStorage.getItem("paymentType");
    const type1 = payType === null ? "fullyPaid" : payType;
    setPaymentType(type1);

    const advAmount = localStorage.getItem("advanceAmount");
    const amt = advAmount === null ? "" : advAmount;
    setAdvanceAmount(amt);

    window.scroll(0, 0);
    setTimeout(function () {
      //your code to be executed after 1 second
    }, 5000);
    setLoading(false);
  }, []);

  // Add validation for customerPhone to ensure it contains only numbers
  const handleCustomerPhoneChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      // Allow only digits
      setCustomerPhone(value);
      localStorage.setItem("custphone", value);
    }
  };

  // Add validation for advance to ensure it contains only numbers
  const handleAdvanceChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      // Allow only digits
      setAdvance(value);
      localStorage.setItem("advance", value);
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
    window.scroll(0, 0);
  }, []);

  return (
    <div>
      <div className="hidden max-lg:block mb-16">
        <MobileMenu />
      </div>
      <div className="top-14 lg:top-0 mx-auto w-full h-[56px] lg:h-[68px] text-white fixed lg:sticky bg-white border-[1.4px]">
        <div className="flex justify-between mx-auto font-bold text-md p-2 rounded-md fixed w-full lg:w-[81.5%]">
          <div className="text-xl text-black hidden lg:block">
            Create Invoice
          </div>
          <div className="flex justify-between gap-x-4 text-sm">
            <button
              onClick={handleResetInvoice}
              className="bg-[#146eb4] top-14 text-white border-[1.4px] border-gray-400  py-2 px-6 font-semibold rounded-md  hover:scale-110 transition duration-300 ease-in cursor-pointer "
            >
              Reset
            </button>
            <button
              onClick={handleCreateInvoice}
              className="bg-amber-600 top-14 border-[1.4px] border-gray-400 text-white py-2 px-6 font-semibold rounded-md text-richblack-700 hover:scale-110 transition duration-300 ease-in cursor-pointer "
            >
              Create Invoice
            </button>
          </div>
        </div>
      </div>

      <div className="px-3">
        {loading && (
          <>
            <div className="h-2 w-2 bg-[#d6f539] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-2 w-2 bg-[#d6f539] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-2 w-2 bg-[#d6f539] rounded-full animate-bounce"></div>
          </>
        )}
        <div>
          <div className="flex flex-col w-full gap-y-3 mx-auto mb-10">
            <div className="flex flex-col lg:flex-row justify-between gap-x-2 w-full mx-auto">
              <div className="flex flex-col w-full lg:w-6/12 mx-auto justify-start items-left mt-16 lg:mt-4 shadow-lg border-[1.2px] p-2 lg:p-5 bg-white gap-y-2 lg:gap-y-4 rounded-md">
                <div className="flex flex-col justify-start items-left gap-y-0 lg:gap-y-4 ">
                  <div className="flex ">
                    <div className="text-md lg:text-lg text-gray-600 font-medium">
                      Customer
                    </div>
                  </div>

                  <div className="flex flex-col justify-start items-left">
                    <div className="text-[13px] font-bold leading-5 mt-2">
                      Name
                    </div>
                    <div>
                      <input
                        className="form-input w-full lg:w-8/12 block font-semibold text-[13px] rounded border border-gray-400 p-2 leading-5 "
                        required
                        name="custname"
                        placeholder="Enter Customer Name"
                        value={customerName}
                        onChange={(e) => {
                          localStorage.setItem("custname", e.target.value);
                          setCustomerName(e.target.value);
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col ">
                  <div className="text-[13px] font-bold leading-5 mt-2">
                    Mobile
                  </div>
                  <div className="flex justify-start items-left -ml-4">
                    <span className="p-[7px] bg-[#eee] border border-[#ccc] border-r-0 rounded-l font-medium text-[13px]">
                      +91
                    </span>
                    <input
                      className="p-[5px] pl-[10px] border border-[#ccc] rounded-r w-[120px] text-[13px] text-left"
                      type="text"
                      name="custphone"
                      value={customerPhone}
                      onChange={handleCustomerPhoneChange}
                      minLength={10}
                      maxLength={10}
                      placeholder="Mobile number..."
                    />
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-6/12 mx-auto flex flex-col mt-4 shadow-lg border-[1.2px] p-2 lg:p-4 bg-white gap-y-2 lg:gap-y-4 rounded-md">
                <div className="flex hidden lg:block">
                  <div className="text-xl text-gray-600 font-medium">
                    Invoice
                  </div>
                </div>
                <div className="flex justify-between w-full mx-auto">
                  <div className="flex flex-col">
                    <div className="text-xs font-medium leading-5 mt-2">
                      Invoice #
                    </div>
                    <div>
                      <input
                        className="w-6/12 block text-xs rounded border border-gray-400 py-2 px-4 leading-5"
                        required
                        name="invoiceNumber"
                        placeholder="10"
                        value={invoiceNumber}
                        onChange={(e) => {
                          setInvoiceNumber(e.target.value);
                          localStorage.setItem("invoiceNumber", e.target.value);
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="text-xs font-medium leading-5 mt-2">
                      Date
                    </div>
                    <div>
                      <input
                        className="w-12/12 block text-xs rounded border border-gray-400 py-2 px-4 leading-5 "
                        required
                        name="date"
                        placeholder="Date"
                        type="date"
                        value={date}
                        onChange={(e) => {
                          setDate(e.target.value);
                          localStorage.setItem("date", e.target.value);
                        }}
                      />
                    </div>
                  </div>
                </div>
                {
                  <div className="flex flex-col">
                    <div className="flex flex-col">
                      <div className="text-xs font-medium leading-5 mt-2">
                        Expected Delivery
                      </div>
                      <div>
                        <input
                          className="w-12/12 lg:w-3/12 block text-xs rounded border border-gray-400 py-2 px-4 leading-5 "
                          required
                          name="expecteddate"
                          placeholder="Date"
                          type="date"
                          value={expectedDate}
                          onChange={(e) => {
                            setExpectedDate(e.target.value);
                            localStorage.setItem(
                              "expecteddate",
                              e.target.value
                            );
                          }}
                        />
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <div className="w-full mx-auto shadow-lg border-[1.2px] p-2 lg:p-4 bg-white gap-y-4 rounded-md">
              <div className="overflow-hidden ">
                <table className="w-full mx-auto text-center text-sm font-light">
                  <thead className="text-[12px] md:text-md uppercase max-md:hidden">
                    <tr className="flex justify-between border-y-2 py-2 border-black">
                      <th className="w-[10%]">S.No.</th>
                      <th className="w-[30%] text-left">Description</th>
                      <th className="w-[15%]">Rate</th>
                      <th className="w-[10%] max-md:hidden">Quantity</th>
                      <th className="w-[10%] md:hidden">Qty</th>
                      <th className="w-[20%] text-center">Amount</th>
                      <th className="w-[10%]"></th>
                    </tr>
                  </thead>

                  <tbody className="max-lg:hidden ">
                    {rows &&
                      rows.length > 0 &&
                      rows.map((row, index) => (
                        <div>
                          <tr className="flex justify-between text-[12px] md:text-md w-full mt-4">
                            <td className="w-[10%] text-center mt-2">
                              {index + 1}.
                            </td>
                            <td className="w-[30%] text-left">
                              <div className="relative w-full max-w-md">
                                <input
                                  type="text"
                                  placeholder="Item Description"
                                  className="w-full py-2 pr-10 pl-4 border border-gray-300 rounded-md "
                                  name="desc"
                                  required
                                  value={row.desc || rows[index].desc}
                                  onChange={(e) =>
                                    handleInputChange(
                                      e.target.name,
                                      e.target.value,
                                      index
                                    )
                                  }
                                />
                                {/* <button
                                  onClick={() => handleSearch(index)}
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600"
                                >
                                  <FontAwesomeIcon icon={faSearch} />
                                </button> */}
                              </div>
                            </td>
                            <td className="w-[15%] text-center">
                              <input
                                className={`w-full text-right block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600 ${
                                  isLoss(row.rate, row.buyPrice)
                                    ? "border-red-500 focus:ring-red-500 outline-red-500"
                                    : "border-gray-300 focus:ring-indigo-500"
                                }`}
                                required
                                name="rate"
                                placeholder="Price"
                                value={row.rate || rows[index].rate}
                                onChange={(e) =>
                                  handleInputChange(
                                    e.target.name,
                                    e.target.value,
                                    index
                                  )
                                }
                              />
                              {isLoss(row.rate, row.buyPrice) && (
                                <p className="text-sm text-red-600 mt-1">
                                  Selling at a loss for this item!
                                </p>
                              )}
                            </td>
                            <td className="w-[10%] ">
                              <div className="relative w-full max-w-md">
                                <input
                                  className="w-full text-right pr-14 block text-xs rounded border border-gray-400 py-2 px-4 leading-5"
                                  required
                                  name="quantity"
                                  placeholder="Quantity"
                                  value={row.qty}
                                  onChange={(e) =>
                                    handleInputChange(
                                      e.target.name,
                                      e.target.value,
                                      index
                                    )
                                  }
                                />
                                {row.selectedUnit !== "none" && (
                                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-r bg-gray-600 uppercase">
                                    {row.selectedUnit}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="w-[20%] text-center">
                              <div className="w-full  mt-3 font-extrabold text-xs">
                                ₹ {row.amount}
                              </div>
                            </td>
                            <td className="w-[10%]">
                              <div className="mt-2">
                                <Trash2
                                  color="red"
                                  className="cursor-pointer text-red-500 hover:text-red-700"
                                  size={20}
                                  onClick={(e) => handleDeleteRow(index, e)}
                                />
                              </div>
                            </td>
                          </tr>
                          <div className="border-b-2 border-dashed py-2"></div>
                        </div>
                      ))}
                  </tbody>

                  <tbody className="lg:hidden">
                    {rows &&
                      rows.length > 0 &&
                      rows.map((row, index) => (
                        <tr className="flex justify-between text-[12px] md:text-md w-full mt-4">
                          <div className="w-full mx-auto flex flex-col gap-y-2">
                            <td className="w-full text-left">
                              <input
                                className=" w-full block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                                required
                                name="desc"
                                placeholder="Description"
                                value={row.desc}
                                onChange={(e) =>
                                  handleInputChange(
                                    e.target.name,
                                    e.target.value,
                                    index
                                  )
                                }
                              />
                            </td>
                            <div className="w-full mx-auto flex gap-x-2">
                              <td className="w-[30%] text-center">
                                <input
                                  className={`w-full text-right block text-xs rounded border border-gray-400 py-1 px-4 leading-5 focus:text-gray-600  ${
                                    isLoss(row.rate, row.buyPrice)
                                      ? "border-red-500 focus:ring-red-500 outline-red-500"
                                      : "border-gray-300 focus:ring-indigo-500"
                                  }`}
                                  required
                                  name="rate"
                                  placeholder="Price"
                                  value={row.rate}
                                  onChange={(e) =>
                                    handleInputChange(
                                      e.target.name,
                                      e.target.value,
                                      index
                                    )
                                  }
                                />
                                {isLoss(row.rate, row.buyPrice) && (
                                  <p className="text-sm text-red-600 mt-1">
                                    Selling at a loss for this item!
                                  </p>
                                )}
                              </td>
                              <td className="w-[30%] ">
                                <div className="relative w-full max-w-md">
                                  <input
                                    className="w-full text-left block px-4 text-xs rounded border border-gray-400 py-1 leading-5 focus:text-gray-600"
                                    required
                                    name="quantity"
                                    placeholder="Quantity"
                                    value={row.qty}
                                    onChange={(e) =>
                                      handleInputChange(
                                        e.target.name,
                                        e.target.value,
                                        index
                                      )
                                    }
                                  />
                                  {row?.selectedUnit !== "none" && (
                                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 text-white p-1 rounded-r bg-gray-600 uppercase">
                                      {row?.selectedUnit}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="w-[30%] text-center">
                                <div className="w-full text-xs mt-2 ">
                                  ₹ {row.amount}
                                </div>
                              </td>
                              <td className="w-[10%]">
                                <div>
                                  {/* <button
                                    className="border-2 px-2 py-1 rounded-md bg-gray-700 text-white font-bold mt-2"
                                    onClick={handleAddRow}
                                  >
                                    +
                                  </button> */}
                                  <div className="mt-1">
                                    <Trash2
                                      color="red"
                                      className="cursor-pointer text-red-500 hover:text-red-700"
                                      size={20}
                                      onClick={(e) => handleDeleteRow(index, e)}
                                    />
                                  </div>
                                </div>
                              </td>
                            </div>
                          </div>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {/* <hr className="w-full mt-4"></hr> */}
              <div className="flex justify-start">
                <button
                  className="border-2 px-3 py-1 rounded-md bg-gray-700 text-2xl text-white font-bold mt-2"
                  onClick={() => handleSearch()}
                >
                  +
                </button>
              </div>
              <hr className="w-full mt-2"></hr>

              <div className="flex flex-col lg:flex-row justify-between w-full mx-auto">
                <div className="w-full lg:w-3/12 mt-2">
                  <div className="w-full mx-auto p-2 lg:p-6 bg-white shadow-md border-[1.4px] rounded-md">
                    <h2 className="text-lg font-semibold mb-4">Payment Type</h2>

                    {/* Radio Options */}
                    <div className="flex flex-col gap-6 mb-4 text-sm">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="payment"
                          value="fullyPaid"
                          checked={paymentType === "fullyPaid"}
                          onChange={() => {
                            setPaymentType("fullyPaid");
                            setAdvanceAmount("");
                          }}
                          className="accent-indigo-600"
                        />
                        Fully Paid
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="payment"
                          value="advance"
                          checked={paymentType === "advance"}
                          onChange={() => setPaymentType("advance")}
                          className="accent-indigo-600"
                        />
                        Advance
                      </label>
                    </div>

                    {/* Input field for Advance */}
                    {paymentType === "advance" && (
                      <div className="mt-2 text-sm">
                        <label className="block mb-1 font-medium">
                          Enter Advance Amount (₹)
                        </label>
                        <input
                          name="advanceAmount"
                          type="text"
                          pattern="[0-9]*"
                          value={advanceAmount}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (/^\d*$/.test(val)) setAdvanceAmount(val);
                          }}
                          className="w-8/12 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 "
                          //placeholder="e.g. 500"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-full lg:w-8/12 text-sm">
                  <div className="w-full flex justify-end gap-x-10 mt-2">
                    <div className="w-11/12 flex justify-end mx-auto mt-2 px-2 text-xs lg:text-sm font-bold rounded-md uppercase">
                      SubTotal
                    </div>
                    <div
                      className="w-3/12 mx-auto flex justify-end mt-1 px-2 text-xs lg:text-sm font-bold rounded-md"
                      name="amount"
                    >
                      ₹ {amount}
                    </div>
                  </div>

                  {taxInfo?.taxType === "alltax" && taxInfo?.cgstAmount && (
                    <div className="w-full flex justify-end gap-x-10 mt-2">
                      <div className="w-11/12 flex justify-end mx-auto mt-2 px-2 text-xs lg:text-sm font-bold rounded-md uppercase">
                        CGST ({taxInfo?.cgstAmount}%)
                      </div>
                      <div
                        className="w-3/12 mx-auto flex justify-end mt-1 px-2 text-xs lg:text-sm font-bold rounded-md"
                        name="cgst"
                      >
                        ₹{" "}
                        {Math.round((taxInfo?.cgstAmount ?? 0) * amount) / 100}
                      </div>
                    </div>
                  )}

                  {taxInfo?.taxType === "alltax" && taxInfo?.sgstAmount && (
                    <div className="w-full flex justify-end gap-x-10 mt-2">
                      <div className="w-11/12 flex justify-end mx-auto mt-2 px-2 text-xs lg:text-sm font-bold rounded-md uppercase">
                        SGST ({taxInfo?.sgstAmount}%)
                      </div>
                      <div
                        className="w-3/12 mx-auto flex justify-end mt-1 px-2 text-xs lg:text-sm font-bold rounded-md"
                        name="sgst"
                      >
                        ₹{" "}
                        {Math.round((taxInfo?.sgstAmount ?? 0) * amount) / 100}
                      </div>
                    </div>
                  )}

                  {taxInfo?.taxType === "alltax" && taxInfo?.igstAmount && (
                    <div className="w-full flex justify-end gap-x-10 mt-2">
                      <div className="w-11/12 flex justify-end mx-auto mt-2 px-2 text-xs lg:text-sm font-bold rounded-md uppercase">
                        IGST ({taxInfo?.igstAmount}%)
                      </div>
                      <div
                        className="w-3/12 mx-auto flex justify-end mt-1 px-2 text-xs lg:text-sm font-bold rounded-md"
                        name="igst"
                      >
                        ₹{" "}
                        {Math.round((taxInfo?.igstAmount ?? 0) * amount) / 100}
                      </div>
                    </div>
                  )}

                  {taxInfo?.taxType === "alltax" && taxInfo?.ugstAmount && (
                    <div className="w-full flex justify-end gap-x-10 mt-2">
                      <div className="w-11/12 flex justify-end mx-auto mt-2 px-2 text-xs lg:text-sm font-bold rounded-md uppercase">
                        UGST ({taxInfo?.ugstAmount}%)
                      </div>
                      <div
                        className="w-3/12 mx-auto flex justify-end mt-1 px-2 text-xs lg:text-sm font-bold rounded-md"
                        name="ugst"
                      >
                        ₹{" "}
                        {Math.round((taxInfo?.ugstAmount ?? 0) * amount) / 100}
                      </div>
                    </div>
                  )}

                  {taxInfo?.taxType === "tax" && taxInfo?.taxAmount && (
                    <div className="w-full flex justify-end gap-x-10 mt-2">
                      <div className="w-11/12 flex justify-end mx-auto mt-2 px-2 text-xs lg:text-sm font-bold rounded-md uppercase">
                        Tax ({taxInfo?.taxAmount}%)
                      </div>
                      <div
                        className="w-3/12 mx-auto flex justify-end mt-1 px-2 text-xs lg:text-sm font-bold rounded-md"
                        name="tax"
                      >
                        ₹ {Math.round((taxInfo?.taxAmount ?? 0) * amount) / 100}
                      </div>
                    </div>
                  )}

                  <div className="w-full flex justify-end gap-x-10 mt-2">
                    <div className="w-11/12 flex justify-end mx-auto mt-2 px-2 text-md font-bold rounded-md uppercase">
                      Total
                    </div>
                    {taxInfo?.taxType === "alltax" ? (
                      <div
                        className="w-3/12 mx-auto flex justify-end mt-1 px-2  text-sm font-bold rounded-md"
                        name="total"
                      >
                        ₹{" "}
                        {Math.round(
                          amount +
                            ((taxInfo?.cgstAmount ?? 0) * amount) / 100 +
                            ((taxInfo?.sgstAmount ?? 0) * amount) / 100 +
                            ((taxInfo?.igstAmount ?? 0) * amount) / 100 +
                            ((taxInfo?.ugstAmount ?? 0) * amount) / 100
                        )}
                      </div>
                    ) : (
                      <div
                        className="w-3/12 mx-auto flex justify-end mt-1 px-2  text-sm font-bold rounded-md"
                        name="total"
                      >
                        ₹{" "}
                        {Math.round(
                          amount + ((taxInfo?.taxAmount ?? 0) * amount) / 100
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* <hr className="w-full my-4"></hr> */}

              {/* <div className="w-full flex justify-end gap-x-10 mt-2">
                <div className="w-9/12 flex justify-end mx-auto mt-2 px-2 text-sm font-bold rounded-md uppercase">
                  Advance
                </div>
                <div className="w-[16%] mx-auto  flex gap-x-2">
                  <div className="text-md font-bold mt-1">₹ </div>
                  <input
                    className="form-input text-md font-bold block w-full rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                    pattern="^[0-9]*$"
                    name="advance"
                    placeholder="Advance..."
                    value={advance}
                    onChange={handleAdvanceChange}
                  />
                </div>
              </div> */}
            </div>
          </div>
        </div>
        {openItem && (
          <InventoryModal
            handleCloseItem={handleCloseItem}
            setItem={setItem}
          ></InventoryModal>
        )}
        <AlertModal
          isOpen={showConfirm}
          onClose={() => {
            setShowConfirm(false);
            document.querySelector('input[name="custname"]').focus();
          }}
          title="Required"
          message="Customer Name is required."
        />
        <AlertModal
          isOpen={showConfirm1}
          onClose={() => {
            setShowConfirm1(false);
            document.querySelector('input[name="custphone"]').focus();
          }}
          title="Required"
          message="Customer Phone number is required."
        />
        <AlertModal
          isOpen={showConfirm2}
          onClose={() => {
            setShowConfirm2(false);
            document.querySelector('input[name="custphone"]').focus();
          }}
          title="Not Valid"
          message="Customer phone number is not valid."
        />
        <AlertModal
          isOpen={showConfirm3}
          onClose={() => {
            setShowConfirm3(false);
            document.querySelector('input[name="expecteddate"]').focus();
          }}
          title="Not Allowed"
          message="Expected delivery date cannot be before the invoice date."
        />
      </div>
    </div>
  );
};

export default AddInvoice;
