import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";

import { MdDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { db } from "../../config/firebase";
import Header from "../Header";
import MobileMenu from "../MobileMenu";
import Loader from "../Loader";
import { BASIC_INFO, USERS } from "../Constant";

const TaxInfo = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const uid = localStorage.getItem("uid");

  const navigate = useNavigate();

  const handleDelete = async () => {
    const isDeleted = await deleteBusinessInfo();
    if (isDeleted) {
      localStorage.removeItem("taxInfo");
      setPosts(null);
    }
  };
  const basicInfo_CollectionRef = collection(doc(db, USERS, uid), BASIC_INFO);
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

        const codeDoc = doc(db, USERS, uid, BASIC_INFO, basicInfo[0].id);
        await updateDoc(codeDoc, {
          taxInfo: null,
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

  useEffect(() => {
    let info = localStorage.getItem("taxInfo");

    if (info === "undefined" || info === "null" || info === null) {
      setPosts(null);
    } else {
      const data = JSON.parse(info);
      setPosts([data]);
    }
  }, []);

  return (
    <div className="flex justify-evenly w-full h-full">
      <div className="w-full lg:w-[82%] ml-0 lg:ml-[17%] border-2 my-3 rounded-lg border-gray-300 bg-white shadow-lg top-0 fixed h-[96.7%]">
        <div className="hidden lg:block">
          <div className="top-0 mx-auto w-full h-[68px] text-white border-b-2">
            <div className="font-bold text-md py-4 px-2 rounded-md w-[82%]">
              <div className="text-xl text-black">Tax Information</div>
            </div>
          </div>
        </div>

        <div className="hidden max-lg:block mb-16">
          <MobileMenu />
        </div>

        <div className="p-2 lg:p-6">
          <div>
            <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-md mt-4">
              {posts && (
                <table className="min-w-full text-sm text-left text-gray-700">
                  <thead className="bg-gray-100 text-xs uppercase text-gray-600 border-b">
                    <tr>
                      <th className="px-4 py-3 border-r">GSTIN</th>
                      {posts[0]?.taxType === "tax" && (
                        <th className="px-4 py-3 border-r">Tax %</th>
                      )}
                      {posts[0]?.taxType === "alltax" && (
                        <th className="px-4 py-3 border-r">CGST %</th>
                      )}
                      {posts[0]?.taxType === "alltax" && (
                        <th className="px-4 py-3 border-r">SGST %</th>
                      )}
                      {posts[0]?.taxType === "alltax" && (
                        <th className="px-4 py-3 border-r">IGST %</th>
                      )}
                      {posts[0]?.taxType === "alltax" && (
                        <th className="px-4 py-3 border-r">UGST %</th>
                      )}

                      <th className="px-4 py-3 border-r">Edit</th>
                      <th className="px-4 py-3">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t bg-white">
                      <td className="px-4 py-3 border-r">
                        {posts[0]?.gstNumber}
                      </td>
                      {posts[0]?.taxType === "tax" && (
                        <td className="px-4 py-3 border-r">
                          {posts[0]?.taxAmount}
                        </td>
                      )}
                      {posts[0]?.taxType === "alltax" && (
                        <td className="px-4 py-3 border-r">
                          {posts[0]?.cgstAmount}
                        </td>
                      )}
                      {posts[0]?.taxType === "alltax" && (
                        <td className="px-4 py-3 border-r">
                          {posts[0]?.sgstAmount}
                        </td>
                      )}
                      {posts[0]?.taxType === "alltax" && (
                        <td className="px-4 py-3 border-r">
                          {posts[0]?.igstAmount}
                        </td>
                      )}
                      {posts[0]?.taxType === "alltax" && (
                        <td className="px-4 py-3 border-r">
                          {posts[0]?.ugstAmount}
                        </td>
                      )}

                      <td className="px-4 py-3 border-r">
                        <button
                          onClick={() => navigate("/edittaxinfo")}
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
                <div className="h-screen flex items-center justify-center ">
                  <div onClick={() => navigate("/addtaxinfo")}>
                    <button className="border-2 bg-[#444] text-white fond-bold text-md py-4 px-8 rounded-md cursor-pointer">
                      {" "}
                      + Add Tax Info
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {loading && <Loader />}
      </div>
    </div>
  );
};

export default TaxInfo;
