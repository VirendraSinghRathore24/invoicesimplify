import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth"; // Optional: simplified hook
import { auth, db } from "./config/firebase";
import { collection, doc, getDocs } from "firebase/firestore";
import { BASIC_INFO, CREATORS, INVOICE_INFO } from "./components/Constant";

const ProtectedRoute = ({ children }) => {
  //   const [user, loading] = useAuthState(auth);

  //   if (loading) {
  //     return <div>Loading...</div>; // Or a nice spinner
  //   }

  const user = localStorage.getItem("user");

  if (user && user === "demo_user") {
    const code = "rudu4@gmail.com";
    const uid = "6qSlaVEstWgNbV4lDJNidDwOvrA3";
    const userName = "Demo User";

    localStorage.setItem("name1", "Demo User");
    initializeData(code, uid, userName);

    return children;
  }

  if (!user || user === "undefined" || user === "null") {
    // User is not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  return children;
};

const initializeData = async (code, uid, userName) => {
  localStorage.setItem("uid", uid);
  localStorage.setItem("auth", "Logged In");
  localStorage.setItem("user", code);
  localStorage.setItem("userName", userName);

  await getBusinessType(code);

  // for content cretor
  await getPersonalInfo(code, uid);
};

const getBusinessType = async (loggedInUser) => {
  const login_CollectionRef = collection(db, "Login_Info");
  const data = await getDocs(login_CollectionRef);
  const filteredData = data.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  }));

  const loginInfo = filteredData.filter((x) => x.code === loggedInUser)[0];

  if (!loginInfo) return;

  localStorage.setItem("type", loginInfo.type);
  localStorage.setItem("name1", loginInfo.name);
  localStorage.setItem("subscription", loginInfo.subscription);
  localStorage.setItem("invoiceNumber", loginInfo.invoiceNumber);

  if (loginInfo.invoiceNumberMode) {
    localStorage.setItem("invoiceNumberMode", loginInfo.invoiceNumberMode);
  } else {
    localStorage.setItem("invoiceNumberMode", "automatic");
  }

  localStorage.setItem("usedInvoiceNumbers", loginInfo.usedInvoiceNumbers);
  localStorage.setItem("subStartDate", loginInfo.subStarts);
  localStorage.setItem("subEndDate", loginInfo.subEnds);
  localStorage.setItem("invoiceCurrency", loginInfo.invoiceCurrency);
};

const getPersonalInfo = async (loggedInUser, uid) => {
  const personalInfo_CollectionRef = collection(
    doc(db, CREATORS, uid),
    BASIC_INFO
  );
  const data = await getDocs(personalInfo_CollectionRef);
  const filteredData = data.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  }));
  const pInfo = filteredData.filter((x) => x.loggedInUser === loggedInUser)[0];

  if (!pInfo) return;
  localStorage.setItem(
    "creator_personalInfo",
    JSON.stringify(pInfo.personalInfo)
  );
  localStorage.setItem(
    "creator_accountInfo",
    JSON.stringify(pInfo.accountInfo)
  );
  localStorage.setItem(
    "creator_additionalInfo",
    JSON.stringify(pInfo.additionalInfo)
  );
  localStorage.setItem("creator_taxInfo", JSON.stringify(pInfo.taxInfo));
  localStorage.setItem("creator_logoUrl", pInfo?.logoUrl);
};

export default ProtectedRoute;
