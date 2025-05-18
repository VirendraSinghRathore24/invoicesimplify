import { addDoc, collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../config/firebase';
import { toast } from 'react-toastify';

function EditBusinessInfo() {
 
    const navigate = useNavigate();
    const [inputs, setInputs] = useState({});
    const [infoExists, setInfoExists] = useState(true);
    const [saving, setSaving] = useState(false);


    const delay = async (ms) => {
      return new Promise((resolve) => 
          setTimeout(resolve, ms));
  };

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({...values, [name]: value}))
      }

      const handlePhoneChange = (event) => {
        const { name, value } = event.target;
        if (/^\d{0,10}$/.test(value)) { // Allow only numeric values up to 10 digits
          setInputs((values) => ({ ...values, [name]: value }));
          localStorage.setItem(name, value);
        }
      };
    
      const handleSubmit = async(event) => {
              event.preventDefault();
              
              // Add to local storage
              localStorage.setItem("businessInfo", JSON.stringify(inputs));
              await addBusinessData(inputs);

              toast("Business Info Saved Successfully !!!");
            }
            const basicInfo_CollectionRef = collection(db, "Basic_Info");
            const addBusinessData = async (inputs) => {
              try{
                // get doc id
                const data = await getDocs(basicInfo_CollectionRef);
                const filteredData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
              
                const loggedInUser = localStorage.getItem("user");
                const basicInfo = filteredData.filter(
                  (x) => x.loggedInUser === loggedInUser
                )[0];
                
                // update business info 
                await updateBusinessInfo(basicInfo.id, inputs)
              }catch(err){
                  console.log(err);
              }
              
            };
      
            const updateBusinessInfo = async (id, businessInfo) => {
                try {
                  const codeDoc = doc(db, "Basic_Info", id);
                  await updateDoc(codeDoc, {
                    businessInfo: businessInfo,
                  });
                  setSaving(true);
                  await delay(2000);
                  setSaving(false);
                  toast('Business Info Updated Successfully !!!');
                } catch (er) {
                  console.log(er);
                }
              };

      useEffect(() => {
        let info1 = localStorage.getItem("businessInfo");

        if(!info1) {
            setInfoExists(false);
        }
        else{
            setInputs(JSON.parse(info1));
            setInfoExists(true);
        }
        
      },[]);

    return (
        <div >
          <div className="flex flex-col w-full mx-auto font-bold text-2xl bg-gray-200 py-4 px-2 rounded-md">Edit Business Information</div>
        <div className='flex flex-col w-full m-auto px-4 py-4 shadow-lg border-2 p-5 bg-white gap-y-4 rounded-md mt-2'>
          

            <form onSubmit={handleSubmit} className="w-full mx-auto flex flex-col md:flex-row justify-between mt-10">
            <div className="flex flex-col gap-y-4 w-full md:w-7/12 mx-auto">
              

            <div className="flex flex-col">
                <div className="text-xs font-medium leading-5 text-gray-700 mt-2">
                  Logo
                </div>
                <div >
                  <div className='border-[1.4px] w-[80px] h-[80px] rounded-md text-gray-600 cursor-pointer border-gray-400 p-4'>Upload Logo</div>
                </div>
              </div>

              <div className="flex flex-col">
                <div className="text-xs font-medium leading-5 text-gray-700 mt-2">
                  Title
                </div>
                <div>
                  <input
                    className="form-input w-full block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                    required
                    name="name"
                    placeholder="बाईसाराज पौशाक पैलेस"
                    value={inputs?.name || ""}                     
                    onChange={(e) => {
                      localStorage.setItem("name", e.target.value);
                      handleChange(e);
                    }}
                  />
                </div>
              </div>
              <div className='flex w-full mx-auto justify-between gap-x-4'>
              <div className="flex flex-col w-full">
                <div className="text-xs font-medium leading-5 text-gray-700 mt-2">
                  Sub Title1
                </div>
                <div>
                  <input
                    className="form-input w-full block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                    name="subTitle1"
                    placeholder="Poshak | Sarees | Cotton Suites"
                    value={inputs?.subTitle1 || ""}   
                    onChange={(e) => {
                      localStorage.setItem("subTitle1", e.target.value);
                      handleChange(e);
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-col w-full">
                <div className="text-xs font-medium leading-5 text-gray-700 mt-2">
                  Sub Title2
                </div>
                <div>
                  <input
                    className="form-input w-full block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                    
                    name="subTitle2"
                    placeholder="Business Name"
                    value={inputs?.subTitle2 || ""}  
                    onChange={(e) => {
                      localStorage.setItem("subTitle2", e.target.value);
                      handleChange(e);
                    }}
                  />
                </div>
              </div>
              </div>
              
              <div className="flex flex-col">
                <div className="text-xs font-medium leading-5 text-gray-700 mt-2">
                  Address
                </div>
                <div >
                  <input
                    className="w-full block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                    
                    name="address1"
                    placeholder="Ground Floor, Gordhan Sky Mall, Khatipura Road,"
                    value={inputs?.address1 || ""}  
                    onChange={(e) => {
                      localStorage.setItem("address1", e.target.value);
                      handleChange(e);
                    }}
                  />
                </div>
              </div>
              <div className='flex w-full mx-auto justify-between gap-x-4'>

                  <input
                    className="w-full block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                    
                    name="address2"
                    placeholder="Jhotwara, Jaipur"
                    value={inputs?.address2|| ""}  
                    onChange={(e) => {
                      localStorage.setItem("address2", e.target.value);
                      handleChange(e);
                    }}
                  />

                  <input
                    className="w-2/12 block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                    maxLength={6}
                    name="address3"
                    placeholder="302023"
                    value={inputs?.address3 || ""}  
                    onChange={(e) => {
                      localStorage.setItem("address3", e.target.value);
                      handleChange(e);
                    }}
                  />
            
             
                  </div>

                  <div className='flex w-full mx-auto justify-between gap-x-4'>
                    <div className='flex w-6/12 gap-x-4'>
   
              

              <div className="flex flex-col ">
        
        <div className="text-xs font-bold leading-5 text-gray-700 mt-2">
        Phone (Primary)
        </div>
        <div className="flex justify-start items-left -ml-4">
          <span className="p-[7px] bg-[#eee] border border-[#ccc] border-r-0 rounded-l font-normal text-sm"
          >
            +91
          </span>
          <input
          className="p-[5px] pl-[10px] border border-[#ccc] rounded-r w-[120px] text-sm text-left"
            type="text"
                    name="phonePrimary"
     
            value={inputs?.phonePrimary || ""}  
                    onChange={(e) => handlePhoneChange(e)}
            maxLength={10}
            placeholder="Mobile number..."
          />
        </div>
 
    </div>


    <div className="flex flex-col ">
        
        <div className="text-xs font-bold leading-5 text-gray-700 mt-2">
        Phone (Secondary)
        </div>
        <div className="flex justify-start items-left -ml-4">
          <span className="p-[7px] bg-[#eee] border border-[#ccc] border-r-0 rounded-l font-normal text-sm"
          >
            +91
          </span>
          <input
          className="p-[5px] pl-[10px] border border-[#ccc] rounded-r w-[120px] text-sm text-left"
            type="text"
                    name="phoneSecondary"
     
            value={inputs?.phoneSecondary || ""}  
                    onChange={(e) => handlePhoneChange(e)}
            maxLength={10}
            placeholder="Mobile number..."
          />
        </div>
        </div>
 
    </div>

              <div className="flex flex-col w-8/12">
                <div className="text-xs font-medium leading-5 text-gray-700 mt-2">
                  Email
                </div>
                <div>
                  <input
                    className="w-full block text-xs rounded border border-gray-400 py-2 px-4 leading-5 focus:text-gray-600"
                    
                    name="email"
                    type="email"
                    placeholder="baisarajjaipur@gmail.com"
                    value={inputs?.email || ""}  
                    onChange={(e) => {
                      localStorage.setItem("email", e.target.value);
                      handleChange(e);
                    }}
                  />
                </div>
              </div>
              </div>
              <div >
                    <div className='rounded-md flex justify-end w-full mx-auto'>
                    
                          <button type='submit' className='bg-[#444] px-4 py-2 rounded-md text-white w-full'>


                          <span className="flex items-center gap-1">
              {saving ? (
                <div className=' flex justify-center w-full mx-auto py-2 gap-x-3'>
                  <div className="h-3 w-3 bg-[#d6f539] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="h-3 w-3 bg-[#d6f539] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="h-3 w-3 bg-[#d6f539] rounded-full animate-bounce"></div>
                </div>
              ) : (
                <div className='text-center w-full mx-auto'>
                    Update
                </div>
              )}
            </span>

                          </button>
                    </div>
                </div>

            </div>
            </form>
        </div>
        </div>
    )
}

export default EditBusinessInfo;