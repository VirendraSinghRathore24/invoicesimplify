import React, { useEffect, useState } from "react";
import { auth, db, googleProvider } from "../../config/firebase";

import { useNavigate } from "react-router-dom";

import { FcGoogle } from "react-icons/fc";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  getAuth,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { addDoc, collection, getDocs } from "firebase/firestore";
import AddtionalInfo from "../businessInfo/AddtionalInfo";

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");

  const handleLogin = () => {
    navigate("/login");
  };
  const handleOnClick = () => {
    navigate("/createinvoice");
  };

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
  const sendEmailForVerify = (auth) => {
    sendEmailVerification(auth.currentUser).then(() => {
      console.log("Email verification sent!");
      // Email verification sent!
      // ...
    });
  };
  const createUserWithUsernameAndPassword = async (e) => {
    try {
      e.preventDefault();
      const auth = getAuth();
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed up
          const user = userCredential.user;

          navigate("/createinvoice");

          updateUserProfile(auth);

          // not adding as of now for verification
          //sendEmailForVerify(auth);

          const code = auth?.currentUser?.email;
          const userName = auth?.currentUser?.displayName;

          localStorage.setItem("auth", "Logged In");
          localStorage.setItem("user", code);
          localStorage.setItem("userName", userName);

          // ...
        })
        .catch((error) => {
          if (error.code === "auth/email-already-in-use") {
            alert(email + " already in use, Please login!!!");
          } else {
            if (error.code === "auth/weak-password") {
              alert("Password should be alteast 6 character long !!!");
            }
          }
        });
    } catch (err) {}
  };

  const login_CollectionRef = collection(db, "Login_Info");
  const basicInfo_CollectionRef = collection(db, "Basic_Info");
  const inventoryInfo_CollectionRef = collection(db, "Inventory_Info");
  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      const code = auth?.currentUser?.email;
      const userName = auth?.currentUser?.displayName;

      // 1. check if it is existing user

      const result = await getExistingUser(code);

      if (result === undefined) {
        // 2. it is new user
        const orgCode = Math.random().toString(36).slice(2);

        await addDoc(login_CollectionRef, {
          orgCode: orgCode,
          code: code,
          userName: userName,
          invoiceNumber: 1,
          type: "poshak"
        });

        // also create db for business, tax and additional info
        await addDoc(basicInfo_CollectionRef, {
          businessInfo: null,
          taxInfo: null,
          additionalInfo: null,
          loggedInUser: code,
        });

        // initialize inventory info
        await addDoc(inventoryInfo_CollectionRef, {
            orgCode: orgCode,
            loggedInUser: code,
            inventory: []
          });

      } else {
        return;
      }
      // check orgCode with DB

      localStorage.setItem("auth", "Logged In");
      localStorage.setItem("user", code);
      localStorage.setItem("userName", userName);
      localStorage.setItem("invoiceNumber", 1);
      navigate("/createinvoice");
    } catch (err) {
      console.log(err);
    }
  };

  const getExistingUser = async (loggedInUser) => {
    const loginCollectionRef = collection(db, "Login_Info");

    const data = await getDocs(loginCollectionRef);
    const filteredData = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    const userCode = filteredData.filter((x) => x.code === loggedInUser)[0];
    return userCode;
  };

  useEffect(() => {
    window.scroll(0, 0);
  }, []);
  return (
    <div className="bg-[#444] w-full mx-auto h-full flex flex-col">
      <form
        onSubmit={createUserWithUsernameAndPassword}
        className="px-10 py-4 mt-2 md:mt-10 gap-y-4 justify-center w-full md:w-[28%] mx-auto "
      >
        <h2 className="text-center font-semibold text-3xl text-white ">
          Sign Up
        </h2>
        <h2 className="text-center text-xl mt-2 text-white ">
          You're a few seconds away from your Invoice account!
        </h2>
        <div className="bg-white mt-4 p-6 rounded-xl">
          <div>
            <div className="flex  flex-col ">
              <div className="text-xs font-medium leading-5  mt-2">
                First Name
              </div>
              <input
                className="form-input block  text-xs rounded border border-gray-400 py-2 px-4 leading-5"
                required
                name="name"
                type="text"
                placeholder="Virendra"
                value={firstname}
                onChange={(e) => {
                  setFirstname(e.target.value);
                }}
              />
            </div>
          </div>
          <div>
            <div className="flex  flex-col ">
              <div className="text-xs font-medium  leading-5  mt-2">
                Last Name
              </div>
              <input
                className="form-input block text-xs rounded border border-gray-400 py-2 px-4 leading-5"
                required
                name="lastname"
                type="text"
                placeholder="Singh"
                value={lastname}
                onChange={(e) => {
                  setLastname(e.target.value);
                }}
              />
            </div>
          </div>
          <div>
            <div className="flex  flex-col ">
              <div className="text-xs font-medium leading-5  mt-2">Email</div>
              <input
                className="form-input block  text-xs rounded border border-gray-400 py-2 px-4 leading-5"
                required
                name="email"
                type="email"
                placeholder="name@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
            </div>
          </div>
          <div>
            <div className="flex  flex-col ">
              <div className="text-xs font-medium leading-5  mt-2">
                Password
              </div>
              <input
                className="form-input block  text-xs rounded border border-gray-400 py-2 px-4 leading-5"
                required
                name="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full border-[1.4px]  text-white bg-[#444] font-medium py-2 px-6 rounded-md mt-4 cursor-pointer "
          >
            Sign Up
          </button>
          <div className="w-full  mx-auto">
            <button
              className="w-full flex justify-center items-center rounded-[8px] font-medium text-richblack-700 border border-richblack-700
            px-[12px] py-[8px] gap-x-2 mt-6 bg-yellow-300 hover:bg-green-300"
              onClick={signInWithGoogle}
            >
              <FcGoogle />
              <p>Sign in with Google</p>
            </button>
          </div>
          <button
            onClick={handleOnClick}
            className="w-full border-[1.4px] bg-[#E5E7EB] py-2 px-6 font-medium rounded-md mt-6 cursor-pointer "
          >
            Cancel
          </button>
        </div>
        <div className="flex justify-evenly gap-x-3 mt-3">
          <div className="text-white mt-2">Already have an account?</div>
          <button
            onClick={handleLogin}
            className=" border-[1.4px] bg-[#E5E7EB] py-2 px-6 font-semibold rounded-md  cursor-pointer "
          >
            Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default Signup;
