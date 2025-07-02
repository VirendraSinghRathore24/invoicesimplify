import React, { useState } from "react";
import {
  FaHome,
  FaUser,
  FaChevronDown,
  FaChevronRight,
  FaCog,
} from "react-icons/fa";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { TbReceiptTax } from "react-icons/tb";
import { TbFileInvoice } from "react-icons/tb";
import { GrNotes } from "react-icons/gr";
import { LuLayoutDashboard } from "react-icons/lu";
import * as IoIcons from "react-icons/io";
import { MdOutlineInventory } from "react-icons/md";
import { MdLogout, MdOutlineMessage } from "react-icons/md";
import {
  LogOutIcon,
  ShieldCheck,
  CircleCheckBig,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import { getAdditionalUserInfo } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import Loader from "./Loader";
import { IoRemove } from "react-icons/io5";

const Sidebar = () => {
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const location = useLocation();
  const loggedInUser = localStorage.getItem("user");
  const [loading, setLoading] = useState(false);

  const toggleSubMenu = (menuName) => {
    setOpenSubMenu(openSubMenu === menuName ? null : menuName);
  };

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
      const loggedInUser = localStorage.getItem("user");
      await getBusinessInfo(loggedInUser);
      await getTaxInfo(loggedInUser);
      await getAdditionalInfo(loggedInUser);
      await getInventoryItems(loggedInUser);
      await getAllInvoices(loggedInUser);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const basicInfo_CollectionRef = collection(db, "Basic_Info");
  const getBusinessInfo = async (loggedInUser) => {
    try {
      const data = await getDocs(basicInfo_CollectionRef);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

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

  const getTaxInfo = async (loggedInUser) => {
    try {
      const data = await getDocs(basicInfo_CollectionRef);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      const basicInfo = filteredData.filter(
        (x) => x.loggedInUser === loggedInUser
      )[0];
      localStorage.setItem("taxInfo", JSON.stringify(basicInfo?.taxInfo));
    } catch (err) {
      console.log(err);
    }
  };

  const getAdditionalInfo = async (loggedInUser) => {
    try {
      const data = await getDocs(basicInfo_CollectionRef);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

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

  const getInventoryItems = async (loggedInUser) => {
    try {
      const inventoryInfo_CollectionRef = collection(db, "Inventory_Info");
      const data = await getDocs(inventoryInfo_CollectionRef);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

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

  const invoiceInfo_CollectionRef = collection(db, "Invoice_Info");
  const getAllInvoices = async (loggedInUser) => {
    const data = await getDocs(invoiceInfo_CollectionRef);
    const filteredData = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    const invoiceInfo = filteredData.filter(
      (x) => x.loggedInUser === loggedInUser
    );
    localStorage.setItem("dashboardInfo", JSON.stringify(invoiceInfo));
  };
  return (
    <div className="w-64 h-screen bg-[#014459] text-white flex flex-col shadow-lg">
      <NavLink className="text-xl font-bold p-5 border-b border-white" to={"/"}>
        Invoice Simplify
      </NavLink>
      <div className="text-sm font-bold py-2 border-b border-white text-center flex items-center justify-start px-6 break-words">
        <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center mr-2">
          {loggedInUser?.charAt(0).toUpperCase()}
        </div>
        {loggedInUser}
      </div>

      <nav className="flex-1 px-4 py-2 overflow-y-auto text-sm">
        <SidebarItem
          icon={<LuLayoutDashboard size={20} />}
          text="Dashboard"
          link="/dashboard"
          active={location.pathname === "/dashboard"}
        />

        <SidebarItem
          icon={<IoIcons.IoIosPaper size={20} />}
          text="Business Info"
          //hasSubMenu
          //isOpen={openSubMenu === 'businessinfo'}
          //onClick={() => toggleSubMenu('businessinfo')}
          link="/businessinfo"
          active={location.pathname === "/businessinfo"}
        >
          {/* <SubMenuItem text="Add Business Info" to="/businessinfo" active={location.pathname === '/businessinfo'}/>
          <SubMenuItem text="Edit Business Info" to="/editbusinessinfo" active={location.pathname === '/editbusinessinfo'}/> */}
        </SidebarItem>

        <SidebarItem
          icon={<TbReceiptTax size={24} />}
          text="Tax Info"
          link="/taxinfo"
          active={location.pathname === "/taxinfo"}
          // hasSubMenu
          //isOpen={openSubMenu === 'taxinfo'}
          //onClick={() => toggleSubMenu('taxinfo')}
        >
          {/* <SubMenuItem text="Add Tax Info" to="/taxinfo" active={location.pathname === '/taxinfo'}/>
          <SubMenuItem text="Edit Tax Info" to="/edittaxinfo" active={location.pathname === '/edittaxinfo'} /> */}
        </SidebarItem>

        <SidebarItem
          icon={<TbFileInvoice size={24} />}
          text="Additional Info"
          link="/additionalinfo"
          active={location.pathname === "/additionalinfo"}
          //hasSubMenu
          //isOpen={openSubMenu === 'additionalinfo'}
          //onClick={() => toggleSubMenu('additionalinfo')}
        >
          {/* <SubMenuItem text="Add Additional Info" to="/additionalinfo" active={location.pathname === '/additionalinfo'}/>
          <SubMenuItem text="Edit Additional Info" to="/editadditionalinfo" active={location.pathname === '/editadditionalinfo'}/> */}
        </SidebarItem>

        <SidebarItem
          icon={<MdOutlineInventory size={24} />}
          text="Inventory"
          link="/inventory"
          active={location.pathname === "/inventory"}
          // hasSubMenu
          // isOpen={openSubMenu === 'inventory'}
          // onClick={() => toggleSubMenu('inventory')}
        >
          {/* <SubMenuItem text="Add Inventory" to="/addinventory" active={location.pathname === '/addinventory'}/>
          <SubMenuItem text="Edit Inventory" to="/editinventory" active={location.pathname === '/editinventory'}/> */}
        </SidebarItem>

        <SidebarItem
          icon={<GrNotes size={20} />}
          text="Invoice"
          link="/createinvoice"
          active={location.pathname === "/createinvoice"}
          // hasSubMenu
          // isOpen={openSubMenu === 'invoice'}
          // onClick={() => toggleSubMenu('invoice')}
        >
          {/* <SubMenuItem text="Create Invoice" to="/createinvoice" active={location.pathname === '/createinvoice'}/> */}
          {/* <SubMenuItem text="Download Invoice" to="/invoice" active={location.pathname === '/invoice'}/>  */}
          {/* <SubMenuItem text="View Invoice" to="/viewinvoice" active={location.pathname === '/viewinvoice'} /> */}
        </SidebarItem>

        <SidebarItem
          icon={<FaCog size={20} />}
          text="Settings"
          hasSubMenu
          isOpen={openSubMenu === "settings"}
          onClick={() => toggleSubMenu("settings")}
        >
          <SubMenuItem
            icon={<RefreshCcw size={18} />}
            text="Sync (Refresh)"
            onClick={handleSync}
          />
          {/* <SubMenuItem
            icon={<MdOutlineMessage size={20} />}
            text="SMS"
            to="/sms"
            active={location.pathname === "/sms"}
          /> */}
          <SubMenuItem
            icon={<Trash2 size={18} />}
            text="Archived Invoices"
            to="/archiveddashboard"
            active={location.pathname === "/archiveddashboard"}
          />
        </SidebarItem>

        <SidebarItem
          icon={<LogOutIcon size={24} />}
          text="Logout"
          onClick={handleLogout}
          // hasSubMenu
          // isOpen={openSubMenu === 'inventory'}
          // onClick={() => toggleSubMenu('inventory')}
        >
          {/* <SubMenuItem text="Add Inventory" to="/addinventory" active={location.pathname === '/addinventory'}/>
          <SubMenuItem text="Edit Inventory" to="/editinventory" active={location.pathname === '/editinventory'}/> */}
        </SidebarItem>
      </nav>
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
      {loading && <Loader />}
    </div>
  );
};

const SidebarItem = ({
  icon,
  text,
  hasSubMenu,
  isOpen,
  onClick,
  children,
  link,
  active,
}) => {
  const baseClasses =
    "flex items-center space-x-3 px-3 py-3 rounded-md transition my-4";
  const activeClasses = active
    ? "bg-amber-700 font-semibold"
    : "hover:bg-gray-700";

  return (
    <div>
      {link ? (
        <Link to={link} className={`${baseClasses} ${activeClasses}`}>
          {icon}
          <span>{text}</span>
        </Link>
      ) : (
        <div
          onClick={onClick}
          className={`${baseClasses} ${activeClasses} justify-between cursor-pointer`}
        >
          <div className="flex items-center space-x-3">
            {icon}
            <span>{text}</span>
          </div>
          {hasSubMenu && (
            <span>
              {isOpen ? (
                <FaChevronDown size={14} />
              ) : (
                <FaChevronRight size={14} />
              )}
            </span>
          )}
        </div>
      )}
      {isOpen && <div className="ml-8 mt-1">{children}</div>}
    </div>
  );
};

const SubMenuItem = ({ text, to, active, icon, onClick }) => {
  const baseClasses =
    "flex items-center space-x-3 px-3 py-3 rounded-md transition my-2 text-sm";
  const activeClasses = active
    ? "bg-amber-600 font-semibold"
    : "hover:bg-gray-600";

  return (
    <Link
      to={to}
      className={`${baseClasses} ${activeClasses} justify-between cursor-pointer`}
    >
      <div onClick={onClick}>
        <div className="flex items-center space-x-3">
          {icon}
          <span>{text}</span>
        </div>
      </div>
    </Link>
  );
};

export default Sidebar;
