import React, { useEffect, useRef, useState } from "react";
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
  History,
  Cog,
} from "lucide-react";

const CreatorSidebar = () => {
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const location = useLocation();
  const name = localStorage.getItem("name1");
  const loggedInUser = localStorage.getItem("user");
  const [subscription, setSubscription] = useState("");
  const sidebarRef = useRef(null);
  const [isScrollable, setIsScrollable] = useState(false);

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
  const [remainingDays, setRemainingDays] = useState(null);
  const calculateRemainingDays = () => {
    const today = new Date();
    const subEndDate = localStorage.getItem("subEndDate");
    const endDate = new Date(subEndDate); // replace with login date

    const diff = endDate - today;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days <= 0) {
      setRemainingDays(0);
      setSubscription("Expired");
      localStorage.setItem("subscriptionPlan", "Expired");
      return;
    }
    localStorage.removeItem("subscriptionPlan");
    const subs = localStorage.getItem("subscription");
    setSubscription(subs);
    setRemainingDays(days);
  };

  useEffect(() => {
    calculateRemainingDays();

    const interval = setInterval(calculateRemainingDays, 24 * 60 * 60 * 1000); // Update daily
    return () => clearInterval(interval);
  }, []);

  const checkScroll = () => {
    const el = sidebarRef.current;
    if (el.scrollHeight > el.clientHeight) {
      setIsScrollable(true);
    } else {
      setIsScrollable(false);
    }
  };
  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);
  return (
    <div className="w-60 h-[96.7%] bg-[#014459] text-white flex flex-col shadow-lg fixed top-0 left-0 rounded-lg m-3">
      <NavLink
        className="text-xl font-bold p-2 items-center flex justify-center border-b border-gray "
        to={"/"}
      >
        <img
          src="../../images/invlogo2.png"
          alt="Logo"
          width={95}
          loading="lazy"
        />
      </NavLink>
      <div className="text-sm font-bold break-all py-2 border-b border-white text-center flex items-center justify-start px-6 break-words">
        <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center mr-2">
          {name?.charAt(0).toUpperCase()}
        </div>
        {name}
      </div>
      <div className="text-[12px] text-center mt-2">{loggedInUser}</div>
      <hr className="mt-2" />

      <nav
        ref={sidebarRef}
        className="flex-1 px-4 py-2 overflow-y-auto text-sm"
      >
        <SidebarItem
          icon={<LuLayoutDashboard size={20} />}
          text="Dashboard"
          link="/creator/dashboard"
          active={location.pathname === "/creator/dashboard"}
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
            text="Personal Info"
            to="/creator/personalinfo"
            active={location.pathname === "/creator/personalinfo"}
          />
          <SubMenuItem
            icon={<TbReceiptTax size={24} />}
            text="Account Info"
            to="/creator/accountinfo"
            active={location.pathname === "/creator/accountinfo"}
          />
          <SubMenuItem
            icon={<TbFileInvoice size={24} />}
            text="Additional Info"
            to="/creator/creatoradditionalinfo"
            active={location.pathname === "/creator/creatoradditionalinfo"}
          />
        </SidebarItem>

        <SidebarItem
          icon={<MdOutlineInventory size={24} />}
          text="Brands"
          link="/creator/brands"
          active={location.pathname === "/creator/brands"}
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
          link="/creator/createinvoice"
          active={location.pathname === "/creator/createinvoice"}
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

          <SubMenuItem
            icon={<History size={18} />}
            text="Payment History"
            to="/paymenthistory"
            active={location.pathname === "/paymenthistory"}
          />
          <SubMenuItem
            icon={<Cog size={18} />}
            text="Configuration"
            to="/configuration"
            active={location.pathname === "/configuration"}
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
      {isScrollable && (
        <div className="px-3">
          <div className="sticky bottom-0 bg-gray-600 text-center text-xs py-2  text-white rounded-full">
            Scroll for more options
          </div>
        </div>
      )}
      <div className="bg-white rounded-xl p-4 m-2 text-gray-800 shadow-inner">
        <h3 className="text-sm font-medium text-gray-600 mb-1">
          Plan Type :
          <span
            className={`inline-block bg-green-100 ${
              subscription === "Expired" ? "text-red-700" : "text-green-700"
            }  text-xs font-semibold px-3 py-1 rounded-full`}
          >
            {subscription}
          </span>
        </h3>
        <div className="text-sm font-medium text-gray-600">
          Expires in :{" "}
          <span className="inline-block bg-yellow-100 text-green-700 text-xs font-semibold px-1 py-1 rounded-full">
            {remainingDays} days{" "}
          </span>
        </div>
        <button
          onClick={() => navigate("/plans")}
          className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2 rounded-lg transition-all duration-200 font-semibold"
        >
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
    "flex items-center space-x-3 px-2 py-2 rounded-md transition my-4";
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
    "flex items-center space-x-3 px-3 py-2 rounded-md transition my-2 text-sm";
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

export default CreatorSidebar;
