import React, { useState } from 'react';
import { FaHome, FaUser, FaChevronDown, FaChevronRight, FaCog } from 'react-icons/fa';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { TbReceiptTax } from "react-icons/tb";
import { TbFileInvoice } from "react-icons/tb";
import { GrNotes } from "react-icons/gr";
import { LuLayoutDashboard } from "react-icons/lu";
import * as IoIcons from "react-icons/io";
import { MdOutlineInventory } from "react-icons/md";
import { MdLogout } from "react-icons/md";
import { LogOutIcon } from 'lucide-react';

const Sidebar = () => {
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const location = useLocation();
  const loggedInUser = localStorage.getItem("user");

  const toggleSubMenu = (menuName) => {
    setOpenSubMenu(openSubMenu === menuName ? null : menuName);
  };

const navigate = useNavigate();
  
 const handleLogout = () => {
   localStorage.clear();
   navigate('/login');
 }

  return (
    <div className="w-64 h-screen bg-[#014459] text-white flex flex-col shadow-lg">
      <div className="text-2xl font-bold p-5 border-b border-white">Invoice Simplify</div>
      <div className="text-sm font-bold py-2 border-b border-white text-center flex items-center justify-start px-6 break-words">
        <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center mr-2">
          {loggedInUser?.charAt(0).toUpperCase()}
        </div>
        {loggedInUser}
      </div>

      <nav className="flex-1 px-4 py-2 overflow-y-auto">
        <SidebarItem icon={<LuLayoutDashboard size={20}/>} text="Dashboard" link="/dashboard" active={location.pathname === '/dashboard'}/>

        <SidebarItem
          icon={<IoIcons.IoIosPaper size={20} />}
          text="Business Info"
          //hasSubMenu
          //isOpen={openSubMenu === 'businessinfo'}
          //onClick={() => toggleSubMenu('businessinfo')}
          link="/businessinfo" active={location.pathname === '/businessinfo'}
        >
          {/* <SubMenuItem text="Add Business Info" to="/businessinfo" active={location.pathname === '/businessinfo'}/>
          <SubMenuItem text="Edit Business Info" to="/editbusinessinfo" active={location.pathname === '/editbusinessinfo'}/> */}
        </SidebarItem>

        <SidebarItem
          icon={<TbReceiptTax size={24}/>}
          text="Tax Info"
          link="/taxinfo" active={location.pathname === '/taxinfo'}
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
          link="/additionalinfo" active={location.pathname === '/additionalinfo'}
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
          link="/inventory" active={location.pathname === '/inventory'}
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
          link="/createinvoice" active={location.pathname === '/createinvoice'}
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
          isOpen={openSubMenu === 'settings'}
          onClick={() => toggleSubMenu('settings')}
        >
          <SubMenuItem text="Delete Account" />
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
      <div className="text-2xl font-bold  border-b border-white"></div>
      {/* <div className='flex ml-10 mb-2 gap-x-2 py-4'>
        <MdLogout size={24}/>
        <div className="text-xl font-semibold ">Logout</div>
      </div> */}
     
    </div>
  );
};

const SidebarItem = ({ icon, text, hasSubMenu, isOpen, onClick, children, link, active }) => {
    const baseClasses = 'flex items-center space-x-3 px-3 py-3 rounded-md transition my-4';
    const activeClasses = active ? 'bg-amber-700 font-semibold' : 'hover:bg-gray-700';
  
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
              <span>{isOpen ? <FaChevronDown size={14} /> : <FaChevronRight size={14} />}</span>
            )}
          </div>
        )}
        {isOpen && <div className="ml-8 mt-1">{children}</div>}
      </div>
    );
  };
  

  const SubMenuItem = ({ text, to, active }) => {
    const baseClasses = 'block py-2 pl-4 text-sm rounded-md transition my-2';
    const activeClasses = active ? 'bg-amber-600 font-semibold' : 'hover:bg-gray-600';
  
    return (
      <Link to={to} className={`${baseClasses} ${activeClasses}`}>
        {text}
      </Link>
    );
  };

export default Sidebar;
