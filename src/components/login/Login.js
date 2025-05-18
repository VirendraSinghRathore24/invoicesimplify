import { collection, getDocs } from "firebase/firestore";
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

import { getAccountData, getPersonalData } from "../DatabaseHelper";

const Login = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = () => {
    navigate("/signup");
  };
  const handleOnClick = () => {
    navigate("/createinvoice");
  };

  const signInWithUsernameAndPassword = (e) => {
    try{
      e.preventDefault();
      const auth = getAuth();
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed in
          const user = userCredential.user;
          navigate("/createinvoice");
  
          const code = auth?.currentUser?.email;
          const userName = auth?.currentUser?.displayName;
    
          localStorage.setItem("auth", "Logged In");
          localStorage.setItem("user", code);
          localStorage.setItem("userName", userName);
          // // ...
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;

          if(errorCode === 'auth/invalid-credential'){
            alert('username or password is invalid !!!');
           }
           return;
        });
    }
    catch(err){
       
    }
    
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);

      await signInWithPopup(auth, googleProvider);

      const code = auth?.currentUser?.email;
      const userName = auth?.currentUser?.displayName;

      localStorage.setItem("auth", "Logged In");
      localStorage.setItem("user", code);
      localStorage.setItem("userName", userName);

      //getPersonalData1(code);
      //getAccountData1(code);

      navigate("/createinvoice");

      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  const getPersonalData1 = async (loggedInUser) => {
    const data = await getPersonalData(loggedInUser);
    const personalInfo = data[0].personalInfo;

    FillLocalStorageForPersonal(personalInfo);
  };

  const FillLocalStorageForPersonal = (personalInfo) => {
    localStorage.setItem("name", personalInfo.name);
    localStorage.setItem("email", personalInfo.email);
    localStorage.setItem("address1", personalInfo.address1);
    localStorage.setItem("address2", personalInfo.address2);
    localStorage.setItem("address3", personalInfo.address3);
    localStorage.setItem("phone", personalInfo.phone);
  };

  const getAccountData1 = async (loggedInUser) => {
    const data = await getAccountData(loggedInUser);
    const accountInfo = data[0].accountInfo;

    FillLocalStorageForAccount(accountInfo);
  };

  const FillLocalStorageForAccount = (accountInfo) => {
    localStorage.setItem("accountName", accountInfo.accountName);
    localStorage.setItem("bankName", accountInfo.bankName);
    localStorage.setItem("accountNumber", accountInfo.accountNumber);
    localStorage.setItem("accountType", accountInfo.accountType);
    localStorage.setItem("ifsc", accountInfo.ifsc);
    localStorage.setItem("branch", accountInfo.branch);
    localStorage.setItem("pan", accountInfo.pan);
   // localStorage.setItem("upiId", accountInfo.upiId);
    //localStorage.setItem("upiType", accountInfo.upiType);
  };

  useEffect(() => {

    const loggedInUser = localStorage.getItem("user");
    if(loggedInUser){
        navigate('/createinvoice');
    }

    window.scroll(0,0);
  },[])

  return (
    <div className="bg-[#444] w-full m-auto h-full flex flex-col">
      <form onSubmit={signInWithUsernameAndPassword} className="px-10 py-4 mt-2 md:mt-10 gap-y-4 justify-center w-full md:w-[28%] mx-auto ">
        <h2 className="text-center font-semibold text-3xl text-white ">
          Log in to your account
        </h2>
        <h2 className="text-center text-xl mt-2 text-white ">
          Welcome back, we hope you're having a great day.
        </h2>
        <div className="bg-white mt-4 p-6 rounded-xl">
          <div>
            <div className="flex  flex-col ">
              <div className="text-xs font-medium leading-5  mt-2">Email</div>
              <input
                className="form-input block  text-xs rounded border border-gray-400 py-2 px-4 leading-5"
                required
                name="name"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
            </div>
          </div>
          <div>
            <div className="flex  flex-col ">
              <div className="text-xs font-medium  leading-5  mt-2">
                Password
              </div>
              <input
                className="form-input block text-xs rounded border border-gray-400 py-2 px-4 leading-5"
                required
                name="name"
                type="password"
                placeholder="*******"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
              />
            </div>
          </div>
          <div className="text-xs text-[#999999] mt-1">
            <NavLink to={"/forgotpassword"}>Forgot your password?</NavLink>
          </div>
          <button
            type="submit"
            className="w-full border-[1.4px]  text-white bg-[#444] py-2 px-6 font-semibold rounded-md mt-4 cursor-pointer "
          >
            Login
          </button>

          <div className="w-full  mx-auto">
            <button
              className="w-full flex justify-center items-center rounded-[8px] text-richblack-700 border border-richblack-700
            px-[12px] py-[8px] gap-x-2 mt-6 bg-yellow-300 hover:bg-green-300"
              onClick={signInWithGoogle}
            >
              <FcGoogle />
              <p>Sign in with Google</p>
            </button>
          </div>
          <button
            onClick={handleOnClick}
            className="w-full border-[1.4px] bg-[#E5E7EB] py-2 px-6 rounded-md mt-6 cursor-pointer "
          >
            Cancel
          </button>
        </div>
        <div className="flex justify-evenly gap-x-3 mt-3">
          <div className="text-white mt-2">Don't have an account?</div>
          <button
            onClick={handleSignup}
            className=" border-[1.4px] bg-[#E5E7EB] py-2 px-6 font-semibold rounded-md  cursor-pointer "
          >
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
