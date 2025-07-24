// EmailScheduler.jsx
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../../config/firebase";
import { SCHEDULED_EMAILS } from "../Constant";
import MobileMenu from "../MobileMenu";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Loader } from "lucide-react";

const EmailScheduler = () => {
  const [emailInfo, setEmailInfo] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleDelete = async () => {
    var res = window.confirm("Are you sure to delete this email schedule?");
    if (res) {
      const uid = localStorage.getItem("uid");
      const scheduledEmails_CollectionRef = collection(db, SCHEDULED_EMAILS);
      try {
        const querySnapshot = await getDocs(scheduledEmails_CollectionRef);
        const emailData = querySnapshot.docs
          .map((doc) => ({ ...doc.data(), id: doc.id }))
          .find((data) => data.uid === uid);
        if (emailData) {
          const docRef = doc(scheduledEmails_CollectionRef, emailData.id);
          await deleteDoc(docRef);
          setEmailInfo([]);
          toast("✅ Email schedule deleted successfully !!!");
        } else {
          toast("❌ No email schedule found to delete.");
        }
      } catch (error) {
        console.error("Firebase error:", error);
        toast("❌ Failed to delete schedule.");
      }
    }
  };
  const handleEdit = (id) => {
    navigate("/editemailscheduler", { state: { id } });
  };

  useEffect(() => {
    // get email info from d)
    const fetchEmailInfo = async () => {
      try {
        const uid = localStorage.getItem("uid");
        const scheduledEmails_CollectionRef = collection(db, SCHEDULED_EMAILS);
        const querySnapshot = await getDocs(scheduledEmails_CollectionRef);
        const emailData = querySnapshot.docs
          .map((doc) => ({ ...doc.data(), id: doc.id }))
          .find((data) => data.uid === uid);

        if (emailData) {
          setEmailInfo([emailData]);
          console.log("Email Info:", emailData);
        }
      } catch (error) {
        console.error("Error fetching email info:", error);
      }
    };
    fetchEmailInfo();
  }, []);

  return (
    <div>
      <div className="hidden lg:block mb-12">
        <div className="top-0 mx-auto w-full h-[68px] text-white fixed bg-white shadow-lg">
          <div className="flex justify-between mx-auto font-bold text-md  py-4 px-2 rounded-md fixed w-[81.5%]">
            <div className="text-xl text-black">Email Scheduler</div>
          </div>
        </div>
      </div>

      <div className="hidden max-lg:block mb-16">
        <MobileMenu />
      </div>

      <div className="p-2 lg:p-6">
        <div>
          {emailInfo && emailInfo.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-md mt-4">
              <table className="min-w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 text-xs uppercase text-gray-600 border-b">
                  <tr className="text-center">
                    <th className="px-4 py-3 border-r">Email</th>
                    <th className="px-4 py-3 border-r">Schedule</th>
                    <th className="px-4 py-3 border-r">Edit</th>
                    <th className="px-4 py-3">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t bg-white text-center">
                    <td className="px-4 py-3 border-r">
                      {emailInfo[0]?.email}
                    </td>
                    <td className="px-4 py-3 border-r">
                      {emailInfo[0]?.frequencies && emailInfo[0]?.frequencies
                        ? emailInfo[0].frequencies.join(", ")
                        : "Not Scheduled"}
                    </td>

                    <td className="px-4 py-3 border-r">
                      <button
                        onClick={
                          () => handleEdit(emailInfo[0].id) // Assuming handleEdit is defined to navigate to the edit page
                        }
                        className="text-blue-600 hover:text-red-800 font-semibold text-sm"
                      >
                        Edit
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete()}
                        className="text-red-600 hover:text-red-800 font-semibold text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
        {emailInfo.length === 0 && (
          <div className="h-screen flex items-center justify-center ">
            <div onClick={() => navigate("/addemailscheduler")}>
              <button className="border-2 bg-[#444] text-white fond-bold text-md py-4 px-8 rounded-md cursor-pointer">
                {" "}
                + Add Email Scheduler
              </button>
            </div>
          </div>
        )}
      </div>
      {loading && <Loader />}
    </div>
  );
};

export default EmailScheduler;
