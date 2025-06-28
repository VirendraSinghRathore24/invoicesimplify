import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { db } from "../../config/firebase";
import Header from "../Header";
import MobileMenu from "../MobileMenu";
import Loader from "../Loader";

function AddTaxInfo() {
  const location = useLocation();
  const [inputs, setInputs] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    try {
      setLoading(true);

      event.preventDefault();

      if (!inputs?.gstNumber && !inputs?.cgstAmount && !inputs?.sgstAmount) {
        alert("Please enter valid details to save the data !!!");
        return;
      }

      // Add to local storage
      // sending  info to next screen
      localStorage.setItem("taxInfo", JSON.stringify(inputs));
      await addTaxData(inputs);
      setLoading(false);
      toast("Tax Info Saved Successfully !!!");
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };
  const basicInfo_CollectionRef = collection(db, "Basic_Info");
  const addTaxData = async (inputs) => {
    try {
      // get doc id
      const data = await getDocs(basicInfo_CollectionRef);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      const loggedInUser = localStorage.getItem("user");
      const basicInfo = filteredData.filter(
        (x) => x.loggedInUser === loggedInUser
      )[0];

      // update business info
      await updateTaxInfo(basicInfo.id, inputs);

      localStorage.setItem("taxInfo", JSON.stringify(inputs));
      navigate("/taxinfo");
    } catch (err) {
      console.log(err);
    }
  };

  const updateTaxInfo = async (id, taxInfo) => {
    try {
      const codeDoc = doc(db, "Basic_Info", id);
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
  const handleBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    let info1 = localStorage.getItem("taxInfo");
    if (info1 === "undefined") {
      info1 = JSON.stringify({
        gstNumber: "",
        cgstAmount: "",
        sgstAmount: "",
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

      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <main className="flex-grow container mx-auto px-4 py-10">
          <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8">
            <h2 className="text-lg lg:text-2xl font-semibold mb-6 text-center">
              Edit Tax Information
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* GST */}
              <div>
                <label htmlFor="gstNumber" className="block font-medium mb-1">
                  GST Number
                </label>
                <input
                  type="text"
                  id="gstNumber"
                  name="gstNumber"
                  placeholder="Enter your GST number"
                  value={inputs?.gstNumber || ""}
                  onChange={(e) => {
                    localStorage.setItem("gstNumber", e.target.value);
                    handleChange(e);
                  }}
                  className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* CGST */}
              <div>
                <label htmlFor="cgstAmount" className="block font-medium mb-1">
                  CGST%
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  id="cgstAmount"
                  name="cgstAmount"
                  placeholder="Enter CGST%"
                  value={inputs?.cgstAmount || ""}
                  onChange={(e) => {
                    localStorage.setItem("cgstAmount", e.target.value);
                    handleChange(e);
                  }}
                  className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {/* CGST */}
              <div>
                <label htmlFor="sgstAmount" className="block font-medium mb-1">
                  SGST%
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  id="sgstAmount"
                  name="sgstAmount"
                  placeholder="Enter SGST%"
                  value={inputs?.sgstAmount || ""}
                  onChange={(e) => {
                    localStorage.setItem("sgstAmount", e.target.value);
                    handleChange(e);
                  }}
                  className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

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
                  Save Changes
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

export default AddTaxInfo;
