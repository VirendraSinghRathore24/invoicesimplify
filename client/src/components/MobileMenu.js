import React, { useState } from "react";
import { Menu, X, CircleCheckBig, ShieldCheck } from "lucide-react"; // optional: or use your own icons
import { NavLink, useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import Loader from "./Loader";

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const loggedInUser = localStorage.getItem("user");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    const res = window.confirm("Are you sure you want to logout?");

    if (res) {
      localStorage.clear();
      navigate("/login");
    }
  };

  const handleSync = async () => {
    // get all data from db and reload to local storage
    try {
      setLoading(true);
      await getBusinessInfo();
      await getTaxInfo();
      await getAdditionalInfo();
      await getInventoryItems();
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const basicInfo_CollectionRef = collection(db, "Basic_Info");
  const getBusinessInfo = async () => {
    try {
      const data = await getDocs(basicInfo_CollectionRef);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      const loggedInUser = localStorage.getItem("user");
      const basicInfo = filteredData.filter(
        (x) => x.loggedInUser === loggedInUser
      )[0];
      localStorage.setItem(
        "businessInfo",
        JSON.stringify(basicInfo?.businessInfo)
      );
    } catch (err) {
      console.log(err);
    }
  };

  const getTaxInfo = async () => {
    try {
      const data = await getDocs(basicInfo_CollectionRef);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      const loggedInUser = localStorage.getItem("user");
      const basicInfo = filteredData.filter(
        (x) => x.loggedInUser === loggedInUser
      )[0];
      localStorage.setItem("taxInfo", JSON.stringify(basicInfo?.taxInfo));
    } catch (err) {
      console.log(err);
    }
  };

  const getAdditionalInfo = async () => {
    try {
      const data = await getDocs(basicInfo_CollectionRef);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      const loggedInUser = localStorage.getItem("user");
      const basicInfo = filteredData.filter(
        (x) => x.loggedInUser === loggedInUser
      )[0];
      localStorage.setItem(
        "additionalInfo",
        JSON.stringify(basicInfo?.additionalInfo)
      );
    } catch (err) {
      console.log(err);
    }
  };

  const getInventoryItems = async () => {
    try {
      const inventoryInfo_CollectionRef = collection(db, "Inventory_Info");
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
      const inventoryItems = inventoryInfo.inventory.sort((a, b) =>
        a.itemName.localeCompare(b.itemName)
      );
      localStorage.setItem("inventoryItems", JSON.stringify(inventoryItems));
    } catch (err) {
      console.log(err);
    }
  };

  const menuItems = [
    "Create Invoice",
    "Dashboard",
    "Inventory",
    "Business Info",
    "Tax Info",
    "Additional Info",
  ];

  return (
    <div className="fixed top-0 left-0 w-full z-50">
      {/* Top bar */}
      <div className="flex items-center justify-between p-4 bg-[#014459] text-white shadow-md">
        <NavLink className="text-xl font-bold" to={"/"}>
          InvoiceSimplify
        </NavLink>
        <button
          className="lg:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Sidebar overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b text-xl font-bold text-blue-600">
          InvoiceSimplify
        </div>
        <hr />
        <div className="text-sm font-bold py-2 border-b border-white text-center flex items-center justify-start px-6 break-words">
          <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center mr-2">
            {loggedInUser?.charAt(0).toUpperCase()}
          </div>
          {loggedInUser}
        </div>
        <hr />
        <nav className="p-4 space-y-4">
          {menuItems.map((item, index) => (
            <NavLink
              to={`/${item.toLowerCase().replace(/\s+/g, "")}`}
              key={index}
              className="block text-gray-800 hover:text-blue-600 transition"
            >
              {item}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 mb-2 bottom-0 mt-auto ">
          <button onClick={handleSync}>Sync (Refresh)</button>
        </div>
        <div className="p-4 bottom-0 mt-auto border-t text-center">
          <button onClick={handleLogout}>Logout</button>
        </div>
        <div className="text-xs font-bold border-t border-white flex justify-evenly mb-2 py-2">
          <div className="flex items-center space-x-1">
            <ShieldCheck size={20} />
            <div>100% Secure</div>
          </div>
          <div className="flex items-center space-x-1">
            <CircleCheckBig size={20} />
            <div>ISO Certified</div>
          </div>
        </div>
      </div>
      {loading && <Loader />}
    </div>
  );
};

export default MobileMenu;
