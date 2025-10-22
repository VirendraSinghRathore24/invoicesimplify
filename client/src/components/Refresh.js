import React, { useEffect, useState } from "react";
import { db } from "../config/firebase";
import { collection, doc, getDocs } from "firebase/firestore";
import Loader from "./Loader";
import MobileMenu from "./MobileMenu";
import { useNavigate } from "react-router-dom";
import { BASIC_INFO, INVENTORY_INFO, INVOICE_INFO, USERS } from "./Constant";

const Refresh = () => {
  const [loading, setLoading] = useState(false);
  const uid = localStorage.getItem("uid");
  const navigate = useNavigate();
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
      await getLoginInfo(loggedInUser);
      navigate(-1);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const login_CollectionRef = collection(db, "Login_Info");
  const getLoginInfo = async (loggedInUser) => {
    try {
      const data = await getDocs(login_CollectionRef);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      const loginInfo = filteredData.filter((x) => x.code === loggedInUser)[0];

      localStorage.setItem("user", loginInfo.code);
      localStorage.setItem("userName", loginInfo.userName);
      localStorage.setItem("name1", loginInfo.name);
      localStorage.setItem("type", loginInfo.type);
      localStorage.setItem("subscription", loginInfo.subscription);
      localStorage.setItem("invoiceNumber", loginInfo.invoiceNumber);
      localStorage.setItem(
        "usedInvoiceNumbers",
        loginInfo.usedInvoiceNumbers ? loginInfo.usedInvoiceNumbers : []
      );
      localStorage.setItem("uid", uid);
      localStorage.setItem("subStartDate", loginInfo.loginDate);
    } catch (err) {
      console.log(err);
    }
  };

  const basicInfo_CollectionRef = collection(doc(db, USERS, uid), BASIC_INFO);
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
      const inventoryInfo_CollectionRef = collection(
        doc(db, USERS, uid),
        INVENTORY_INFO
      );
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

  const invoiceInfo_CollectionRef = collection(
    doc(db, USERS, uid),
    INVOICE_INFO
  );
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

  useEffect(() => {
    handleSync();
  }, []);
  return (
    <div>
      <div className="hidden max-lg:block mb-16">
        <MobileMenu />
      </div>

      <div className="flex h-screen items-center justify-center">
        {!loading && (
          <div className="">Refresh is Completed successfully !!!</div>
        )}
        {loading && <Loader />}
      </div>
    </div>
  );
};

export default Refresh;
