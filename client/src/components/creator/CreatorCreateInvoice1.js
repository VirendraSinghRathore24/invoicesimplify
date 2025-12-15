import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sidebar, Trash2, X, Search, Cog } from "lucide-react";
import InventoryModal from "../inventory/InventoryModal";
import { FaMicrophone } from "react-icons/fa";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import AlertModal from "../confirmModal/AlertModal";
import { IoMdSettings } from "react-icons/io";
import MobileMenu from "../MobileMenu";
import {
  CREATORS,
  INVOICE_INFO,
  LOGIN_INFO,
  SERVICE_CENTER,
  USERS,
} from "../Constant";
import Loader from "../Loader";
import SignModal from "./SignModal";
import BrandModal from "./BrandModal";
import CreatorMobileMenu from "./CreatorMobileMenu";
import ChangeInvoiceNumberModal from "./ChangeInvoiceNumberModal";
import AddBrandModal from "./AddBrandModal";
import BrandListModal from "./BrandListModal";
import EditBrandModal from "./EditBrandModal";

const CreatorCreateInvoice1 = () => {
  const [signature, setSignature] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);

  const [isAccountInfo, setIsAccountInfo] = useState(false);
  const [isBusinessInfo, setIsBusinessInfo] = useState(false);

  const [open1, setOpen1] = useState(false);
  const [mode, setMode] = useState("automatic");

  const countryCode = localStorage.getItem("countryCode");
  const currencySymbol = localStorage.getItem("invoiceCurrency") || "₹";

  const location = useLocation();
  let customerInfo = {};
  let invoiceInfo = "";
  let signedInfo = "";
  let amount1 = "";
  let rows1 = [];
  let isEdit = false;

  if (location.state?.finalData) {
    customerInfo = location.state?.finalData.customerInfo;
    invoiceInfo = location.state?.finalData.invoiceInfo;
    signedInfo = location.state?.finalData.signedInfo;
    amount1 = location.state?.finalData.amount;
    rows1 = location.state?.finalData?.rows;
    isEdit = true;
  }
  const [selectedBrand, setSelectedBrand] = useState(customerInfo);
  const [brandSelected, setBrandSelected] = useState(isEdit);
  const refreshPage = () => {
    navigate(0); // React Router v6+
  };
  useEffect(() => {
    //console.log(signature);
  }, [signature]);

  const [isModalAOpen, setIsModalAOpen] = useState(true);
  const [isModalBOpen, setIsModalBOpen] = useState(false);

  const loggedInUser = localStorage.getItem("user");

  const [invoiceName, setInvoiceName] = useState("");
  const [amount, setAmount] = useState(amount1);
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
  const [symbol, setSymbol] = useState(currencySymbol ? currencySymbol : "₹");

  const [loss, setLoss] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [openSign, setOpenSign] = useState(false);
  const handleCloseSign = () => {
    setOpenSign(false);
  };

  // item details
  const [rows, setRows] = useState(rows1);
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

    localStorage.setItem("creator_customerInfo", JSON.stringify(selectedBrand));

    // verify unique invoice number
    const invoiceExists = await checkInvoiceNumberExists(invoiceNumber);

    const invoiceInfo = {
      invoiceNumber: invoiceNumber,
      invoiceNumberMode: localStorage.getItem("invoiceNumberMode"),
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

    navigate("/creator/invoice1");
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

    if (!loginInfo) return;

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

    setBrandSelected(false);
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
    const customerInfo = localStorage.getItem("creator_customerInfo");
    if (customerInfo) {
      setBrandSelected(true);
    }
    setSelectedBrand(JSON.parse(customerInfo));
    // const customerName = localStorage.getItem("creator_customername");
    //const productName = localStorage.getItem("creator_productName");
    // const customerEmail = localStorage.getItem("creator_customeremail");
    // const address = localStorage.getItem("customer_address");
    // const address1 = localStorage.getItem("customer_address1");
    // const address2 = localStorage.getItem("customer_address2");
    // const address3 = localStorage.getItem("customer_address3");
    // const phone = localStorage.getItem("customer_customerphone");
    // const gst = localStorage.getItem("customer_gst");
    // const pan = localStorage.getItem("customer_pan");
    // const tin = localStorage.getItem("customer_tin");
    // const cin = localStorage.getItem("customer_cin");

    // UpdateValues("customerName", customerName);
    //UpdateValues("productName", productName);
    // UpdateValues("customerEmail", customerEmail);
    // UpdateValues("address", address);
    // UpdateValues("address1", address1);
    // UpdateValues("address2", address2);
    // UpdateValues("address3", address3);
    // UpdateValues("customerPhone", phone);
    // UpdateValues("gst", gst);
    // UpdateValues("pan", pan);
    // UpdateValues("tin", tin);
    // UpdateValues("cin", cin);
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

  const handleSave = () => {
    try {
      setLoading1(true);
      localStorage.setItem("invoiceNumberMode", mode);
      if (mode === "automatic") {
        // get invoice number
        getInvoiceNumber();
      } else {
        setInvoiceNumber("");
      }
      setOpen1(false);
    } catch (err) {
      console.log(err);
      setOpen1(false);
    } finally {
      setLoading1(false);
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
    // localStorage.removeItem("creator_customername");
    // localStorage.removeItem("creator_customeremail");
    // localStorage.removeItem("customer_address");
    // localStorage.removeItem("customer_address1");
    // localStorage.removeItem("customer_address2");
    // localStorage.removeItem("customer_address3");
    localStorage.removeItem("creator_customerInfo");
    //localStorage.removeItem("creator_productName");
    // localStorage.removeItem("customer_customerphone");
    // localStorage.removeItem("customer_gst");
    // localStorage.removeItem("customer_pan");
    // localStorage.removeItem("customer_tin");
    // localStorage.removeItem("customer_cin");
    // localStorage.removeItem("sign");
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
    getLocalStoragePersonalInfo();
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

    const invoiceNumberMode = localStorage.getItem("invoiceNumberMode");
    if (invoiceNumberMode === "automatic") {
      getInvoiceNumber();
    } else {
      setInvoiceNumber("");
    }

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

  const brandInfo_CollectionRef = collection(
    doc(db, CREATORS, uid),
    "Brand_Info"
  );

  const [openBrandListModal, setOpenBrandListModal] = useState(false);
  const [openAddBrandModal, setOpenAddBrandModal] = useState(false);
  const handleAddItem = (newItem) => {
    addBrand(newItem);
    //setBrands((prev) => [...prev, newItem]); // Add item to list
    setOpenAddBrandModal(false); // Close Modal B
    setOpenBrandListModal(true);
  };

  const [openEditBrandModal, setOpenEditBrandModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [editId, setEditId] = useState("");
  const handleEditItem = (newItem) => {
    handleUpdate(newItem);
    //addBrand(newItem);
    //setBrands((prev) => [...prev, newItem]); // Add item to list
    setOpenEditBrandModal(false); // Close Modal B
    setOpenBrandListModal(true);
  };

  const handleUpdate = async (inputs) => {
    try {
      setLoading(true);
      const codeDoc = doc(db, CREATORS, uid, "Brand_Info", editId);
      await updateDoc(codeDoc, {
        customerInfo: inputs,
      });
      setLoading(false);
    } catch (er) {
      console.log(er);
      setLoading(false);
    }
  };

  const addBrand = async (newItem) => {
    // check if brand info already exist, yes-ignore
    const data = await getDocs(brandInfo_CollectionRef);
    const filteredData = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    const val = filteredData.find(
      (x) => x.customerInfo.customerName.trim() === newItem.customerName.trim()
    );

    if (val) return;

    // brand info
    await addDoc(brandInfo_CollectionRef, {
      customerInfo: newItem,
      loggedInUser: loggedInUser,
      createdAt: serverTimestamp(),
    });
  };

  const handleSelect = (data) => {
    setSelectedBrand(data?.customerInfo);
    setBrandSelected(true);
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

  const recognitionRef = useRef(null);
  const [items, setItems] = useState([]);
  const [listening, setListening] = useState(false);
  const [spokenText, setSpokenText] = useState("");

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "hi-IN"; // Hindi + English
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript.toLowerCase();
      setSpokenText(text);
      parseSpeech(text);
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
  }, []);

  const startListening = () => {
    setListening(true);
    recognitionRef.current.start();
  };

  const parseSpeech = (text) => {
    /**
     * Examples:
     * 1 किलो चीनी 40 रुपये
     * 2 litre milk 60
     */
    const regex =
      /(\d+)\s*(g|ग्राम|kg|किलो|किलोग्राम|केजी|लीटर|l|litre|pcs|पीस)?\s*([\u0900-\u097Fa-z\s]+?)\s*(\d+)/;

    const match = text.match(regex);

    if (!match) {
      alert("आवाज़ समझ में नहीं आई 😕");
      return;
    }

    // const quantity = `${match[1]} ${match[2] || ""}`;
    const qty = `${match[1]}`;
    const desc = match[3].trim();
    const rate = Number(match[4]);

    //setRows((prev) => [...prev, { desc, qty, rate }]);
    const item = {
      desc: match[3].trim(),
      rate:
        match[2] === "ग्राम"
          ? (Number(match[4]) * 1000) / qty
          : Number(match[4]) / qty,
      qty: match[1],
      type: match[2] || "",
      amount: Number(match[4]),
    };

    setRows((prevRows) => {
      const updatedRows = [...prevRows, item];
      localStorage.setItem("customer_rows", JSON.stringify(updatedRows));
      setAmount((prevAmount) => Number(prevAmount) + item.amount);
      return updatedRows;
    });
  };

  return (
    <div className=" ">
      <div className=" lg:left-64 right-0 top-0 left-0 lg:fixed bg-gray-100 ">
        <div className="hidden max-lg:block mb-16">
          <CreatorMobileMenu />
        </div>

        <header className="top-14 lg:top-0 mx-auto bg-white h-[56px] lg:h-[64px] max-lg:w-full text-white fixed lg:sticky border-b-2">
          <div className="flex justify-between items-center mx-auto font-bold text-md p-2 rounded-md">
            <div className="text-lg text-black mt-1 hidden lg:block">
              Create Invoice
            </div>
            <div className="flex gap-x-4 text-sm mt-1">
              <button
                onClick={handleResetInvoice}
                className="bg-white text-gray-900 border-[1.4px] border-gray-400  py-2 px-6 font-semibold rounded-md  hover:scale-110 transition duration-300 ease-in cursor-pointer "
              >
                Reset
              </button>
              <button
                onClick={handleCreateInvoice}
                className="bg-blue-600 text-white font-medium hover:bg-blue-700 transition border-[1.4px] border-gray-400 py-2 px-6 font-semibold rounded-md text-richblack-700 hover:scale-110 transition duration-300 ease-in cursor-pointer "
              >
                Create Invoice
              </button>
            </div>
          </div>
        </header>

        <main className="p-2 lg:p-4 mt-32">
          <div>
            <div className="flex flex-col w-full gap-y-3 mx-auto lg:overflow-y-auto  lg:h-[calc(100vh-100px)]">
              <div className="w-full  mx-auto  border-[1.2px] p-2 lg:p-4 bg-white gap-y-4 rounded-md">
                <div className="w-full flex justify-end mx-auto ">
                  <button
                    onClick={startListening}
                    disabled={listening}
                    // style={{
                    //   background: listening ? "#ff4d4d" : "#007bff",
                    // }}
                  >
                    <FaMicrophone size={22} color="blue" />
                  </button>
                  <span> {listening ? " सुन रहा है..." : " बोलें"}</span>
                </div>

                <div className="overflow-hidden mt-2">
                  <table className="w-full mx-auto text-center text-sm font-light">
                    <thead className="text-[12px] md:text-md uppercase max-md:hidden">
                      <tr className="flex justify-between border-y-2 py-2 border-black">
                        <th className="w-[10%]">S.No.</th>
                        <th className="w-[30%] text-left">Description</th>
                        <th className="w-[15%]">Rate</th>
                        <th className="w-[10%] max-lg:hidden block">Qty</th>
                        <th className="w-[10%] lg:hidden block">Quantity</th>
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
                                </div>
                              </td>
                              <td className="w-[15%] text-center ml-2">
                                <input
                                  className={`w-full text-right block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600 
                                      
                                    `}
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
                              </td>
                              <td className="w-[15%] ml-2">
                                <div className="flex gap-2">
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
                                  <div className="mt-2">{row.type}</div>
                                </div>
                              </td>
                              <td className="w-[20%] text-center">
                                <div className="w-full  mt-3 font-extrabold text-xs">
                                  {currencySymbol} {row.amount}
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
                                    className={`w-full text-right block text-xs rounded border border-gray-400 py-1 px-4 leading-5 focus:text-gray-600
                                       `}
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
                                </td>
                                <td className="w-[20%]">
                                  <div className="flex gap-2">
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
                                    </div>
                                    <div className="mt-2">{row.type}</div>
                                  </div>
                                </td>
                                <td className="w-[30%] text-center">
                                  <div className="w-full text-xs mt-2 ">
                                    {currencySymbol} {row.amount}
                                  </div>
                                </td>
                                <td className="w-[10%]">
                                  <div>
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
                        {currencySymbol} {Math.round(amount)}
                      </div>
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
          <BrandListModal
            isOpen={openBrandListModal}
            onClose={() => setOpenBrandListModal(false)}
            onSelect={handleSelect}
            onAddNew={() => {
              setOpenBrandListModal(false);
              setOpenAddBrandModal(true);
            }}
            onEdit={() => {
              setOpenBrandListModal(false);
              setOpenEditBrandModal(true);
            }}
            setEditData={setEditData}
            setEditId={setEditId}
          />
          <AddBrandModal
            isOpen={openAddBrandModal}
            onClose={() => {
              setOpenAddBrandModal(false);
              setOpenBrandListModal(true);
            }}
            onSave={handleAddItem}
          />
          <EditBrandModal
            isOpen={openEditBrandModal}
            editData={editData}
            onClose={() => {
              setOpenEditBrandModal(false);
              setOpenBrandListModal(true);
            }}
            onSave={handleEditItem}
          />
          <ChangeInvoiceNumberModal
            isOpen={open1}
            onClose={() => {
              setMode(localStorage.getItem("invoiceNumberMode"));
              setOpen1(false);
            }}
            onSave={handleSave}
            mode={mode}
            setMode={setMode}
          />
        </main>
      </div>
    </div>
  );
};

export default CreatorCreateInvoice1;
