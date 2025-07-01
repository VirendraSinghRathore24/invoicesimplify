import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

import MobileMenu from "./MobileMenu";
import Header from "./Header";
import Loader from "./Loader";

function SMS() {
  const navigate = useNavigate();

  const location = useLocation();
  const [inputs, setInputs] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    try {
      setLoading(true);
      event.preventDefault();

      // Add to local storage
      // sending  info to next screen
      localStorage.setItem("additionalInfo", JSON.stringify(inputs));

      navigate("/additionalinfo");
      toast("Additional Info Saved Successfully !!!");
      setLoading(false);
    } catch (err) {
      alert(err);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleLogin = () => {
    const user = localStorage.getItem("user");

    if (!user || user === "undefined" || user === "null") {
      navigate("/login");
    }
  };

  useEffect(() => {
    handleLogin();
  }, []);
  return (
    <div>
      <div className="hidden lg:block">
        <Header />
      </div>
      <div className="hidden max-lg:block mb-16">
        <MobileMenu />
      </div>

      <div className="p2- lg:p-6">
        <div className="flex flex-col w-full mx-auto font-bold text-lg lg:text-2xl bg-gray-200 py-4 px-2 rounded-md">
          Configure SMS Message
        </div>

        <div className="flex flex-col w-full my-auto px-4 shadow-lg border-2 p-5 bg-white gap-y-4 rounded-md mt-4">
          <form
            onSubmit={handleSubmit}
            className="w-full mx-auto flex flex-col md:flex-row justify-between "
          >
            <div className="flex flex-col w-full mx-auto gap-y-6">
              <div>
                <textarea
                  className="form-input w-full block text-md text-start rounded border border-gray-400 py-2 px-4 leading-5 h-24 focus:text-gray-600"
                  name="sms"
                  type="text"
                  placeholder="Enter sms information"
                  value={inputs?.sms || ""}
                  onChange={(e) => {
                    localStorage.setItem("sms", e.target.value);
                    handleChange(e);
                  }}
                />
              </div>
              <div className="flex justify-evenly">
                <div className="rounded-md flex justify-between w-full mx-auto">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      {loading && <Loader />}
    </div>
  );
}

export default SMS;
