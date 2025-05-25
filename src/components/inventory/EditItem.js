import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../config/firebase";
import { X } from "lucide-react";
import { toast } from "react-toastify";

function EditItem({handleCloseEditModal, setItemAdded, editPost}) {

const location = useLocation();
  const [inputs, setInputs] = useState(editPost);
  const [showList, setShowList] = useState(false);
  const [posts, setPosts] = useState([]);

  const navigate = useNavigate();
  const inventoryInfo_CollectionRef = collection(db, "Inventory_Info");

  

  const handleSubmit = async (event) => {
    event.preventDefault();

    // check if item is already added

    // update item to db
    await updateInventoryItems(inputs);

    setItemAdded(true);
    handleCloseEditModal();

    toast('Item updated successfully!!!');

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
    
    const existingItems = inventoryInfo.inventory;

    // Find the item to update
    const updatedItems = existingItems.map((item) =>
      item.id === inventoryInfo.id ? { ...item, ...inputs } : item
    );

    // Update the inventory in Firestore
    const codeDoc = doc(db, "Inventory_Info", inventoryInfo.id);
    await updateDoc(codeDoc, {
      inventory: updatedItems,
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

  return (
    <div className=" w-full mx-auto fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center ">
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
            className="w-full mx-auto flex flex-col md:flex-row justify-between mt-10"
          >
            <div className="flex flex-col gap-y-4 w-full  mx-auto">
              <div className="flex flex-col gap-y-4">
                
                <div className="w-full mx-auto">
                  <input
                    className="form-input w-[400px] block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
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
                 <button type='button' onClick={handleCloseEditModal} className='px-4 py-2 rounded-md text-black w-3/12 border-[1.4px] border-black'>Cancel</button>
                  <button
                    type="submit"
                    className="bg-[#444] px-4 py-2 rounded-md text-white w-3/12"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
    </div>
    </div>
  );
}

export default EditItem;
