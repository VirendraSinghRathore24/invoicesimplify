import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const handleUpdatePassword = () => {
    const auth = getAuth();

    sendPasswordResetEmail(auth, email)
      .then(() => {
        toast("Password reset email sent, Please check your email !!!", {
          position: "top-center",
        });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
      });
  };

  const handleSignup = () => {
    navigate("/login");
  };
  const handleOnClick = () => {
    navigate("/createinvoice");
  };

  return (
    <div className="bg-[#444] w-full mx-auto h-full flex flex-col">
      <div className="px-10 py-4 mt-2 md:mt-10 gap-y-4 justify-center w-full md:w-[28%] mx-auto ">
        <h2 className="text-center font-semibold text-3xl text-white ">
          Reset your password
        </h2>
        <h2 className="text-center text-xl mt-2 text-white ">
          Enter your email and we'll send you a link to change your password.
        </h2>
        <div className="bg-white mt-4 p-6 rounded-xl">
          <div>
            <div className="flex  flex-col ">
              <div className="text-xs font-medium leading-5 mt-2">Email</div>
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

          <button
            onClick={handleUpdatePassword}
            className="w-full border-[1.4px] text-white bg-[#444] py-2 px-6  rounded-md mt-4 cursor-pointer "
          >
            Reset your Password
          </button>

          <button
            onClick={handleOnClick}
            className="w-full border-[1.4px] bg-[#E5E7EB] py-2 px-6 font-semibold rounded-md mt-6 cursor-pointer "
          >
            Cancel
          </button>
        </div>
        <div className="flex justify-evenly gap-x-3 mt-3">
          <div className="text-white mt-2">Got your password?</div>
          <button
            onClick={handleSignup}
            className=" border-[1.4px] bg-[#E5E7EB] py-2 px-6 font-semibold rounded-md  cursor-pointer "
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
