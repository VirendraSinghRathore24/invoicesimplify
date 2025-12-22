import React, { useEffect, useState } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../../config/firebase";
import { BASIC_INFO, CREATORS } from "../Constant";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";

export default function LogoUpload({ onUpload, logoUrl = "" }) {
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(logoUrl);
  const [uploading, setUploading] = useState(false);

  const VITE_CLOUDINARY_CLOUD_NAME = "dixqxdivr";
  const VITE_CLOUDINARY_UPLOAD_PRESET = "invoice_logo_upload";

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const uploadLogo = async () => {
    if (!file) {
      alert("Please select a logo");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", VITE_CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      localStorage.setItem("creator_logoUrl", data.secure_url);
      onUpload(data.secure_url);
      await addLogo(data.secure_url);
      alert("Logo uploaded successfully : " + data.secure_url);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };
  const uid = localStorage.getItem("uid");
  const basicInfo_CollectionRef = collection(
    doc(db, CREATORS, uid),
    BASIC_INFO
  );
  const addLogo = async (logoUrl) => {
    try {
      // get doc id
      const data = await getDocs(basicInfo_CollectionRef);
      const basicInfo = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      // update business info
      basicInfo[0].personalInfo.logoUrl = logoUrl;
      await updateLogo(basicInfo[0].id, basicInfo[0].personalInfo);
    } catch (err) {
      console.log(err);
    }
  };

  const delay = async (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const updateLogo = async (id, personalInfo) => {
    try {
      const codeDoc = doc(db, CREATORS, uid, BASIC_INFO, id);

      await updateDoc(codeDoc, {
        personalInfo: personalInfo,
      });
      setSaving(true);
      await delay(2000);
      setSaving(false);
    } catch (er) {
      console.log(er);
    }
  };

  useEffect(() => {
    setPreview(logoUrl);
  }, [logoUrl]);

  return (
    <div className="max-w-sm rounded-xl border border-dashed border-gray-300 p-4">
      <h3 className="mb-3 text-lg font-semibold">🏪 Upload Logo</h3>

      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="mb-3 h-24 w-24 rounded object-contain"
        />
      )}

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mb-3 block w-full text-sm text-gray-600
                   file:mr-4 file:rounded-lg file:border-0
                   file:bg-gray-100 file:px-4 file:py-2
                   file:text-sm file:font-semibold
                   hover:file:bg-gray-200"
      />

      <button
        onClick={uploadLogo}
        disabled={uploading}
        className={`w-full rounded-lg px-4 py-2 text-white transition
          ${
            uploading
              ? "cursor-not-allowed bg-gray-400"
              : "bg-green-500 hover:bg-green-600"
          }`}
      >
        {uploading ? "Uploading..." : "Upload Logo"}
      </button>
    </div>
  );
}
