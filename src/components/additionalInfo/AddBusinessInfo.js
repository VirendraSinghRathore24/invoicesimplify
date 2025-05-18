import {
  addDoc,
  collection,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../config/firebase";
import { toast } from "react-toastify";

function AddBusinessInfo({ setAddedInfo }) {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({});
  const loggedInUser = localStorage.getItem("user");

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
    event.preventDefault();

    // Add to local storage
    localStorage.setItem("businessInfo", JSON.stringify(inputs));
    await addBusinessData(inputs);
    setAddedInfo(true);
    toast("Business Info Saved Successfully !!!");
  };
  const basicInfo_CollectionRef = collection(db, "Basic_Info");
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
    } catch (err) {
      console.log(err);
    }
  };

  const updateBusinessInfo = async (id, businessInfo) => {
    try {
      const codeDoc = doc(db, "Basic_Info", id);
      await updateDoc(codeDoc, {
        businessInfo: businessInfo,
      });
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

  useEffect(() => {
    getInvoiceInfo();
  }, []);

  return (
    <div className="h-screen py-4">
      <div className="flex flex-col w-7/12 m-auto px-4 py-4 ">
        <div className="text-xl font-semibold text-center">
          Business Information
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full mx-auto flex flex-col md:flex-row justify-between mt-10"
        >
          <div className="flex flex-col gap-y-4 w-full md:w-7/12 mx-auto">
            <div className="flex justify-evenly">
              <div className="w-2/12 mx-auto text-xs font-medium leading-5 text-gray-700 mt-2">
                Logo
              </div>
              <div className="w-10/12 mx-auto">
                <div className="border-[1.4px] w-[80px] h-[80px] rounded-md text-gray-600 cursor-pointer border-gray-400 p-4">
                  Upload Logo
                </div>
              </div>
            </div>

            <div className="flex justify-evenly">
              <div className="w-2/12 mx-auto text-xs font-medium leading-5 text-gray-700 mt-2">
                Title
              </div>
              <div className="w-10/12 mx-auto">
                <input
                  className="form-input w-full block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                  required
                  name="name"
                  placeholder="बाईसाराज पौशाक पैलेस"
                  value={inputs.name || ""}
                  onChange={(e) => {
                    localStorage.setItem("name", e.target.value);
                    handleChange(e);
                  }}
                />
              </div>
            </div>
            <div className="flex justify-evenly">
              <div className="w-2/12 mx-auto text-xs font-medium leading-5 text-gray-700 mt-2">
                Sub Title1
              </div>
              <div className="w-10/12 mx-auto">
                <input
                  className="form-input w-full block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                  name="subTitle1"
                  placeholder="Poshak | Sarees | Cotton Suites"
                  value={inputs.subTitle1 || ""}
                  onChange={(e) => {
                    localStorage.setItem("subTitle1", e.target.value);
                    handleChange(e);
                  }}
                />
              </div>
            </div>
            <div className="flex justify-evenly">
              <div className="w-2/12 mx-auto text-xs font-medium leading-5 text-gray-700 mt-2">
                Sub Title2
              </div>
              <div className="w-10/12 mx-auto">
                <input
                  className="form-input w-full block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                  name="subTitle2"
                  placeholder="Business Name"
                  value={inputs.subTitle2 || ""}
                  onChange={(e) => {
                    localStorage.setItem("subTitle2", e.target.value);
                    handleChange(e);
                  }}
                />
              </div>
            </div>

            <div className="flex justify-evenly">
              <div className="w-2/12 mx-auto text-xs font-medium leading-5 text-gray-700 mt-2">
                Address
              </div>
              <div className="w-10/12 mx-auto">
                <input
                  className="w-full block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                  name="address1"
                  placeholder="Ground Floor, Gordhan Sky Mall, Khatipura Road,"
                  value={inputs.address1 || ""}
                  onChange={(e) => {
                    localStorage.setItem("address1", e.target.value);
                    handleChange(e);
                  }}
                />
              </div>
            </div>
            <div className="flex justify-evenly">
              <div className="w-2/12 mx-auto text-xs font-medium leading-5 text-gray-700 mt-2"></div>
              <div className="w-10/12 mx-auto">
                <input
                  className="w-full block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                  name="address2"
                  placeholder="Jhotwara, Jaipur"
                  value={inputs.address2 || ""}
                  onChange={(e) => {
                    localStorage.setItem("address2", e.target.value);
                    handleChange(e);
                  }}
                />
              </div>
            </div>
            <div className="flex justify-evenly">
              <div className="w-2/12 mx-auto text-xs font-medium leading-5 text-gray-700 mt-2"></div>
              <div className="w-10/12 mx-auto">
                <input
                  className="w-3/12 block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                  maxLength={6}
                  name="address3"
                  placeholder="302023"
                  value={inputs.address3 || ""}
                  onChange={(e) => {
                    localStorage.setItem("address3", e.target.value);
                    handleChange(e);
                  }}
                />
              </div>
            </div>
            <div className="flex justify-evenly">
              <div className="w-2/12 mx-auto text-xs font-medium leading-5 text-gray-700 mt-2">
                Phone (Primary)
              </div>
              <div className="w-10/12 mx-auto">
                <input
                  className="w-4/12 block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                  required
                  name="phonePrimary"
                  placeholder="8095528924"
                  maxLength={10}
                  value={inputs.phonePrimary || ""}
                  onChange={(e) => handlePhoneChange(e)}
                />
              </div>
            </div>

            <div className="flex justify-evenly">
              <div className="w-2/12 mx-auto text-xs font-medium leading-5 text-gray-700 mt-2">
                Phone (Secondary)
              </div>
              <div className="w-10/12 mx-auto">
                <input
                  className="w-4/12 block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                  maxLength={10}
                  name="phoneSecondary"
                  placeholder="8890223335"
                  value={inputs.phoneSecondary || ""}
                  onChange={(e) => handlePhoneChange(e)}
                />
              </div>
            </div>

            <div className="flex justify-evenly">
              <div className="w-2/12 mx-auto text-xs font-medium leading-5 text-gray-700 mt-2">
                Email
              </div>
              <div className="w-10/12 mx-auto">
                <input
                  className="w-7/12 block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                  name="email"
                  type="email"
                  placeholder="baisarajjaipur@gmail.com"
                  value={inputs.email || ""}
                  onChange={(e) => {
                    localStorage.setItem("email", e.target.value);
                    handleChange(e);
                  }}
                />
              </div>
            </div>

            <div>
              <div className="rounded-md flex justify-end w-full mx-auto">
                {/* <button onClick={handleBack} className='bg-[#444] px-4 py-2 rounded-md text-white'>Back</button> */}
                <button
                  type="submit"
                  className="bg-[#444] px-4 py-2 rounded-md text-white w-full"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddBusinessInfo;
