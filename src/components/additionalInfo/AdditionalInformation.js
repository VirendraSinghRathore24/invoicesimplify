
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'

import { MdDelete } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { db } from '../../config/firebase';
import Header from '../Header';


const AdditionalInformation = () => {

    const [posts, setPosts] = useState([]);
    const [allCategory, setAllCategory] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
   const handleDelete = async () => {
       console.log(posts);
       const isDeleted = await deleteBusinessInfo();
       if (isDeleted) {
         localStorage.removeItem("additionalInfo");
         setPosts(null);
         
       }
     };
     const basicInfo_CollectionRef = collection(db, "Basic_Info");
     const deleteBusinessInfo = async () => {
       try {
         var res = window.confirm("Delete the item?");
         if (res) {
           const data = await getDocs(basicInfo_CollectionRef);
           const filteredData = data.docs.map((doc) => ({
             ...doc.data(),
             id: doc.id,
           }));
   
           const loggedInUser = localStorage.getItem("user");
           const basicInfo = filteredData.filter(
             (x) => x.loggedInUser === loggedInUser
           )[0];
   
           const codeDoc = doc(db, "Basic_Info", basicInfo.id);
           await updateDoc(codeDoc, {
             additionalInfo: null,
           });
           return true;
         }
       } catch (er) {
         console.log(er);
         return false;
       }
     };

     const handleLogin = () => {
      const user = localStorage.getItem("user");
  
      if(!user || user === "undefined" || user === "null"){
        navigate("/login");
      } 
  }
    useEffect(()=> {
      handleLogin();
        let info3 = localStorage.getItem("additionalInfo");
        if(info3 === "undefined" || info3 === "null"){
            setPosts([]);
        }else{
            setPosts(JSON.parse(info3));
        }

    },[]);

  return (
    <div>
      <Header/>
   
    <div className='p-6'>
      <div className="flex flex-col w-full mx-auto font-bold text-2xl bg-gray-200 py-4 px-2 rounded-md">Additional Information</div>
<div>

    <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-md mt-4">
      { posts &&
      <table className="min-w-full text-sm text-left text-gray-700">
        <thead className="bg-gray-100 text-xs uppercase text-gray-600 border-b">
          <tr>
            <th className="px-4 py-3 border-r">Note1</th>
            <th className="px-4 py-3 border-r">Note2</th>
            <th className="px-4 py-3 border-r">Note3</th>
            <th className="px-4 py-3 border-r">Note4</th>
            <th className="px-4 py-3 border-r">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
         
            <tr
              
              className='border-t bg-white'
            >
              <td className="px-4 py-3 border-r">{posts?.note1}</td>
              <td className="px-4 py-3 border-r">{posts?.note2}</td>
              <td className="px-4 py-3 border-r">{posts?.note3}</td>
              <td className="px-4 py-3 border-r">{posts?.note4}</td>
              <td className="px-4 py-3">
                <button onClick={() => navigate('/editadditionalinfo')} className="text-blue-600 hover:text-red-800 font-semibold text-sm">Edit</button>
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => handleDelete()}
                  className="text-red-600 hover:text-red-800 font-semibold text-sm"
                >
                  Delete
                </button>
              </td>
            </tr>
        </tbody>
      </table>}

      {!posts && (
          <div className="flex h-screen items-center justify-center ">
            <div onClick={() => navigate("/addadditionalinfo")}>
              <button className="border-2 bg-[#444] text-white fond-bold text-lg py-4 px-8 rounded-md cursor-pointer">
                {" "}
                + Add Additional Info
              </button>
            </div>
          </div>
        )}
    </div>
    </div>
   
           
            </div>
            </div> 
  )
}

export default AdditionalInformation