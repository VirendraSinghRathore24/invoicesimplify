// Modal.js

import React, { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Loader from "../Loader";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";
import { CREATORS } from "../Constant";
import CreatorMobileMenu from "./CreatorMobileMenu";

const Brands = () => {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState("");
  const [loading, setLoading] = useState(false);
  const uid = localStorage.getItem("uid");
  const loggedInUser = localStorage.getItem("user");
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  const getBrands = async () => {
    setLoading(true);
    const existingBrands = await getBrandsData();

    setPosts(existingBrands);
    setFilteredData(existingBrands);
    setLoading(false);
  };

  const brandInfo_CollectionRef = collection(
    doc(db, CREATORS, uid),
    "Brand_Info"
  );
  const getBrandsData = async () => {
    try {
      const data = await getDocs(brandInfo_CollectionRef);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      // get items list
      const brands = filteredData.sort((a, b) =>
        a.customerInfo.customerName.localeCompare(b.customerInfo.customerName)
      );
      return brands;
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogin = () => {
    const user = localStorage.getItem("user");

    if (!user || user === "undefined" || user === "null") {
      navigate("/login");
      return;
    }
    const type = localStorage.getItem("type");
    if (!type || type === "undefined" || type === "null") {
      navigate("/selectbusinesstype");
      return;
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    const filtered = posts.filter((post) =>
      post.customerInfo.customerName.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
    if (value === "") {
      setFilteredData(posts);
    }
  };

  const handleDelete = async (user) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      const items = filteredData.filter((item) => item.id !== user.id);
      setFilteredData(items);

      //localStorage.setItem("creator_dashboardInfo", JSON.stringify(items));

      // archive before deleting
      //await archiveInvoice(user);

      const invDoc = doc(db, CREATORS, uid, "Brand_Info", user.id);
      await deleteDoc(invDoc);

      await getBrandsData();
    }
  };

  useEffect(() => {
    handleLogin();
    getBrands();
  }, []);

  return (
    <div className="">
      <div className="lg:left-64 right-0 top-0 left-0 lg:fixed bg-gray-100">
        <div className="hidden lg:block top-0 mx-auto w-full h-[64px] text-white fixed border-b-2">
          <div className="flex justify-between mx-auto font-bold text-md py-4 px-2 rounded-lg ">
            <div className="text-xl text-black">Brands/Agencies</div>
          </div>
        </div>

        {/* <div className="hidden max-lg:block  mx-auto w-full text-white fixed border-b-2 mt-10">
          <div className="flex justify-between mx-auto font-bold text-md py-4 px-2 rounded-lg ">
            <div className="text-xl text-black">Brands/Agencies</div>
          </div>
        </div> */}
        <div className="flex justify-center items-center w-full mx-auto">
          <div className="hidden max-lg:block mb-16">
            <CreatorMobileMenu />
          </div>
          <div className="flex flex-col w-full  mt-10 p-4">
            <div className="flex items-center justify-between mt-4 mb-3 ">
              <input
                type="text"
                placeholder="Search brand by name or address..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-10/12 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                // onClick={() => setOpen(true)}
                className="px-4 py-2 flex items-center cursor-pointer gap-2 px-2 py-1 rounded-lg border border-blue-600 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white transition text-sm"
              >
                + Add New
              </button>
            </div>

            {/* Seller List */}
            <div className=" w-full overflow-y-auto max-h-screen scrollbar-thin scrollbar-thumb-gray-300">
              {posts.length === 0 ? (
                <p className="text-gray-500 text-center py-6">
                  No brand found.
                </p>
              ) : (
                posts.map((seller, i) => (
                  <div
                    key={i}
                    className="bg-white border rounded-lg p-4 mb-3 hover:bg-gray-50 cursor-pointer transition flex justify-between"
                    onClick={() => {
                      //onSelect(seller);
                      //onClose();
                    }}
                  >
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm">
                        {seller.customerInfo.customerName}
                      </h3>
                      {seller.customerInfo.address && (
                        <p className="text-gray-600 text-xs mt-1">
                          {seller.customerInfo.address}
                        </p>
                      )}
                      {seller.customerInfo.address1 && (
                        <p className="text-gray-600 text-xs">
                          {seller.customerInfo.address1}
                        </p>
                      )}
                      {seller.customerInfo.address2 && (
                        <p className="text-gray-500 text-xs">
                          {seller.customerInfo.address2} -{" "}
                          {seller.customerInfo.address3}
                        </p>
                      )}
                      {seller.customerInfo.gst && (
                        <p className="text-gray-500 text-xs mt-1">
                          GSTIN: {seller.customerInfo.gst}
                        </p>
                      )}
                      {seller.customerInfo.pan && (
                        <p className="text-gray-500 text-xs">
                          PAN: {seller.customerInfo.pan}
                        </p>
                      )}
                      {seller.customerInfo.tin && (
                        <p className="text-gray-500 text-xs">
                          TIN: {seller.customerInfo.tin}
                        </p>
                      )}
                      {seller.customerInfo.cin && (
                        <p className="text-gray-500 text-xs">
                          CIN: {seller.customerInfo.cin}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-x-4">
                      <Pencil size={16} />

                      <Trash2 size={16} color="red" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          {loading && <Loader />}
        </div>
      </div>
    </div>
  );
};

export default Brands;
