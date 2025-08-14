import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar, Trash2, X, Search } from "lucide-react";
import InventoryModal from "../inventory/InventoryModal";
import { collection, doc, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";
import AlertModal from "../confirmModal/AlertModal";
import MobileMenu from "../MobileMenu";
import { INVOICE_INFO, LOGIN_INFO, SERVICE_CENTER, USERS } from "../Constant";
import Loader from "../Loader";
import SignModal from "./SignModal";
import BrandModal from "./BrandModal";
import CreatorMobileMenu from "./CreatorMobileMenu";

const CreatorAddInvoice = () => {
  const [signature, setSignature] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);

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

  const [inputs, setInputs] = useState({});

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [paymentType, setPaymentType] = useState("fullyPaid");
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");

  const [businessType, setBusinessType] = useState("Rajputi Poshak");

  // invoice details
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleKM, setVehicleKM] = useState("");
  const [vehicleType, setVehicleType] = useState("");

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [settledDate, setSettledDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [expectedDate, setExpectedDate] = useState();

  const [upiEnabled, setUpiEnabled] = useState(true);
  const uid = localStorage.getItem("uid");

  const type = localStorage.getItem("type");

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

  const [openSign, setOpenSign] = useState(false);
  const handleCloseSign = () => {
    setOpenSign(false);
  };

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
        values[index].desc,
        values[index].code
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

  const isQuantityExceeded = (qty, itemQty, itemName, code) => {
    if (code === "emptyrow") {
      return true; // Allow empty row to be added
    }
    if (itemQty < parseInt(qty)) {
      alert(`Quantity of ${itemName} is not sufficient in stock !!!`);
      return false;
    }

    return true;
  };

  const navigate = useNavigate();

  const [taxInfo, setTaxInfo] = useState([]);

  const [showConfirm, setShowConfirm] = useState(false);

  const handleCreateInvoice = async () => {
    // if (!inputs?.customerName?.trim()) {
    //   setShowConfirm(true);
    //   return;
    // }

    // if (!invoiceNumber) {
    //   alert("Please add invoice number !!!");
    //   return;
    // }

    // if (!date) {
    //   alert("Please add invoice date !!!");
    //   return;
    // }

    // let info1 = localStorage.getItem("creater_personalInfo");
    // if (!info1 || info1 === null || info1 === undefined || info1 === "null") {
    //   alert("Please add business name to create invoice !!!");
    //   return;
    // }

    // if (rows.length === 0) {
    //   alert("Atleast one item should be added !!!");
    //   return;
    // }
    // // validate each row before creating invoice
    // for (let i = 0; i < rows.length; i++) {
    //   const row = rows[i];
    //   if (!row.desc.trim()) {
    //     alert("Item description can not be empty !!!");
    //     return;
    //   }
    //   if (!row.rate) {
    //     alert("Price (Rate) can not be empty !!!");
    //     return;
    //   }
    //   if (!row.qty) {
    //     alert("Quantity can not be empty !!!");
    //     return;
    //   }
    // }

    localStorage.setItem("creator_customerInfo", JSON.stringify(inputs));

    // verify unique invoice number
    const invoiceExists = await checkInvoiceNumberExists(invoiceNumber);

    const invoiceInfo = {
      invoiceNumber: invoiceNumber,
      date: date,
    };

    const signedInfo = {
      signature: signature,
      signedDate: signedDate,
    };

    localStorage.setItem("creator_signedInfo", JSON.stringify(signedInfo));
    localStorage.setItem("creator_invoiceInfo", JSON.stringify(invoiceInfo));

    localStorage.setItem("creator_amountInfo", amount);

    localStorage.setItem("customer_rows", JSON.stringify(rows));

    navigate("/creator/invoice");
  };

  const login_CollectionRef = collection(db, LOGIN_INFO);
  const checkInvoiceNumberExists = async (invoiceNumber) => {
    try {
      setLoading1(true);
      const data = await getDocs(login_CollectionRef);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      const loggedInUser = localStorage.getItem("user");
      const loginInfo = filteredData.filter((x) => x.code === loggedInUser)[0];

      const userdNumbers = loginInfo.usedInvoiceNumbers;

      while (userdNumbers.some((num) => num === invoiceNumber)) {
        // If the invoice number already exists in usedInvoiceNumbers, increment it
        invoiceNumber++;
      }
      setInvoiceNumber(invoiceNumber);
    } catch (error) {
      console.error("Error checking invoice number:", error);
    } finally {
      setLoading1(false);
    }
  };

  const getInvoiceNumber = async () => {
    const data = await getDocs(login_CollectionRef);
    const filteredData = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    const loggedInUser = localStorage.getItem("user");
    const loginInfo = filteredData.filter((x) => x.code === loggedInUser)[0];

    // const invNumber = localStorage.getItem("invoiceNumber");
    const invNumber = loginInfo.invoiceNumber;
    const nextInvoiceNumber = parseInt(invNumber);

    const usedInvoiceNumbers = localStorage.getItem("usedInvoiceNumbers");
    const userdNumbers = usedInvoiceNumbers.split(",");
    while (userdNumbers.some((num) => num === invNumber)) {
      // If the invoice number already exists in usedInvoiceNumbers, increment it
      nextInvoiceNumber++;
    }
    localStorage.setItem("invoiceNumber", nextInvoiceNumber);
    setInvoiceNumber(nextInvoiceNumber);
  };

  const handleResetInvoice = () => {
    var res = window.confirm("Reset will delete all data. Continue?");
    if (!res) return;

    setCustomerName("");
    setCustomerPhone("");
    setExpectedDate("");
    setAdvance(0);

    setVehicleNumber("");
    setVehicleKM("");
    setVehicleType("");

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
    const invoiceInfo_CollectionRef = collection(
      doc(db, USERS, uid),
      INVOICE_INFO
    );
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

  const UpdateValues = (key, value) => {
    if (value === undefined || value === null || value === "undefined") return;
    setInputs((values) => ({
      ...values,
      [key]: value ?? "",
    }));
  };

  const getLocalStoragePersonalInfo = () => {
    const customerName = localStorage.getItem("creator_customername");
    const productName = localStorage.getItem("creator_productName");
    const customerEmail = localStorage.getItem("creator_customeremail");
    const address = localStorage.getItem("customer_address");
    const address1 = localStorage.getItem("customer_address1");
    const address2 = localStorage.getItem("customer_address2");
    const address3 = localStorage.getItem("customer_address3");
    const phone = localStorage.getItem("customer_customerphone");
    const gst = localStorage.getItem("customer_gst");
    const pan = localStorage.getItem("customer_pan");
    const tin = localStorage.getItem("customer_tin");
    const cin = localStorage.getItem("customer_cin");

    UpdateValues("customerName", customerName);
    UpdateValues("productName", productName);
    UpdateValues("customerEmail", customerEmail);
    UpdateValues("address", address);
    UpdateValues("address1", address1);
    UpdateValues("address2", address2);
    UpdateValues("address3", address3);
    UpdateValues("customerPhone", phone);
    UpdateValues("gst", gst);
    UpdateValues("pan", pan);
    UpdateValues("tin", tin);
    UpdateValues("cin", cin);
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
    localStorage.removeItem("vehicleNumber");
    localStorage.removeItem("vehicleKM");
    localStorage.removeItem("vehicleType");
  };

  const deleteLocalStorageInvoiceInfo = () => {
    //localStorage.removeItem("invoiceNumber");
    localStorage.removeItem("date");
    localStorage.removeItem("expecteddate");
    localStorage.removeItem("advance");
    localStorage.removeItem("paymentType");
    localStorage.removeItem("discountAmount");
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

  const [openBrandModal, setOpenBrandModal] = useState(false);
  const handleCloseBrandModal = async () => {
    setOpenBrandModal(false);
  };

  useEffect(() => {
    getLocalStoragePersonalInfo();
    getLocalStorageInvoiceInfo();
    getAllRowsFromLocalStorage();

    getLocalStorageSignInfo();
    getLocalStorageUpiInfo();
  }, []);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [openItem, setOpenItem] = useState(false);
  const handleSearch = () => {
    handleCloseItemForEmptyRow();
  };

  const handleCloseItemForEmptyRow = () => {
    const item = {
      desc: "",
      rate: "",
      qty: 1,
      amount: "",
    };

    setRows((prevRows) => {
      const updatedRows = [...prevRows, item];
      localStorage.setItem("customer_rows", JSON.stringify(updatedRows));
      setAmount((prevAmount) => prevAmount + item.amount);
      return updatedRows;
    });
  };

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs((values) => ({ ...values, [name]: value }));
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

    const discAmount = localStorage.getItem("discountAmount");
    const da = discAmount === null ? "" : discAmount;
    setDiscountAmount(da);

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
    <div className="flex justify-evenly w-full h-full">
      <div className="w-full lg:w-[82%] ml-0 lg:ml-[17%] lg:border-2 my-3 rounded-lg lg:border-gray-300 lg:bg-white lg:shadow-lg top-0 lg:fixed">
        <div className="hidden max-lg:block mb-16">
          <CreatorMobileMenu />
        </div>
        <div>
          <div className="top-14 lg:top-0 mx-auto w-full h-[56px] lg:h-[68px] text-white fixed lg:sticky border-b-2">
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
            <div>
              <div className="flex flex-col w-full gap-y-3 mx-auto  lg:overflow-y-auto  lg:h-[calc(100vh-100px)]">
                <div className="flex flex-col lg:flex-row justify-between gap-x-2 w-full mx-auto">
                  <div className="flex flex-col w-full lg:w-6/12 mx-auto justify-start items-left mt-16 lg:mt-4  border-[1.2px] p-2 lg:p-5 bg-white gap-y-2 lg:gap-y-4 rounded-md">
                    <div className="flex flex-col justify-start items-left gap-y-0 lg:gap-y-4 ">
                      <div className="flex justify-between">
                        <div className="text-md lg:text-lg text-gray-600 font-medium">
                          Brand Information
                        </div>
                        <div
                          onClick={() => setOpenBrandModal(true)}
                          className="border-[1.4px] border-black rounded-md px-4 py-1 bg-[#146eb4] text-white flex gap-x-2"
                        >
                          <Search size={21} className="mt-1" />
                          <button>Brands</button>
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
                            name="customerName"
                            placeholder="Enter Brand/Agency Name"
                            value={inputs?.customerName}
                            onChange={(e) => {
                              localStorage.setItem(
                                "creator_customername",
                                e.target.value
                              );
                              handleChange(e);
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col w-full">
                        <div className="text-[13px] font-bold leading-5 mt-2">
                          Product Name
                        </div>
                        <div>
                          <input
                            className="form-input w-full lg:w-8/12 block font-semibold text-[13px] rounded border border-gray-400 p-2 leading-5 "
                            required
                            name="productName"
                            placeholder="Enter Product Name"
                            value={inputs?.productName}
                            onChange={(e) => {
                              localStorage.setItem(
                                "creator_productName",
                                e.target.value
                              );
                              handleChange(e);
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col text-sm">
                      <div className="font-medium leading-5 text-gray-700 mb-1">
                        Address
                      </div>
                      <div className="flex flex-col gap-y-3">
                        <input
                          className="w-full dark:bg-gray-700 border border-gray-400 border-[1.4px] dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          name="address"
                          placeholder="Enter Brand address"
                          value={inputs?.address || ""}
                          onChange={(e) => {
                            localStorage.setItem(
                              "customer_address",
                              e.target.value
                            );
                            handleChange(e);
                          }}
                        />
                        <input
                          className="w-full dark:bg-gray-700 border border-gray-400 border-[1.4px] dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          name="address1"
                          placeholder="Enter address"
                          value={inputs?.address1 || ""}
                          onChange={(e) => {
                            localStorage.setItem(
                              "customer_address1",
                              e.target.value
                            );
                            handleChange(e);
                          }}
                        />
                        <div className="flex gap-x-3 justify-between">
                          <input
                            className="w-8/12 dark:bg-gray-700 border border-gray-400 border-[1.4px] dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            name="address2"
                            placeholder="City, State"
                            value={inputs?.address2 || ""}
                            onChange={(e) => {
                              localStorage.setItem(
                                "customer_address2",
                                e.target.value
                              );
                              handleChange(e);
                            }}
                          />
                          <input
                            className="w-3/12 dark:bg-gray-700 border border-gray-400 border-[1.4px] dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            name="address3"
                            placeholder="Zip Code"
                            maxLength={6}
                            value={inputs?.address3 || ""}
                            onChange={(e) => {
                              localStorage.setItem(
                                "customer_address3",
                                e.target.value
                              );
                              handleChange(e);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between gap-x-4">
                      <div className="flex flex-col justify-start items-left w-full">
                        <div className="text-[13px] font-bold leading-5 mt-2">
                          Email
                        </div>
                        <div>
                          <input
                            className="form-input w-full block font-semibold text-[13px] rounded border border-gray-400 p-2 leading-5 "
                            required
                            name="customerEmail"
                            placeholder="Enter Brand Email"
                            value={inputs?.customerEmail}
                            onChange={(e) => {
                              localStorage.setItem(
                                "creator_customeremail",
                                e.target.value
                              );
                              handleChange(e);
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col ">
                        <div className="text-[13px] font-bold leading-5 mt-2">
                          Mobile
                        </div>
                        <div className="flex justify-start items-left -ml-4">
                          <span className="p-[8px] bg-[#eee] border border-[#ccc] border-r-0 rounded-l font-medium text-[13px]">
                            +91
                          </span>
                          <input
                            className="p-[5px] pl-[10px] border border-[#ccc] rounded-r text-[13px] text-left"
                            type="text"
                            name="customerPhone"
                            value={inputs?.customerPhone}
                            onChange={(e) => {
                              localStorage.setItem(
                                "customer_customerphone",
                                e.target.value
                              );
                              handleChange(e);
                            }}
                            minLength={10}
                            maxLength={10}
                            placeholder="Mobile number..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col w-full lg:w-6/12 mx-auto justify-start items-left mt-16 lg:mt-4  border-[1.2px] p-2 lg:p-5 bg-white gap-y-2 lg:gap-y-4 rounded-md">
                    <div className="flex flex-col justify-start items-left gap-y-0 lg:gap-y-4 ">
                      <div className="flex flex-col justify-start items-left">
                        <div className="text-[13px] font-bold leading-5 mt-2">
                          GST #
                        </div>
                        <div>
                          <input
                            className="form-input w-full lg:w-6/12 block font-semibold text-[13px] rounded border border-gray-400 p-2 leading-5 "
                            required
                            name="gst"
                            placeholder="Enter GST Number"
                            value={inputs?.gst}
                            onChange={(e) => {
                              localStorage.setItem(
                                "customer_gst",
                                e.target.value
                              );
                              handleChange(e);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col justify-start items-left">
                      <div className="text-[13px] font-bold leading-5 mt-2">
                        PAN #
                      </div>
                      <div>
                        <input
                          className="form-input w-full lg:w-6/12 block font-semibold text-[13px] rounded border border-gray-400 p-2 leading-5 "
                          required
                          name="pan"
                          placeholder="Enter PAN Number"
                          value={inputs?.pan}
                          onChange={(e) => {
                            localStorage.setItem(
                              "customer_pan",
                              e.target.value
                            );
                            handleChange(e);
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col text-sm">
                      <div className="font-medium leading-5 text-gray-700 mb-1">
                        TIN #
                      </div>
                      <div className="flex flex-col gap-y-3">
                        <input
                          className="w-full lg:w-6/12 dark:bg-gray-700 border border-gray-400 border-[1.4px] dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          name="tin"
                          placeholder="Enter TIN Number"
                          value={inputs?.tin || ""}
                          onChange={(e) => {
                            localStorage.setItem(
                              "customer_tin",
                              e.target.value
                            );
                            handleChange(e);
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col text-sm">
                      <div className="font-medium leading-5 text-gray-700 mb-1">
                        CIN #
                      </div>
                      <div className="flex flex-col gap-y-3">
                        <input
                          className="w-full lg:w-6/12 dark:bg-gray-700 border border-gray-400 border-[1.4px] dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          name="cin"
                          placeholder="Enter CIN Number"
                          value={inputs?.cin || ""}
                          onChange={(e) => {
                            localStorage.setItem(
                              "customer_cin",
                              e.target.value
                            );
                            handleChange(e);
                          }}
                        />
                      </div>
                    </div>
                    <div className="w-full mx-auto flex flex-col mt-4  border-[1.2px] p-2 lg:p-4 bg-white gap-y-2 lg:gap-y-4 rounded-md">
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
                                localStorage.setItem(
                                  "customer_invoiceNumber",
                                  e.target.value
                                );
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
                                localStorage.setItem(
                                  "customer_date",
                                  e.target.value
                                );
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full mx-auto  border-[1.2px] p-2 lg:p-4 bg-white gap-y-4 rounded-md">
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
                                      placeholder="Description"
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
                                      placeholder="Qty"
                                      value={row.qty}
                                      onChange={(e) =>
                                        handleInputChange(
                                          e.target.name,
                                          e.target.value,
                                          index
                                        )
                                      }
                                    />
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
                                          onClick={(e) =>
                                            handleDeleteRow(index, e)
                                          }
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

                  <div className="flex flex-col justify-between w-full mx-auto gap-x-3">
                    <div className="w-full text-sm">
                      <div className="w-full flex justify-end gap-x-10 mt-2">
                        <div className="w-11/12 flex justify-end mx-auto mt-2 px-2 text-md font-bold rounded-md uppercase">
                          Total
                        </div>
                        <div
                          className="w-3/12 mx-auto flex justify-end mt-1 px-2  text-sm font-bold rounded-md"
                          name="total"
                        >
                          ₹ {Math.round(amount)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setOpenSign(true)}
                    className="bg-[#146eb4] text-center w-4/12 lg:w-2/12 border-[1.4px] border-gray-400 text-white py-2 font-semibold rounded-md text-richblack-700 mb-2 cursor-pointer "
                  >
                    {" "}
                    <button>+ Add Signature</button>
                  </div>

                  {sign && (
                    <div className="w-[35%] md:w-[20%] border-2">
                      <img src={signature} alt="sign" />
                      <div className="flex justify-between">
                        <div className="px-2 text-xs">
                          {" "}
                          Signed on: {signedDate}
                        </div>
                        <div>
                          {" "}
                          <button onClick={handleCloseSign1}>
                            <X />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
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
              {loading1 && <Loader />}
            </div>
            {openSign && (
              <SignModal
                setSignature={setSignature}
                handleSignOpen={handleSignOpen}
                handleCloseSign={handleCloseSign}
              ></SignModal>
            )}
            {openBrandModal && (
              <BrandModal
                handleCloseBrandModal={handleCloseBrandModal}
              ></BrandModal>
            )}
            <AlertModal
              isOpen={showConfirm}
              onClose={() => {
                setShowConfirm(false);
                document.querySelector('input[name="customerName"]').focus();
              }}
              title="Required"
              message="Customer Name is required."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorAddInvoice;
