import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { db } from "../../config/firebase";
import MobileMenu from "../MobileMenu";
import Loader from "../Loader";
import { BASIC_INFO, USERS } from "../Constant";

function EditTaxInfo() {
  const [inputs, setInputs] = useState({});
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState("tax");

  const uid = localStorage.getItem("uid");

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    try {
      setLoading(true);
      event.preventDefault();

      // Add to local storage
      inputs.taxType = selected;
      localStorage.setItem("taxInfo", JSON.stringify(inputs));
      await addTaxData(inputs);

      alert("Tax Info Saved Successfully !!!");
      navigate("/taxinfo");

      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };
  const basicInfo_CollectionRef = collection(doc(db, USERS, uid), BASIC_INFO);
  const addTaxData = async (inputs) => {
    try {
      // get doc id
      const data = await getDocs(basicInfo_CollectionRef);
      const basicInfo = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      // update business info
      await updateTaxInfo(basicInfo[0].id, inputs);
    } catch (err) {
      console.log(err);
    }
  };

  const updateTaxInfo = async (id, taxInfo) => {
    try {
      const codeDoc = doc(db, USERS, uid, BASIC_INFO, id);
      await updateDoc(codeDoc, {
        taxInfo: taxInfo,
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

  useEffect(() => {
    let info1 = localStorage.getItem("taxInfo");
    if (info1 === "undefined") {
      info1 = JSON.stringify({
        gstNumber: "",
        cgstAmount: "",
        sgstAmount: "",
        igstAmount: "",
        ugstAmount: "",
        taxAmount: "",
      });
    }
    const taxData = JSON.parse(info1);
    setInputs(taxData);
    setSelected(taxData.taxType);
  }, []);

  return (
    <div>
      <div className="hidden lg:block mb-12">
        <div className="top-0 mx-auto w-full h-[68px] text-white fixed bg-white shadow-lg">
          <div className="flex justify-between mx-auto font-bold text-md  py-4 px-2 rounded-md fixed w-[81.5%]">
            <div className="text-xl text-black">Tax Information</div>
          </div>
        </div>
      </div>

      <div className="hidden max-lg:block mb-16">
        <MobileMenu />
      </div>

      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <main className="flex-grow container mx-auto px-2 py-10">
          <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8">
            <h2 className="text-lg lg:text-2xl font-semibold mb-6 text-center">
              Edit Tax Information
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6 text-sm">
              {/* GST */}
              <div>
                <label htmlFor="gstNumber" className="block font-medium mb-1">
                  GST Number
                </label>
                <input
                  type="text"
                  id="gstNumber"
                  name="gstNumber"
                  required
                  placeholder="Enter your GST number"
                  value={inputs?.gstNumber || ""}
                  onChange={(e) => {
                    localStorage.setItem("gstNumber", e.target.value);
                    handleChange(e);
                  }}
                  className="w-full lg:w-6/12 border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex flex-wrap gap-6 mb-6">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="tax"
                    checked={selected === "tax"}
                    onChange={() => setSelected("tax")}
                    className="form-radio text-blue-600"
                  />
                  Tax
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="alltax"
                    checked={selected === "alltax"}
                    onChange={() => setSelected("alltax")}
                    className="form-radio text-blue-600"
                  />
                  All Tax
                </label>
              </div>

              {selected === "tax" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax %
                  </label>
                  <input
                    type="number"
                    id="taxAmount"
                    name="taxAmount"
                    min={0}
                    max={100}
                    value={inputs?.taxAmount || ""}
                    onChange={(e) => {
                      localStorage.setItem("taxAmount", e.target.value);
                      handleChange(e);
                    }}
                    className="w-4/12 lg:w-2/12 px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-blue-300"
                  />
                </div>
              )}

              {/* CGST */}
              {selected === "alltax" && (
                <div className="flex flex-wrap gap-y-4 gap-x-4 justify-between">
                  <div>
                    <label
                      htmlFor="cgstAmount"
                      className="block font-medium mb-1"
                    >
                      CGST%
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      id="cgstAmount"
                      name="cgstAmount"
                      value={inputs?.cgstAmount || ""}
                      onChange={(e) => {
                        localStorage.setItem("cgstAmount", e.target.value);
                        handleChange(e);
                      }}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  {/* SGST */}
                  <div>
                    <label
                      htmlFor="sgstAmount"
                      className="block font-medium mb-1"
                    >
                      SGST%
                    </label>
                    <input
                      type="number"
                      id="sgstAmount"
                      min={0}
                      max={100}
                      name="sgstAmount"
                      value={inputs?.sgstAmount || ""}
                      onChange={(e) => {
                        localStorage.setItem("sgstAmount", e.target.value);
                        handleChange(e);
                      }}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* IGST */}

                  <div>
                    <label
                      htmlFor="igstAmount"
                      className="block font-medium mb-1"
                    >
                      IGST%
                    </label>
                    <input
                      type="number"
                      id="igstAmount"
                      min={0}
                      max={100}
                      name="igstAmount"
                      value={inputs?.igstAmount || ""}
                      onChange={(e) => {
                        localStorage.setItem("igstAmount", e.target.value);
                        handleChange(e);
                      }}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  {/* UGST */}
                  <div>
                    <label
                      htmlFor="ugstAmount"
                      className="block font-medium mb-1"
                    >
                      UGST%
                    </label>
                    <input
                      type="number"
                      id="ugstAmount"
                      min={0}
                      max={100}
                      name="ugstAmount"
                      value={inputs?.ugstAmount || ""}
                      onChange={(e) => {
                        localStorage.setItem("ugstAmount", e.target.value);
                        handleChange(e);
                      }}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}
              {/* Buttons */}
              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={() => navigate("/taxinfo")}
                  type="button"
                  className="px-5 py-2 border border-gray-400 text-gray-700 dark:text-white rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
      {loading && <Loader />}
    </div>
  );
}

export default EditTaxInfo;
