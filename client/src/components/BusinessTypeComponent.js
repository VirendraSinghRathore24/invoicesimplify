import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import LoginFooter from "./login/LoginFooter";
import { BASIC_INFO, CONTENT_CREATOR, CREATORS, LOGIN_INFO } from "./Constant";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";

const BusinessTypeComponent = () => {
  const [businessType, setBusinessType] = useState("");

  const navigate = useNavigate();

  const businessTypes = [
    "Content Creator",
    "Small Business",
    "IT Services",
    "E‑Commerce",
    "Other",
  ];

  const handleSubmit = async () => {
    if (!businessType) {
      alert("Please select a business type");
      return;
    }

    const user = localStorage.getItem("user");
    const uid = localStorage.getItem("uid");

    // update business type for the user in the database
    await updateBusinessTypeInDB(user, uid);
    if (businessType === CONTENT_CREATOR) {
      localStorage.setItem("type", businessType);
      await setupForConententCreator(user, uid);
      navigate("/creator/personalinfo");
    }
  };

  const setupForConententCreator = async (user, uid) => {
    const basicInfo_CollectionRef = collection(
      doc(db, CREATORS, uid),
      BASIC_INFO
    );
    await addDoc(basicInfo_CollectionRef, {
      personalInfo: null,
      accountInfo: null,
      additionalInfo: null,
      loggedInUser: user,
    });
  };

  const updateBusinessTypeInDB = async (user, uid) => {
    const login_CollectionRef = collection(db, LOGIN_INFO);

    const data = await getDocs(login_CollectionRef);
    const filteredData = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    const loginInfo = filteredData.filter((x) => x.code === user)[0];

    const codeDoc = doc(db, LOGIN_INFO, loginInfo.id);
    await updateDoc(codeDoc, {
      type: businessType,
    });
  };

  useEffect(() => {
    const type = localStorage.getItem("type");
    if (type) {
      navigate("/");
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow px-6 py-4 flex justify-between items-center">
        <NavLink
          to={"/"}
          className="text-2xl font-bold text-indigo-600 dark:text-white"
        >
          <div className="flex items-center gap-2">
            <img
              src={"../../images/invlogo2.png"}
              alt="InvoiceSimplify"
              className="h-10"
            />
          </div>
        </NavLink>
      </header>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm text-center">
          <h2 className="text-xl font-bold mb-4">Select Business Type</h2>

          <select
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            className="border rounded-lg p-2 w-full mb-4"
          >
            <option value="">-- Select --</option>
            {businessTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full hover:bg-blue-700 transition"
          >
            Continue
          </button>
        </div>
      </div>
      {/* Footer */}
      <LoginFooter />
    </div>
  );
};

export default BusinessTypeComponent;
