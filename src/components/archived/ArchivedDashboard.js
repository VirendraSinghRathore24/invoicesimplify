import { addDoc, collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../../config/firebase";
import { useNavigate } from "react-router-dom";
import Loader from "../Loader";

const ArchivedDashboard = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [amount, setAmount] = useState(0);
  const [balance, setBalance] = useState(0);
  const [paid, setPaid] = useState(0);

  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const handleDelete = async(user) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      setData(data.filter((item) => item.id !== user.id));

      const invDoc = doc(db, "Archived_Invoices", user.id);
      await deleteDoc(invDoc);

      const totalAmount = amount - user?.amountInfo?.amount;
      setAmount(totalAmount);

      await getInvoiceInfo();
    }
  };


  const handleView = (id) => {
    navigate("/archivedviewinvoice", {
      state: {
        id: id
      },
    });
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);

    const result = data.filter((item) => item.customerInfo.customerName.toLowerCase().includes(e.target.value.toLowerCase()) ||
      item.customerInfo.customerPhone.toLowerCase().includes(e.target.value.toLowerCase()) ||
      item.invoiceInfo.invoiceNumber.toString().toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredData(result);

    updateAmountAfterSearch(result);
    updateBalanceAfterSearch(result);
    updatePaidAfterSearch(result);
  };

  const updateAmountAfterSearch = (result) => {
    const totalAmount = result.reduce((acc, item) => {
      const amount = Math.round(item.amountInfo.amount + item.taxCalculatedInfo.cgst + item.taxCalculatedInfo.sgst);
      return acc + amount;
    }, 0);

    setAmount(totalAmount);
  }

  const updateBalanceAfterSearch = (result) => {
    const totalBalance = result.reduce((acc, item) => {
      const balance = Math.round(item.taxCalculatedInfo.balance);
      return acc + balance;
    }, 0);

    setBalance(totalBalance);
  }

  const updatePaidAfterSearch = (result) => {
    const totalPaid = result.reduce((acc, item) => {
      const paid = Math.round(item.amountInfo.advance);
      return acc + paid;
    }, 0);

    setPaid(totalPaid);
  }
  

  const handleSort = (key) => {
    if(!key) return;

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

  const sortAmount = (a, b) => {
    const amountA = Math.round(a.amountInfo.amount + a.taxCalculatedInfo.cgst + a.taxCalculatedInfo.sgst);
    const amountB = Math.round(b.amountInfo.amount + b.taxCalculatedInfo.cgst + b.taxCalculatedInfo.sgst);
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

  const sortStatus = (a, b) => {
    const statusA = a.taxCalculatedInfo.balance === 0 ? 'Paid' : 'Due';
    const statusB = b.taxCalculatedInfo.balance === 0 ? 'Paid' : 'Due';
    if (statusA < statusB) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (statusA > statusB) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  };

  const sortedData = React.useMemo(() => {
    let sortableData = [...data];

    if(sortConfig.key === "invoice") {
      sortableData.sort(sortInvoiceNumber);
      setFilteredData(sortableData);
    } 
    else if(sortConfig.key === "name") {
      sortableData.sort(sortCustomerName);
      setFilteredData(sortableData);
    }
    else if(sortConfig.key === "phone") {
      sortableData.sort(sortCustomerPhone);
      setFilteredData(sortableData);
    }
    else if(sortConfig.key === "date") {
      sortableData.sort(sortDate);
      setFilteredData(sortableData);
    }
    else if(sortConfig.key === "amount") {
      sortableData.sort(sortAmount);
      setFilteredData(sortableData);
    }
    else if(sortConfig.key === "paid") {
      sortableData.sort(sortPaid);
      setFilteredData(sortableData);
    }
    else if(sortConfig.key === "balance") {
      sortableData.sort(sortBalance);
      setFilteredData(sortableData);
    }
    else if(sortConfig.key === "status") {
      sortableData.sort(sortStatus);
      setFilteredData(sortableData);
    }
    return filteredData;
    
  }, [data, sortConfig, searchTerm]);



  const invoiceInfo_CollectionRef = collection(db, "Archived_Invoices");
  const getInvoiceInfo = async () => {
    setLoading(true);
    const data = await getDocs(invoiceInfo_CollectionRef);
    const filteredData = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    const loggedInUser = localStorage.getItem("user");
    const invoiceInfo = filteredData.filter(
      (x) => x.loggedInUser === loggedInUser
    );

    const totalAmount = invoiceInfo.reduce((acc, item) => {
      const amount = Math.round(item.amountInfo.amount + item.taxCalculatedInfo.cgst + item.taxCalculatedInfo.sgst);
      return acc + amount;
    }, 0);

    setAmount(totalAmount);

    const totalBalance = invoiceInfo.reduce((acc, item) => {
      const balance = Math.round(item.taxCalculatedInfo.balance);
      return acc + balance;
    }, 0);

    setBalance(totalBalance);

    const totalPaid = invoiceInfo.reduce((acc, item) => {
      const paid = Math.round(item.amountInfo.advance);
      return acc + paid;
    }, 0);

    setPaid(totalPaid);

    const invoiceInfo1 = invoiceInfo.sort((a, b) => b.invoiceInfo.invoiceNumber - a.invoiceInfo.invoiceNumber);
    setData(invoiceInfo1);
    setFilteredData(invoiceInfo1);
    setLoading(false);
  };

  const handleLogin = () => {
    const user = localStorage.getItem("user");

    if(!user || user === "undefined" || user === "null"){
      navigate("/login");
    } 
}

  useEffect(() => {
    handleLogin();
    
    getInvoiceInfo();
    
  }, []);

  return (
    <div>
      <div className="flex flex-col w-full mx-auto font-bold text-2xl bg-gray-200 py-4 px-2 rounded-md">Dashboard - Deleted Invoices</div>
     
      <div className="flex justify-between py-4 gap-x-2">
        <div className="flex flex-col gap-y-4 font-bold text-xl shadow-lg border-2 p-5 bg-amber-50 gap-y-4 rounded-md h-32 w-3/12">
          <div className="">Balance</div>
          <div className="text-2xl">₹ {balance}</div>
        </div>
        
        <div className="flex flex-col gap-y-4 font-bold text-xl shadow-lg border-2 p-5 bg-red-50 gap-y-4 rounded-md h-32 w-3/12">
          <div className="">Amount</div>
          <div className="text-2xl">₹ {amount}</div>
        </div>

        <div className="flex flex-col gap-y-4 font-bold text-xl shadow-lg border-2 p-5 bg-blue-50 gap-y-4 rounded-md h-32 w-3/12">
          <div className="">Paid</div>
          <div className="text-2xl">₹ {paid}</div>
        </div>

        <div className="flex flex-col gap-y-4 font-bold text-xl shadow-lg border-2 p-5 bg-green-50 gap-y-4 rounded-md h-32 w-3/12">
          <div className="">Invoices</div>
          <div className="text-2xl">{filteredData ? filteredData.length : 0}</div>
        </div>
      </div>
    
    <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-md mt-4 shadow-lg border-2 bg-white gap-y-4 rounded-md">
      <div className="p-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
          className="p-2 border border-gray-300 rounded-md mb-4 w-full"
        />
      </div>
      <table className="min-w-full text-sm text-left text-gray-700 ">
        <thead className="bg-gray-100 text-xs uppercase text-gray-600 border-b">
          <tr>
            {[
              "ID",
              "Invoice",
              "Name",
              "Phone",
              "Date",
              "Amount",
              "Paid",
              "Balance",
              "Status",
              "View",
              "Delete",
            ].map((header) => (
              <th
                key={header}
                className="px-4 py-3 border-r cursor-pointer"
                onClick={() => handleSort(header)}
              >
                {header}
                {sortConfig.key?.toLowerCase() !== "view" && sortConfig.key?.toLowerCase() !== "delete" && sortConfig.key === header.toLowerCase() && (
                  <span>{sortConfig.direction === "asc" ? " 🔼" : " 🔽"}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody>
          {filteredData.map((user, index) => {
            const formatDate = (dateString) => {
              const date = new Date(dateString);
              const day = String(date.getDate()).padStart(2, '0');
              const month = String(date.getMonth() + 1).padStart(2, '0');
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
                <td className="px-4 py-3 border-r w-[5%]">{index+1}.</td>
                <td className="px-4 py-3 border-r w-[10%]">{user.invoiceInfo.invoiceNumber}</td>
                <td className="px-4 py-3 border-r w-[20%]">{user.customerInfo.customerName}</td>
                <td className="px-4 py-3 border-r w-[10%]">{user.customerInfo.customerPhone}</td>
                <td className="px-4 py-3 border-r w-[10%]">{formatDate(user.invoiceInfo.date)}</td>
                <td className="px-4 py-3 border-r text-right w-[10%]">{Math.round(user.amountInfo.amount + user.taxCalculatedInfo.cgst + user.taxCalculatedInfo.sgst)}</td>
                <td className="px-4 py-3 border-r text-right w-[10%]">{user.amountInfo.advance}</td>
                <td className="px-4 py-3 border-r text-right w-[10%]">{user.taxCalculatedInfo.balance}</td>
                <td className="px-4 py-3 border-r w-[10%]">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      (user.amountInfo.amount - user.amountInfo.advance) === 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-300 text-red-700"
                    }`}
                  >
                    {user.taxCalculatedInfo.balance === 0 ? 'Paid' : 'Due'}
                  </span>
                </td>
                <td className="px-4 py-3 border-r w-[10%]">
                  <button onClick={() => handleView(user.id)} className="text-blue-600 hover:text-blue-800 font-semibold text-sm">
                    View
                  </button>
                </td>
                <td className="px-4 py-3 w-[10%]">
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
              <td colSpan="9" className="text-center px-4 py-6 text-gray-500">
                No data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
        
      {loading && (<Loader/>)}

    </div>
  );
};

export default ArchivedDashboard;
