import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import React, { use, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, storage } from "../../config/firebase";

import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import Header from "../Header";
import Loader from "../Loader";
import MobileMenu from "../MobileMenu";
import { BASIC_INFO, CREATORS, PERSONAL_INFO, USERS } from "../Constant";
import CreatorMobileMenu from "./CreatorMobileMenu";

function AddPersonalInfo() {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({});
  const [saving, setSaving] = useState(false);
  const [avatarURL, setAvatarURL] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const uid = localStorage.getItem("uid");

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs((values) => ({ ...values, [name]: value }));
  };

  const handlePhoneChange = (event) => {
    const { name, value } = event.target;
    if (/^\d{0,10}$/.test(value)) {
      // Allow only numeric values up to 10 digits
      setInputs((values) => ({ ...values, [name]: value }));
      localStorage.setItem(name, value);
    }
  };

  const handleSubmit = async (event) => {
    try {
      setLoading(true);

      event.preventDefault();

      // Add to local storage
      localStorage.setItem("creator_personalInfo", JSON.stringify(inputs));
      await addPersonalData(inputs);
      setLoading(false);

      alert("Business Info Saved Successfully !!!");
      navigate("/creator/personalinfo");
    } catch (er) {
      console.log(er);
      setLoading(false);
    }
  };
  const basicInfo_CollectionRef = collection(
    doc(db, CREATORS, uid),
    BASIC_INFO
  );
  const addPersonalData = async (inputs) => {
    try {
      // get doc id
      const data = await getDocs(basicInfo_CollectionRef);
      const basicInfo = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      // update business info
      await updatePersonalInfo(basicInfo[0].id, inputs);
      //navigate("/businessInfo");
    } catch (err) {
      console.log(err);
    }
  };
  const delay = async (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };
  const updatePersonalInfo = async (id, personalInfo) => {
    try {
      const codeDoc = doc(db, CREATORS, uid, BASIC_INFO, id);

      await updateDoc(codeDoc, {
        personalInfo: personalInfo,
      });
      setSaving(true);
      await delay(2000);
      setSaving(false);
    } catch (er) {
      console.log(er);
    }
  };

  const getInvoiceInfo = async () => {
    const data = await getDocs(basicInfo_CollectionRef);
    const basicInfo = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    if (basicInfo?.length > 0) {
      localStorage.setItem(
        "businessInfo",
        JSON.stringify(basicInfo[0].businessInfo)
      );
    }

    return basicInfo;
  };

  const handleLogin = () => {
    const user = localStorage.getItem("user");

    if (!user || user === "undefined" || user === "null") {
      navigate("/login");
      return;
    }
  };
  useEffect(() => {
    handleLogin();
    getInvoiceInfo();
  }, []);

  return (
    <div className="">
      <div className="lg:left-64 right-0 top-0 left-0 lg:fixed bg-white">
        <div className="hidden lg:block">
          <div className="top-0 mx-auto w-full h-[64px] text-white border-b-2">
            <div className="font-bold text-md py-4 px-2 rounded-md">
              <div className="text-xl text-black">Personal Information</div>
            </div>
          </div>
        </div>

        <div className="hidden max-lg:block mb-16">
          <CreatorMobileMenu />
        </div>

        <div className="flex flex-col bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 ">
          <main className="flex-grow container mx-auto px-1 py-2 scroll-y-auto h-[96.7%]">
            <div className="max-w-10xl mx-auto bg-white dark:bg-gray-800 rounded-xl p-2">
              <div className="text-xl font-semibold mb-6 text-center">
                Add Personal Information
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col gap-y-4 w-full md:w-7/12 mx-auto">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium leading-5 mb-1">
                      Name
                    </div>
                    <div>
                      <input
                        className="w-full dark:bg-gray-700 border border-gray-400 border-[1.4px] dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                        name="name"
                        placeholder="Enter name"
                        value={inputs?.name || ""}
                        onChange={(e) => {
                          localStorage.setItem("creator_name", e.target.value);
                          handleChange(e);
                        }}
                      />
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
                        placeholder="Enter your address"
                        value={inputs?.address || ""}
                        onChange={(e) => {
                          localStorage.setItem(
                            "creator_address",
                            e.target.value
                          );
                          handleChange(e);
                        }}
                      />
                      <input
                        className="w-full dark:bg-gray-700 border border-gray-400 border-[1.4px] dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        name="address1"
                        placeholder="Enter your address"
                        value={inputs?.address1 || ""}
                        onChange={(e) => {
                          localStorage.setItem(
                            "creator_address1",
                            e.target.value
                          );
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
                            localStorage.setItem(
                              "creator_address2",
                              e.target.value
                            );
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
                            localStorage.setItem(
                              "creator_address3",
                              e.target.value
                            );
                            handleChange(e);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col text-sm lg:flex-row w-full gap-y-3 mx-auto justify-between gap-x-4">
                    <div className="flex flex-col lg:flex-row w-full gap-y-3 lg:w-6/12 gap-x-4">
                      <div className="flex flex-col ">
                        <div className="font-bold leading-5 text-gray-700 mb-1">
                          Phone (Primary)
                        </div>
                        <div className="flex justify-start items-left -ml-4">
                          <span className="p-[7px] p-2 bg-[#eee] border border-[#ccc] border-r-0 rounded-l font-normal text-md">
                            +91
                          </span>
                          <input
                            className=" w-[120px] dark:bg-gray-700 border border-gray-400 border-[1.4px] px-4 py-2 dark:border-gray-600 pl-[10px] rounded-r focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            type="text"
                            name="phonePrimary"
                            value={inputs?.phonePrimary || ""}
                            onChange={(e) => handlePhoneChange(e)}
                            minLength={10}
                            maxLength={10}
                            placeholder="Mobile number..."
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col text-sm lg:flex-row w-full gap-y-3 mx-auto justify-between gap-x-4">
                      <div className="flex flex-col w-full">
                        <div className="font-medium leading-5 text-gray-700 mb-1">
                          Email
                        </div>
                        <div>
                          <input
                            className="w-full dark:bg-gray-700 border border-gray-400 border-[1.4px] dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            name="email"
                            type="email"
                            placeholder="Enter email"
                            value={inputs?.email || ""}
                            onChange={(e) => {
                              localStorage.setItem(
                                "creator_email",
                                e.target.value
                              );
                              handleChange(e);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="text-sm font-medium leading-5 mb-1">
                      Social Media Account
                    </div>
                    <div>
                      <input
                        className="w-full dark:bg-gray-700 border border-gray-400 border-[1.4px] dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        name="socialMedia"
                        placeholder="instagram link"
                        value={inputs?.socialMedia || ""}
                        onChange={(e) => {
                          localStorage.setItem(
                            "creator_socialMedia",
                            e.target.value
                          );
                          handleChange(e);
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="rounded-md flex justify-between gap-x-20 w-full mx-auto text-sm">
                      <button
                        type="button"
                        onClick={() => navigate("/creator/personalinfo")}
                        className="px-5 py-2 rounded-md border border-gray-500 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition text-center"
                      >
                        <span className="flex items-center gap-1">
                          {saving ? (
                            <div className=" flex justify-center w-full mx-auto py-2 gap-x-3">
                              <div className="h-3 w-3 bg-[#d6f539] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                              <div className="h-3 w-3 bg-[#d6f539] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                              <div className="h-3 w-3 bg-[#d6f539] rounded-full animate-bounce"></div>
                            </div>
                          ) : (
                            <div>Save</div>
                          )}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </main>
        </div>
        {loading && <Loader />}
      </div>
    </div>
  );
}

export default AddPersonalInfo;
