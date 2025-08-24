import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { BanknoteArrowUp, ArrowUp, FileDigit, BanknoteX } from "lucide-react";

// import MobileMenu from "./MobileMenu";
import dayjs from "dayjs";
import { ARCHIVED_INVOICES, CREATORS, INVOICE_INFO, USERS } from "../Constant";
import { db } from "../../config/firebase";
import Loader from "../Loader";
import CreatorMobileMenu from "./CreatorMobileMenu";
import ReminderModal from "./ReminderModal";

const CreatorDashboard = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [amount, setAmount] = useState(0);
  const [balance, setBalance] = useState(0);
  const [paid, setPaid] = useState(0);
  const [settled, setSettled] = useState(0);
  const [paidInvoices, setPaidInvoices] = useState(0);
  const type = localStorage.getItem("type");

  const [totalProfit, setTotalProft] = useState(0);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [quickOption, setQuickOption] = useState("any");
  const [statusFilter, setStatusFilter] = useState("All");

  const uid = localStorage.getItem("uid");

  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [openReminderModal, setOpenReminderModal] = useState(false);
  const handleCloseReminderModal = () => {
    setOpenReminderModal(false);
  };

  const origionalData = JSON.parse(
    localStorage.getItem("creator_dashboardInfo")
  );

  const fetchData = async (from, to) => {
    try {
      setLoading(true);

      const invoiceInfo = JSON.parse(
        localStorage.getItem("creator_dashboardInfo")
      );
      const result = invoiceInfo.filter(
        (item) =>
          new Date(item.invoiceInfo.date) >= from &&
          new Date(item.invoiceInfo.date) <= to
      );
      setFilteredData(result);
      updatedData(result);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRangeFilter = () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }
    const from = dayjs(startDate).startOf("day").toDate();
    const to = dayjs(endDate).endOf("day").toDate();
    fetchData(from, to);
    setQuickOption("range");
  };

  const handleQuickFilterChange = (value) => {
    setQuickOption(value);

    const now = dayjs();
    let from, to;

    switch (value) {
      case "today":
        from = now.startOf("day").toDate();
        to = now.endOf("day").toDate();
        fetchData(from, to);
        break;
      case "month":
        from = now.startOf("month").toDate();
        to = now.endOf("month").toDate();
        fetchData(from, to);
        break;
      case "sixmonths":
        from = now.subtract(6, "month").startOf("month").toDate();
        to = now.endOf("day").toDate();
        fetchData(from, to);
        break;
      case "range":
        setStartDate("");
        setEndDate("");
        break;
      case "any":
      default:
        getInvoiceInfo();
        break;
    }
  };

  const updatedData = (result) => {
    updateAmountAfterSearch(result);
    updateBalanceAfterSearch(result);
    updatePaidAfterSearch(result);

    const totalPaidInvoices = result.filter(
      (item) =>
        item.amountInfo.paymentType === "fullyPaid" ||
        item.taxCalculatedInfo.balance === 0
    ).length;
    setPaidInvoices(totalPaidInvoices);
    setSettled(result.length - totalPaidInvoices);
  };

  const handleDelete = async (user) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      const items = data.filter((item) => item.id !== user.id);
      setData(items);

      localStorage.setItem("dashboardInfo", JSON.stringify(items));

      // archive before deleting
      //await archiveInvoice(user);

      const invDoc = doc(db, CREATORS, uid, INVOICE_INFO, user.id);
      await deleteDoc(invDoc);

      const totalAmount = amount - user?.amountInfo?.amount;
      setAmount(totalAmount);

      await getInvoiceInfo();
    }
  };

  function daysFromToday(dateString) {
    const givenDate = new Date(dateString); // e.g., "2025-08-01"
    const today = new Date();

    // Remove time part for accurate day count
    givenDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    // Difference in milliseconds
    const diffInMs = today - givenDate;

    // Convert milliseconds to days
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    return diffInDays;
  }

  // archive deleted invoice to another collection
  // first get the invoice data and then add it to the archive collection
  const archiveInvoice = async (user) => {
    const archiveCollectionRef = collection(
      doc(db, USERS, uid),
      ARCHIVED_INVOICES
    );
    const archivedInvoice = {
      ...user,
      archivedAt: new Date().toISOString(),
    };
    await addDoc(archiveCollectionRef, archivedInvoice);
  };

  const handleSettle = (post) => {
    let settleInfo = {};
    if (post.taxCalculatedInfo === "alltax") {
      settleInfo = {
        amount:
          post.amountInfo.amount +
          post.taxCalculatedInfo.cgst +
          post.taxCalculatedInfo.sgst +
          post.taxCalculatedInfo.igst +
          post.taxCalculatedInfo.ugst,
        advance: post.amountInfo.advance,
        balance: post.taxCalculatedInfo.balance,
        docid: post.id,
        invoicenumber: post.invoiceInfo.invoiceNumber,
      };
    } else {
      settleInfo = {
        amount: post.amountInfo.amount + post.taxCalculatedInfo.tax,
        advance: post.amountInfo.advance,
        balance: post.taxCalculatedInfo.balance,
        docid: post.id,
        invoicenumber: post.invoiceInfo.invoiceNumber,
      };
    }

    localStorage.setItem("settleInfo", JSON.stringify(settleInfo));
    //setOpenSettlePopup(true);
  };

  const handleView = (id) => {
    navigate("/creator/viewinvoice", {
      state: {
        id: id,
      },
    });
  };

  const handleUpdateStatus = async (id, status) => {
    if (
      window.confirm(
        "Are you sure you want to update the payment status to " +
          (status === "Received" ? "Pending" : "Received") +
          "?"
      )
    ) {
      const codeDoc = doc(db, CREATORS, uid, INVOICE_INFO, id);
      await updateDoc(codeDoc, {
        paymentStatus: status === "Received" ? "Pending" : "Received",
      });

      await getInvoiceInfo();
    }
  };

  const handleEdit = (id) => {
    navigate("/editinvoice", {
      state: {
        id: id,
      },
    });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);

    const result = data?.filter(
      (item) =>
        item.customerInfo.customerName
          .toLowerCase()
          .includes(e.target.value.toLowerCase()) ||
        (item.customerInfo.customerPhone &&
          item.customerInfo.customerPhone
            .toLowerCase()
            .includes(e.target.value.toLowerCase())) ||
        item.invoiceInfo.invoiceNumber
          .toString()
          .toLowerCase()
          .includes(e.target.value.toLowerCase()) ||
        (item.customerInfo.productName &&
          item.customerInfo.productName
            .toLowerCase()
            .includes(e.target.value.toLowerCase()))
    );
    setFilteredData(result);

    updateAmountAfterSearch(result);
    updateBalanceAfterSearch(result);
    updatePaidAfterSearch(result);
  };

  const updateAmountAfterSearch = (result) => {
    const totalAmount = result?.reduce((acc, item) => {
      const amount = Math.round(parseInt(item.amount));
      return acc + amount;
    }, 0);

    setAmount(result ? totalAmount : 0);
  };

  const updateBalanceAfterSearch = (result) => {
    const totalBalance = result?.reduce((acc, item) => {
      const balance =
        item.paymentStatus === "Pending" ? parseInt(item.amount) : 0;
      return acc + balance;
    }, 0);

    setBalance(result ? totalBalance : 0);
  };

  const updatePaidAfterSearch = (result) => {
    const totalPaid = result.reduce((acc, item) => {
      const paid =
        item.paymentStatus === "Received" ? parseInt(item.amount) : 0;
      return acc + paid;
    }, 0);

    setPaid(totalPaid);
  };

  const handleSort = (key) => {
    if (!key) return;

    key = key.toLowerCase();
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortInvoiceNumber = (a, b) => {
    if (a.invoiceInfo.invoiceNumber < b.invoiceInfo.invoiceNumber) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a.invoiceInfo.invoiceNumber > b.invoiceInfo.invoiceNumber) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  };

  const sortCustomerName = (a, b) => {
    if (a.customerInfo.customerName < b.customerInfo.customerName) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a.customerInfo.customerName > b.customerInfo.customerName) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  };

  const sortProductName = (a, b) => {
    if (a.customerInfo.productName < b.customerInfo.productName) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a.customerInfo.productName > b.customerInfo.productName) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  };

  const sortCustomerPhone = (a, b) => {
    if (a.customerInfo.customerPhone < b.customerInfo.customerPhone) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a.customerInfo.customerPhone > b.customerInfo.customerPhone) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  };

  const sortDate = (a, b) => {
    const dateA = new Date(a.invoiceInfo.date);
    const dateB = new Date(b.invoiceInfo.date);
    if (dateA < dateB) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (dateA > dateB) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  };

  const sortStatus = (a, b) => {
    const dateA = a.paymentStatus;
    const dateB = b.paymentStatus;

    if (dateA < dateB) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (dateA > dateB) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  };

  const sortAmount = (a, b) => {
    const amountA = parseInt(a.amount);
    const amountB = parseInt(b.amount);
    if (amountA < amountB) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (amountA > amountB) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  };

  const sortPaid = (a, b) => {
    const paidA = Math.round(a.amountInfo.advance);
    const paidB = Math.round(b.amountInfo.advance);
    if (paidA < paidB) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (paidA > paidB) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  };

  const sortBalance = (a, b) => {
    const balanceA = Math.round(a.taxCalculatedInfo.balance);
    const balanceB = Math.round(b.taxCalculatedInfo.balance);
    if (balanceA < balanceB) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (balanceA > balanceB) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  };

  const sortSettle = (a, b) => {
    const statusA = a.taxCalculatedInfo.balance > 0 ? "" : "Settle";
    const statusB = b.taxCalculatedInfo.balance > 0 ? "" : "Settle";
    if (statusA < statusB) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (statusA > statusB) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  };

  const sortedData = React.useMemo(() => {
    let sortableData =
      filteredData && filteredData.length > 0
        ? [...filteredData]
        : filteredData;

    if (sortConfig.key === "invoice") {
      sortableData?.sort(sortInvoiceNumber);
      setFilteredData(sortableData);
    } else if (sortConfig.key === "brand name") {
      sortableData?.sort(sortCustomerName);
      setFilteredData(sortableData);
    } else if (sortConfig.key === "product") {
      sortableData?.sort(sortProductName);
      setFilteredData(sortableData);
    } else if (sortConfig.key === "address") {
      sortableData?.sort(sortCustomerPhone);
      setFilteredData(sortableData);
    } else if (sortConfig.key === "date") {
      sortableData?.sort(sortDate);
      setFilteredData(sortableData);
    } else if (sortConfig.key === "status") {
      sortableData?.sort(sortStatus);
      setFilteredData(sortableData);
    } else if (sortConfig.key === "amount") {
      sortableData?.sort(sortAmount);
      setFilteredData(sortableData);
    } else if (sortConfig.key === "paid") {
      sortableData?.sort(sortPaid);
      setFilteredData(sortableData);
    } else if (sortConfig.key === "balance") {
      sortableData?.sort(sortBalance);
      setFilteredData(sortableData);
    } else if (sortConfig.key === "settle") {
      sortableData?.sort(sortSettle);
      setFilteredData(sortableData);
    }
    return filteredData;
  }, [data, sortConfig]);

  const calculateProfit = (invoiceInfo) => {
    let totalProfit = 0;
    invoiceInfo?.forEach((item) => {
      item.rows.forEach((row) => {
        if (row.rate && row.buyPrice) {
          totalProfit += (row.rate - row.buyPrice) * row.qty;
        }
      });
    });
    return totalProfit;
  };

  const invoiceInfo_CollectionRef = collection(
    doc(db, CREATORS, uid),
    INVOICE_INFO
  );

  const getAllInvoiceInfo = async () => {
    const data = await getDocs(invoiceInfo_CollectionRef);
    const invoiceInfo = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    const data1 = invoiceInfo.sort((a, b) =>
      b.invoiceInfo.date === a.invoiceInfo.date
        ? b.invoiceInfo.invoiceNumber - a.invoiceInfo.invoiceNumber
        : new Date(b.invoiceInfo.date) - new Date(a.invoiceInfo.date)
    );
    localStorage.setItem("creator_dashboardInfo", JSON.stringify(data1));
    return invoiceInfo;
  };
  //const invoiceInfo_CollectionRef = collection(db, "Invoice_Info");
  const getInvoiceInfo = async () => {
    setLoading(true);
    const invoiceInfo = await getAllInvoiceInfo();

    setFilteredData(invoiceInfo);
    setData(invoiceInfo);

    const totalAmount = invoiceInfo.reduce((acc, item) => {
      const amount = Math.round(parseInt(item.amount));
      return acc + amount;
    }, 0);

    setAmount(totalAmount);

    const totalOutstanding = invoiceInfo.reduce((acc, item) => {
      const balance =
        item.paymentStatus === "Pending" ? parseInt(item.amount) : 0;
      return acc + balance;
    }, 0);

    setBalance(totalOutstanding);

    const totalPaid = invoiceInfo.reduce((acc, item) => {
      const paid =
        item.paymentStatus === "Received" ? parseInt(item.amount) : 0;
      return acc + paid;
    }, 0);

    setPaid(totalPaid);

    setLoading(false);
  };

  const handleCustomRangeFilter = (e) => {
    if (e.target.name === "startdate") {
      setStartDate(e.target.value);

      if (endDate) {
        const from = dayjs(e.target.value).startOf("day").toDate();
        const to = dayjs(endDate).endOf("day").toDate();
        fetchData(from, to);
        setQuickOption("range");
      }
    }
    if (e.target.name === "enddate") {
      setEndDate(e.target.value);

      if (startDate) {
        const from = dayjs(startDate).startOf("day").toDate();
        const to = dayjs(e.target.value).endOf("day").toDate();
        fetchData(from, to);
        setQuickOption("range");
      }
    }
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);

    let result = origionalData;
    if (status === "Paid") {
      result = origionalData?.filter((x) => x.paymentStatus === "Received");
    } else if (status === "Unpaid") {
      result = origionalData?.filter((x) => x.paymentStatus === "Pending");
    }

    const invoiceInfo1 = result?.sort(
      (a, b) => b.invoiceInfo.invoiceNumber - a.invoiceInfo.invoiceNumber
    );
    setFilteredData(invoiceInfo1);
    updateAmountAfterSearch(result);
    updateBalanceAfterSearch(result);
    updatePaidAfterSearch(result);
  };
  const handleLogin = () => {
    const user = localStorage.getItem("user");

    if (!user || user === "undefined" || user === "null") {
      navigate("/login");
    }
  };

  useEffect(() => {
    handleLogin();
    getInvoiceInfo();
    window.scroll(0, 0);
  }, []);

  return (
    <div className="flex justify-evenly w-full h-full ">
      <div className="w-full lg:w-[82%] ml-0 lg:ml-[17%] border-2 my-3 rounded-lg border-gray-300 bg-white shadow-lg top-0 fixed">
        <div className="hidden lg:block top-0 mx-auto w-[82%] h-[68px] text-white fixed border-b-2 my-3">
          <div className="flex justify-between mx-auto font-bold text-md py-4 px-2 rounded-lg ">
            <div className="text-xl text-black">Dashboard</div>
          </div>
        </div>

        <div className="hidden max-lg:block mb-16">
          <CreatorMobileMenu />
        </div>

        <div className="p-2 lg:py-6 mt-10 ">
          <div className="hidden lg:block">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-2 py-3 rounded-md">
              <div className={`p-5 rounded-lg shadow bg-indigo-500 text-white`}>
                <div className="flex items-center justify-between">
                  <p className="text-md">Total Invoices</p>
                  <FileDigit />
                </div>
                <h3 className="mt-2 text-2xl font-semibold">
                  {filteredData ? filteredData.length : 0}
                </h3>
              </div>

              <div className={`p-5 rounded-lg shadow bg-purple-500 text-white`}>
                <div className="flex items-center justify-between">
                  <p className="text-md">Paid</p>
                  <BanknoteArrowUp />
                </div>
                <h3 className="mt-2 text-2xl font-semibold">₹ {paid}</h3>
              </div>

              <div className={`p-5 rounded-lg shadow bg-red-400 text-white`}>
                <div className="flex items-center justify-between">
                  <p className="text-md">Due Amount</p>
                  <BanknoteX />
                </div>
                <h3 className="mt-2 text-2xl font-semibold">₹ {balance}</h3>
              </div>

              <div
                className={`p-5 rounded-lg shadow bg-emerald-500 text-white`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-md">Total Earnings</p>
                  <ArrowUp />
                </div>
                <h3 className="mt-2 text-2xl font-semibold">₹ {amount}</h3>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 text-xs">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearch}
              className="px-4 py-2 border rounded-lg w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <select
              className="px-4 py-2 border rounded-lg text-xs w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={quickOption}
              onChange={(e) => handleQuickFilterChange(e.target.value)}
            >
              <option value="any">Any Date</option>
              <option value="today">Today</option>
              <option value="month">This Month</option>
              <option value="sixmonths">Last 6 Months</option>
              <option value="range">Custom Range</option>
            </select>

            {/* Show range inputs only if 'range' is selected */}
            {quickOption === "range" && (
              <>
                <input
                  type="date"
                  name="startdate"
                  className="border px-3 py-1 rounded w-full"
                  value={startDate}
                  onChange={(e) => handleCustomRangeFilter(e)}
                />

                <input
                  type="date"
                  name="enddate"
                  className="border px-3 py-1 rounded w-full"
                  value={endDate}
                  onChange={(e) => handleCustomRangeFilter(e)}
                />
              </>
            )}
          </div>
          <div className="flex gap-2">
            {["All", "Paid", "Unpaid"].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusFilter(status)}
                className={`px-4 py-2 rounded-md text-xs font-medium ${
                  statusFilter === status
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="overflow-hidden border border-gray-300 shadow-md mt-4 rounded-md">
            <div className="max-h-[65vh] lg:max-h-[51vh] overflow-y-auto overflow-x-auto">
              <table className="min-w-full text-xs text-left text-gray-700">
                <thead className="bg-gray-100 text-gray-600 border-b sticky top-0 z-10">
                  <tr>
                    {[
                      "S.No.",
                      "Invoice",
                      "Brand Name",
                      "Product",
                      "Date",
                      "Amount",
                      "Status",
                      "Update",
                      "Payment Reminder",
                      "View",
                      "Delete",
                    ].map((header, i) => (
                      <th
                        key={i}
                        className="px-4 py-3 border-r bg-gray-100 whitespace-nowrap"
                        onClick={() =>
                          ![
                            "S.No.",
                            "View",
                            "Delete",
                            "Update",
                            "Payment Reminder",
                          ].includes(header) && handleSort(header)
                        }
                      >
                        {header}
                        {![
                          "S.No.",
                          "View",
                          "Delete",
                          "Update",
                          "Payment Reminder",
                        ].includes(header) && (
                          <span>
                            {sortConfig.key === header.toLowerCase()
                              ? sortConfig.direction === "asc"
                                ? " 🔼"
                                : " 🔽"
                              : " ⬍"}
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredData?.length > 0 ? (
                    filteredData.map((user, index) => {
                      const formatDate = (dateString) => {
                        const date = new Date(dateString);
                        return `${String(date.getDate()).padStart(
                          2,
                          "0"
                        )}-${String(date.getMonth() + 1).padStart(
                          2,
                          "0"
                        )}-${date.getFullYear()}`;
                      };

                      return (
                        <tr
                          key={user.id}
                          className={`border-t ${
                            index % 2 === 0 &&
                            !(
                              daysFromToday(user.invoiceInfo.date) > 30 &&
                              user.paymentStatus === "Pending"
                            )
                              ? "bg-white"
                              : daysFromToday(user.invoiceInfo.date) > 30 &&
                                user.paymentStatus === "Pending"
                              ? "bg-orange-100"
                              : "bg-gray-50"
                          } hover:bg-gray-200`}
                        >
                          <td className="px-4 py-3 border-r w-[10%]">
                            {index + 1}.
                          </td>

                          <td className="px-4 py-3 border-r whitespace-nowrap">
                            {user.invoiceInfo.invoiceNumber}
                          </td>
                          <td className="px-4 py-3 border-r whitespace-nowrap">
                            {user.customerInfo.customerName}
                          </td>
                          <td className="px-4 py-3 border-r whitespace-nowrap">
                            {user.customerInfo.productName}
                          </td>
                          {/* {user.customerInfo.address ? (
                            <td className="px-4 py-3 border-r whitespace-nowrap text-wrap">
                              {user.customerInfo.address},{" "}
                              {user.customerInfo.address1},{" "}
                              {user.customerInfo.address2} -{" "}
                              {user.customerInfo.address3}
                            </td>
                          ) : (
                            <td className="px-4 py-3 border-r whitespace-nowrap"></td>
                          )} */}

                          <td className="px-4 py-3 border-r whitespace-nowrap">
                            {formatDate(user.invoiceInfo.date)}
                          </td>

                          <td className="px-4 py-3 border-r text-right whitespace-nowrap">
                            {user.amount}
                          </td>
                          {user.paymentStatus === "Pending" ? (
                            <td className="px-4 py-3 border-r text-right whitespace-nowrap text-red-700 font-bold">
                              {user.paymentStatus} - (
                              {daysFromToday(user.invoiceInfo.date)} days)
                            </td>
                          ) : (
                            <td className="px-4 py-3 border-r text-right whitespace-nowrap text-green-700 font-bold">
                              {user.paymentStatus}
                            </td>
                          )}

                          <td className="px-4 py-3 border-r whitespace-nowrap">
                            <button
                              onClick={() =>
                                handleUpdateStatus(user.id, user.paymentStatus)
                              }
                              className="text-white border-2 rounded-md px-2 py-1 bg-blue-600 font-semibold text-xs"
                            >
                              Update Status
                            </button>
                          </td>
                          {user.paymentStatus === "Pending" ? (
                            <td className="px-4 py-3 border-r whitespace-nowrap">
                              <button
                                onClick={() => {
                                  localStorage.setItem(
                                    "reminder_data",
                                    JSON.stringify(user)
                                  );
                                  setOpenReminderModal(true);
                                }}
                                className="text-white border-2 rounded-md px-2 py-1 bg-orange-600 font-semibold text-xs"
                              >
                                Send Reminder
                              </button>
                            </td>
                          ) : (
                            <td className="px-4 py-3 border-r whitespace-nowrap">
                              <div className="px-2 py-1 text-green-600 font-semibold text-xs">
                                Completed
                              </div>
                            </td>
                          )}
                          <td className="px-4 py-3 border-r whitespace-nowrap">
                            <button
                              onClick={() => handleView(user.id)}
                              className="text-blue-600 hover:text-blue-800 font-semibold text-xs"
                            >
                              View
                            </button>
                          </td>
                          {/* <td className="px-4 py-3 border-r whitespace-nowrap">
                            <button
                              onClick={() => handleEdit(user.id)}
                              className="text-blue-600 hover:text-blue-800 font-semibold text-xs"
                            >
                              Edit
                            </button>
                          </td> */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <button
                              onClick={() => handleDelete(user)}
                              className="text-red-600 hover:text-red-800 font-semibold text-xs"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="12"
                        className="text-center px-4 py-6 text-gray-500"
                      >
                        No data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {loading && <Loader />}
        </div>
      </div>
      {openReminderModal && (
        <ReminderModal handleCloseReminderModal={handleCloseReminderModal} />
      )}
    </div>
  );
};

export default CreatorDashboard;
