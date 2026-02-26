import { addDoc, collection, doc, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { auth, db, googleProvider } from "../../config/firebase";

import { NavLink, useNavigate } from "react-router-dom";
//import Spinner from '../Spinner';
import { FcGoogle } from "react-icons/fc";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

import Loader from "../Loader";
import LoginFooter from "./LoginFooter";
import {
  BASIC_INFO,
  CONTENT_CREATOR,
  CREATORS,
  INVENTORY_INFO,
  INVOICE_INFO,
  USERS,
} from "../Constant";

const Login = ({ setUpdateCredit }) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = () => {
    navigate("/signup");
  };
  const handleOnClick = () => {
    navigate("/");
  };

  // get all data and add to local storage
  const getAllData = async (loggedInUser, uid) => {
    const basicInfo_CollectionRef = collection(doc(db, USERS, uid), BASIC_INFO);
    const data = await getDocs(basicInfo_CollectionRef);
    const filteredData = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    const basicInfo = filteredData.filter(
      (x) => x.loggedInUser === loggedInUser
    )[0];

    if (!basicInfo) return;

    localStorage.setItem(
      "businessInfo",
      JSON.stringify(basicInfo?.businessInfo)
    );
    localStorage.setItem("taxInfo", JSON.stringify(basicInfo?.taxInfo));
    localStorage.setItem(
      "additionalInfo",
      JSON.stringify(basicInfo?.additionalInfo)
    );
  };

  const getInventoryList = async (loggedInUser, uid) => {
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

    if (!inventoryInfo) return;
    localStorage.setItem(
      "inventoryItems",
      JSON.stringify(inventoryInfo?.inventory)
    );
  };

  const login_CollectionRef = collection(db, "Login_Info");
  const getBusinessType = async (loggedInUser) => {
    const data = await getDocs(login_CollectionRef);
    const filteredData = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    const loginInfo = filteredData.filter((x) => x.code === loggedInUser)[0];

    if (!loginInfo) return;

    localStorage.setItem("type", loginInfo.type);
    localStorage.setItem("name1", loginInfo.name);
    localStorage.setItem("subscription", loginInfo.subscription);
    localStorage.setItem("invoiceNumber", loginInfo.invoiceNumber);

    if (loginInfo.invoiceNumberMode) {
      localStorage.setItem("invoiceNumberMode", loginInfo.invoiceNumberMode);
    } else {
      localStorage.setItem("invoiceNumberMode", "automatic");
    }

    localStorage.setItem("usedInvoiceNumbers", loginInfo.usedInvoiceNumbers);
    localStorage.setItem("subStartDate", loginInfo.subStarts);
    localStorage.setItem("subEndDate", loginInfo.subEnds);
    localStorage.setItem("invoiceCurrency", loginInfo.invoiceCurrency);
    localStorage.setItem("credit", loginInfo.credit);
    localStorage.setItem("planType", loginInfo.planType);
    setUpdateCredit(loginInfo.credit);
  };

  const getInvoiceInfo = async (loggedInUser, uid) => {
    const invoiceInfo_CollectionRef = collection(
      doc(db, USERS, uid),
      INVOICE_INFO
    );
    const data = await getDocs(invoiceInfo_CollectionRef);
    const filteredData = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    const invoiceInfo = filteredData.filter(
      (x) => x.loggedInUser === loggedInUser
    );
    if (!invoiceInfo) return;
    localStorage.setItem("dashboardInfo", JSON.stringify(invoiceInfo));
  };

  const getPersonalInfo = async (loggedInUser, uid) => {
    const personalInfo_CollectionRef = collection(
      doc(db, CREATORS, uid),
      BASIC_INFO
    );
    const data = await getDocs(personalInfo_CollectionRef);
    const filteredData = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    const pInfo = filteredData.filter(
      (x) => x.loggedInUser === loggedInUser
    )[0];

    if (!pInfo) return;
    localStorage.setItem(
      "creator_personalInfo",
      JSON.stringify(pInfo.personalInfo)
    );
    localStorage.setItem(
      "creator_accountInfo",
      JSON.stringify(pInfo.accountInfo)
    );
    localStorage.setItem(
      "creator_additionalInfo",
      JSON.stringify(pInfo.additionalInfo)
    );
    localStorage.setItem("creator_taxInfo", JSON.stringify(pInfo.taxInfo));
    localStorage.setItem("creator_logoUrl", pInfo?.logoUrl);
  };

  const signInWithUsernameAndPassword = async (e) => {
    try {
      e.preventDefault();
      setLoading(true);
      const auth = getAuth();
      signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          // Signed in
          const user = userCredential.user;

          const code = auth?.currentUser?.email;
          const userName = auth?.currentUser?.displayName;
          const uid = auth?.currentUser?.uid;

          await initializeData(code, uid, userName);

          setLoading(false);
          // // ...
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;

          if (errorCode === "auth/invalid-credential") {
            alert("username or password is invalid !!!, Singup First");
          }
          setLoading(false);
          return;
        });
    } catch (err) {
      setLoading(false);
    }
  };

  const addLocalStorageForNewUser = async (code, userName, uid, name) => {
    localStorage.setItem("auth", "Logged In");
    localStorage.setItem("user", code);
    localStorage.setItem("userName", userName);
    localStorage.setItem("name1", name);
    localStorage.setItem("invoiceNumber", 1);
    localStorage.setItem("invoiceNumberMode", "automatic");
    localStorage.setItem("usedInvoiceNumbers", []);
    localStorage.setItem("subscription", "Free");
    localStorage.setItem("uid", uid);
    localStorage.setItem("isFreePlan", true);
    localStorage.setItem("invoiceCurrency", "₹");
    localStorage.setItem("subStartDate", new Date().toISOString().slice(0, 10));
    localStorage.setItem("credit", 10);
    localStorage.setItem("planType", "Free");
    setUpdateCredit(10);
  };

  const initializeDBForNewUser = async (code, userName, uid) => {
    await addLocalStorageForNewUser(code, userName, uid, userName);

    const orgCode = Math.random().toString(36).slice(2);
    const date = new Date();
    date.setDate(date.getDate() + 30);
    const nextMonthDate = date.toISOString().slice(0, 10);
    localStorage.setItem("subEndDate", nextMonthDate);

    await addDoc(login_CollectionRef, {
      orgCode: orgCode,
      code: code,
      userName: userName,
      name: userName,
      invoiceNumber: 1,
      invoiceNumberMode: "automatic",
      usedInvoiceNumbers: [],
      type: CONTENT_CREATOR,
      subscription: "Free",
      invoiceCurrency: "₹",
      subStarts: new Date().toISOString().slice(0, 10),
      subEnds: nextMonthDate,
      loginDate: new Date().toISOString().slice(0, 10),
      credit: 10,
    });

    const basicInfo_CollectionRef = collection(doc(db, USERS, uid), BASIC_INFO);
    // also create db for business, tax and additional info
    await addDoc(basicInfo_CollectionRef, {
      businessInfo: null,
      imageUrl: null,
      taxInfo: null,
      additionalInfo: null,
      loggedInUser: code,
    });
  };
  const initializeData = async (code, uid, userName) => {
    localStorage.setItem("uid", auth?.currentUser?.uid);
    localStorage.setItem("auth", "Logged In");
    localStorage.setItem("user", code);
    localStorage.setItem("userName", userName);

    await getBusinessType(code);

    // for content cretor
    await getPersonalInfo(code, uid);

    const info = localStorage.getItem("creator_personalInfo");

    if (info === "undefined") {
      navigate("/creator/personalinfo");
    } else {
      navigate("/creator/createinvoice");
    }
  };

  const checkIfUserExists = async (email) => {
    const loginCollectionRef = collection(db, "Login_Info");
    const data = await getDocs(loginCollectionRef);
    const filteredData = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    const userExists = filteredData.some((user) => user.code === email);
    return userExists;
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);

      setLoading(true);

      const code = auth?.currentUser?.email;
      const userName = auth?.currentUser?.displayName;
      const uid = auth?.currentUser?.uid;

      const userExists = await checkIfUserExists(code);

      if (userExists) {
        await initializeData(code, uid, userName);
      } else {
        await initializeDBForNewUser(code, userName, uid);
      }
      navigate("/creator/createinvoice");
      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    window.scroll(0, 0);
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

      {/* Login Form */}
      <main className="flex-grow flex items-center justify-center px-4 py-10">
        <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-3xl shadow-lg overflow-hidden grid md:grid-cols-2">
          <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-8">
            <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
            <p className="text-center text-sm">
              Login to manage your invoices easily and efficiently.
            </p>
            <img
              src="../images/Login-amico.svg"
              alt="Login Illustration"
              className="w-3/4 mt-6"
            />
          </div>
          <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg p-8">
            <h2 className="text-3xl font-semibold mb-6 text-center">
              Login to Your Account
            </h2>
            <form
              onSubmit={signInWithUsernameAndPassword}
              className="space-y-5"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  required
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium">Password</label>
                  <NavLink
                    to={"/forgotpassword"}
                    className="text-sm text-indigo-600 hover:underline"
                  >
                    Forgot Password?
                  </NavLink>
                </div>
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  required
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold text-sm"
              >
                Login
              </button>
              <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                Don’t have an account?{" "}
                <NavLink
                  to={"/signup"}
                  className="text-indigo-600 hover:underline"
                >
                  Sign Up
                </NavLink>
              </div>
            </form>
            <button
              className="w-full flex justify-center items-center rounded-[8px] font-medium text-richblack-700 border border-richblack-700
                        px-[12px] py-[8px] gap-x-2 mt-6 bg-yellow-300 hover:bg-green-300"
              onClick={signInWithGoogle}
            >
              <FcGoogle />
              <p>Sign in with Google</p>
            </button>
          </div>
        </div>
        {loading && <Loader />}
      </main>

      {/* Footer */}
      <LoginFooter />
    </div>
  );
};

export default Login;
