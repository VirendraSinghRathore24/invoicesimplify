import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, storage } from "../../config/firebase";
import { toast } from "react-toastify";
import ImageUpload from "./ImageUpload";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import Header from "../Header";

function AddBusinessInfo() {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({});
  const loggedInUser = localStorage.getItem("user");
  const [saving, setSaving] = useState(false);
  const [avatarURL, setAvatarURL] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

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
      const codeDoc = doc(db, "Basic_Info", id);

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
      <Header />

      <div className="h-screen p-6">
        <div className="flex flex-col w-full mx-auto font-bold text-2xl bg-gray-200 py-4 px-2 rounded-md">
          Add Business Information
        </div>

        <div className="flex flex-col w-full m-auto px-4 py-4 shadow-lg border-2 p-5 bg-white gap-y-4 rounded-md mt-2">
          <form
            onSubmit={handleSubmit}
            className="w-full mx-auto flex flex-col md:flex-row justify-between"
          >
            <div className="flex flex-col gap-y-4 w-full md:w-7/12 mx-auto">
              <div className="flex flex-col">
                <div className="border-2 w-[100px] h-[100px] rounded-md cursor-pointer">
                  <ImageUpload
                    setSelectedFile={setSelectedFile}
                    avatarURL={avatarURL}
                    setAvatarURL={setAvatarURL}
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <div className="text-xs font-medium leading-5 text-gray-700 mt-2">
                  Title
                </div>
                <div>
                  <input
                    className="form-input w-full block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                    required
                    name="name"
                    placeholder="बाईसाराज पौशाक पैलेस"
                    value={inputs?.name || ""}
                    onChange={(e) => {
                      localStorage.setItem("name", e.target.value);
                      handleChange(e);
                    }}
                  />
                </div>
              </div>
              <div className="flex w-full mx-auto justify-between gap-x-4">
                <div className="flex flex-col w-full">
                  <div className="text-xs font-medium leading-5 text-gray-700 mt-2">
                    Sub Title1
                  </div>
                  <div>
                    <input
                      className="form-input w-full block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                      name="subTitle1"
                      placeholder="Poshak | Sarees | Cotton Suites"
                      value={inputs?.subTitle1 || ""}
                      onChange={(e) => {
                        localStorage.setItem("subTitle1", e.target.value);
                        handleChange(e);
                      }}
                    />
                  </div>
                </div>
                <div className="flex flex-col w-full">
                  <div className="text-xs font-medium leading-5 text-gray-700 mt-2">
                    Sub Title2
                  </div>
                  <div>
                    <input
                      className="form-input w-full block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                      name="subTitle2"
                      placeholder="Business Name"
                      value={inputs?.subTitle2 || ""}
                      onChange={(e) => {
                        localStorage.setItem("subTitle2", e.target.value);
                        handleChange(e);
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                <div className="text-xs font-medium leading-5 text-gray-700 mt-2">
                  Address
                </div>
                <div>
                  <input
                    className="w-full block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                    name="address1"
                    placeholder="Ground Floor, Gordhan Sky Mall, Khatipura Road,"
                    value={inputs?.address1 || ""}
                    onChange={(e) => {
                      localStorage.setItem("address1", e.target.value);
                      handleChange(e);
                    }}
                  />
                </div>
              </div>
              <div className="flex w-full mx-auto justify-between gap-x-4">
                <input
                  className="w-full block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                  name="address2"
                  placeholder="Jhotwara, Jaipur"
                  value={inputs?.address2 || ""}
                  onChange={(e) => {
                    localStorage.setItem("address2", e.target.value);
                    handleChange(e);
                  }}
                />

                <input
                  className="w-2/12 block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                  maxLength={6}
                  name="address3"
                  placeholder="302023"
                  value={inputs?.address3 || ""}
                  onChange={(e) => {
                    localStorage.setItem("address3", e.target.value);
                    handleChange(e);
                  }}
                />
              </div>

              <div className="flex w-full mx-auto justify-between gap-x-4">
                <div className="flex w-6/12 gap-x-4">
                  <div className="flex flex-col ">
                    <div className="text-xs font-bold leading-5 text-gray-700 mt-2">
                      Phone (Primary)
                    </div>
                    <div className="flex justify-start items-left -ml-4">
                      <span className="p-[7px] bg-[#eee] border border-[#ccc] border-r-0 rounded-l font-normal text-sm">
                        +91
                      </span>
                      <input
                        className="p-[5px] pl-[10px] border border-[#ccc] rounded-r w-[120px] text-sm text-left"
                        type="text"
                        name="phonePrimary"
                        value={inputs?.phonePrimary || ""}
                        onChange={(e) => handlePhoneChange(e)}
                        maxLength={10}
                        placeholder="Mobile number..."
                      />
                    </div>
                  </div>

                  <div className="flex flex-col ">
                    <div className="text-xs font-bold leading-5 text-gray-700 mt-2">
                      Phone (Secondary)
                    </div>
                    <div className="flex justify-start items-left -ml-4">
                      <span className="p-[7px] bg-[#eee] border border-[#ccc] border-r-0 rounded-l font-normal text-sm">
                        +91
                      </span>
                      <input
                        className="p-[5px] pl-[10px] border border-[#ccc] rounded-r w-[120px] text-sm text-left"
                        type="text"
                        name="phoneSecondary"
                        value={inputs?.phoneSecondary || ""}
                        onChange={(e) => handlePhoneChange(e)}
                        maxLength={10}
                        placeholder="Mobile number..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col w-8/12">
                  <div className="text-xs font-medium leading-5 text-gray-700 mt-2">
                    Email
                  </div>
                  <div>
                    <input
                      className="w-full block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                      name="email"
                      type="email"
                      placeholder="baisarajjaipur@gmail.com"
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
                <div className="rounded-md flex justify-between gap-x-20 w-full mx-auto">
                  <button
                    type="button"
                    onClick={() => navigate("/businessinfo")}
                    className="px-4 py-2 rounded-md text-black w-3/12 border-[1.4px] border-black"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#444] px-4 py-2 rounded-md text-white w-3/12"
                  >
                    <span className="flex items-center gap-1">
                      {saving ? (
                        <div className=" flex justify-center w-full mx-auto py-2 gap-x-3">
                          <div className="h-3 w-3 bg-[#d6f539] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="h-3 w-3 bg-[#d6f539] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="h-3 w-3 bg-[#d6f539] rounded-full animate-bounce"></div>
                        </div>
                      ) : (
                        <div className="text-center w-full mx-auto">Save</div>
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddBusinessInfo;
