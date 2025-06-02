import React from 'react';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Header() {

    const navigate = useNavigate();
    return (
        
        <div className="top-0  mx-auto w-full  h-[72px] text-white sticky bg-white shadow-md">
            <div className='flex justify-end p-4 gap-x-8'>
            <div className='text-black '><button onClick={() => navigate('/upgrade')} className='bg-[#FF5721] text-md text-white py-2 px-4 font-semibold rounded-md text-richblack-700 hover:bg-white hover:text-[#FF5721] hover:border-2 hover:border-[#FF5721] cursor-pointer tracking-wide'>Upgrade</button></div>
            <div className=' '>
               <User color='black' size={32}/>
            </div>
            </div>
        </div>
        
    )
}

export default Header;

