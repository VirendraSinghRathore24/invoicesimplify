import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import MobileMenu from "../MobileMenu";
import Loader from "../Loader";
import { BASIC_INFO, CREATORS, USERS } from "../Constant";
import CreatorMobileMenu from "./CreatorMobileMenu";

const PaymentHistory = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const uid = localStorage.getItem("uid");

  const navigate = useNavigate();

  const basicInfo_CollectionRef = collection(
    doc(db, CREATORS, uid),
    "Payment_History"
  );

  const handleLogin = () => {
    const user = localStorage.getItem("user");

    if (!user || user === "undefined" || user === "null") {
      navigate("/login");
    }
  };

  const getDate = (utcDate) => {
    var today = new Date(utcDate);
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
    const date = month + " " + today.getDate() + ", " + today.getFullYear();
    return date;
  };

  useEffect(() => {
    handleLogin();
    const getPaymentHistory = async () => {
      try {
        setLoading(true);
        const data = await getDocs(basicInfo_CollectionRef);
        const paymentHistory = data.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        setPosts(paymentHistory);
        console.log(paymentHistory);
        setLoading(false);
      } catch (er) {
        console.log(er);
        setLoading(false);
      }
    };
    getPaymentHistory();
    window.scroll(0, 0);
  }, []);

  return (
    <div className="flex justify-evenly w-full h-full">
      <div className="w-full lg:w-[82%] ml-0 lg:ml-[17%] border-2 my-3 rounded-lg border-gray-300 bg-white shadow-lg top-0 fixed h-[96.7%]">
        <div className="hidden lg:block">
          <div className="top-0 mx-auto w-full h-[68px] text-white border-b-2">
            <div className="font-bold text-md py-4 px-2 rounded-md w-[82%]">
              <div className="text-xl text-black">Payment History</div>
            </div>
          </div>
        </div>

        <div className="hidden max-lg:block mb-16">
          <CreatorMobileMenu />
        </div>
        {/* Desktop view with sticky header */}
        <div className="h-[600px] overflow-auto hidden lg:block border border-gray-300 rounded-md m-2">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="sticky top-0 z-10 bg-gray-100 text-xs uppercase text-gray-600 border-b">
              <tr>
                {[
                  "S.No.",
                  "Plan",
                  "Paid",
                  "Start Date",
                  "End Date",
                  "Order ID",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 border-r min-w-[120px] bg-gray-100"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts &&
                posts.map((post, index) => (
                  <tr
                    key={post.id}
                    className={`border hover:bg-amber-300 cursor-pointer ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } 
                      `}
                  >
                    <td className="px-4 py-3 border-r">{index + 1}.</td>
                    <td className="px-4 py-3 border-r">{post.planName}</td>
                    <td className="px-4 py-3 border-r">{post.amountPaid}</td>
                    <td className="px-4 py-3 border-r whitespace-nowrap">
                      {getDate(post.planStartsDate)}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap border-r">
                      {getDate(post.planEndsDate)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {post.razorpayPaymentId}
                    </td>
                  </tr>
                ))}
              {posts && posts.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center px-4 py-6 text-gray-500"
                  >
                    No data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile view with sticky header */}
        <div className="h-[400px] overflow-auto lg:hidden border border-gray-300 rounded-md m-2">
          <table className="min-w-full text-xs text-left text-gray-700">
            <thead className="sticky top-0 z-10 bg-gray-100 text-xs uppercase text-gray-600 border-b">
              <tr>
                {["Plan", "Paid", "Start Date", "End Date", "Order ID"].map(
                  (header) => (
                    <th
                      key={header}
                      className="px-4 py-3 border-r min-w-[120px] bg-gray-100"
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {posts &&
                posts.map((post, index) => (
                  <tr
                    key={post.id}
                    className={`border ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } `}
                  >
                    <td className="px-4 py-3 border-r">{post.planName}</td>
                    <td className="px-4 py-3 border-r">{post.amountPaid}</td>
                    <td className="px-4 py-3 border-r whitespace-nowrap">
                      {getDate(post.planStartsDate)}
                    </td>
                    <td className="px-4 py-3 border-r whitespace-nowrap">
                      {getDate(post.planEndsDate)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {post.razorpayPaymentId}
                    </td>
                  </tr>
                ))}
              {posts && posts.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center px-4 py-6 text-gray-500"
                  >
                    No data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {loading && <Loader />}
      </div>
    </div>
  );
};

export default PaymentHistory;
