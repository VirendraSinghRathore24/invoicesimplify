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

function EditTaxInfo() {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({});
  const [saving, setSaving] = useState(false);

  const [loading, setLoading] = useState(false);

  const uid = localStorage.getItem("uid");

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs((values) => ({ ...values, [name]: value }));
  };

  const handleSubmit = async (event) => {
    try {
      setLoading(true);

      event.preventDefault();

      // Add to local storage
      localStorage.setItem("creator_taxInfo", JSON.stringify(inputs));
      await addPersonalData(inputs);
      setLoading(false);

      alert("Tax Info Saved Successfully !!!");
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
      navigate("/creator/taxinfo");
    } catch (err) {
      console.log(err);
    }
  };
  const delay = async (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };
  const updatePersonalInfo = async (id, taxInfo) => {
    try {
      const codeDoc = doc(db, CREATORS, uid, BASIC_INFO, id);

      await updateDoc(codeDoc, {
        taxInfo: taxInfo,
      });
      setSaving(true);
      await delay(2000);
      setSaving(false);
    } catch (er) {
      console.log(er);
    }
  };

  const handleLogin = () => {
    const user = localStorage.getItem("user");

    if (!user || user === "undefined" || user === "null") {
      navigate("/login");
      return;
    }
  };

  const isValidGST = (value) => {
    // Allow empty (for backspace)
    if (value === "") return true;

    // Regex: 0–100 with max 2 decimals
    const regex = /^(100(\.00?)?|(\d{1,2})(\.\d{0,2})?)$/;

    return regex.test(value);
  };
  useEffect(() => {
    handleLogin();
    let info1 = localStorage.getItem("creator_taxInfo");
    setInputs(JSON.parse(info1));
  }, []);

  return (
    <div className="">
      <div className="lg:left-64 right-0 top-0 left-0 lg:fixed bg-white">
        <div className="hidden lg:block">
          <div className="top-0 mx-auto w-full h-[64px] text-white border-b-2">
            <div className="font-bold text-md py-4 px-2 rounded-md ">
              <div className="text-xl text-black">Tax Information</div>
            </div>
          </div>
        </div>

        <div className="hidden max-lg:block mb-16">
          <CreatorMobileMenu />
        </div>

        <div className="flex flex-col  bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 ">
          <main className="flex-grow container mx-auto px-1 py-2 scroll-y-auto h-[96.7%]">
            <div className="max-w-10xl mx-auto bg-white dark:bg-gray-800 rounded-xl p-2">
              <div className="text-xl font-semibold mb-6 text-center">
                Edit Tax Information
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col gap-y-4 w-full md:w-7/12 mx-auto">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium leading-5 mb-1">
                      GSTIN
                    </div>
                    <div>
                      <input
                        className="w-full dark:bg-gray-700 border border-gray-400 border-[1.4px] dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                        name="gstin"
                        placeholder="Enter gstin"
                        value={inputs?.gstin || ""}
                        onChange={(e) => {
                          localStorage.setItem("creator_gstin", e.target.value);
                          handleChange(e);
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col text-sm">
                    <div className="font-medium leading-5 text-gray-700 mb-1">
                      %
                    </div>
                    <div className="flex flex-col gap-y-3">
                      <input
                        className="w-full dark:bg-gray-700 border border-gray-400 border-[1.4px] dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        name="gstpercentage"
                        placeholder="Enter GST %"
                        inputMode="decimal"
                        min={0}
                        max={100}
                        value={inputs?.gstpercentage || ""}
                        onChange={(e) => {
                          const value = e.target.value;

                          // Allow only valid GST %
                          if (!isValidGST(value)) return;

                          localStorage.setItem("creator_gstpercentage", value);
                          handleChange(e);
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="rounded-md flex justify-between gap-x-20 w-full mx-auto text-sm">
                      <button
                        type="button"
                        onClick={() => navigate("/creator/taxinfo")}
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
                            <div>Update</div>
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

export default EditTaxInfo;
