import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import Loader from "./Loader";

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // const [data, setData] = useState([
  //   {
  //     id: 1,
  //     name: "Virendra Singh",
  //     invoice: 22,
  //     address: "40605, Nikoo Homes 1, Bhartiya City, Bangalore - 560087",
  //     email: "alice@example.com",
  //     phone: "8095528525",
  //     role: "Admin",
  //     department: "IT",
  //     status: "Fully Paid",
  //     joined: "2023-01-01",
  //     amount: 5400,
  //     paid: 5400,
  //     balance: 0,
  //   },
  //   {
  //     id: 2,
  //     name: "Sanju Shekhawat",
  //     invoice: 23,
  //     address: "LIC, Nikoo Homes 1, Bhartiya City, Bangalore - 560087",
  //     email: "bob@example.com",
  //     phone: "9087765434",
  //     role: "Editor",
  //     department: "HR",
  //     status: "Partially Paid",
  //     joined: "2022-10-15",
  //     amount: 5000,
  //     paid: 2400,
  //     balance: 2000,
  //   },
  //   {
  //     id: 3,
  //     invoice: 24,
  //     name: "Rudransh Rathore",
  //     address: "40605, Nikoo Homes 1, Bhartiya City, Bangalore - 560087",
  //     email: "alice@example.com",
  //     phone: "7789065478",
  //     role: "Admin",
  //     department: "IT",
  //     status: "Not Paid",
  //     joined: "2023-01-01",
  //     amount: 5400,
  //     paid: 0,
  //     balance: 5400,
  //   },
  //   {
  //     id: 4,
  //     invoice: 42,
  //     name: "Soniya Sharma",
  //     address: "40605, Nikoo Homes 1, Bhartiya City, Bangalore - 560087",
  //     email: "bob@example.com",
  //     phone: "9876543210",
  //     role: "Editor",
  //     department: "HR",
  //     status: "Partially Paid",
  //     joined: "2022-10-15",
  //     amount: 6400,
  //     paid: 2400,
  //     balance: 2000,
  //   },
  //   {
  //     id: 5,
  //     name: "Sonam Singh",
  //     invoice: 28,
  //     address: "40605, Nikoo Homes 1, Bhartiya City, Bangalore - 560087",
  //     email: "alice@example.com",
  //     phone: "7898789909",
  //     role: "Admin",
  //     department: "IT",
  //     status: "Partially Paid",
  //     joined: "2023-01-01",
  //     amount: 5000,
  //     paid: 2400,
  //     balance: 2000,
  //   },
  //   {
  //     id: 6,
  //     name: "Amit Rathore",
  //     invoice: 20,
  //     address: "40605, Nikoo Homes 1, Bhartiya City, Bangalore - 560087",
  //     email: "bob@example.com",
  //     phone: "9876789087",
  //     role: "Editor",
  //     department: "HR",
  //     status: "Fully Paid",
  //     joined: "2022-10-15",
  //     amount: 7500,
  //     paid: 7500,
  //     balance: 0,
  //   },

  //   {
  //     id: 7,
  //     name: "Prachi Gupta",
  //     invoice: 12,
  //     address: "40605, Nikoo Homes 1, Bhartiya City, Bangalore - 560087",
  //     email: "bob@example.com",
  //     phone: "8890990087",
  //     role: "Editor",
  //     department: "HR",
  //     status: "Fully Paid",
  //     joined: "2022-10-15",
  //     amount: 7500,
  //     paid: 7500,
  //     balance: 0,
  //   },

  //   // Add more entries as needed
  // ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const handleDelete = async(id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      setData(data.filter((item) => item.id !== id));

      const invDoc = doc(db, "Invoice_Info", id);
      await deleteDoc(invDoc);
    }
  };

  const handleView = (id) => {
    navigate("/viewinvoice", {
      state: {
        id: id
      },
    });
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    let sortableData = [...data];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData.filter((item) =>
      Object.values(item).some((value) =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, sortConfig, searchTerm]);

  const invoiceInfo_CollectionRef = collection(db, "Invoice_Info");
  const getInvoiceInfo = async () => {
    const data = await getDocs(invoiceInfo_CollectionRef);
    const filteredData = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    const loggedInUser = localStorage.getItem("user");
    const invoiceInfo = filteredData.filter(
      (x) => x.loggedInUser === loggedInUser
    );

    setData(invoiceInfo);
  };

  useEffect(() => {
    setLoading(true);
    getInvoiceInfo();
    setLoading(false);
  }, []);

  return (
    <div>
      <div className="flex flex-col w-full mx-auto font-bold text-2xl bg-gray-200 py-4 px-2 rounded-md">Dashboard</div>
    
    <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-md mt-4">
      <div className="p-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
          className="p-2 border border-gray-300 rounded-md mb-4 w-full"
        />
      </div>
      <table className="min-w-full text-sm text-left text-gray-700">
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
                onClick={() => handleSort(header.toLowerCase())}
              >
                {header}
                {sortConfig.key === header.toLowerCase() && (
                  <span>{sortConfig.direction === "asc" ? " 🔼" : " 🔽"}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((user, index) => (
            <tr
              key={user.id}
              className={`border-t ${
                index % 2 === 0 ? "bg-white" : "bg-gray-50"
              }`}
            >
              <td className="px-4 py-3 border-r">{index+1}</td>
              <td className="px-4 py-3 border-r">{user.invoiceInfo.invoiceNumber}</td>
              <td className="px-4 py-3 border-r">{user.customerInfo.customerName}</td>
              <td className="px-4 py-3 border-r">{user.customerInfo.customerPhone}</td>
              <td className="px-4 py-3 border-r">{user.invoiceInfo.date}</td>
              <td className="px-4 py-3 border-r text-right">{Math.round(user.amountInfo.amount + user.taxCalculatedInfo.cgst + user.taxCalculatedInfo.sgst)}</td>
              <td className="px-4 py-3 border-r text-right">{user.amountInfo.advance}</td>
              <td className="px-4 py-3 border-r text-right">{user.taxCalculatedInfo.balance}</td>
              <td className="px-4 py-3 border-r">
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
              <td className="px-4 py-3 border-r ">
                <button onClick={() => handleView(user.id)} className="text-blue-600 hover:text-blue-800 font-semibold text-sm">
                  View
                </button>
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => handleDelete(user.id)}
                  className="text-red-600 hover:text-red-800 font-semibold text-sm"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {sortedData.length === 0 && (
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

export default Dashboard;
