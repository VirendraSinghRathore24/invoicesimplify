// Modal.js

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Loader from "../Loader";
import { collection, doc, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";
import { CREATORS } from "../Constant";

const BrandModal = ({ handleCloseBrandModal }) => {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState("");
  const [loading, setLoading] = useState(false);
  const uid = localStorage.getItem("uid");
  const loggedInUser = localStorage.getItem("user");

  const navigate = useNavigate();

  const handleSelect = (post) => {
    localStorage.setItem(
      "creator_customername",
      post.customerInfo.customerName
    );
    localStorage.setItem(
      "creator_customeremail",
      post.customerInfo.customerEmail
    );
    localStorage.setItem("customer_address", post.customerInfo.address);
    localStorage.setItem("customer_address1", post.customerInfo.address1);
    localStorage.setItem("customer_address2", post.customerInfo.address2);
    localStorage.setItem("customer_address3", post.customerInfo.address3);
    localStorage.setItem(
      "customer_customerphone",
      post.customerInfo.customerPhone
    );
    localStorage.setItem("customer_gst", post.customerInfo.gst);
    localStorage.setItem("customer_pan", post.customerInfo.pan);
    localStorage.setItem("customer_tin", post.customerInfo.tin);
    localStorage.setItem("customer_cin", post.customerInfo.cin);
    handleCloseBrandModal();
  };

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
      // const brands = filteredData.sort((a, b) =>
      //   a.customerName.localeCompare(b.customerName)
      // );
      return filteredData;
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
  useEffect(() => {
    handleLogin();
    getBrands();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    const filtered = posts.filter((post) =>
      post.itemName.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
    if (value === "") {
      setFilteredData(posts);
    }
  };

  const handleCloseModal = () => {
    // localStorage.removeItem("selectedItem");
    // localStorage.removeItem("selectedItemCode");
    // localStorage.removeItem("selectedItemPrice");
    // localStorage.removeItem("selectedItemBuyPrice");
    // localStorage.removeItem("selectedItemQty");
    // localStorage.removeItem("selectedItemUnit");
    handleCloseBrandModal();
  };

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        handleCloseModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleCloseModal]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center ">
      <div className="overflow-auto mt-6 bg-white p-4 text-black rounded-xl w-full lg:w-7/12">
        <div className="flex justify-between py-2">
          <div className=" text-lg font-bold">Select Brand/Agency </div>
          <div className="flex justify-end gap-x-4">
            <button onClick={handleCloseBrandModal}>
              <X size={30} />
            </button>
          </div>
        </div>

        <hr />
        <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-md mt-2">
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
          <div className="h-[400px] overflow-auto hidden lg:block border border-gray-300 rounded-md">
            <table className="min-w-full text-sm text-left text-gray-700">
              <thead className="sticky top-0 z-10 bg-gray-100 text-xs uppercase text-gray-600 border-b">
                <tr>
                  {["S.No.", "Name", "Address", "Mobile"].map((header) => (
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
                      onClick={() => handleSelect(post)}
                      key={post.id}
                      className={`border ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } ${
                        post.itemQty === 0
                          ? "bg-red-500 text-black cursor-not-allowed"
                          : "hover:bg-amber-300 cursor-pointer"
                      }`}
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
                      <td className="px-4 py-3 border-r">
                        {post.customerInfo.customerPhone}
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
          <div className="h-[400px] overflow-auto lg:hidden border border-gray-300 rounded-md mt-4">
            <table className="min-w-full text-xs text-left text-gray-700">
              <thead className="sticky top-0 z-10 bg-gray-100 text-xs uppercase text-gray-600 border-b">
                <tr>
                  {["Name", "Code", "Price", "Stock"].map((header) => (
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
                      onClick={() => handleSelect(post)}
                      key={post.id}
                      className={`border ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } ${
                        post.itemQty === 0
                          ? "bg-red-500 text-black cursor-not-allowed"
                          : "hover:bg-amber-300 cursor-pointer"
                      }`}
                    >
                      <td className="px-4 py-3 border-r">{post.itemName}</td>
                      <td className="px-4 py-3 border-r">{post.itemCode}</td>
                      <td className="px-4 py-3 border-r">{post.sellPrice}</td>
                      <td className="px-4 py-3 border-r">
                        {post.itemQty}
                        {post?.selectedUnit !== "none" && (
                          <span className="ml-1 uppercase">
                            {post.selectedUnit}
                          </span>
                        )}
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
  );
};

export default BrandModal;
