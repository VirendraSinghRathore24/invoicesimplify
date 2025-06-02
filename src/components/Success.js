import confetti from 'canvas-confetti';
import React, { useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import Header from './Header';

const Success = () => {
    const location = useLocation();

    const {order} = location.state;
    const date = new Date().toString();
    useEffect(() => {
        confetti({
            particleCount: 500,
            spread:75
           })
    }, [])
  return (
    <div>
        <Header />
   
    <div className='flex flex-col text-center w-full mx-auto h-full quicksand-bold'>
        <div className='flex flex-col gap-y-4 text-black mt-8 md:mt-36 w-full md:w-5/12 mx-auto justify-center'>
            <div className=' text-[36px] font-bold'>Payment Successful! 🎉</div>
            <div className=' text-[18px] text-left p-4'>Thank you for your purchase! Your payment has been successfully processed.</div>
            <div className='text-[20px] font-bold text-left p-4'>Order Details:</div>
            <div className='font-semibold text-left p-4'>
                <div>✅ Order ID: <span className='font-normal'> {order.id} </span></div>
                <div className='mt-2'>✅ Amount Paid: <span className='font-normal'> {order.amount/100} {order.currency} </span></div>
                <div className='mt-2'>✅ Plan Type: <span className='font-normal'> Most Popular </span></div>
                <div className='mt-2'>✅ Date: <span className='font-normal'>  {date}</span></div>
            </div>
            <NavLink className='bg-[#FF5721] mt-10 flex justify-center mx-auto text-lg text-white py-2 md:py-4 px-4 md:px-8 font-semibold rounded-md text-richblack-700 hover:border-2 hover:border-[#FF5721] hover:bg-white hover:text-[#FF5721]' to={'/createinvoice'}>Create Your Invoice</NavLink>
        </div>
    </div>
    </div>
  )
}

export default Success