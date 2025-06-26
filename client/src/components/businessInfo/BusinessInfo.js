import React, { useEffect, useState } from "react";

import AddBusinessInfo from "./AddBusinessInfo";
import { useNavigate } from "react-router-dom";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import Header from "../Header";
import MobileMenu from "../MobileMenu";
import Loader from "../Loader";

const BusinessInfo = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleDelete = async () => {
    console.log(posts);
    const isDeleted = await deleteBusinessInfo();
    if (isDeleted) {
      localStorage.removeItem("businessInfo");
      setPosts(null);
    }
  };
  const basicInfo_CollectionRef = collection(db, "Basic_Info");
  const deleteBusinessInfo = async () => {
    try {
      var res = window.confirm("Are you sure to delete Business Info?");
      if (res) {
        setLoading(true);
        const data = await getDocs(basicInfo_CollectionRef);
        const filteredData = data.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        const loggedInUser = localStorage.getItem("user");
        const basicInfo = filteredData.filter(
          (x) => x.loggedInUser === loggedInUser
        )[0];

        const codeDoc = doc(db, "Basic_Info", basicInfo.id);
        await updateDoc(codeDoc, {
          businessInfo: null,
        });
        setLoading(false);
        return true;
      }
    } catch (er) {
      console.log(er);
      setLoading(false);
      return false;
    }
  };

  const handleLogin = () => {
    const user = localStorage.getItem("user");

    if (!user || user === "undefined" || user === "null") {
      navigate("/login");
    }
  };

  useEffect(() => {
    handleLogin();
    const info = localStorage.getItem("businessInfo");

    if (info === "undefined" || info === "null") {
      setPosts(null);
    } else {
      const data = JSON.parse(info);
      setPosts(data);
    }
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
          Business Information
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-md mt-4 hidden lg:block">
          {posts && (
            <table className="min-w-full text-sm text-left text-gray-700">
              <thead className="bg-gray-100 text-xs uppercase text-gray-600 border-b">
                <tr>
                  <th className="px-4 py-3 border-r">Title</th>
                  <th className="px-4 py-3 border-r">SubTitle1</th>
                  <th className="px-4 py-3 border-r">SubTitle2</th>
                  <th className="px-4 py-3 border-r">Address</th>
                  <th className="px-4 py-3 border-r">Phone1</th>
                  <th className="px-4 py-3 border-r">Phone2</th>
                  <th className="px-4 py-3 border-r">Email</th>
                  <th className="px-4 py-3 border-r">Edit</th>
                  <th className="px-4 py-3">Delete</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t bg-white">
                  <td className="px-4 py-3 border-r">{posts?.name}</td>
                  <td className="px-4 py-3 border-r">{posts?.subTitle1}</td>
                  <td className="px-4 py-3 border-r">{posts?.subTitle2}</td>
                  <td className="px-4 py-3 border-r">{posts?.address}</td>
                  <td className="px-4 py-3 border-r">{posts?.phonePrimary}</td>
                  <td className="px-4 py-3 border-r">
                    {posts?.phoneSecondary}
                  </td>
                  <td className="px-4 py-3 border-r">{posts?.email}</td>
                  <td className="px-4 py-3 border-r">
                    <button
                      onClick={() => navigate("/editbusinessinfo")}
                      className="text-blue-600 hover:text-red-800 font-semibold text-sm"
                    >
                      Edit
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete()}
                      className="text-red-600 hover:text-red-800 font-semibold text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          )}

          {!posts && (
            <div className="flex h-screen items-center justify-center ">
              <div onClick={() => navigate("/addbusinessinfo")}>
                <button className="border-2 bg-[#444] text-white fond-bold text-lg py-4 px-8 rounded-md cursor-pointer">
                  {" "}
                  + Add Business Info
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-md mt-4 hidden max-lg:block">
          {posts && (
            <table className="min-w-full text-sm text-left text-gray-700">
              <thead className="bg-gray-100 text-xs uppercase text-gray-600 border-b">
                <tr>
                  <th className="px-4 py-3 border-r">Title</th>
                  <th className="px-4 py-3 border-r">Address</th>
                  <th className="px-4 py-3 border-r">Phone1</th>
                  <th className="px-4 py-3 border-r">Edit</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t bg-white">
                  <td className="px-4 py-3 border-r">{posts?.name}</td>
                  <td className="px-4 py-3 border-r">{posts?.address}</td>
                  <td className="px-4 py-3 border-r">{posts?.phonePrimary}</td>
                  <td className="px-4 py-3 border-r">
                    <button
                      onClick={() => navigate("/editbusinessinfo")}
                      className="text-blue-600 hover:text-red-800 font-semibold text-sm"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          )}

          {!posts && (
            <div className="flex h-screen items-center justify-center ">
              <div onClick={() => navigate("/addbusinessinfo")}>
                <button className="border-2 bg-[#444] text-white fond-bold text-lg py-4 px-8 rounded-md cursor-pointer">
                  {" "}
                  + Add Business Info
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {loading && <Loader />}
    </div>
  );
};

export default BusinessInfo;
