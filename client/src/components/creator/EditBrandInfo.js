// Modal.js

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "../Loader";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { CREATORS } from "../Constant";
import CreatorMobileMenu from "./CreatorMobileMenu";

const EditBrandInfo = () => {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({});
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs((values) => ({ ...values, [name]: value }));
  };

  const handleLogin = () => {
    const user = localStorage.getItem("user");

    if (!user || user === "undefined" || user === "null") {
      navigate("/login");
      return;
    }
  };

  const handleUpdate = async () => {
    try {
      if (!inputs.customerName) {
        alert("Please enter Brand/Agency Name !!!");
        return;
      }

      setLoading(true);
      const codeDoc = doc(
        db,
        CREATORS,
        localStorage.getItem("uid"),
        "Brand_Info",
        location.state.post.id
      );
      await updateDoc(codeDoc, {
        customerInfo: inputs,
      });
      setLoading(false);
      alert("Brand information updated successfully!");
      navigate("/creator/brands");
    } catch (er) {
      console.log(er);
      setLoading(false);
    }
  };

  useEffect(() => {
    handleLogin();

    const post = location.state.post;
    setInputs(post.customerInfo);
  }, []);

  return (
    <div className="">
      <div className="lg:left-64 right-0 top-0 left-0 lg:fixed bg-white">
        <div className="hidden lg:block top-0 mx-auto w-full h-[64px] text-white fixed border-b-2">
          <div className="flex justify-between mx-auto font-bold text-md py-4 px-2 rounded-lg ">
            <div className="text-xl text-black">Brands/Agencies</div>
          </div>
        </div>
        <div className="flex justify-center items-center w-full mx-auto mt-16">
          <div className="hidden max-lg:block mb-16">
            <CreatorMobileMenu />
          </div>
          <div className="mt-16 lg:mt-0 bg-white p-4 text-black rounded-xl w-full">
            <div className="flex flex-col lg:flex-row justify-between gap-x-2 w-full mx-auto">
              <div className="flex flex-col w-full lg:w-6/12 mx-auto justify-start items-left mt-16 lg:mt-4  border-[1.2px] p-2 lg:p-5 bg-white gap-y-2 lg:gap-y-4 rounded-md">
                <div className="flex flex-col justify-start items-left gap-y-0 lg:gap-y-4 ">
                  <div className="flex justify-between">
                    <div className="text-md lg:text-lg text-gray-600 font-medium">
                      Brand Information
                    </div>
                  </div>

                  <div className="flex flex-col justify-start items-left">
                    <div className="text-[13px] font-bold leading-5 mt-2">
                      Name
                    </div>
                    <div>
                      <input
                        className="form-input w-full lg:w-8/12 block font-semibold text-[13px] rounded border border-gray-400 p-2 leading-5 "
                        required
                        name="customerName"
                        placeholder="Enter Brand/Agency Name"
                        value={inputs?.customerName}
                        onChange={(e) => {
                          handleChange(e);
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col w-full">
                    <div className="text-[13px] font-bold leading-5 mt-2">
                      Product Name
                    </div>
                    <div>
                      <input
                        className="form-input w-full lg:w-8/12 block font-semibold text-[13px] rounded border border-gray-400 p-2 leading-5 "
                        required
                        name="productName"
                        placeholder="Enter Product Name"
                        value={inputs?.productName}
                        onChange={(e) => {
                          handleChange(e);
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col text-sm">
                  <div className="font-medium leading-5 text-gray-700 mb-1">
                    Address
                  </div>
                  <div className="flex flex-col gap-y-3">
                    <input
                      className="w-full dark:bg-gray-700 border border-gray-400 border-[1.4px] dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      name="address"
                      placeholder="Enter Brand address"
                      value={inputs?.address || ""}
                      onChange={(e) => {
                        handleChange(e);
                      }}
                    />
                    <input
                      className="w-full dark:bg-gray-700 border border-gray-400 border-[1.4px] dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      name="address1"
                      placeholder="Enter address"
                      value={inputs?.address1 || ""}
                      onChange={(e) => {
                        handleChange(e);
                      }}
                    />
                    <div className="flex gap-x-3 justify-between">
                      <input
                        className="w-8/12 dark:bg-gray-700 border border-gray-400 border-[1.4px] dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        name="address2"
                        placeholder="City, State"
                        value={inputs?.address2 || ""}
                        onChange={(e) => {
                          handleChange(e);
                        }}
                      />
                      <input
                        className="w-3/12 dark:bg-gray-700 border border-gray-400 border-[1.4px] dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        name="address3"
                        placeholder="Zip Code"
                        maxLength={6}
                        value={inputs?.address3 || ""}
                        onChange={(e) => {
                          handleChange(e);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between gap-x-4">
                  <div className="flex flex-col justify-start items-left w-full">
                    <div className="text-[13px] font-bold leading-5 mt-2">
                      Email
                    </div>
                    <div>
                      <input
                        className="form-input w-full block font-semibold text-[13px] rounded border border-gray-400 p-2 leading-5 "
                        required
                        name="customerEmail"
                        placeholder="Enter Brand Email"
                        value={inputs?.customerEmail}
                        onChange={(e) => {
                          handleChange(e);
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col ">
                    <div className="text-[13px] font-bold leading-5 mt-2">
                      Mobile
                    </div>
                    <div className="flex justify-start items-left -ml-4">
                      <span className="p-[8px] bg-[#eee] border border-[#ccc] border-r-0 rounded-l font-medium text-[13px]">
                        +91
                      </span>
                      <input
                        className="p-[5px] pl-[10px] border border-[#ccc] rounded-r text-[13px] text-left"
                        type="text"
                        name="customerPhone"
                        value={inputs?.customerPhone}
                        onChange={(e) => {
                          handleChange(e);
                        }}
                        minLength={10}
                        maxLength={10}
                        placeholder="Mobile number..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col w-full lg:w-6/12 mx-auto justify-start items-left mt-16 lg:mt-4  border-[1.2px] p-2 lg:p-5 bg-white gap-y-2 lg:gap-y-4 rounded-md">
                <div className="flex flex-col justify-start items-left gap-y-0 lg:gap-y-4 ">
                  <div className="flex flex-col justify-start items-left">
                    <div className="text-[13px] font-bold leading-5 mt-2">
                      GST #
                    </div>
                    <div>
                      <input
                        className="form-input w-full lg:w-6/12 block font-semibold text-[13px] rounded border border-gray-400 p-2 leading-5 "
                        required
                        name="gst"
                        placeholder="Enter GST Number"
                        value={inputs?.gst}
                        onChange={(e) => {
                          handleChange(e);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-start items-left">
                  <div className="text-[13px] font-bold leading-5 mt-2">
                    PAN #
                  </div>
                  <div>
                    <input
                      className="form-input w-full lg:w-6/12 block font-semibold text-[13px] rounded border border-gray-400 p-2 leading-5 "
                      required
                      name="pan"
                      placeholder="Enter PAN Number"
                      value={inputs?.pan}
                      onChange={(e) => {
                        handleChange(e);
                      }}
                    />
                  </div>
                </div>
                <div className="flex flex-col text-sm">
                  <div className="font-medium leading-5 text-gray-700 mb-1">
                    TIN #
                  </div>
                  <div className="flex flex-col gap-y-3">
                    <input
                      className="w-full lg:w-6/12 dark:bg-gray-700 border border-gray-400 border-[1.4px] dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      name="tin"
                      placeholder="Enter TIN Number"
                      value={inputs?.tin || ""}
                      onChange={(e) => {
                        handleChange(e);
                      }}
                    />
                  </div>
                </div>
                <div className="flex flex-col text-sm">
                  <div className="font-medium leading-5 text-gray-700 mb-1">
                    CIN #
                  </div>
                  <div className="flex flex-col gap-y-3">
                    <input
                      className="w-full lg:w-6/12 dark:bg-gray-700 border border-gray-400 border-[1.4px] dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      name="cin"
                      placeholder="Enter CIN Number"
                      value={inputs?.cin || ""}
                      onChange={(e) => {
                        handleChange(e);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="rounded-md flex justify-between gap-x-20 w-full mx-auto text-sm mt-4">
                <button
                  type="button"
                  onClick={() => navigate("/creator/brands")}
                  className="px-5 py-2 rounded-md border border-gray-500 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={() => handleUpdate()}
                  className="px-5 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition text-center"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
          {loading && <Loader />}
        </div>
      </div>
    </div>
  );
};

export default EditBrandInfo;
