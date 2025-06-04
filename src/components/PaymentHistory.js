import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
  } from "firebase/firestore";
  import React, { useEffect, useState } from "react";
  import { db } from "../config/firebase";
  import { useNavigate } from "react-router-dom";
  import Loader from "./Loader";
  import { SquareArrowOutUpRight } from "lucide-react";
  import Header from "./Header";
  
  const PaymentHistory = () => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
   
  
    const handleLogin = () => {
      const user = localStorage.getItem("user");
  
      if (!user || user === "undefined" || user === "null") {
        //navigate("/login");
      }
    };

    const dd = [
        {
            orderid: 1234567890,
            plantype: "Monthly",
            paymentdate: "12-02-2025",
            startdate: "12-03-2025",
            enddate: "14-04-2025",
            amount: 499
        },
        {
            orderid: 9009876543,
            plantype: "Yearly",
            paymentdate: "12-02-2025",
            startdate: "12-03-2025",
            enddate: "14-04-2025",
            amount: 1499
        },
        {
            orderid: 1230123456,
            plantype: "Invoice",
            paymentdate: "12-02-2025",
            startdate: "12-03-2025",
            enddate: "14-04-2025",
            amount: 99
        },
        {
            orderid: 1234567190,
            plantype: "Monthly",
            paymentdate: "12-02-2025",
            startdate: "12-03-2025",
            enddate: "14-04-2025",
            amount: 499
        }
    ]
  
    useEffect(() => {
      handleLogin();
      
      
    }, []);
  
    return (
      <div>
         <Header/>
      
      <div className="p-6">
       
        <div className="flex flex-col w-full mx-auto font-bold text-2xl bg-gray-200 py-4 px-2 rounded-md ">
          Payment Information
        </div>

  
        <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-md mt-4 shadow-lg border-2 bg-white gap-y-4 rounded-md">
          <div className="p-4">
            <input
              type="text"
              placeholder="Search..."
              //value={searchTerm}
              //onChange={handleSearch}
              className="p-2 border border-gray-300 rounded-md mb-4 w-full"
            />
          </div>
          <table className="min-w-full text-sm text-left text-gray-700 ">
            <thead className="bg-gray-100 text-xs uppercase text-gray-600 border-b">
              <tr>
                {[
                  "S.No.",
                  "Order ID",
                  "Plan Type",
                  "Payment Date",
                  "Start Date",
                  "End Date",
                  "Amount"
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 border-r cursor-pointer"
                    //onClick={() => handleSort(header)}
                  >
                    {header}
                    {/* {sortConfig.key?.toLowerCase() !== "view" &&
                      sortConfig.key?.toLowerCase() !== "delete" &&
                      sortConfig.key === header.toLowerCase() && (
                        <span>
                          {sortConfig.direction === "asc" ? " 🔼" : " 🔽"}
                        </span>
                      )} */}
                  </th>
                ))}
              </tr>
            </thead>
  
            <tbody>
              {dd.map((post, index) => {
                const formatDate = (dateString) => {
                  const date = new Date(dateString);
                  const day = String(date.getDate()).padStart(2, "0");
                  const month = String(date.getMonth() + 1).padStart(2, "0");
                  const year = date.getFullYear();
                  return `${day}-${month}-${year}`;
                };
  
                return (
                  <tr
                    key={post.id}
                    className={`border-t ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-200`}
                  >
                    <td className="px-4 py-3 border-r w-[5%]">{index + 1}.</td>
                    <td className="px-4 py-3 border-r w-[10%]">
                      {post.orderid}
                    </td>
                    <td className="px-4 py-3 border-r w-[10%]">
                      {post.plantype}
                    </td>
                    <td className="px-4 py-3 border-r w-[10%]">
                      {post.paymentdate}
                    </td>
                    <td className="px-4 py-3 border-r w-[10%]">
                      {post.startdate}
                    </td>
                    <td className="px-4 py-3 border-r w-[10%]">
                      {post.enddate}
                    </td>
                    
                    <td className="px-4 py-3 border-r  w-[10%]">
                      {post.amount}
                    </td>
                  </tr>
                );
              })}
              {dd.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center px-4 py-6 text-gray-500">
                    No data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
  
        {/* {loading && <Loader />} */}
      </div>
      </div>
    );
  };
  
  export default PaymentHistory;
  