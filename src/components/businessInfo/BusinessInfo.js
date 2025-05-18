
import React, { useEffect, useState } from 'react'

import { MdDelete } from "react-icons/md";
import Home from './EditBusinessInfo';
import AddBusinessInfo from '../additionalInfo/AddBusinessInfo';
import { Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const BusinessInfo = () => {

    const [posts, setPosts] = useState([]);
    const [allCategory, setAllCategory] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);
    const [addedInfo, setAddedInfo] = useState(false);

    const navigate = useNavigate();

    const getCategory = async () => {
        
    } 
    const handleDelete = async(id) => {
        // TODO - use DB as well to delete
        localStorage.removeItem("businessInfo");
        setAddedInfo(false);

    }

    const handleSearch = (e) => {
        
    }

    useEffect(()=> {
       // getCategory();
       let info1 = localStorage.getItem("businessInfo");

       if(!info1){
         setAddedInfo(false);
       }
       else{
        setPosts(JSON.parse(info1));
        setAddedInfo(true);
       }

    },[addedInfo]);

  return (
    <div>
       <div className="flex flex-col w-full mx-auto font-bold text-2xl bg-gray-200 py-4 px-2 rounded-md">Business Information</div>
    <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-md mt-4">
      {addedInfo && 
      <table className="min-w-full text-sm text-left text-gray-700">
        <thead className="bg-gray-100 text-xs uppercase text-gray-600 border-b">
          <tr>
            <th className="px-4 py-3 border-r">Title</th>
            <th className="px-4 py-3 border-r">SubTitle1</th>
            <th className="px-4 py-3 border-r">Address</th>
            <th className="px-4 py-3 border-r">Phone1</th>
            <th className="px-4 py-3 border-r">Phone2</th>
            <th className="px-4 py-3 border-r">Email</th>
            <th className="px-4 py-3 border-r">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
         
            <tr
              
              className='border-t bg-white'
            >
              <td className="px-4 py-3 border-r">{posts?.name}</td>
              <td className="px-4 py-3 border-r">{posts?.subTitle1}</td>
              <td className="px-4 py-3 border-r">{posts?.address1}, {posts?.address2} - {posts?.address3}</td>
              <td className="px-4 py-3 border-r">{posts?.phonePrimary}</td>
              <td className="px-4 py-3 border-r">{posts?.phoneSecondary}</td>
              <td className="px-4 py-3 border-r">{posts?.email}</td>
              <td className="px-4 py-3">
                <button onClick={() => navigate('/editbusinessinfo')} className="text-blue-600 hover:text-red-800 font-semibold text-sm">Edit</button>
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

      {!addedInfo && (
            <AddBusinessInfo setAddedInfo={setAddedInfo}/>
          )}
    </div>
    </div>

  )
}

export default BusinessInfo