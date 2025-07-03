import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../config/firebase";
import AddItem from "./AddItem";
import { Edit, Box } from "lucide-react";
import EditItem from "./EditItem";
import Header from "../Header";
import Loader from "../Loader";
import StockModal from "./StockModal";
import MobileMenu from "../MobileMenu";

function Inventory() {
  const location = useLocation();
  const [inputs, setInputs] = useState({});
  const [showList, setShowList] = useState(false);
  const [posts, setPosts] = useState([]);
  const [itemAdded, setItemAdded] = useState(false);
  const [editPost, setEditPost] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const inventoryInfo_CollectionRef = collection(db, "Inventory_Info");

  const [openItem, setOpenItem] = useState(false);
  const handleCloseItem = async () => {
    setOpenItem(false);
    await checkIfListExists();
  };

  const [openEditModal, setOpenEditModal] = useState(false);
  const handleCloseEditModal = async () => {
    setOpenEditModal(false);
    await checkIfListExists();
  };

  const [openStockModal, setOpenStockModal] = useState(false);
  const handleCloseStockModal = async () => {
    setOpenStockModal(false);
    await checkIfListExists();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // check if item is already added

    // update item to db
    await updateInventoryItems(inputs);
  };

  const updateInventoryItems = async (item) => {
    const data = await getDocs(inventoryInfo_CollectionRef);
    const filteredData = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    const loggedInUser = localStorage.getItem("user");
    const inventoryInfo = filteredData.filter(
      (x) => x.loggedInUser === loggedInUser
    )[0];

    // get items list
    const existingItems = inventoryInfo.inventory;
    const newItem = {
      itemName: inputs.itemName,
    };
    const inventoryData = [...existingItems, newItem];

    // update inventory info
    const codeDoc = doc(db, "Inventory_Info", inventoryInfo.id);
    await updateDoc(codeDoc, {
      inventory: inventoryData,
    });
  };

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs((values) => ({ ...values, [name]: value }));
  };
  const handleBack = () => {
    navigate(-1);
  };

  const checkIfListExists = async () => {
    setLoading(true);
    const existingItems = JSON.parse(localStorage.getItem("inventoryItems"));
    setShowList(true);
    setPosts(existingItems ?? []);
    setFilteredData(existingItems ?? []);
    setLoading(false);
  };

  const handleDelete = async (post) => {
    const res = window.confirm("Are you sure you want to delete this item?");
    if (!res) return;

    const data = await getDocs(inventoryInfo_CollectionRef);
    const filteredData = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    const loggedInUser = localStorage.getItem("user");
    const inventoryInfo = filteredData.filter(
      (x) => x.loggedInUser === loggedInUser
    )[0];

    const existingItems = inventoryInfo.inventory;
    const updatedItems = existingItems.filter(
      (item) => item.itemName !== post.itemName
    );

    const codeDoc = doc(db, "Inventory_Info", inventoryInfo.id);
    await updateDoc(codeDoc, {
      inventory: updatedItems,
    });

    setPosts(updatedItems);
    setFilteredData(updatedItems);
  };

  const handleEdit = (post, index) => {
    post.index = index;
    setEditPost(post);
    setOpenEditModal(true);
  };

  const handleStockModal = (post, index) => {
    post.index = index;
    setEditPost(post);
    setOpenStockModal(true);
  };

  const handleLogin = () => {
    const user = localStorage.getItem("user");

    if (!user || user === "undefined" || user === "null") {
      navigate("/login");
    }
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchTerm(val);

    const result = posts.filter(
      (x) =>
        x.itemName.toLowerCase().includes(val.toLowerCase()) ||
        x.itemCode.toLowerCase().includes(val.toLowerCase())
    );
    setFilteredData(result);
  };

  useEffect(() => {
    handleLogin();
    // call db to check the items length
    checkIfListExists();

    let info1 = localStorage.getItem("inventory");
    setInputs(JSON.parse(info1));
  }, []);

  return (
    <div>
      <div className="hidden lg:block mb-12">
        <div className="top-0 mx-auto w-full h-[68px] text-white fixed bg-white shadow-lg">
          <div className="flex justify-between mx-auto font-bold text-md  py-4 px-2 rounded-md fixed w-[81.5%]">
            <div className="text-xl text-black">Inventory</div>
          </div>
        </div>
      </div>
      <div className="hidden max-lg:block mb-16">
        <MobileMenu />
      </div>
      <div className="p-2 lg:p-6">
        <div className="flex flex-col w-full m-auto p-2 lg:p-4">
          {showList ? (
            <div>
              <div className="flex justify-end">
                <button
                  onClick={() => setOpenItem(true)}
                  className="border-1 px-4 py-2 bg-[#444] text-white font-bold rounded-md hover:bg-amber-800 text-sm"
                >
                  {" "}
                  + Add Item
                </button>
              </div>
              <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-md mt-4 text-sm">
                <div className="p-4">
                  <input
                    type="text"
                    placeholder="Search..."
                    autoFocus
                    value={searchTerm}
                    onChange={handleSearch}
                    className="p-2 border border-gray-300 rounded-md mb-4 w-full"
                  />
                </div>
                <div className="overflow-auto h-[485px]">
                  <table className="min-w-full text-sm text-left text-gray-700">
                    <thead className="bg-gray-100 text-xs  text-gray-600 border-b">
                      <tr>
                        <th className="px-4 py-3 border-r">S.No.</th>
                        <th className="px-4 py-3 border-r">Item Name</th>
                        <th className="px-4 py-3 border-r">Item Code</th>
                        <th className="px-4 py-3 border-r">Quantity</th>
                        <th className="px-4 py-3 border-r">Buy Price</th>
                        <th className="px-4 py-3 border-r">Sell Price</th>
                        <th className="px-4 py-3 border-r">Stock</th>
                        <th className="px-4 py-3 border-r">Edit</th>
                        <th className="px-4 py-3 max-lg:hidden">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData &&
                        filteredData?.length > 0 &&
                        filteredData.map((post, index) => (
                          <tr
                            key={index}
                            className={`border-t ${
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            } hover:bg-gray-200 text-xs`}
                          >
                            <td className="px-4 py-3 border-r border-b">
                              {index + 1}.
                            </td>
                            <td className="px-4 py-3 border-r border-b text-[13px]">
                              {post?.itemName}
                            </td>
                            <td className="px-4 py-3 border-r border-b">
                              {post?.itemCode}
                            </td>
                            <td className="px-4 py-3 border-r border-b">
                              {post?.itemQty}{" "}
                              {post?.selectedUnit !== "none" && (
                                <span className="ml-1 uppercase">
                                  {post.selectedUnit}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 border-r border-b">
                              {post?.buyPrice}
                            </td>
                            <td className="px-4 py-3 border-r border-b">
                              {post?.sellPrice}
                            </td>
                            <td className="px-4 py-3 border-r border-b">
                              <button
                                onClick={() => handleStockModal(post, index)}
                                className="text-blue-600 hover:text-red-800 font-semibold text-xs"
                              >
                                Update
                                {/* Tooltip */}
                                {/* <div className="absolute bottom-full mb-2 font-bold text-sm left-1/2 -translate-x-1/2 bg-black text-white rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                                  Add or reduce your stock for this item
                                </div> */}
                              </button>
                            </td>
                            <td className="px-4 py-3 cursor-pointer border-r border-b">
                              <button
                                onClick={() => handleEdit(post, index)}
                                className="text-blue-600 hover:text-red-800 font-semibold text-xs"
                              >
                                Edit
                              </button>
                            </td>
                            <td className="px-4 py-3 cursor-pointer border-b max-lg:hidden">
                              <button
                                onClick={() => handleDelete(post)}
                                className="text-red-600 hover:text-red-800 font-semibold text-xs"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      {filteredData?.length === 0 && (
                        <tr>
                          <td
                            colSpan="9"
                            className="text-center px-4 py-6 text-gray-500"
                          >
                            No data available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-screen items-center justify-center ">
              <div onClick={() => setOpenItem(true)}>
                <button className="border-2 bg-[#444] text-white fond-bold text-lg py-4 px-8 rounded-md cursor-pointer">
                  {" "}
                  + Add Inventory
                </button>
              </div>
            </div>
          )}
          {openItem && (
            <AddItem
              handleCloseItem={handleCloseItem}
              setItemAdded={setItemAdded}
            ></AddItem>
          )}
          {openEditModal && (
            <EditItem
              handleCloseEditModal={handleCloseEditModal}
              setItemAdded={setItemAdded}
              editPost={editPost}
            ></EditItem>
          )}
          {openStockModal && (
            <StockModal
              handleCloseStockModal={handleCloseStockModal}
              setItemAdded={setItemAdded}
              editPost={editPost}
            ></StockModal>
          )}
        </div>
      </div>
      {loading && <Loader />}
    </div>
  );
}

export default Inventory;
