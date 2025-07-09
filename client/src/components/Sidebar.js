import React, { useState } from "react";
import { FaChevronDown, FaChevronRight, FaCog } from "react-icons/fa";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { TbReceiptTax } from "react-icons/tb";
import { TbFileInvoice } from "react-icons/tb";
import { GrNotes } from "react-icons/gr";
import { LuLayoutDashboard } from "react-icons/lu";
import * as IoIcons from "react-icons/io";
import { MdOutlineInventory } from "react-icons/md";
import {
  LogOutIcon,
  ShieldCheck,
  CircleCheckBig,
  RefreshCcw,
} from "lucide-react";

const Sidebar = () => {
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const location = useLocation();
  const name = localStorage.getItem("name1");
  const loggedInUser = localStorage.getItem("user");
  const subscription = localStorage.getItem("subscription");

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

  return (
    <div className="w-60 h-screen bg-[#014459] text-white flex flex-col shadow-lg">
      <NavLink className="text-xl font-bold p-5 border-b border-white" to={"/"}>
        Invoice Simplify
      </NavLink>
      <div className="text-sm font-bold break-all py-2 border-b border-white text-center flex items-center justify-start px-6 break-words">
        <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center mr-2">
          {name?.charAt(0).toUpperCase()}
        </div>
        {name}
      </div>
      <div className="text-[12px] text-center mt-2">{loggedInUser}</div>
      <hr className="mt-2" />

      <nav className="flex-1 px-4 py-2 overflow-y-auto text-sm">
        <SidebarItem
          icon={<LuLayoutDashboard size={20} />}
          text="Dashboard"
          link="/dashboard"
          active={location.pathname === "/dashboard"}
        />

        <SidebarItem
          icon={<IoIcons.IoIosPaper size={20} />}
          text="Basic Info"
          hasSubMenu
          isOpen={openSubMenu === "basicinfo"}
          onClick={() => toggleSubMenu("basicinfo")}
        >
          <SubMenuItem
            icon={<IoIcons.IoIosPaper size={20} />}
            text="Business Info"
            to="/businessinfo"
            active={location.pathname === "/businessinfo"}
          />
          <SubMenuItem
            icon={<TbReceiptTax size={24} />}
            text="Tax Info"
            to="/taxinfo"
            active={location.pathname === "/taxinfo"}
          />
          <SubMenuItem
            icon={<TbFileInvoice size={24} />}
            text="Additional Info"
            to="/additionalinfo"
            active={location.pathname === "/additionalinfo"}
          />
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
            to="/refresh"
            active={location.pathname === "/refresh"}
          />
          {/* <SubMenuItem
            icon={<MdOutlineMessage size={20} />}
            text="SMS"
            to="/sms"
            active={location.pathname === "/sms"}
          /> */}
          {/* <SubMenuItem
            icon={<Trash2 size={18} />}
            text="Archived Invoices"
            to="/archiveddashboard"
            active={location.pathname === "/archiveddashboard"}
          /> */}
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
      <div className="bg-white rounded-xl p-4 m-2 text-gray-800 shadow-inner">
        <h3 className="text-sm font-medium text-gray-600 mb-1">
          Plan Type :
          <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
            {subscription}
          </span>
        </h3>

        <button className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2 rounded-lg transition-all duration-200 font-semibold">
          Upgrade Plan
        </button>
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
