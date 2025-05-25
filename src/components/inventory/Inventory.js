import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../config/firebase";
import AddItem from "./AddItem";
import { Edit } from "lucide-react";
import EditItem from "./EditItem";

function Inventory() {
  const location = useLocation();
  const [inputs, setInputs] = useState({});
  const [showList, setShowList] = useState(false);
  const [posts, setPosts] = useState([]);
  const [itemAdded, setItemAdded] = useState(false);
  const [editPost, setEditPost] = useState(null);
  

  const navigate = useNavigate();
  const inventoryInfo_CollectionRef = collection(db, "Inventory_Info");

  const [openItem, setOpenItem] = useState(false);  
    const handleCloseItem = () => {
      setOpenItem(false);
    }

    const [openEditModal, setOpenEditModal] = useState(false);  
    const handleCloseEditModal = () => {
      setOpenEditModal(false);
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
    const existingItems = inventoryInfo.inventory.sort((a, b) => a.itemName.localeCompare(b.itemName));

    if(existingItems.length > 0){
      setShowList(true);
      setPosts(inventoryInfo.inventory);
    }
  }

  const handleEdit = (post) => {
    setEditPost(post);
    setOpenEditModal(true);
    
  }

  useEffect(() => {
    // call db to check the items length
    checkIfListExists();

    let info1 = localStorage.getItem("inventory");
    setInputs(JSON.parse(info1));
  }, [itemAdded]);

  return (
    <div>
       <div className="flex flex-col w-full mx-auto font-bold text-2xl bg-gray-200 py-4 px-2 rounded-md">Add Inventory</div>
        
   
    <div className="flex flex-col w-full m-auto p-4">
      
      {showList ? (
        <div>
          <div className="flex justify-end">
      <button onClick={() => setOpenItem(true)} className="w-2/12 border-1 px-4 py-2 bg-[#444] text-white font-bold rounded-md hover:bg-amber-800"> +  Add Item</button>
      </div>
        <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-md mt-4">
          
         <div className="p-4">
        <input
          type="text"
          placeholder="Search..."
          
          className="p-2 border border-gray-300 rounded-md mb-4 w-full"
        />
      </div>
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
                <tr key={index}
                className={`border-t ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-gray-200`}>
              <td className="px-4 py-3 border-r">{index + 1}.</td>
              <td className="px-4 py-3 border-r">{post?.itemName}</td>

              <td className="px-4 py-3 cursor-pointer">
                <button
                  onClick={() => handleEdit(post)}
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
    </div>
    </div>
  );
}

export default Inventory;
