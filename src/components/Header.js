import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';

function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const userCode = localStorage.getItem('user');

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="top-0 mx-auto w-full h-[72px] text-white sticky bg-white shadow-md">
            <div className='flex justify-end p-4 gap-x-8'>
                <div className='text-black'>
                    <button onClick={() => navigate('/upgrade')} className='bg-[#FF5721] text-md text-white py-2 px-4 font-semibold rounded-md text-richblack-700 hover:bg-white hover:text-[#FF5721] hover:border-2 hover:border-[#FF5721] cursor-pointer tracking-wide'>Upgrade</button>
                </div>
                <div className='relative'>
                    <div
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        //onMouseLeave={() => setIsMenuOpen(false)}
                        className='cursor-pointer'
                    >
                        <User color='black' size={32} />
                    </div>
                    {isMenuOpen && (
                        <div className='absolute right-0 mt-3 w-48 bg-white border border-gray-300 rounded-md shadow-lg'>
                            <div className='px-4 py-2 text-sm text-gray-700'>User Code: {userCode}</div>
                            <div
                                onClick={handleLogout}
                                className='px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer'
                            >
                                Logout
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Header;