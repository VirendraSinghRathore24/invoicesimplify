import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../config/firebase";
import { toast } from "react-toastify";
import Header from "../Header";
import MobileMenu from "../MobileMenu";
import Loader from "../Loader";
import { BASIC_INFO, USERS } from "../Constant";

function AddtionalInfo() {
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
      localStorage.setItem("additionalInfo", JSON.stringify(inputs));
      await addAdditionalData(inputs);
      navigate("/additionalinfo");
      alert("Additional Info Saved Successfully !!!");
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };
  const additionalInfo_CollectionRef = collection(
    doc(db, USERS, uid),
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
      const codeDoc = doc(db, USERS, uid, BASIC_INFO, id);
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
    let info1 = localStorage.getItem("additionalInfo");

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
    <div>
      <div className="hidden lg:block">
        <Header />
      </div>
      <div className="hidden max-lg:block mb-16">
        <MobileMenu />
      </div>

      <div className="p-2 lg:p-6">
        <div className="flex flex-col w-full mx-auto font-bold text-lg lg:text-2xl bg-gray-200 py-4 px-2 rounded-md">
          Edit Additional Information
        </div>

        <div className="flex flex-col w-full my-auto px-4 shadow-lg border-2 p-5 bg-white gap-y-4 rounded-md mt-4 text-sm">
          <form
            onSubmit={handleSubmit}
            className="w-full mx-auto flex flex-col md:flex-row justify-between "
          >
            <div className="flex flex-col w-full mx-auto gap-y-6">
              <div className="flex flex-col lg:flex-row gap-y-4 justify-between w-full mx-auto gap-x-8">
                <div className="flex flex-col gap-y-4 w-full mx-auto">
                  <div>Left Bottom Text</div>
                  <div>
                    <div>
                      <input
                        className="form-input w-full block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                        name="note1"
                        placeholder="Enter Notes"
                        value={inputs?.note1 || ""}
                        onChange={(e) => {
                          localStorage.setItem("note1", e.target.value);
                          handleChange(e);
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div>
                      <input
                        className="form-input w-full block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                        name="note2"
                        placeholder="Enter Notes"
                        value={inputs?.note2 || ""}
                        onChange={(e) => {
                          localStorage.setItem("note2", e.target.value);
                          handleChange(e);
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div>
                      <input
                        className="form-input w-full block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                        name="note3"
                        placeholder="Enter Notes"
                        value={inputs?.note3 || ""}
                        onChange={(e) => {
                          localStorage.setItem("note3", e.target.value);
                          handleChange(e);
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div>
                      <input
                        className="form-input w-full block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                        name="note4"
                        placeholder="Enter Notes"
                        value={inputs?.note4 || ""}
                        onChange={(e) => {
                          localStorage.setItem("note4", e.target.value);
                          handleChange(e);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-y-4 w-full  mx-auto">
                  <div>Middle Bottom Text</div>
                  <div>
                    <div>
                      <input
                        className="form-input w-full block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                        name="middlenote1"
                        placeholder="Enter Notes"
                        value={inputs?.middlenote1 || ""}
                        onChange={(e) => {
                          localStorage.setItem("middlenote1", e.target.value);
                          handleChange(e);
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div>
                      <input
                        className="form-input w-full block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                        name="middlenote2"
                        placeholder="Enter Notes"
                        value={inputs?.middlenote2 || ""}
                        onChange={(e) => {
                          localStorage.setItem("middlenote2", e.target.value);
                          handleChange(e);
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div>
                      <input
                        className="form-input w-full block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                        name="middlenote3"
                        placeholder="Enter Notes"
                        value={inputs?.middlenote3 || ""}
                        onChange={(e) => {
                          localStorage.setItem("middlenote3", e.target.value);
                          handleChange(e);
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div>
                      <input
                        className="form-input w-full block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                        name="middlenote4"
                        placeholder="Enter Notes"
                        value={inputs?.middlenote4 || ""}
                        onChange={(e) => {
                          localStorage.setItem("middlenote4", e.target.value);
                          handleChange(e);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-y-4 w-full mx-auto">
                  <div>Right Bottom Text</div>
                  <div>
                    <div>
                      <input
                        className="form-input w-full block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                        name="rnote1"
                        placeholder="Enter Notes"
                        value={inputs?.rnote1 || ""}
                        onChange={(e) => {
                          localStorage.setItem("rnote1", e.target.value);
                          handleChange(e);
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div>
                      <input
                        className="form-input w-full block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                        name="rnote2"
                        placeholder="Enter Notes"
                        value={inputs?.rnote2 || ""}
                        onChange={(e) => {
                          localStorage.setItem("rnote2", e.target.value);
                          handleChange(e);
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div>
                      <input
                        className="form-input w-full block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                        name="rnote3"
                        placeholder="Enter Notes"
                        value={inputs?.rnote3 || ""}
                        onChange={(e) => {
                          localStorage.setItem("rnote3", e.target.value);
                          handleChange(e);
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div>
                      <input
                        className="form-input w-full block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                        name="rnote4"
                        placeholder="Enter Notes"
                        value={inputs?.rnote4 || ""}
                        onChange={(e) => {
                          localStorage.setItem("rnote4", e.target.value);
                          handleChange(e);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

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
                    onClick={() => navigate("/additionalinfo")}
                    className="px-5 py-2 rounded-md border border-gray-500 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
                  >
                    Update Changes
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

export default AddtionalInfo;
