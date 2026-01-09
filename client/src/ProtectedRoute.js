import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth"; // Optional: simplified hook
import { auth } from "./config/firebase";

const ProtectedRoute = ({ children }) => {
  //   const [user, loading] = useAuthState(auth);

  //   if (loading) {
  //     return <div>Loading...</div>; // Or a nice spinner
  //   }

  const user = localStorage.getItem("user");

  if (!user || user === "undefined" || user === "null") {
    // User is not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
