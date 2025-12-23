import React, { useEffect, useState } from "react";
import { db } from "../../config/firebase";

import { NavLink, useNavigate } from "react-router-dom";

import {
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { addDoc, collection, doc, getDocs } from "firebase/firestore";

import Loader from "../Loader";
import LoginFooter from "./LoginFooter";
import {
  BASIC_INFO,
  CONTENT_CREATOR,
  CREATORS,
  INVENTORY_INFO,
  LOGIN_INFO,
  USERS,
} from "../Constant";

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [loading, setLoading] = useState(false);

  const updateUserProfile = (auth) => {
    updateProfile(auth.currentUser, {
      displayName: firstname + ", " + lastname,
    })
      .then(() => {
        console.log("Profile updated!");
        // Profile updated!
        // ...
      })
      .catch((error) => {
        // An error occurred
        // ...
      });
  };
  // const sendEmailForVerify = (auth) => {
  //   sendEmailVerification(auth.currentUser).then(() => {
  //     console.log("Email verification sent!");
  //     // Email verification sent!
  //     // ...
  //   });
  // };
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

  const createUserWithUsernameAndPassword = async (e) => {
    try {
      e.preventDefault();

      setLoading(true);
      const userExists = await checkIfUserExists(email);

      if (userExists) {
        alert("User already exists. Please login.");
        setLoading(false);
        return;
      }

      const auth = getAuth();
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed up
          //const user = userCredential.user;
          const code = auth?.currentUser?.email;
          const userName = auth?.currentUser?.displayName;
          const uid = auth?.currentUser?.uid;

          initializeDB(code, userName, uid);
          updateUserProfile(auth);

          // not adding as of now for verification
          //sendEmailForVerify(auth);
          localStorage.setItem("auth", "Logged In");
          localStorage.setItem("user", code);
          localStorage.setItem("userName", userName);
          localStorage.setItem("name1", name);
          localStorage.setItem("invoiceNumber", 1);
          localStorage.setItem("invoiceNumberMode", "automatic");
          localStorage.setItem("usedInvoiceNumbers", []);
          localStorage.setItem("type", CONTENT_CREATOR);
          localStorage.setItem("subscription", "Free");
          localStorage.setItem("uid", uid);
          localStorage.setItem("isFreePlan", true);
          localStorage.setItem("invoiceCurrency", "₹");
          localStorage.setItem(
            "subStartDate",
            new Date().toISOString().slice(0, 10)
          );

          setLoading(false);

          navigate("/creator/personalinfo");
        })
        .catch((error) => {
          if (error.code === "auth/email-already-in-use") {
            alert(email + " already in use, Please login!!!");
          }
          if (error.code === "auth/weak-password") {
            alert("Password should be at least 6 characters long !!!");
          } else {
            alert("Error : " + error.code);
          }
          setLoading(false);
        });
    } catch (err) {
      alert("Error : " + err);
      setLoading(false);
    }
  };

  const initializeDB = async (code, userName, uid) => {
    const orgCode = Math.random().toString(36).slice(2);
    const date = new Date();
    date.setDate(date.getDate() + 30);
    const nextMonthDate = date.toISOString().slice(0, 10);
    localStorage.setItem("subEndDate", nextMonthDate);

    const login_CollectionRef = collection(db, LOGIN_INFO);
    await addDoc(login_CollectionRef, {
      orgCode: orgCode,
      code: code,
      userName: userName,
      name: name,
      invoiceNumber: 1,
      invoiceNumberMode: "automatic",
      usedInvoiceNumbers: [],
      type: CONTENT_CREATOR,
      subscription: "Free",
      invoiceCurrency: "₹",
      subStarts: new Date().toISOString().slice(0, 10),
      subEnds: nextMonthDate,
      loginDate: new Date().toISOString().slice(0, 10),
    });

    const basicInfo_CollectionRef = collection(
      doc(db, CREATORS, uid),
      BASIC_INFO
    );
    await addDoc(basicInfo_CollectionRef, {
      personalInfo: null,
      accountInfo: null,
      additionalInfo: null,
      taxInfo: null,
      logoUrl: null,
      loggedInUser: code,
    });
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
      {/* 🔽 Page Dropdown */}

      {/* Signup Form */}
      <main className="flex-grow flex items-center justify-center px-4 py-10">
        <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-3xl shadow-lg overflow-hidden grid md:grid-cols-2">
          <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-8">
            <h2 className="text-3xl font-bold mb-4">
              Welcome to InvoiceSimplify
            </h2>
            <p className="text-center text-sm">
              Fast, simple & mobile-friendly invoicing for business and
              creators.
            </p>
            <img
              src="../images/Signup-amico.svg"
              alt="Signup"
              className="w-3/4 mt-6"
            />
          </div>
          <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg p-8">
            <h2 className="text-3xl font-semibold mb-6 text-center">
              Create Your Account
            </h2>
            <form
              onSubmit={(e) => createUserWithUsernameAndPassword(e)}
              className="space-y-5"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                  required
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>
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
                <label className="block text-sm font-medium mb-1">
                  Password
                </label>
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
                Sign Up
              </button>
              <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                Already have an account?{" "}
                <NavLink
                  to={"/login"}
                  className="text-indigo-600 hover:underline"
                >
                  Login
                </NavLink>
              </div>
            </form>
          </div>
        </div>
        {loading && <Loader />}
      </main>

      {/* Footer */}
      <LoginFooter />
    </div>
  );
};

export default Signup;
