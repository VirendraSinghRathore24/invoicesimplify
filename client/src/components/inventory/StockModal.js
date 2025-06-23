import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../config/firebase";
import { X } from "lucide-react";
import { toast } from "react-toastify";

function StockModal({ handleCloseStockModal, setItemAdded, editPost }) {
  const location = useLocation();
  const [added, setAdded] = useState(false);
  const [inputs, setInputs] = useState(editPost);
  const [showList, setShowList] = useState(false);
  const [posts, setPosts] = useState([]);
  const [addedDate, setAddedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [newQty, setNewQty] = useState(0);
  const [totalQty, setTotalQty] = useState(0);

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

    handleCloseStockModal();
    setItemAdded(true);

    toast("Item updated successfully!!!");
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
    existingItems[editPost.index].itemQty = totalQty;
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

    if (name === "adjustQty") {
      setAdded(true);
      setNewQty(value);
      setTotalQty(parseInt(editPost.itemQty) + parseInt(value));
    }
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
    <div className=" w-full mx-auto fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center p-2">
      <div className="overflow-auto mt-6 bg-white p-2 lg:p-4 text-black rounded-xl w-full lg:w-7/12">
        <div className="flex justify-between py-2">
          <div className=" text-lg font-bold">Adjust Stock Quantity </div>
          <button onClick={handleCloseStockModal}>
            <X size={30} />
          </button>
        </div>

        <hr />
        <div>
          <form
            onSubmit={handleSubmit}
            className="space-y-4 text-gray-800 dark:text-white mt-3 text-sm"
          >
            <div className="w-full flex flex-col lg:flex-row gap-x-10 mb-6">
              <div className="w-full lg:w-7/12">
                <div>
                  <label className="block font-medium mb-1">Date</label>
                  <input
                    type="date"
                    name="addedDate"
                    value={addedDate}
                    onChange={(e) => {
                      handleChange(e);
                    }}
                    required
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex justify-between gap-4 mt-4">
                  <div className="w-full mb-6">
                    <label className="block font-medium mb-1">
                      Add or Reduce Stock
                    </label>
                    <select
                      //onChange={handlePageChange}
                      defaultValue=""
                      className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="add">Add (+)</option>
                      <option value="reduce">Reduce (-)</option>
                    </select>
                  </div>
                  <div className="">
                    <div className="w-full ">
                      <label className="block font-medium mb-1">
                        Adjust Quantity
                      </label>
                      <input
                        type="number"
                        name="adjustQty"
                        min="0"
                        required
                        autoFocus
                        value={inputs?.adjustQty}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-px h-64 bg-gray-300 mx-4 hidden lg:block" />
              <div className="w-full lg:w-5/12">
                <div className="flex  justify-between gap-4 mb-6">
                  <div>
                    <div className="block mb-1 font-bold">Item Name</div>
                    <div className="block font-medium mb-1">
                      {editPost.itemName}
                    </div>
                  </div>
                  <div>
                    <div className="block font-bold mb-1">Item Code</div>
                    <div className="block font-medium mb-1">
                      {editPost.itemCode}
                    </div>
                  </div>
                </div>
                <hr className="w-full" />
                <div className="block font-bold mb-1 mt-2 text-md lg:text-lg">
                  {" "}
                  Stock Calculation
                </div>
                <div className="shadow-md p-4 rounded-lg border-[1.4px] mt-2">
                  <div>
                    <div className="flex justify-between ">
                      <div className="block font-medium mb-1">
                        Current Stock
                      </div>
                      <div className="block font-medium mb-1">
                        {editPost.itemQty}
                      </div>
                    </div>
                    {added && (
                      <div className="flex justify-between font-bold">
                        <div className="block font-medium mb-1 text-green-600">
                          Stock Added
                        </div>
                        <div className="block font-medium mb-1 text-green-600">
                          + {newQty}
                        </div>
                      </div>
                    )}
                  </div>
                  {/* <hr /> */}
                  {added && (
                    <div className="flex justify-between mt-6 font-bold text-md lg:text-lg border-t pt-2">
                      <div className="block font-medium mb-1">
                        Updated Stocks
                      </div>
                      <div className="block font-medium mb-1">{totalQty}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <hr />
            <div className="flex justify-end mt-4 gap-3">
              <button
                type="button"
                onClick={handleCloseStockModal}
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

export default StockModal;
