import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../config/firebase";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import Loader from "../Loader";
import { INVENTORY_INFO, USERS } from "../Constant";

function EditItem({ handleCloseEditModal, setItemAdded, editPost }) {
  const [inputs, setInputs] = useState(editPost);
  const [selectedUnit, setSelectedUnit] = useState(editPost.selectedUnit);
  const [loading, setLoading] = useState(false);
  const [itemNameUpdated, setItemNameUpdated] = useState(false);
  const [itemCodeUpdated, setItemCodeUpdated] = useState(false);

  const uid = localStorage.getItem("uid");

  const navigate = useNavigate();
  const inventoryInfo_CollectionRef = collection(
    doc(db, USERS, uid),
    INVENTORY_INFO
  );

  const handleSubmit = async (event) => {
    try {
      setLoading(true);

      event.preventDefault();

      // check if item is already added

      const isValid = validatePrices(inputs.buyPrice, inputs.sellPrice);
      if (!isValid) {
        setLoading(false);
        return;
      }
      // update item to db
      if (await updateInventoryItems(inputs)) {
        handleCloseEditModal();
        setItemAdded(true);

        toast("Item updated successfully!!!");
        setLoading(false);
      } else {
        alert(
          "Item already added with same name and code, please use different !!!"
        );
        setLoading(false);
        return;
      }
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const updateInventoryItems = async () => {
    const data = await getDocs(inventoryInfo_CollectionRef);
    const inventoryInfo = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }))[0];

    // update inventory info

    const existingItems = inventoryInfo.inventory.sort((a, b) =>
      a.itemName.localeCompare(b.itemName)
    );

    const duplicateItem = existingItems.filter(
      (item) =>
        (itemNameUpdated || itemCodeUpdated) &&
        item.itemCode === inputs.itemCode &&
        item.itemName.toLowerCase().trim() ===
          inputs.itemName.toLowerCase().trim()
    );

    if (duplicateItem.length > 0) {
      return false;
    }
    // Prepare the updated item

    // Update the item name at index 2
    existingItems[editPost.index].itemName = inputs.itemName;
    existingItems[editPost.index].itemCode = inputs.itemCode;
    existingItems[editPost.index].itemQty = inputs.itemQty;
    existingItems[editPost.index].buyPrice = inputs.buyPrice;
    existingItems[editPost.index].sellPrice = inputs.sellPrice;
    existingItems[editPost.index].selectedUnit = selectedUnit;

    // Find the item to update
    const updatedItems = existingItems.map((item) =>
      item.id === inventoryInfo.id ? { ...item, ...inputs } : item
    );

    localStorage.setItem("inventoryItems", JSON.stringify(updatedItems));
    // Update the inventory in Firestore
    const codeDoc = doc(db, USERS, uid, INVENTORY_INFO, inventoryInfo.id);
    await updateDoc(codeDoc, {
      inventory: updatedItems,
    });
    return true;
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

    setItemNameUpdated(false);
    setItemCodeUpdated(false);

    if (name === "itemName") {
      setItemNameUpdated(true);
    }
    if (name === "itemCode") {
      setItemCodeUpdated(true);
    }
    setInputs((values) => ({ ...values, [name]: value }));
  };

  const handleLogin = () => {
    const user = localStorage.getItem("user");

    if (!user || user === "undefined" || user === "null") {
      navigate("/login");
    }
  };

  const handleUnitChange = (e) => {
    // Handle unit change logic here if needed
    const selectedUnit1 = e.target.value;
    setSelectedUnit(selectedUnit1);
  };

  useEffect(() => {
    handleLogin();
  }, []);

  return (
    <div className=" w-full mx-auto fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center p-6">
      <div className="overflow-auto mt-6 bg-white p-6 text-black rounded-xl">
        <div className="flex justify-between py-2">
          <div className=" text-lg font-bold">Edit Item </div>
          <button onClick={handleCloseEditModal}>
            <X size={30} />
          </button>
        </div>

        <hr />
        <form
          onSubmit={handleSubmit}
          className="space-y-4 text-gray-800 dark:text-white mt-3 text-sm"
        >
          <div className="flex justify-between w-full gap-x-4">
            <div className="w-8/12">
              <label className="block font-medium mb-1">Item Name</label>
              <input
                type="text"
                name="itemName"
                value={inputs?.itemName}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="w-4/12">
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
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <div className="w-full  mb-6">
                <label className="block font-medium mb-1">Measuring Unit</label>
                <select
                  onChange={(e) => handleUnitChange(e)}
                  defaultValue={selectedUnit}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="pcs">Pieces(PCS)</option>
                  <option value="mtr">Meters(MTR)</option>
                  <option value="hour">Hours(HRS)</option>
                  <option value="none">None(None)</option>
                </select>
              </div>
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
                onChange={handleChange}
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
              Update
            </button>
          </div>
        </form>
      </div>
      {loading && <Loader />}
    </div>
  );
}

export default EditItem;
