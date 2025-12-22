import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";

const SignModal = ({ setSignature, handleSignOpen, handleCloseSign }) => {
  const sigRef = useRef();
  const [enableSave, setEnableSave] = useState(false);
  const containerRef = useRef(null);

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

  const resizeCanvas = () => {
    const canvas = sigRef.current?.getCanvas();
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const width = container.offsetWidth;
    const height = 200;

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.getContext("2d").scale(ratio, ratio);
  };

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center lg:left-64">
      <div className="mt-6 bg-white p-5 text-black rounded-xl w-full lg:w-5/12 m-2">
        <div className="flex justify-end">
          <button onClick={handleCloseSign} className="text-xl font-bold">
            <X size={30} />
          </button>
        </div>

        <div ref={containerRef} className="w-full max-w-xl">
          <SignatureCanvas
            ref={sigRef}
            penColor="black"
            canvasProps={{
              className: "w-full h-[200px] border border-black",
            }}
            onBegin={handleSignStart}
          />
        </div>

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
