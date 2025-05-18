import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../config/firebase";
import AddItem from "./AddItem";

function AddInventory() {
  const location = useLocation();
  const [inputs, setInputs] = useState({});
  const [showList, setShowList] = useState(false);
  const [posts, setPosts] = useState([]);

  const navigate = useNavigate();
  const inventoryInfo_CollectionRef = collection(db, "Inventory_Info");

  const [openItem, setOpenItem] = useState(false);  
    const handleCloseItem = () => {
      setOpenItem(false);
    }

  const handleSubmit = async (event) => {
    event.preventDefault();

    // check if item is already added

    // update item to db
    await updateInventoryItems(inputs);

    // // TODO - rework with DB
    // const data = [
    //   { name: "Aari Jarsdoshi Poshak" },
    //   { name: "New Design Poshak" },
    //   { name: "Apni Poshak" },
    //   { name: "Gotta and Jari Poshak" },
    //   { name: "Amazing Poshak" },
    //   { name: "Jaipuri Poshak" },
    // ];

    // sending  info to next screen
    //localStorage.setItem("inventory", JSON.stringify(data));
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

  const checkIfListExists = async() => {
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

    if(existingItems.length > 0){
      setShowList(true);
      setPosts(inventoryInfo.inventory);
    }
  }

  useEffect(() => {
    // call db to check the items length
    checkIfListExists();

    let info1 = localStorage.getItem("inventory");
    setInputs(JSON.parse(info1));
  }, []);

  return (
    <div>
       <div className="flex flex-col w-full mx-auto font-bold text-2xl bg-gray-200 py-4 px-2 rounded-md">Add Inventory</div>
        
   
    <div className="flex flex-col w-5/12 m-auto p-4 mt-10 ">
      <button onClick={() => setOpenItem(true)} className="w-3/12 border-1 px-4 py-2 bg-[#444] text-white font-bold rounded-md hover:bg-amber-800"> +  Add Item</button>
      {showList ? (
        <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-md mt-2">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-xs uppercase text-gray-600 border-b">
            <tr>
              <th className="px-4 py-3 border-r">S.No.</th>
              <th className="px-4 py-3 border-r">Item Name</th>
              <th className="px-4 py-3 border-r">Edit</th>
              <th className="px-4 py-3">Delete</th>
            </tr>
          </thead>
          <tbody>
            {
              posts && posts.length > 0 && posts.map((post, index) => (
                <tr className="border-t bg-white">
              <td className="px-4 py-3 border-r">{index + 1}.</td>
              <td className="px-4 py-3 border-r">{post?.itemName}</td>

              <td className="px-4 py-3 cursor-pointer">
                <button
                  onClick={() => navigate("/editbusinessinfo")}
                  className="text-blue-600 hover:text-red-800 font-semibold text-sm"
                >
                  Edit
                </button>
              </td>
              <td className="px-4 py-3 cursor-pointer">
                <button className="text-red-600 hover:text-red-800 font-semibold text-sm">
                  Delete
                </button>
              </td>
            </tr>
              ))
            }
            
          </tbody>
        </table>
        </div>
      ) : (
        <div>
          <div className="text-xl font-semibold text-center">Add Item</div>

          <form
            onSubmit={handleSubmit}
            className="w-full mx-auto flex flex-col md:flex-row justify-between mt-10"
          >
            <div className="flex flex-col gap-y-4 w-full md:w-7/12 mx-auto">
              <div className="flex justify-evenly">
                <div className="w-4/12 mx-auto text-xs font-medium leading-5 text-gray-700 mt-2">
                  Item Name
                </div>
                <div className="w-8/12 mx-auto">
                  <input
                    className="form-input w-full block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                    name="itemName"
                    required
                    placeholder="Enter Item Name"
                    value={inputs?.itemName || ""}
                    onChange={(e) => {
                      localStorage.setItem("itemName", e.target.value);
                      handleChange(e);
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-evenly">
                <div className="rounded-md flex justify-between w-full mx-auto">
                  <button
                    type="submit"
                    className="bg-[#444] px-4 py-2 rounded-md text-white w-full"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
      {openItem && (
            <AddItem
              handleCloseItem={handleCloseItem}
              
            ></AddItem>
          )}
    </div>
    </div>
  );
}

export default AddInventory;
