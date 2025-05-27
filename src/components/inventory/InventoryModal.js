// Modal.js

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useNavigate } from "react-router-dom";


const InventoryModal = ({ handleCloseItem, setItem }) => {
  const [posts, setPosts] = useState([{ code: "", symbol: "" }]);

  const navigate = useNavigate();

  const getItemList = async () => {

    const data = [
        {name : 'Aari Jarsdoshi Poshak Jaipur and Jodhpur'},
        {name : 'New Design Poshak'},
        {name : 'Apni Poshak'},
        {name : 'Gotta and Jari Poshak'},
        {name : 'Amazing Poshak'},
        {name : 'Jaipuri Poshak'},
        {name : 'Aari Jarsdoshi Poshak Jaipur and Jodhpur'},,
        {name : 'Aari Jarsdoshi Poshak Jaipur and Jodhpur'},,
        {name : 'Aari Jarsdoshi Poshak Jaipur and Jodhpur'},,
        {name : 'Aari Jarsdoshi Poshak Jaipur and Jodhpur'},,
        {name : 'Aari Jarsdoshi Poshak Jaipur and Jodhpur'},,
        {name : 'Aari Jarsdoshi Poshak Jaipur and Jodhpur'},,
        {name : 'Aari Jarsdoshi Poshak Jaipur and Jodhpur'},,
        {name : 'Aari Jarsdoshi Poshak Jaipur and Jodhpur'},,
        {name : 'Aari Jarsdoshi Poshak Jaipur and Jodhpur'},,
        {name : 'Aari Jarsdoshi Poshak Jaipur and Jodhpur'},
      ]

    setPosts(data);
  };

  const handleSelect = (post) => {
    setItem(post.itemName);
    localStorage.setItem("selectedItem", post.itemName);
    handleCloseItem();
  }

  const inventoryInfo_CollectionRef = collection(db, "Inventory_Info");
  const getInventoryList = async() => {
    const data = await getDocs(inventoryInfo_CollectionRef);
        const filteredData = data.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
    
        const loggedInUser = localStorage.getItem("user");
        const inventoryInfo = filteredData.filter(
          (x) => x.loggedInUser === loggedInUser
        )[0];
    
        // get items list
        const existingItems = inventoryInfo.inventory.sort((a, b) => a.itemName.localeCompare(b.itemName));
        setPosts(existingItems);
  }

  const handleLogin = () => {
    const user = localStorage.getItem("user");

    if(!user || user === "undefined" || user === "null"){
      navigate("/login");
    } 
}
  useEffect(() => {
    handleLogin();
    getInventoryList();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        handleCloseItem();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleCloseItem]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center ">
      <div className="overflow-auto mt-6 bg-white p-4 text-black rounded-xl">
        <div className="flex justify-between py-2">
          <div className=" text-lg font-bold">Select Item </div>
          <button onClick={handleCloseItem}>
            <X size={30} />
          </button>
        </div>

        <hr />
        <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-md">
      <div className="p-4">
        <input
          type="text"
          placeholder="Search..."
          //value={searchTerm}
          //onChange={handleSearch}
          className="p-2 border border-gray-300 rounded-md mb-4 w-full"
        />
      </div>
      <div className="overflow-auto h-[400px]">
      <table className="min-w-full text-sm text-left text-gray-700 ">
        <thead className="bg-gray-100 text-xs uppercase text-gray-600 border-b">
          <tr>
            {['S.NO','Item','Delete'].map((header) => (
              <th
                key={header}
                className="px-4 py-3 border-r cursor-pointer"
                //onClick={() => handleSort(header.toLowerCase())}
              >
                {/* {header}
                {sortConfig.key === header.toLowerCase() && (
                  <span>
                    {sortConfig.direction === 'asc' ? ' 🔼' : ' 🔽'}
                  </span>
                )} */}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {posts.map((post, index) => (
            <tr onClick={() => handleSelect(post)}
              key={post.id}
              className={`border-t ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-amber-300  cursor-pointer`}
            >
              <td className="px-4 py-3 border-r">{index+1}.</td>
              <td className="px-4 py-3 border-r">{post.itemName}</td>
            
              <td className="px-4 py-3">
                <button
                  
                  className="text-blue-600 hover:text-red-800 font-semibold text-sm"
                >
                  Select
                </button>
              </td>
            </tr>
          ))}
          {/* {sortedData.length === 0 && (
            <tr>
              <td colSpan="9" className="text-center px-4 py-6 text-gray-500">
                No data available.
              </td>
            </tr>
          )} */}
        </tbody>
      </table>
      </div>
    </div>
      </div>
    </div>
  );
};


export default InventoryModal;