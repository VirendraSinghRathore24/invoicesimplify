
import React, { useEffect, useState } from 'react'

import { MdDelete } from "react-icons/md";
import { useNavigate } from 'react-router-dom';


const TaxInfo = () => {

    const [posts, setPosts] = useState([]);
    const [allCategory, setAllCategory] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();


    const getCategory = async () => {
        
    } 
    const handleDelete = async(id) => {
        
    }

    const handleSearch = (e) => {
        
    }

    useEffect(() => {
           let info1 = localStorage.getItem("taxInfo");
           setPosts(JSON.parse(info1));
         },[]);

  return (
    <div>
      <div className="flex flex-col w-full mx-auto font-bold text-2xl bg-gray-200 py-4 px-2 rounded-md">Tax Information</div>
<div>

    <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-md mt-4">
      {
      <table className="min-w-full text-sm text-left text-gray-700">
        <thead className="bg-gray-100 text-xs uppercase text-gray-600 border-b">
          <tr>
            <th className="px-4 py-3 border-r">GSTIN</th>
            <th className="px-4 py-3 border-r">CGST %</th>
            <th className="px-4 py-3 border-r">SGST %</th>
            <th className="px-4 py-3 border-r">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
         
            <tr
              
              className='border-t bg-white'
            >
              <td className="px-4 py-3 border-r">{posts?.gstNumber}</td>
              <td className="px-4 py-3 border-r">{posts?.cgstAmount}</td>
              <td className="px-4 py-3 border-r">{posts?.sgstAmount}</td>
              <td className="px-4 py-3">
                <button onClick={() => navigate('/edittaxinfo')} className="text-blue-600 hover:text-red-800 font-semibold text-sm">Edit</button>
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

export default TaxInfo