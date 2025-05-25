
import React from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();
  
 const handleLogout = () => {
   localStorage.clear();
   navigate('/login');
 }

  return (
    <div className="bg-[#444] w-full m-auto h-full flex flex-col">
      <div onClick={handleLogout} className="underline text-blue-500 font-bold text-xl cursor-pointer">Logout</div>
    </div>
  );
};

export default Logout;
