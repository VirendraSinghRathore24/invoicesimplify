import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function BasicComplete() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNext = () => {
      // localStorage.setItem("businessInfo", JSON.stringify(businessInfo));
      // localStorage.setItem("taxInfo", JSON.stringify(taxInfo));
      // localStorage.setItem("additionalInfo", JSON.stringify(additionalInfo));

      navigate('/createinvoice');
  }

  
    return (
        
        <div className='flex flex-col w-full my-auto px-4 mt-10'>
            <div className='text-xl font-semibold'>Great !!! Basic Setup Completed</div>
                    

            <div className="w-full mx-auto flex flex-col md:flex-row justify-between mt-10">
            <div className="flex flex-col gap-y-4 w-full md:w-7/12 mx-auto">
              
              
              

              <div onClick={handleNext} className='rounded-md flex justify-center w-full'>
                    <button className='bg-[#444] px-6 py-3 rounded-md text-white font-semibold'>Create Invoice</button>
              </div>

            </div>
            </div>
        </div>
        
    )
}

export default BasicComplete;