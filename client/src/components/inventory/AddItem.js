import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../config/firebase";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import Header from "../Header";

function AddItem({ handleCloseItem, setItemAdded }) {
  const location = useLocation();
  const [inputs, setInputs] = useState({});
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
    if (await updateInventoryItems(inputs)) {
      setItemAdded(true);
      handleCloseItem();

      toast("Item added successfully!!!");
    } else {
      alert("Item already exists with same name and code.");
      return;
    }

    // sending  info to next screen
    //localStorage.setItem("inventory", JSON.stringify(data));
  };

  const validatePrices = (buyPrice, sellPrice) => {
    if (parseInt(sellPrice) < parseInt(buyPrice)) {
      alert("Sell price cannot be less than buy price.");
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
          item.itemCode === inputs.itemCode && item.itemName === inputs.itemName
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
    };
    const inventoryData = [...existingItems, newItem];

    localStorage.setItem("inventoryItems", JSON.stringify(inventoryData));

    // update inventory info
    const codeDoc = doc(db, "Inventory_Info", inventoryInfo.id);
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
    <div>
      <Header />

      <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-4/12 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
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
            className="space-y-4 text-gray-800 dark:text-white mt-3"
          >
            <div className="flex justify-between w-full gap-x-4">
              <div className="w-8/12">
                <label className="block font-medium mb-1">Item Name</label>
                <input
                  type="text"
                  name="itemName"
                  autoFocus
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
                    //onChange={handlePageChange}
                    defaultValue=""
                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="reduce">Pieces(PCS)</option>
                    <option value="add">Meters(MTR)</option>
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
      {/* <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md p-6 relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Add Item
            </h2>
            <button
              onClick={handleCloseItem}
              className="text-gray-500 hover:text-red-600 text-xl font-bold"
            >
              <X size={30} />
            </button>
          </div>
          <hr />
          <form onSubmit={handleSubmit} className="space-y-4 mt-3">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                Item Description
              </label>
              <input
                type="text"
                name="description"
                autoFocus
                //value={item.description}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex w-full mx-auto justify-between">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Price (₹)
                </label>
                <input
                  type="number"
                  name="price"
                  //value={item.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-9/12 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  //value={item.quantity}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-6/12 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <hr />

            <div className="flex justify-end gap-4">
              <button
                type="button"
                //onClick={onClose}
                className="px-4 py-2 rounded-md border border-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
              >
                Save Item
              </button>
            </div>
          </form>
        </div>
      </div> */}

      {/* <div className=" w-full mx-auto fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center p-6">
        <div className="overflow-auto mt-6 bg-white p-4 text-black rounded-xl">
          <div className="flex justify-between py-2">
            <div className=" text-lg font-bold">Add Item </div>
            <button onClick={handleCloseItem}>
              <X size={30} />
            </button>
          </div>

          <hr />
          <div>
            <form
              onSubmit={handleSubmit}
              className="w-full mx-auto flex flex-col md:flex-row justify-between mt-10"
            >
              <div className="flex flex-col gap-y-4 w-full mx-auto">
                <div className="flex flex-col gap-y-4">
                  <div className="w-full mx-auto">
                    <input
                      className="form-input w-[400px] block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                      name="itemName"
                      autoFocus
                      required
                      placeholder="Enter Item Name"
                      value={inputs?.itemName || ""}
                      onChange={(e) => {
                        localStorage.setItem("itemName", e.target.value);
                        handleChange(e);
                      }}
                    />
                  </div>

                  <div className="flex gap-x-2 mx-auto w-full justify-between">
                    <div>
                      <input
                        className="form-input w-[140px] block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                        name="itemPrice"
                        required
                        placeholder="Price"
                        value={inputs?.itemPrice || ""}
                        onChange={(e) => {
                          localStorage.setItem("itemPrice", e.target.value);
                          handleChange(e);
                        }}
                      />
                    </div>
                    <div>
                      <input
                        className="form-input w-[100px]  block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                        name="itemQty"
                        required
                        placeholder="Quantity"
                        value={inputs?.itemQty}
                        onChange={(e) => {
                          handleChange(e);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <hr />
                <div className="flex justify-evenly">
                  <div className="rounded-md flex justify-between w-full mx-auto">
                    <button
                      type="button"
                      onClick={handleCloseItem}
                      className="px-5 py-2 border border-gray-400 text-gray-700 dark:text-white rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div> */}
    </div>
  );
}

export default AddItem;
