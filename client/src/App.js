import "./App.css";
import { Route, Routes, useLocation } from "react-router-dom";
import EditBusinessInfo from "./components/businessInfo/EditBusinessInfo";
import AddtionalInfo from "./components/additionalInfo/EditAddtionalInfo";
import AddInvoice from "./components/invoice/AddInvoice";
import Invoice from "./components/invoice/Invoice";
import Sidebar from "./components/Sidebar";
import BusinessInfo from "./components/businessInfo/BusinessInfo";
import TaxInfo from "./components/tax/TaxInfo";
import AdditionalInformation from "./components/additionalInfo/AdditionalInformation";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dashboard from "./components/Dashboard";
import Home from "./components/Home";
import Login from "./components/login/Login";
import Signup from "./components/login/Signup";
import ViewInvoice from "./components/invoice/ViewInvoice";
import Logout from "./components/login/Logout";
import AddBusinessInfo from "./components/businessInfo/AddBusinessInfo";
import AddTaxInfo from "./components/tax/AddTaxInfo";
import EditTaxInfo from "./components/tax/EditTaxInfo";
import AddAddtionalInfo from "./components/additionalInfo/AddAddtionalInfo";
import Inventory from "./components/inventory/Inventory";
import ArchivedDashboard from "./components/archived/ArchivedDashboard";
import ArchivedViewInvoice from "./components/archived/ArchivedViewInvoice";
import Success from "./components/Success";
import PaymentHistory from "./components/PaymentHistory";
import ViewInvoiceByCustomer from "./components/invoice/ViewInvoiceByCustomer";
import ForgotPassword from "./components/login/ForgotPassword";
import AboutUs from "./components/AboutUs";
import ContactUs from "./components/ContactUs";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsOfUse from "./components/TermsOfUse";
import SMS from "./components/SMS";
import AllUsers from "./components/admin/AllUsers";
import Refresh from "./components/Refresh";
import EmailScheduler from "./components/emailScheduler/EmailScheduler";
import EditEmailScheduler from "./components/emailScheduler/EditEmailScheduler";
import AddEmailScheduler from "./components/emailScheduler/AddEmailScheduler";
import PricingPlans from "./components/PricingPlans";
import EditInvoice from "./components/invoice/EditInvoice";

function App() {
  const location = useLocation();
  const showSidebar = ![
    "/",
    "/login",
    "/signup",
    "/forgotpassword",
    "/aboutus",
    "/contactus",
    "/privacypolicy",
    "/termsofuse",
    "/plans",
    "/success",
    "/admin/allusers",
  ].includes(location.pathname);

  const showSidebar1 = !location.pathname.includes("/ci");

  return (
    <div className="flex h-screen">
      {showSidebar && showSidebar1 && (
        <div>
          <div className="hidden lg:block">
            <Sidebar />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          {/* Login and Signup routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          {/* Business Info */}
          <Route path="/businessinfo" element={<BusinessInfo />} />
          <Route path="/editbusinessinfo" element={<EditBusinessInfo />} />
          <Route path="/addbusinessinfo" element={<AddBusinessInfo />} />
          {/* Tax Info */}
          <Route path="/edittaxinfo" element={<EditTaxInfo />} />
          <Route path="/taxinfo" element={<TaxInfo />} />
          <Route path="/addtaxinfo" element={<AddTaxInfo />} />
          {/* Additional Info */}
          <Route path="/editadditionalinfo" element={<AddtionalInfo />} />
          <Route path="/addadditionalinfo" element={<AddAddtionalInfo />} />
          <Route path="/additionalinfo" element={<AdditionalInformation />} />
          {/* Invoice */}
          <Route path="/createinvoice" element={<AddInvoice />} />
          <Route path="/editinvoice" element={<EditInvoice />} />
          <Route path="/viewinvoice" element={<ViewInvoice />} />
          <Route path="/invoice" element={<Invoice />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/archiveddashboard" element={<ArchivedDashboard />} />
          <Route
            path="/archivedviewinvoice"
            element={<ArchivedViewInvoice />}
          />

          <Route path="/success" element={<Success />} />
          <Route path="/paymenthistory" element={<PaymentHistory />} />
          <Route path="/ci/:id" element={<ViewInvoiceByCustomer />} />
          {/* About Us */}
          <Route path="/aboutus" element={<AboutUs />} />
          <Route path="/contactus" element={<ContactUs />} />
          <Route path="/privacypolicy" element={<PrivacyPolicy />} />
          <Route path="/termsofuse" element={<TermsOfUse />} />
          <Route path="/sms" element={<SMS />} />
          <Route path="/refresh" element={<Refresh />} />

          <Route path="/admin/allusers" element={<AllUsers />} />

          <Route path="/emailscheduler" element={<EmailScheduler />} />
          <Route path="/addemailscheduler" element={<AddEmailScheduler />} />
          <Route path="/editemailscheduler" element={<EditEmailScheduler />} />

          <Route path="/plans" element={<PricingPlans />} />
        </Routes>

        <ToastContainer />
      </div>
    </div>
  );
}

export default App;
