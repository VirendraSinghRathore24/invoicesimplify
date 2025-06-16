import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../config/firebase";
import { X } from "lucide-react";
import { toast } from "react-toastify";

function EditItem({ handleCloseEditModal, setItemAdded, editPost }) {
  const location = useLocation();
  const [inputs, setInputs] = useState(editPost);
  const [showList, setShowList] = useState(false);
  const [posts, setPosts] = useState([]);

  const navigate = useNavigate();
  const inventoryInfo_CollectionRef = collection(db, "Inventory_Info");

  const handleSubmit = async (event) => {
    event.preventDefault();

    // check if item is already added

    const isValid = validatePrices(inputs.buyPrice, inputs.sellPrice);
    if (!isValid) {
      return;
    }
    // update item to db
    await updateInventoryItems(inputs);

    handleCloseEditModal();
    setItemAdded(true);

    toast("Item updated successfully!!!");

    // sending  info to next screen
    //localStorage.setItem("inventory", JSON.stringify(data));
  };

  const updateInventoryItems = async () => {
    const data = await getDocs(inventoryInfo_CollectionRef);
    const filteredData = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    const loggedInUser = localStorage.getItem("user");
    const inventoryInfo = filteredData.filter(
      (x) => x.loggedInUser === loggedInUser
    )[0];

    // update inventory info

    const existingItems = inventoryInfo.inventory.sort((a, b) =>
      a.itemName.localeCompare(b.itemName)
    );

    // Prepare the updated item

    // Update the item name at index 2
    existingItems[editPost.index].itemName = inputs.itemName;
    existingItems[editPost.index].itemCode = inputs.itemCode;
    existingItems[editPost.index].itemQty = inputs.itemQty;
    existingItems[editPost.index].buyPrice = inputs.buyPrice;
    existingItems[editPost.index].sellPrice = inputs.sellPrice;

    // Find the item to update
    const updatedItems = existingItems.map((item) =>
      item.id === inventoryInfo.id ? { ...item, ...inputs } : item
    );

    localStorage.setItem("inventoryItems", JSON.stringify(updatedItems));
    // Update the inventory in Firestore
    const codeDoc = doc(db, "Inventory_Info", inventoryInfo.id);
    await updateDoc(codeDoc, {
      inventory: updatedItems,
    });
  };

  const validatePrices = (buyPrice, sellPrice) => {
    if (parseInt(sellPrice) < parseInt(buyPrice)) {
      alert("Sell price cannot be less than buy price.");
      return false;
    }
    return true;
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

    if (existingItems.length > 0) {
      setShowList(true);
      setPosts(inventoryInfo.inventory);
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
  }, []);

  return (
    <div className=" w-full mx-auto fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center p-6">
      <div className="overflow-auto mt-6 bg-white p-4 text-black rounded-xl">
        <div className="flex justify-between py-2">
          <div className=" text-lg font-bold">Edit Item </div>
          <button onClick={handleCloseEditModal}>
            <X size={30} />
          </button>
        </div>

        <hr />
        <div>
          <form
            onSubmit={handleSubmit}
            className="space-y-4 text-gray-800 dark:text-white mt-3"
          >
            <div>
              <label className="block font-medium mb-1">Item Name</label>
              <input
                type="text"
                name="itemName"
                autoFocus
                value={inputs?.itemName}
                onChange={(e) => {
                  localStorage.setItem("itemName", e.target.value);
                  handleChange(e);
                }}
                required
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Item Code</label>
                <input
                  type="text"
                  name="itemCode"
                  required
                  value={inputs?.itemCode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Quantity</label>
                <input
                  type="number"
                  name="itemQty"
                  value={inputs?.itemQty}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">
                  Buy Price (₹) / Unit
                </label>
                <input
                  type="number"
                  name="buyPrice"
                  value={inputs?.buyPrice}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">
                  Sell Price (₹) / Unit
                </label>
                <input
                  type="number"
                  name="sellPrice"
                  value={inputs.sellPrice}
                  onChange={(e) => {
                    localStorage.setItem("sellPrice", e.target.value);
                    handleChange(e);
                  }}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <hr />
            <div className="flex justify-end mt-4 gap-3">
              <button
                type="button"
                onClick={handleCloseEditModal}
                className="px-4 py-2 border border-gray-400 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Update Item
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditItem;
