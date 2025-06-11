import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LoginFooter from "./LoginFooter";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleUpdatePassword = (e) => {
    try {
      e.preventDefault();
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
    } catch (err) {
      console.log(err);
    }
  };

  const handleSignup = () => {
    navigate("/login");
  };
  const handleOnClick = () => {
    navigate("/createinvoice");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow px-6 py-4 flex justify-between items-center">
        <NavLink
          to={"/"}
          className="text-2xl font-bold text-indigo-600 dark:text-white"
        >
          InvoiceSimplify
        </NavLink>
      </header>

      {/* Main Section */}
      <main className="flex-grow flex items-center justify-center px-4 py-10">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-center">
            Forgot Your Password?
          </h2>

          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
            Enter your email address and we’ll send you a reset link.
          </p>

          {submitted ? (
            <div className="text-center text-green-600 dark:text-green-400">
              ✅ A password reset link has been sent to <strong>{email}</strong>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold text-sm transition"
              >
                Send Reset Link
              </button>

              <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
                <NavLink
                  to={"/login"}
                  className="text-indigo-600 hover:underline"
                >
                  Back to Login
                </NavLink>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <LoginFooter />
    </div>
  );
};

export default ForgotPassword;
