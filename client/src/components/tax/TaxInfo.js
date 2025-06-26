import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";

import { MdDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { db } from "../../config/firebase";
import Header from "../Header";
import MobileMenu from "../MobileMenu";
import Loader from "../Loader";

const TaxInfo = () => {
  const [posts, setPosts] = useState([]);
  const [allCategory, setAllCategory] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleDelete = async () => {
    const isDeleted = await deleteBusinessInfo();
    if (isDeleted) {
      localStorage.removeItem("taxInfo");
      setPosts(null);
    }
  };
  const basicInfo_CollectionRef = collection(db, "Basic_Info");
  const deleteBusinessInfo = async () => {
    try {
      var res = window.confirm("Delete the item?");
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
    <div>
      <div className="hidden lg:block">
        <Header />
      </div>
      <div className="hidden max-lg:block mb-16">
        <MobileMenu />
      </div>

      <div className="p-2 lg:p-6">
        <div className="flex flex-col w-full mx-auto font-bold text-lg lg:text-2xl bg-gray-200 py-4 px-2 rounded-md">
          Tax Information
        </div>
        <div>
          <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-md mt-4">
            {posts && (
              <table className="min-w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 text-xs uppercase text-gray-600 border-b">
                  <tr>
                    <th className="px-4 py-3 border-r">GSTIN</th>
                    <th className="px-4 py-3 border-r">CGST %</th>
                    <th className="px-4 py-3 border-r">SGST %</th>
                    <th className="px-4 py-3 border-r">Edit</th>
                    <th className="px-4 py-3">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t bg-white">
                    <td className="px-4 py-3 border-r">
                      {posts[0]?.gstNumber}
                    </td>
                    <td className="px-4 py-3 border-r">
                      {posts[0]?.cgstAmount}
                    </td>
                    <td className="px-4 py-3 border-r">
                      {posts[0]?.sgstAmount}
                    </td>
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
                  <button className="border-2 bg-[#444] text-white fond-bold text-lg py-4 px-8 rounded-md cursor-pointer">
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
  );
};

export default TaxInfo;
