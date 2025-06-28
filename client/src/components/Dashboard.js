import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import Loader from "./Loader";
import { BanknoteArrowUp, ArrowUp, FileDigit } from "lucide-react";
import Header from "./Header";
import SettlePopup from "./SettlePopup";
import MobileMenu from "./MobileMenu";
import dayjs from "dayjs";

const Dashboard = () => {
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

  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [openSettlePopup, setOpenSettlePopup] = useState(false);
  const handleCloseSettlePopup = () => {
    setOpenSettlePopup(false);
    getInvoiceInfo();
  };

  const origionalData = JSON.parse(localStorage.getItem("dashboardInfo"));

  const fetchData = async (from, to) => {
    try {
      setLoading(true);

      const invoiceInfo = JSON.parse(localStorage.getItem("dashboardInfo"));
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
    updateTotalProfitAfterSearch(result);

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
      await archiveInvoice(user);

      const invDoc = doc(db, "Invoice_Info", user.id);
      await deleteDoc(invDoc);

      const totalAmount = amount - user?.amountInfo?.amount;
      setAmount(totalAmount);

      await getInvoiceInfo();
    }
  };

  // archive deleted invoice to another collection
  // first get the invoice data and then add it to the archive collection
  const archiveInvoice = async (user) => {
    const archiveCollectionRef = collection(db, "Archived_Invoices");
    const archivedInvoice = {
      ...user,
      archivedAt: new Date().toISOString(),
    };
    await addDoc(archiveCollectionRef, archivedInvoice);
  };

  const handleSettle = (post) => {
    const settleInfo = {
      amount:
        post.amountInfo.amount +
        post.taxCalculatedInfo.cgst +
        post.taxCalculatedInfo.sgst,
      advance: post.amountInfo.advance,
      balance: post.taxCalculatedInfo.balance,
      docid: post.id,
      invoicenumber: post.invoiceInfo.invoiceNumber,
    };

    localStorage.setItem("settleInfo", JSON.stringify(settleInfo));
    setOpenSettlePopup(true);
  };

  const handleView = (id) => {
    navigate("/viewinvoice", {
      state: {
        id: id,
      },
    });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);

    const result = data.filter(
      (item) =>
        item.customerInfo.customerName
          .toLowerCase()
          .includes(e.target.value.toLowerCase()) ||
        item.customerInfo.customerPhone
          .toLowerCase()
          .includes(e.target.value.toLowerCase()) ||
        item.invoiceInfo.invoiceNumber
          .toString()
          .toLowerCase()
          .includes(e.target.value.toLowerCase())
    );
    setFilteredData(result);

    updateAmountAfterSearch(result);
    updateBalanceAfterSearch(result);
    updatePaidAfterSearch(result);
    updateTotalProfitAfterSearch(result);

    const totalPaidInvoices = result.filter(
      (item) =>
        item.amountInfo.paymentType === "fullyPaid" ||
        item.taxCalculatedInfo.balance === 0
    ).length;
    setPaidInvoices(totalPaidInvoices);

    // const totalSettled = result.filter(
    //   (item) => item.taxCalculatedInfo.balance === 0
    // ).length;
    setSettled(result.length - totalPaidInvoices);
  };

  const updateAmountAfterSearch = (result) => {
    const totalAmount = result.reduce((acc, item) => {
      const amount = Math.round(
        item.amountInfo.amount +
          item.taxCalculatedInfo.cgst +
          item.taxCalculatedInfo.sgst
      );
      return acc + amount;
    }, 0);

    setAmount(totalAmount);
  };

  const updateBalanceAfterSearch = (result) => {
    const totalBalance = result.reduce((acc, item) => {
      const balance = Math.round(item.taxCalculatedInfo.balance);
      return acc + balance;
    }, 0);

    setBalance(totalBalance);
  };

  const updatePaidAfterSearch = (result) => {
    const totalPaid = result.reduce((acc, item) => {
      const paid = Math.round(item.amountInfo.advance);
      return acc + paid;
    }, 0);

    setPaid(totalPaid);
  };

  const updateTotalProfitAfterSearch = (result) => {
    const totalProfit = calculateProfit(result);
    setTotalProft(totalProfit);
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

  const sortDelivery = (a, b) => {
    const dateA = a.invoiceInfo.expectedDate
      ? new Date(a.invoiceInfo.expectedDate)
      : 0;
    const dateB = b.invoiceInfo.expectedDate
      ? new Date(b.invoiceInfo.expectedDate)
      : 0;

    if (dateA < dateB) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (dateA > dateB) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  };

  const sortAmount = (a, b) => {
    const amountA = Math.round(
      a.amountInfo.amount + a.taxCalculatedInfo.cgst + a.taxCalculatedInfo.sgst
    );
    const amountB = Math.round(
      b.amountInfo.amount + b.taxCalculatedInfo.cgst + b.taxCalculatedInfo.sgst
    );
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
    let sortableData = [...filteredData];

    if (sortConfig.key === "invoice") {
      sortableData.sort(sortInvoiceNumber);
      setFilteredData(sortableData);
    } else if (sortConfig.key === "name") {
      sortableData.sort(sortCustomerName);
      setFilteredData(sortableData);
    } else if (sortConfig.key === "phone") {
      sortableData.sort(sortCustomerPhone);
      setFilteredData(sortableData);
    } else if (sortConfig.key === "date") {
      sortableData.sort(sortDate);
      setFilteredData(sortableData);
    } else if (sortConfig.key === "delivery") {
      sortableData.sort(sortDelivery);
      setFilteredData(sortableData);
    } else if (sortConfig.key === "amount") {
      sortableData.sort(sortAmount);
      setFilteredData(sortableData);
    } else if (sortConfig.key === "paid") {
      sortableData.sort(sortPaid);
      setFilteredData(sortableData);
    } else if (sortConfig.key === "balance") {
      sortableData.sort(sortBalance);
      setFilteredData(sortableData);
    } else if (sortConfig.key === "settle") {
      sortableData.sort(sortSettle);
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

  //const invoiceInfo_CollectionRef = collection(db, "Invoice_Info");
  const getInvoiceInfo = async () => {
    setLoading(true);

    const invoiceInfo = JSON.parse(localStorage.getItem("dashboardInfo"));
    const totalAmount = invoiceInfo?.reduce((acc, item) => {
      const amount = Math.round(
        item.amountInfo.amount +
          item.taxCalculatedInfo.cgst +
          item.taxCalculatedInfo.sgst
      );
      return acc + amount;
    }, 0);

    setAmount(totalAmount);

    const totalBalance = invoiceInfo?.reduce((acc, item) => {
      const balance = Math.round(item.taxCalculatedInfo.balance);
      return acc + balance;
    }, 0);

    setBalance(totalBalance);

    const totalPaid = invoiceInfo?.reduce((acc, item) => {
      const paid = Math.round(item.amountInfo.advance);
      return acc + paid;
    }, 0);

    setPaid(totalPaid);

    setTotalProft(calculateProfit(invoiceInfo));

    const paidInvoices = invoiceInfo?.filter(
      (item) =>
        item.amountInfo.paymentType === "fullyPaid" ||
        item.taxCalculatedInfo.balance === 0
    ).length;
    setPaidInvoices(paidInvoices);

    setSettled(invoiceInfo?.length - paidInvoices);

    const invoiceInfo1 = invoiceInfo?.sort(
      (a, b) => b.invoiceInfo.invoiceNumber - a.invoiceInfo.invoiceNumber
    );
    setData(invoiceInfo1);
    setFilteredData(invoiceInfo1);
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
      result = origionalData.filter(
        (x) =>
          x.amountInfo.paymentType === "fullyPaid" ||
          x.taxCalculatedInfo.balance === 0 ||
          x.taxCalculatedInfo.balance === null
      );
    } else if (status === "Unpaid") {
      result = origionalData.filter((x) => x.taxCalculatedInfo.balance > 0);
    }

    const invoiceInfo1 = result?.sort(
      (a, b) => b.invoiceInfo.invoiceNumber - a.invoiceInfo.invoiceNumber
    );
    setFilteredData(invoiceInfo1);
    updateAmountAfterSearch(result);
    updateBalanceAfterSearch(result);
    updatePaidAfterSearch(result);
    updateTotalProfitAfterSearch(result);

    const totalPaidInvoices = result.filter(
      (item) =>
        item.amountInfo.paymentType === "fullyPaid" ||
        item.taxCalculatedInfo.balance === 0
    ).length;
    setPaidInvoices(totalPaidInvoices);

    // const totalSettled = result.filter(
    //   (item) => item.taxCalculatedInfo.balance === 0
    // ).length;
    setSettled(result.length - totalPaidInvoices);
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
    <div>
      <div className="hidden lg:block top-0 mx-auto w-full h-[72px] text-white sticky bg-white shadow-lg">
        <div className="flex justify-between mx-auto font-bold text-md  py-4 px-2 rounded-md fixed w-[81.5%]">
          <div className="text-2xl text-black">Dashboard</div>
        </div>
      </div>

      <div className="hidden max-lg:block mb-16">
        <MobileMenu />
      </div>

      <div className="p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8  p-3 rounded-md">
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
            <h3 className="mt-2 text-2xl font-semibold"> {paidInvoices}</h3>
          </div>

          <div className={`p-5 rounded-lg shadow bg-yellow-500 text-white`}>
            <p className="text-md">Outstanding</p>
            <h3 className="mt-2 text-2xl font-semibold">{settled}</h3>
          </div>

          <div className={`p-5 rounded-lg shadow bg-emerald-500 text-white`}>
            <div className="flex items-center justify-between">
              <p className="text-md">Profit</p>
              <ArrowUp />
            </div>
            <h3 className="mt-2 text-2xl font-semibold">₹ {totalProfit}</h3>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <input
            type="text"
            placeholder="Search..."
            autoFocus
            value={searchTerm}
            onChange={handleSearch}
            className="px-4 py-2 border rounded-lg w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <select
            className="px-4 py-2 border rounded-lg w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
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
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                statusFilter === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-md mt-4 shadow-lg border-2 bg-white gap-y-4 rounded-md">
          <table className="min-w-full text-sm text-left text-gray-700 ">
            <thead className="bg-gray-100 text-xs uppercase text-gray-600 border-b">
              {type === "Rajputi Poshak" ? (
                <tr>
                  {[
                    "S.No.",
                    "Invoice",
                    "Name",
                    "Phone",
                    "Date",
                    "Delivery",
                    "Amount",
                    "Paid",
                    "Balance",
                    "Settle",
                    "View",
                    "Delete",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 border-r cursor-pointer"
                      onClick={() =>
                        !["S.No.", "View", "Delete"].includes(header) &&
                        handleSort(header)
                      }
                    >
                      {header}
                      {!["S.No.", "View", "Delete"].includes(header) && (
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
              ) : (
                <tr>
                  {[
                    "S.No.",
                    "Invoice",
                    "Name",
                    "Phone",
                    "Date",
                    "Amount",
                    "Paid",
                    "Balance",
                    "Settle",
                    "View",
                    "Delete",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 border-r cursor-pointer"
                      onClick={() =>
                        !["S.No.", "View", "Delete"].includes(header) &&
                        handleSort(header)
                      }
                    >
                      {header}
                      {!["S.No.", "View", "Delete"].includes(header) && (
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
              )}
            </thead>

            <tbody>
              {filteredData.map((user, index) => {
                const formatDate = (dateString) => {
                  const date = new Date(dateString);
                  const day = String(date.getDate()).padStart(2, "0");
                  const month = String(date.getMonth() + 1).padStart(2, "0");
                  const year = date.getFullYear();
                  return `${day}-${month}-${year}`;
                };

                return (
                  <tr
                    key={user.id}
                    className={`border-t ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-200`}
                  >
                    <td className="px-4 py-3 border-r w-[4%]">{index + 1}.</td>
                    <td className="px-4 py-3 border-r w-[10%]">
                      {user.invoiceInfo.invoiceNumber}
                    </td>
                    <td className="px-4 py-3 border-r w-[18%]">
                      {user.customerInfo.customerName}
                    </td>
                    <td className="px-4 py-3 border-r w-[10%]">
                      {user.customerInfo.customerPhone}
                    </td>
                    <td className="px-4 py-3 border-r w-[10%]">
                      {formatDate(user.invoiceInfo.date)}
                    </td>
                    {type === "Rajputi Poshak" && (
                      <td className="px-4 py-3 border-r w-[10%]">
                        {user.invoiceInfo.expectedDate
                          ? formatDate(user.invoiceInfo.expectedDate)
                          : ""}
                      </td>
                    )}
                    <td className="px-4 py-3 border-r text-right w-[10%]">
                      {Math.round(
                        user.amountInfo.amount +
                          user.taxCalculatedInfo.cgst +
                          user.taxCalculatedInfo.sgst
                      )}
                    </td>
                    {user.amountInfo.paymentType === "fullyPaid" ? (
                      <td className="px-4 py-3 border-r text-right w-[8%]">
                        {Math.round(
                          user.amountInfo.amount +
                            user.taxCalculatedInfo.cgst +
                            user.taxCalculatedInfo.sgst
                        )}
                      </td>
                    ) : (
                      <td className="px-4 py-3 border-r text-right w-[8%]">
                        {user.amountInfo.advance}
                      </td>
                    )}

                    {user.amountInfo.paymentType === "fullyPaid" ||
                    user.taxCalculatedInfo.balance === 0 ? (
                      <td className="px-4 py-3 text-green-600 border-r text-right w-[10%]">
                        Fully Paid
                      </td>
                    ) : (
                      <td className="px-4 py-3 border-r text-right w-[10%]">
                        {user.taxCalculatedInfo.balance}
                      </td>
                    )}

                    {user.taxCalculatedInfo.balance > 0 ? (
                      <td className="px-4 py-3 border-r w-[10%] text-center">
                        <button
                          onClick={() => handleSettle(user)}
                          className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                        >
                          Settle
                        </button>
                      </td>
                    ) : (
                      <td className="px-4 py-3 border-r w-[10%] text-center">
                        {user.invoiceInfo.settledDate
                          ? formatDate(user.invoiceInfo.settledDate)
                          : ""}
                      </td>
                    )}

                    <td className="px-4 py-3 border-r w-[8%]">
                      <button
                        onClick={() => handleView(user.id)}
                        className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                      >
                        View
                      </button>
                    </td>
                    <td className="px-4 py-3 w-[8%]">
                      <button
                        onClick={() => handleDelete(user)}
                        className="text-red-600 hover:text-red-800 font-semibold text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredData.length === 0 && (
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
        {openSettlePopup && (
          <SettlePopup
            handleCloseSettlePopup={handleCloseSettlePopup}
          ></SettlePopup>
        )}
        {loading && <Loader />}
      </div>
    </div>
  );
};

export default Dashboard;
