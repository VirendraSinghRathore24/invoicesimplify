import React, { useRef, useState } from 'react';
import { IoCameraOutline } from "react-icons/io5";
import { MdOutlineCancel } from "react-icons/md";

const ImageUpload = ({setSelectedFile, avatarURL, setAvatarURL}) => {
    
    const fileUploadRef = useRef();
    

    const handleImageUpload = (event) => {
        event.preventDefault();
        fileUploadRef.current.click();
    }

    const uploadImageDisplay = () => {
        const uploadedFile = fileUploadRef.current.files[0];
        setSelectedFile(uploadedFile);

        if(uploadedFile !== undefined)
        {
            const cachedURL = URL.createObjectURL(uploadedFile);
            setAvatarURL(cachedURL);
        }
    }

    const handleCancel = (event) => {
        event.preventDefault();
        setAvatarURL('');
        event.stopPropagation();
       
    }

  return (
    <div className='relative w-[150px] h-[150px]'>
        

        <form id='form' encType='multipart/form-data'>
        <button 
            type='submit'
            onClick={handleImageUpload}
            >
            {
                !avatarURL ? (<IoCameraOutline size={20} color='black' className='w-[100px] h-[100px] rounded-md'/>) 
                          : (
                            <div>
                                <div onClick={handleCancel} className='absolute right-0 bg-black/30'>
                                    <MdOutlineCancel size={20} color='white'/>
                                </div>
                                <img src={avatarURL} alt='Avatar' className='w-[100px] h-[100px] rounded-md'/>
                            </div>)
            }
            
        </button>
            <input 
                type='file'
                id='file'
                ref={fileUploadRef}
                onChange={uploadImageDisplay}
                hidden
            />

        </form>
    </div>
  )
}

export default ImageUpload