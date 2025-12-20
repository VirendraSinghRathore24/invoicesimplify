import React, { useEffect, useState } from "react";

import { db } from "../../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import Loader from "../Loader";
import MobileMenu from "../MobileMenu";

const ContactUsMessages = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const loginInfo_CollectionRef = collection(db, "Contact_US");
  const getLoginInfo = async () => {
    try {
      setLoading(true);
      const data = await getDocs(loginInfo_CollectionRef);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      setUsers(filteredData);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const calculateRemainingDays = (loginDate) => {
    const today = new Date();
    const future = new Date(loginDate); // replace with login date
    future.setMonth(future.getMonth() + 2);

    const diff = future - today;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    return days;
  };

  useEffect(() => {
    const user = localStorage.getItem("user");

    if (user !== "virendrasinghrathore24@gmail.com") {
      alert("You are not authorized !!!");
      return;
    }

    getLoginInfo();
    window.scroll(0, 0);
  }, []);

  return (
    <div>
      <div className="hidden lg:block top-0 mx-auto w-full h-[68px] text-white sticky bg-white shadow-lg">
        <div className="flex justify-between mx-auto font-bold text-md  py-4 px-2 rounded-md fixed w-[81.5%]">
          <div className="text-xl text-black">All Messages</div>
        </div>
      </div>

      <div className="hidden max-lg:block mb-16">
        <MobileMenu />
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 text-xs">
          <input
            type="text"
            placeholder="Search..."
            //value={searchTerm}
            //onChange={handleSearch}
            className="px-4 py-2 border rounded-lg w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-md mt-4 shadow-lg border-2 bg-white gap-y-4 rounded-md">
          <table className="min-w-full text-xs text-left text-gray-700 ">
            <thead className="bg-gray-100 text-xs text-gray-600 border-b text-center">
              <tr>
                {["S.No.", "Name", "Email", "Message", "Date"].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 border-r cursor-pointer"
                    // onClick={() =>
                    //   !["S.No."].includes(header) && handleSort(header)
                    // }
                  >
                    {
                      header
                      /* {!["S.No."].includes(header) && (
                      <span>
                        {sortConfig.key === header.toLowerCase()
                          ? sortConfig.direction === "asc"
                            ? " 🔼"
                            : " 🔽"
                          : " ⬍"}
                      </span>
                    )} */
                    }
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {users &&
                users?.map((user, index) => {
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
                      className={`border-t text-center ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-200`}
                    >
                      <td className="px-4 py-3 border-r w-[4%]">
                        {index + 1}.
                      </td>
                      <td className="px-4 py-3 border-r w-[10%]">
                        {user.contactData.name}
                      </td>
                      <td className="px-4 py-3 border-r w-[18%]">
                        {user.contactData.email}
                      </td>
                      <td className="px-4 py-3 border-r w-[18%]">
                        {user.contactData.message}
                      </td>
                      <td className="px-4 py-3 border-r w-[18%]">
                        {formatDate(user.messageDate)}
                      </td>
                    </tr>
                  );
                })}
              {users?.length === 0 && (
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
        {loading && <Loader />}
      </div>
    </div>
  );
};

export default ContactUsMessages;
