import React, { useRef, useState } from "react";
import { X } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";

const SignModal = ({ setSignature, handleSignOpen, handleCloseSign }) => {
  const sigRef = useRef();
  const [enableSave, setEnableSave] = useState(false);

  const handleSignatureEnd = () => {
    setSignature(sigRef.current.toDataURL());
    handleCloseSign();
    handleSignOpen();

    localStorage.setItem("sign", sigRef.current.toDataURL());
  };
  const handleSignStart = () => {
    setEnableSave(true);
  };
  const clearSignature = () => {
    sigRef.current.clear();
    setSignature(null);
    setEnableSave(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center">
      <div className="mt-6 bg-white p-5 text-black rounded-xl w-full md:w-5/12 m-2">
        <div className="flex justify-end">
          <button onClick={handleCloseSign} className="text-xl font-bold">
            <X size={30} />
          </button>
        </div>

        <SignatureCanvas
          penColor="black"
          canvasProps={{
            className:
              "signature border border-gray-400 rounded-md w-full h-48",
          }}
          ref={sigRef}
          onBegin={handleSignStart}
          minWidth={1}
          maxWidth={3}
          velocityFilterWeight={0.7}
        />

        <div className="flex justify-between my-2">
          <button
            onClick={clearSignature}
            className="bg-gray-900 text-white rounded-md p-2"
          >
            Clear
          </button>
          {enableSave ? (
            <button
              onClick={handleSignatureEnd}
              className="bg-gray-900 text-white rounded-md p-2"
            >
              Save
            </button>
          ) : (
            <button disabled className="bg-blue-300 text-white rounded-md p-2">
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignModal;
