// Modal.js

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Loader from "../Loader";

const InventoryModal = ({ handleCloseItem, setItem }) => {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSelect = (post) => {
    if (post.itemQty === 0) {
      alert("Item is out of stock");
      return;
    }
    setItem(post.itemName);
    localStorage.setItem("selectedItem", post.itemName);
    localStorage.setItem("selectedItemCode", post.itemCode);
    localStorage.setItem("selectedItemPrice", post.sellPrice);
    localStorage.setItem("selectedItemBuyPrice", post.buyPrice);
    localStorage.setItem("selectedItemQty", post.itemQty);
    localStorage.setItem("selectedItemUnit", post.selectedUnit);
    handleCloseItem();
  };

  const addEmptyRow = () => {
    localStorage.setItem("selectedItem", "");
    localStorage.setItem("selectedItemCode", "emptyrow");
    localStorage.setItem("selectedItemPrice", "");
    localStorage.setItem("selectedItemBuyPrice", "");
    localStorage.setItem("selectedItemQty", "");
    localStorage.setItem("selectedItemUnit", "");
    handleCloseItem();
  };

  const getInventoryList = () => {
    setLoading(true);
    const existingItems = JSON.parse(localStorage.getItem("inventoryItems"));
    setPosts(existingItems);
    setFilteredData(existingItems);
    setLoading(false);
  };

  const handleLogin = () => {
    const user = localStorage.getItem("user");

    if (!user || user === "undefined" || user === "null") {
      navigate("/login");
    }
  };
  useEffect(() => {
    handleLogin();
    getInventoryList();
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
    setItem("");
    localStorage.removeItem("selectedItem");
    localStorage.removeItem("selectedItemCode");
    localStorage.removeItem("selectedItemPrice");
    localStorage.removeItem("selectedItemBuyPrice");
    localStorage.removeItem("selectedItemQty");
    localStorage.removeItem("selectedItemUnit");
    handleCloseItem();
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
          <div className=" text-lg font-bold">Select Item </div>
          <div className="flex justify-end gap-x-4">
            <button
              onClick={() => addEmptyRow()}
              className="border-1 px-4 py-2 bg-[#444] text-white font-bold rounded-md hover:bg-amber-800 text-sm"
            >
              {" "}
              + Add
            </button>
            <button onClick={handleCloseModal}>
              <X size={30} />
            </button>
          </div>
        </div>

        <hr />
        <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-md">
          <div className="p-4">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => handleSearch(e)}
              className="p-2 border border-gray-300 rounded-md mb-4 w-full"
            />
          </div>
          <div className="overflow-auto h-[400px] hidden lg:block">
            <table className="min-w-full text-sm text-left text-gray-700 ">
              <thead className="bg-gray-100 text-xs uppercase text-gray-600 border-b">
                <tr>
                  {[
                    "S.No.",
                    "Name",
                    "Item Code",
                    "Sell Price",
                    "Current Stock",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 border-r cursor-pointer"
                      //onClick={() => handleSort(header.toLowerCase())}
                    >
                      {header}
                      {/* {sortConfig.key === header.toLowerCase() && (
                  <span>{sortConfig.direction === "asc" ? " 🔼" : " 🔽"}</span>
                )} */}
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
                      } `}
                    >
                      <td className="px-4 py-3 border-r">{index + 1}.</td>
                      <td className="px-4 py-3 border-r">{post.itemName}</td>
                      <td className="px-4 py-3 border-r">{post.itemCode}</td>
                      <td className="px-4 py-3 border-r">{post.sellPrice}</td>
                      <td className="px-4 py-3 border-r">
                        {post.itemQty}{" "}
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
                      colSpan="9"
                      className="text-center px-4 py-6 text-gray-500"
                    >
                      No data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="overflow-auto h-[400px] hidden max-lg:block">
            <table className="min-w-full text-xs text-left text-gray-700 ">
              <thead className="bg-gray-100 text-xs uppercase text-gray-600 border-b">
                <tr>
                  {["Name", "Code", "Price", "Stock"].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 border-r cursor-pointer"
                      //onClick={() => handleSort(header.toLowerCase())}
                    >
                      {header}
                      {/* {sortConfig.key === header.toLowerCase() && (
                  <span>{sortConfig.direction === "asc" ? " 🔼" : " 🔽"}</span>
                )} */}
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
                      } `}
                    >
                      <td className="px-4 py-3 border-r w-[50%]">
                        {post.itemName}
                      </td>
                      <td className="px-4 py-3 border-r w-[20%]">
                        {post.itemCode}
                      </td>
                      <td className="px-4 py-3 border-r w-[10%]">
                        {post.sellPrice}
                      </td>
                      <td className="px-4 py-3 border-r w-[20%]">
                        {post.itemQty}{" "}
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
                      colSpan="9"
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

export default InventoryModal;
