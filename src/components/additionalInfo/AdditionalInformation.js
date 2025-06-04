import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";

import { MdDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { db } from "../../config/firebase";
import Header from "../Header";

const AdditionalInformation = () => {
  const [posts, setPosts] = useState([]);
  const [allCategory, setAllCategory] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const handleDelete = async () => {
    console.log(posts);
    const isDeleted = await deleteBusinessInfo();
    if (isDeleted) {
      localStorage.removeItem("additionalInfo");
      setPosts(null);
    }
  };
  const basicInfo_CollectionRef = collection(db, "Basic_Info");
  const deleteBusinessInfo = async () => {
    try {
      var res = window.confirm("Delete the item?");
      if (res) {
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
          additionalInfo: null,
        });
        return true;
      }
    } catch (er) {
      console.log(er);
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
    let info3 = localStorage.getItem("additionalInfo");
    if (info3 === "undefined" || info3 === "null") {
      setPosts([]);
    } else {
      setPosts(JSON.parse(info3));
    }
  }, []);

  return (
    <div>
      <Header />

      <div className="p-6">
        <div className="flex justify-between w-full mx-auto font-bold text-2xl bg-gray-200 py-4 px-2 rounded-md">
          <div>Additional Information</div>
          {posts && (
            <div>
              <button
                onClick={() => handleDelete()}
                className="text-white bg-gray-800 font-semibold text-sm border-2 border-black p-2 rounded-md"
              >
                Delete All
              </button>
            </div>
          )}
        </div>
        <div>
          {posts && <div className="mt-4">Left Bottom Text</div>}
          {posts && (
            <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-md mt-4">
              <table className="min-w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 text-xs uppercase text-gray-600 border-b">
                  <tr>
                    <th className="px-4 py-3 border-r">Note1</th>
                    <th className="px-4 py-3 border-r">Note2</th>
                    <th className="px-4 py-3 border-r">Note3</th>
                    <th className="px-4 py-3 border-r">Note4</th>
                    <th className="px-4 py-3 border-r">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t bg-white">
                    <td className="px-4 py-3 border-r">{posts?.note1}</td>
                    <td className="px-4 py-3 border-r">{posts?.note2}</td>
                    <td className="px-4 py-3 border-r">{posts?.note3}</td>
                    <td className="px-4 py-3 border-r">{posts?.note4}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate("/editadditionalinfo")}
                        className="text-blue-600 hover:text-red-800 font-semibold text-sm"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          {posts && <div className="mt-6">Middle Bottom Text</div>}
          {posts && (
            <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-md mt-4">
              <table className="min-w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 text-xs uppercase text-gray-600 border-b">
                  <tr>
                    <th className="px-4 py-3 border-r">Note1</th>
                    <th className="px-4 py-3 border-r">Note2</th>
                    <th className="px-4 py-3 border-r">Note3</th>
                    <th className="px-4 py-3 border-r">Note4</th>
                    <th className="px-4 py-3 border-r">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t bg-white">
                    <td className="px-4 py-3 border-r">{posts?.middlenote1}</td>
                    <td className="px-4 py-3 border-r">{posts?.middlenote2}</td>
                    <td className="px-4 py-3 border-r">{posts?.middlenote3}</td>
                    <td className="px-4 py-3 border-r">{posts?.middlenote4}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate("/editadditionalinfo")}
                        className="text-blue-600 hover:text-red-800 font-semibold text-sm"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          {posts && <div className="mt-6">Right Bottom Text</div>}
          {posts && (
            <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-md mt-4">
              <table className="min-w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 text-xs uppercase text-gray-600 border-b">
                  <tr>
                    <th className="px-4 py-3 border-r">Note1</th>
                    <th className="px-4 py-3 border-r">Note2</th>
                    <th className="px-4 py-3 border-r">Note3</th>
                    <th className="px-4 py-3 border-r">Note4</th>
                    <th className="px-4 py-3 border-r">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t bg-white">
                    <td className="px-4 py-3 border-r">{posts?.rnote1}</td>
                    <td className="px-4 py-3 border-r">{posts?.rnote2}</td>
                    <td className="px-4 py-3 border-r">{posts?.rnote3}</td>
                    <td className="px-4 py-3 border-r">{posts?.rnote4}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate("/editadditionalinfo")}
                        className="text-blue-600 hover:text-red-800 font-semibold text-sm"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          {posts && <div className="mt-6">Additional Description</div>}
          {posts && (
            <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-md mt-4">
              <table className="min-w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 text-xs uppercase text-gray-600 border-b">
                  <tr>
                    <th className="px-4 py-3 border-r">
                      Additional Description
                    </th>
                    <th className="px-4 py-3 border-r">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t bg-white">
                    <td className="px-4 py-3 border-r">
                      {posts?.additionaldesc}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate("/editadditionalinfo")}
                        className="text-blue-600 hover:text-red-800 font-semibold text-sm"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          {!posts && (
            <div className="flex h-screen items-center justify-center ">
              <div onClick={() => navigate("/addadditionalinfo")}>
                <button className="border-2 bg-[#444] text-white fond-bold text-lg py-4 px-8 rounded-md cursor-pointer">
                  {" "}
                  + Add Additional Info
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdditionalInformation;
