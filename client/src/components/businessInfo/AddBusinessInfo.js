import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import React, { use, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, storage } from "../../config/firebase";
import { toast } from "react-toastify";
import ImageUpload from "./ImageUpload";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import Header from "../Header";
import Loader from "../Loader";
import MobileMenu from "../MobileMenu";
import { BASIC_INFO, USERS } from "../Constant";

function AddBusinessInfo() {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({});
  const loggedInUser = localStorage.getItem("user");
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
      localStorage.setItem("businessInfo", JSON.stringify(inputs));
      await addBusinessData(inputs);

      alert("Business Info Saved Successfully !!!");

      setLoading(false);
    } catch (er) {
      console.log(er);
      setLoading(false);
    }
  };
  const basicInfo_CollectionRef = collection(doc(db, USERS, uid), BASIC_INFO);
  const addBusinessData = async (inputs) => {
    try {
      // get doc id
      const data = await getDocs(basicInfo_CollectionRef);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      const basicInfo = filteredData.filter(
        (x) => x.loggedInUser === loggedInUser
      )[0];

      // update business info
      await updateBusinessInfo(basicInfo.id, inputs);
      navigate("/businessInfo");
    } catch (err) {
      console.log(err);
    }
  };
  const delay = async (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };
  const updateBusinessInfo = async (id, businessInfo) => {
    try {
      const codeDoc = doc(db, USERS, uid, BASIC_INFO, id);

      // logo upload
      if (selectedFile) {
        const imageRef = ref(storage, `logo/${selectedFile.name}`);
        await uploadBytes(imageRef, selectedFile);

        const imageUrl1 = await getDownloadURL(imageRef);
        setImageUrl(imageUrl1);
      }

      await updateDoc(codeDoc, {
        businessInfo: businessInfo,
        imageUrl: imageUrl,
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
    const filteredData = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    const basicInfo = filteredData.filter(
      (x) => x.loggedInUser === loggedInUser
    );

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
    }
  };
  useEffect(() => {
    handleLogin();
    getInvoiceInfo();
  }, []);

  return (
    <div>
      <div className="hidden lg:block mb-12">
        <div className="top-0 mx-auto w-full h-[68px] text-white fixed bg-white shadow-lg">
          <div className="flex justify-between mx-auto font-bold text-md  py-4 px-2 rounded-md fixed w-[81.5%]">
            <div className="text-xl text-black">Business Information</div>
          </div>
        </div>
      </div>

      <div className="hidden max-lg:block mb-16">
        <MobileMenu />
      </div>

      <div className="flex flex-col  bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <main className="flex-grow container mx-auto px-4 py-10">
          <div className="max-w-10xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8">
            <div className="text-xl font-semibold mb-6 text-center">
              Add Business Information
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col gap-y-4 w-full md:w-7/12 mx-auto">
                <div className="flex flex-col text-sm">
                  <div className="font-medium leading-5 text-gray-700 mb-1">
                    Logo
                  </div>
                  <div>
                    <div className="border-[1.4px] w-[80px] h-[80px] rounded-md text-gray-600 cursor-pointer border-gray-400 p-4">
                      Upload Logo
                    </div>
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="text-sm font-medium leading-5 mb-1">
                    Title
                  </div>
                  <div>
                    <input
                      className="w-full dark:bg-gray-700 border border-gray-400 border-[1.4px] dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                      name="name"
                      placeholder="Enter business name"
                      value={inputs?.name || ""}
                      onChange={(e) => {
                        localStorage.setItem("name", e.target.value);
                        handleChange(e);
                      }}
                    />
                  </div>
                </div>
                <div className="flex w-full mx-auto justify-between gap-x-4 text-sm">
                  <div className="flex flex-col w-full">
                    <div className="font-medium leading-5 text-gray-700 mb-1">
                      Sub Title1
                    </div>
                    <div>
                      <input
                        className="w-full dark:bg-gray-700 border border-gray-400 border-[1.4px] dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        name="subTitle1"
                        placeholder="Business Desc"
                        value={inputs?.subTitle1 || ""}
                        onChange={(e) => {
                          localStorage.setItem("subTitle1", e.target.value);
                          handleChange(e);
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col w-full">
                    <div className="font-medium leading-5 text-gray-700 mb-1">
                      Sub Title2
                    </div>
                    <div>
                      <input
                        className="w-full dark:bg-gray-700 border border-gray-400 border-[1.4px] dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        name="subTitle2"
                        placeholder="Business Desc"
                        value={inputs?.subTitle2 || ""}
                        onChange={(e) => {
                          localStorage.setItem("subTitle2", e.target.value);
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
                  <div>
                    <textarea
                      className="w-full dark:bg-gray-700 border border-gray-400 border-[1.4px] dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      name="address"
                      placeholder="Enter business address"
                      value={inputs?.address || ""}
                      onChange={(e) => {
                        localStorage.setItem("address", e.target.value);
                        handleChange(e);
                      }}
                    />
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
                          required
                          value={inputs?.phonePrimary || ""}
                          onChange={(e) => handlePhoneChange(e)}
                          minLength={10}
                          maxLength={10}
                          placeholder="Mobile number..."
                        />
                      </div>
                    </div>

                    <div className="flex flex-col ">
                      <div className="font-bold leading-5 text-gray-700 mb-1">
                        Phone (Secondary)
                      </div>
                      <div className="flex justify-start items-left -ml-4">
                        <span className="p-[7px] bg-[#eee] border border-[#ccc] px-2 py-2 border-r-0 rounded-l font-normal text-md">
                          +91
                        </span>
                        <input
                          className="w-[120px] dark:bg-gray-700 border border-gray-400 border-[1.4px] px-4 py-2 dark:border-gray-600 pl-[10px] rounded-r focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          type="text"
                          name="phoneSecondary"
                          value={inputs?.phoneSecondary || ""}
                          onChange={(e) => handlePhoneChange(e)}
                          minLength={10}
                          maxLength={10}
                          placeholder="Mobile number..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col w-8/12">
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
                          localStorage.setItem("email", e.target.value);
                          handleChange(e);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="rounded-md flex justify-between gap-x-20 w-full mx-auto text-sm">
                    <button
                      type="button"
                      onClick={() => navigate("/businessinfo")}
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
  );
}

export default AddBusinessInfo;
