// Modal.js

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Loader from "../Loader";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";
import { CREATORS } from "../Constant";
import CreatorMobileMenu from "./CreatorMobileMenu";

const Brands = () => {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState("");
  const [loading, setLoading] = useState(false);
  const uid = localStorage.getItem("uid");
  const loggedInUser = localStorage.getItem("user");

  const navigate = useNavigate();

  const getBrands = async () => {
    setLoading(true);
    const existingBrands = await getBrandsData();

    setPosts(existingBrands);
    setFilteredData(existingBrands);
    setLoading(false);
  };

  const brandInfo_CollectionRef = collection(
    doc(db, CREATORS, uid),
    "Brand_Info"
  );
  const getBrandsData = async () => {
    try {
      const data = await getDocs(brandInfo_CollectionRef);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      // get items list
      const brands = filteredData.sort((a, b) =>
        a.customerInfo.customerName.localeCompare(b.customerInfo.customerName)
      );
      return brands;
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogin = () => {
    const user = localStorage.getItem("user");

    if (!user || user === "undefined" || user === "null") {
      navigate("/login");
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    const filtered = posts.filter((post) =>
      post.customerInfo.customerName.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
    if (value === "") {
      setFilteredData(posts);
    }
  };

  const handleDelete = async (user) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      const items = filteredData.filter((item) => item.id !== user.id);
      setFilteredData(items);

      //localStorage.setItem("creator_dashboardInfo", JSON.stringify(items));

      // archive before deleting
      //await archiveInvoice(user);

      const invDoc = doc(db, CREATORS, uid, "Brand_Info", user.id);
      await deleteDoc(invDoc);

      await getBrandsData();
    }
  };

  useEffect(() => {
    handleLogin();
    getBrands();
  }, []);

  return (
    <div className="flex justify-evenly w-full h-full ">
      <div className="w-full lg:w-[82%] ml-0 lg:ml-[17%] h-[97%] border-2 my-3 rounded-lg border-gray-300 bg-white shadow-lg top-0 fixed">
        <div className="hidden lg:block top-0 mx-auto w-[82%] h-[68px] text-white fixed border-b-2 my-3">
          <div className="flex justify-between mx-auto font-bold text-md py-4 px-2 rounded-lg ">
            <div className="text-xl text-black">Brands/Agencies</div>
          </div>
        </div>

        <div className="hidden max-lg:block  mx-auto w-full text-white fixed border-b-2 mt-10">
          <div className="flex justify-between mx-auto font-bold text-md py-4 px-2 rounded-lg ">
            <div className="text-xl text-black">Brands/Agencies</div>
          </div>
        </div>
        <div className="flex justify-center items-center w-full mx-auto">
          <div className="hidden max-lg:block mb-16">
            <CreatorMobileMenu />
          </div>

          <div className="mt-8 lg:mt-0 bg-white p-2 text-black rounded-xl w-full">
            <div className="overflow-x-auto rounded-lg mt-16">
              <div className="p-4">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e)}
                  className="p-2 border border-gray-300 rounded-md w-full text-sm"
                />
              </div>
              {/* Desktop view with sticky header */}
              <div className="h-[550px] overflow-auto hidden lg:block border border-gray-300 rounded-md m-2">
                <table className="min-w-full text-sm text-left text-gray-700">
                  <thead className="sticky top-0 z-10 bg-gray-100 text-xs uppercase text-gray-600 border-b">
                    <tr>
                      {["S.No.", "Name", "Address", "Edit", "Delete"].map(
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
                    {filteredData &&
                      filteredData.map((post, index) => (
                        <tr
                          //onClick={() => handleSelect(post)}
                          key={post.id}
                          className={`border hover:bg-amber-300 cursor-pointer ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } 
                      `}
                        >
                          <td className="px-4 py-3 border-r">{index + 1}.</td>
                          <td className="px-4 py-3 border-r">
                            {post.customerInfo.customerName}
                          </td>
                          <td className="px-4 py-3 border-r">
                            {post.customerInfo.address},{" "}
                            {post.customerInfo.address1},{" "}
                            {post.customerInfo.address2} -{" "}
                            {post.customerInfo.address3}
                          </td>
                          <td className="px-4 py-3 border-r whitespace-nowrap">
                            <button
                              onClick={() =>
                                navigate("/creator/editbrandinfo", {
                                  state: {
                                    post: post,
                                  },
                                })
                              }
                              className="text-blue-600 hover:text-blue-800 font-semibold text-xs"
                            >
                              Edit
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
                              onClick={() => handleDelete(post)}
                              className="text-red-600 hover:text-red-800 font-semibold text-xs"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    {filteredData && filteredData.length === 0 && (
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
                      {["Name", "Address", "Edit"].map((header) => (
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
                    {filteredData &&
                      filteredData.map((post, index) => (
                        <tr
                          //onClick={() => handleSelect(post)}
                          key={post.id}
                          className={`border ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } ${
                            post.itemQty === 0
                              ? "bg-red-500 text-black cursor-not-allowed"
                              : "hover:bg-amber-300 cursor-pointer"
                          }`}
                        >
                          <td className="px-4 py-3 border-r">
                            {post.customerInfo.customerName}
                          </td>
                          <td className="px-4 py-3 border-r">
                            {post.customerInfo.address},{" "}
                            {post.customerInfo.address1},{" "}
                            {post.customerInfo.address2} -{" "}
                            {post.customerInfo.address3}
                          </td>
                          <td className="px-4 py-3 border-r whitespace-nowrap">
                            <button
                              //onClick={() => handleView(user.id)}
                              className="text-blue-600 hover:text-blue-800 font-semibold text-xs"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    {filteredData && filteredData.length === 0 && (
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
            </div>
          </div>
          {loading && <Loader />}
        </div>
      </div>
    </div>
  );
};

export default Brands;
