import React from "react";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import * as IoIcons from "react-icons/io";
import { TbReceiptTax } from "react-icons/tb";
import { TbFileInvoice } from "react-icons/tb";
import { GrNotes } from "react-icons/gr";
import { LuLayoutDashboard } from "react-icons/lu";
import * as RiIcons from "react-icons/ri";

export const SidebarData = [
    {
    title: "Dashboard",
    path: "/",
    icon: <LuLayoutDashboard />,
    cName: "nav-text",
  },
  {
    title: "Business Info",
    path: "/",
    icon: <IoIcons.IoIosPaper />,
    cName: "nav-text",
    iconClosed: <RiIcons.RiArrowDownSFill />,
        iconOpened: <RiIcons.RiArrowUpSFill />,

        subNav: [
            {
                title: "Our Aim",
                path: "/about-us/aim",
                icon: <IoIcons.IoIosPaper />,
            },
            {
                title: "Our Vision",
                path: "/about-us/vision",
                icon: <IoIcons.IoIosPaper />,
            },
        ],
  },
  {
    title: "Tax Info",
    path: "/taxinfo",
    icon: <TbReceiptTax />,
    cName: "nav-text",
  },
  {
    title: "Additional Info",
    path: "/additionalinfo",
    icon: <GrNotes />,
    cName: "nav-text",
  },
  {
    title: "Create Invoice",
    path: "/createinvoice",
    icon: <TbFileInvoice />,
    cName: "nav-text",
  },
  {
    title: "Invoice",
    path: "/invoice",
    icon: <FaIcons.FaEnvelopeOpenText />,
    cName: "nav-text",
  },
  {
    title: "Settings",
    path: "/support",
    icon: <IoIcons.IoMdSettings />,
    cName: "nav-text",
  },
];