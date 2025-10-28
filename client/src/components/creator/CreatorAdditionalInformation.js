import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";

import { MdDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { db } from "../../config/firebase";
import Header from "../Header";
import MobileMenu from "../MobileMenu";
import Loader from "../Loader";
import { BASIC_INFO, CREATORS } from "../Constant";
import CreatorMobileMenu from "./CreatorMobileMenu";

const CreatorAdditionalInformation = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const uid = localStorage.getItem("uid");

  const navigate = useNavigate();
  const handleDelete = async () => {
    const isDeleted = await deleteBusinessInfo();
    if (isDeleted) {
      localStorage.removeItem("creator_additionalInfo");
      setPosts(null);
    }
  };
  const basicInfo_CollectionRef = collection(
    doc(db, CREATORS, uid),
    BASIC_INFO
  );
  const deleteBusinessInfo = async () => {
    try {
      var res = window.confirm("Delete the item?");
      if (res) {
        setLoading(true);
        const data = await getDocs(basicInfo_CollectionRef);
        const basicInfo = data.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        const codeDoc = doc(db, CREATORS, uid, BASIC_INFO, basicInfo[0].id);
        await updateDoc(codeDoc, {
          additionalInfo: null,
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
    let info = localStorage.getItem("creator_additionalInfo");
    if (info === "undefined" || info === "null" || info === null) {
      setPosts(null);
    } else {
      const data = JSON.parse(info);
      setPosts([data]);
    }
    window.scroll(0, 0);
  }, []);

  return (
    <div className="">
      <div className="lg:left-64 right-0 top-0 left-0 lg:fixed bg-white">
        <div className="hidden lg:block">
          <div className="top-0 mx-auto w-full h-[64px] text-white border-b-2">
            <div className="flex justify-between font-bold text-md py-4 px-2 rounded-md w-full">
              <div className="text-xl text-black">Additional Information</div>
            </div>
          </div>
        </div>

        <div className="hidden max-lg:block mb-16">
          <CreatorMobileMenu />
        </div>

        <div className="p-2">
          <div className="text-sm">
            {posts && (
              <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-md mt-4">
                <table className="min-w-full text-sm text-left text-gray-700">
                  <thead className="bg-gray-100 text-xs uppercase text-gray-600 border-b">
                    <tr>
                      <th className="px-4 py-3 border-r">
                        Additional Description
                      </th>
                      <th className="px-4 py-3 border-r">Edit</th>
                      <th className="px-4 py-3 border-r">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t bg-white">
                      <td className="px-4 py-3 border-r w-[96%]">
                        {posts[0]?.additionaldesc}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() =>
                            navigate("/creator/editcreatoradditionalinfo")
                          }
                          className="text-blue-600 hover:text-red-800 font-semibold text-sm"
                        >
                          Edit
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete()}
                          className="text-blue-600 hover:text-red-800 font-semibold text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            {!posts && (
              <div className="flex h-screen items-center justify-center ">
                <div
                  onClick={() => navigate("/creator/addcreatoradditionalinfo")}
                >
                  <button className="border-2 bg-[#444] text-white fond-bold text-md py-4 px-8 rounded-md cursor-pointer">
                    {" "}
                    + Add Additional Info
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        {loading && <Loader />}
      </div>
    </div>
  );
};

export default CreatorAdditionalInformation;
