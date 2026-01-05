import React, { useState, useEffect } from "react";
import AddBrandModal from "./AddBrandModal";
import { Pencil } from "lucide-react";
import { collection, doc, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";
import { CREATORS } from "../Constant";

const BrandListModal = ({
  isOpen,
  onClose,
  onSelect,
  onAddNew,
  onEdit,
  setEditData,
  setEditId,
}) => {
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [open, setOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSave = (data) => {
    console.log("Seller saved:", data);
  };

  const [brands, setBrands] = useState([]);
  const getBrands = async () => {
    setLoading(true);
    const existingBrands = await getBrandsData();
    const filteredData1 = existingBrands?.sort((a, b) =>
      a?.createdAt < b?.createdAt ? 1 : -1
    );

    setBrands(filteredData1);

    setLoading(false);
  };

  const getBrandsData = async () => {
    try {
      const uid = localStorage.getItem("uid");
      const brandInfo_CollectionRef = collection(
        doc(db, CREATORS, uid),
        "Brand_Info"
      );
      const data = await getDocs(brandInfo_CollectionRef);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      const brands = filteredData.sort((a, b) =>
        b.customerInfo.customerName.localeCompare(a.customerInfo.customerName)
      );

      return brands;
    } catch (err) {
      console.log(err);
    }
  };

  const handleEdit = (data) => {
    setEditId(data.id);
    setEditData(data);
    onEdit();
  };

  useEffect(() => {
    getBrands();
    setFiltered(
      brands.filter((s) =>
        s.customerInfo?.customerName
          ?.toLowerCase()
          .includes(search?.toLowerCase())
      )
    );
  }, [search, brands]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-2 lg:left-64">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-lg p-6 animate-fadeIn">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-lg font-semibold text-gray-800">
            Select Brand\Agency
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Search + Add Button */}
        <div className="flex items-center justify-between mt-4 mb-3">
          <input
            type="text"
            placeholder="Search brand by name ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-2/4 lg:w-3/4 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            onClick={onAddNew}
            className="px-4 py-2 flex items-center cursor-pointer gap-2 px-2 py-1 rounded-lg border border-blue-600 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white transition text-sm"
          >
            + Add New
          </button>
        </div>

        {/* Seller List */}
        <div className="max-h-72 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300">
          {filtered.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No brand found.</p>
          ) : (
            filtered.map((seller, i) => (
              <div
                key={i}
                className="border rounded-lg p-4 mb-3 hover:bg-gray-50 cursor-pointer transition flex justify-between max-h-[96%]"
                onClick={() => {
                  onSelect(seller);
                  onClose();
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
                  {seller.customerInfo.customerPhone && (
                    <p className="text-gray-600 text-xs">
                      Mobile: {seller.customerInfo.customerPhone}
                    </p>
                  )}
                  {seller.customerInfo.customerEmail && (
                    <p className="text-gray-600 text-xs">
                      Email: {seller.customerInfo.customerEmail}
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
                <div
                  className="cursor-pointer"
                  onClick={() => handleEdit(seller)}
                >
                  <Pencil size={16} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t pt-3 mt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrandListModal;
