
import React, { useEffect, useState } from 'react'

import { MdDelete } from "react-icons/md";
import { useNavigate } from 'react-router-dom';


const AdditionalInformation = () => {

    const [posts, setPosts] = useState([]);
    const [allCategory, setAllCategory] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const handleDelete = async(id) => {
        
    }

    useEffect(()=> {
        let info3 = localStorage.getItem("additionalInfo");
        setPosts(JSON.parse(info3));

    },[]);

  return (
    <div>
      <div className="flex flex-col w-full mx-auto font-bold text-2xl bg-gray-200 py-4 px-2 rounded-md">Additional Information</div>
<div>

    <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-md mt-4">
      {
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
                  
                  className="text-red-600 hover:text-red-800 font-semibold text-sm"
                >
                  Delete
                </button>
              </td>
            </tr>
        </tbody>
      </table>}

      {/* {!addedInfo && (
            <AddBusinessInfo setAddedInfo={setAddedInfo}/>
          )} */}
    </div>
    </div>
   
           
            </div>
           
  )
}

export default AdditionalInformation