import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { db } from '../../config/firebase';
import Header from '../Header';

function AddTaxInfo() {
  const location = useLocation();  
  const [inputs, setInputs] = useState({});

  const navigate = useNavigate();
 
  const handleSubmit = async(event) => {
          event.preventDefault();
          
          // Add to local storage
           // sending  info to next screen
          localStorage.setItem("taxInfo", JSON.stringify(inputs));
          await addTaxData(inputs);

          toast("Tax Info Saved Successfully !!!");
        }
        const basicInfo_CollectionRef = collection(db, "Basic_Info");
        const addTaxData = async (inputs) => {
          try{
            // get doc id
            const data = await getDocs(basicInfo_CollectionRef);
            const filteredData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
          
            const loggedInUser = localStorage.getItem("user");
            const basicInfo = filteredData.filter(
              (x) => x.loggedInUser === loggedInUser
            )[0];
            
            // update business info 
            await updateTaxInfo(basicInfo.id, inputs);

            localStorage.setItem("taxInfo", JSON.stringify(inputs));
            navigate("/taxinfo");
          }catch(err){
              console.log(err);
          }
          
        };
  
        const updateTaxInfo = async (id, taxInfo) => {
            try {
              const codeDoc = doc(db, "Basic_Info", id);
              await updateDoc(codeDoc, {
                taxInfo: taxInfo,
              });
            } catch (er) {
              console.log(er);
            }
          };

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs(values => ({...values, [name]: value}))
  }
  const handleBack = () => {
    navigate(-1);
  }

   useEffect(() => {
          let info1 = localStorage.getItem("taxInfo");
          if(info1 === "undefined"){
            info1 = JSON.stringify({
              gstNumber: "",
              cgstAmount: "",
              sgstAmount: ""
            });
          }
          setInputs(JSON.parse(info1));
        },[]);

    return (
      <div>
        <Header/>
     
        <div className='p-6'>
          <div className="flex flex-col w-full mx-auto font-bold text-2xl bg-gray-200 py-4 px-2 rounded-md">Add Tax & GST Information</div>
       
        <div className='flex flex-col w-5/12 m-auto p-4 mt-10 shadow-lg border-2 p-5 bg-white gap-y-4 rounded-md'>
            

            <form onSubmit={handleSubmit} className="w-full mx-auto flex flex-col md:flex-row justify-between">
            <div className="flex flex-col gap-y-4 w-full md:w-7/12 mx-auto">
            <div className="flex flex-col">
                <div className="text-xs font-medium leading-5 text-gray-700">
                  GST Number
                </div>
                <div >
                  <input
                    className="form-input w-full block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                    
                    name="gstNumber"
                    placeholder="Enter GST Number"
                    value={inputs?.gstNumber || ""}                     
                    onChange={(e) => {
                      localStorage.setItem("gstNumber", e.target.value);
                      handleChange(e);
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="text-xs font-medium leading-5 text-gray-700 mt-2">
                  CGST %
                </div>
                <div >
                  <input
                    className="form-input w-5/12 block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                    
                    name="cgstAmount"
                    placeholder="CGST %"
                    value={inputs?.cgstAmount || ""}                     
                    onChange={(e) => {
                      localStorage.setItem("cgstAmount", e.target.value);
                      handleChange(e);
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="text-xs font-medium leading-5 text-gray-700 mt-2">
                  SGST %
                </div>
                <div>
                  <input
                    className="form-input w-5/12 block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                    
                    name="sgstAmount"
                    placeholder="SGST %"
                    value={inputs?.sgstAmount || ""}                     
                    onChange={(e) => {
                      localStorage.setItem("sgstAmount", e.target.value);
                      handleChange(e);
                    }}
                  />
                </div>
              </div>

             
              <div className="flex justify-evenly">
                    <div className='rounded-md flex justify-between w-full mx-auto'>
                    <button type='button' onClick={() => navigate('/taxinfo')} className='px-4 py-2 rounded-md text-black w-3/12 border-[1.4px] border-black'>Cancel</button>
                          <button type='submit' className='bg-[#444] px-4 py-2 rounded-md text-white w-3/12'>Save</button>
                    </div>
                </div>
              


            </div>
            </form>
        </div>
        </div>
        </div>
    )
}

export default AddTaxInfo;