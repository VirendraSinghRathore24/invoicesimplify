import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../config/firebase";
import { toast } from "react-toastify";
import Header from "../Header";
import MobileMenu from "../MobileMenu";
import Loader from "../Loader";
import { BASIC_INFO, CREATORS, USERS } from "../Constant";
import CreatorMobileMenu from "./CreatorMobileMenu";

function AddCreatorAddtionalInfo() {
  const navigate = useNavigate();

  const location = useLocation();
  const [inputs, setInputs] = useState({});
  const [loading, setLoading] = useState(false);
  const uid = localStorage.getItem("uid");

  const handleSubmit = async (event) => {
    try {
      setLoading(true);
      event.preventDefault();

      // Add to local storage
      // sending  info to next screen
      localStorage.setItem("creator_additionalInfo", JSON.stringify(inputs));
      await addAdditionalData(inputs);
      navigate("/creator/creatoradditionalinfo");
      alert("Additional Info Saved Successfully !!!");
      setLoading(false);
    } catch (err) {
      alert(err);
      setLoading(false);
    }
  };
  const additionalInfo_CollectionRef = collection(
    doc(db, CREATORS, uid),
    BASIC_INFO
  );
  const addAdditionalData = async (inputs) => {
    try {
      // get doc id
      const data = await getDocs(additionalInfo_CollectionRef);
      const basicInfo = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      // update business info
      await updateAdditionalInfo(basicInfo[0].id, inputs);
    } catch (err) {
      console.log(err);
    }
  };

  const updateAdditionalInfo = async (id, additionalInfo) => {
    try {
      const codeDoc = doc(db, CREATORS, uid, BASIC_INFO, id);
      await updateDoc(codeDoc, {
        additionalInfo: additionalInfo,
      });
    } catch (er) {
      console.log(er);
    }
  };
  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs((values) => ({ ...values, [name]: value }));
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleLogin = () => {
    const user = localStorage.getItem("user");

    if (!user || user === "undefined" || user === "null") {
      navigate("/login");
    }
  };

  useEffect(() => {
    handleLogin();
    let info1 = localStorage.getItem("creator_additionalInfo");

    if (info1 === "undefined" || info1 === null) {
      info1 = JSON.stringify({
        note1: "",
        note2: "",
        note3: "",
        note4: "",
      });
    }
    setInputs(JSON.parse(info1));
  }, []);
  return (
    <div className="flex justify-evenly w-full h-full">
      <div className="w-full lg:w-[82%] ml-0 lg:ml-[17%] lg:border-2 my-3 rounded-lg lg:border-gray-300 lg:bg-white lg:shadow-lg top-0 lg:fixed h-[96.7%]">
        <div className="hidden lg:block">
          <div className="top-0 mx-auto w-full h-[68px] text-white border-b-2">
            <div className="font-bold text-md py-4 px-2 rounded-md w-[82%]">
              <div className="text-xl text-black">Additional Information</div>
            </div>
          </div>
        </div>
        <div className="hidden max-lg:block mb-16">
          <CreatorMobileMenu />
        </div>

        <div className="p-2">
          <div className="flex flex-col w-full my-auto px-4 shadow-lg border-2 p-5 bg-white gap-y-4 rounded-md mt-4 text-sm">
            <form
              onSubmit={handleSubmit}
              className="w-full mx-auto flex flex-col md:flex-row justify-between "
            >
              <div className="flex flex-col w-full mx-auto gap-y-6">
                <div>
                  <textarea
                    className="form-input w-full block text-xs text-start rounded border border-gray-400 py-2 px-4 leading-5 h-24 focus:text-gray-600"
                    name="additionaldesc"
                    type="text"
                    placeholder="Enter additional information"
                    value={inputs?.additionaldesc || ""}
                    onChange={(e) => {
                      localStorage.setItem("additionaldesc", e.target.value);
                      handleChange(e);
                    }}
                  />
                </div>
                <div className="flex justify-evenly">
                  <div className="rounded-md flex justify-between w-full mx-auto">
                    <button
                      type="button"
                      onClick={() => navigate("/creator/creatoradditionalinfo")}
                      className="px-5 py-2 rounded-md border border-gray-500 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                    >
                      Cancel
                    </button>
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
    </div>
  );
}

export default AddCreatorAddtionalInfo;
