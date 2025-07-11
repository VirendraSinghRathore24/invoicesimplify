import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../config/firebase";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import Loader from "../Loader";
import { INVENTORY_INFO, USERS } from "../Constant";

function AddItem({ handleCloseItem, setItemAdded }) {
  const [inputs, setInputs] = useState({});
  const [selectedUnit, setSelectedUnit] = useState("pcs");
  const [loading, setLoading] = useState(false);
  const uid = localStorage.getItem("uid");

  const navigate = useNavigate();
  const inventoryInfo_CollectionRef = collection(
    doc(db, USERS, uid),
    INVENTORY_INFO
  );

  const handleSubmit = async (event) => {
    try {
      event.preventDefault();
      setLoading(true);

      // check if item is already added

      const isValid = validatePrices(inputs.buyPrice, inputs.sellPrice);
      if (!isValid) {
        setLoading(false);
        return;
      }

      // update item to db
      if (await updateInventoryItems(inputs)) {
        setItemAdded(true);
        handleCloseItem();

        toast("Item added successfully!!!");
      } else {
        alert("Item already exists with same name and code.");
        setLoading(false);
        return;
      }
      setLoading(false);

      // sending  info to next screen
      //localStorage.setItem("inventory", JSON.stringify(data));
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const validatePrices = (buyPrice, sellPrice) => {
    if (parseInt(sellPrice) < parseInt(buyPrice)) {
      alert("Sell price cannot be less than buy price.");
      setLoading(false);
      return false;
    }
    return true;
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

    if (
      existingItems.length > 0 &&
      existingItems.some(
        (item) =>
          item.itemCode === inputs.itemCode &&
          item.itemName.toLowerCase().trim() ===
            inputs.itemName.toLowerCase().trim()
      )
    ) {
      return false;
    }

    const newItem = {
      itemName: inputs.itemName,
      itemCode: inputs.itemCode,
      itemQty: inputs.itemQty,
      buyPrice: inputs.buyPrice,
      sellPrice: inputs.sellPrice,
      selectedUnit: selectedUnit || "pcs",
    };
    const inventoryData = [...existingItems, newItem];

    localStorage.setItem("inventoryItems", JSON.stringify(inventoryData));

    // update inventory info
    const codeDoc = doc(db, USERS, uid, INVENTORY_INFO, inventoryInfo.id);
    await updateDoc(codeDoc, {
      inventory: inventoryData,
    });
    return true;
  };

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
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
    var today = new Date();
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "July",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    let month = months[today.getMonth()];
    const code =
      month.substring(0, 3).toUpperCase() +
      today.getFullYear().toString().substring(2);

    setInputs((values) => ({ ...values, ["itemCode"]: code }));
  }, []);

  return (
    <div>
      <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-lg:w-[96%]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg lg:text-xl font-bold text-gray-800 dark:text-white">
              Create New Item
            </h2>
            <button
              onClick={handleCloseItem}
              className="text-2xl hover:text-red-500"
            >
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
                  <label className="block font-medium mb-1">
                    Measuring Unit
                  </label>
                  <select
                    onChange={(e) => handleUnitChange(e)}
                    defaultValue="pcs"
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
                onClick={handleCloseItem}
                className="px-4 py-2 border border-gray-400 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
      {loading && <Loader />}
    </div>
  );
}

export default AddItem;
