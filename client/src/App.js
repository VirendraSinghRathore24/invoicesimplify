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
import PaymentHistory from "./components/creator/PaymentHistory";
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
import AccountInfo from "./components/creator/AccountInfo";
import CreatorAddInvoice from "./components/creator/CreatorAddInvoice";
import CreatorInvoice from "./components/creator/CreatorInvoice";
import { CONTENT_CREATOR } from "./components/Constant";
import CreatorSidebar from "./components/creator/CreatorSidebar";
import CreatorDashboard from "./components/creator/CreatorDashboard";
import CreatorViewInvoice from "./components/creator/CreatorViewInvoice";
import Brands from "./components/creator/Brands";
import AddPersonalInfo from "./components/creator/AddPersonalInfo";
import PersonalInfo from "./components/creator/PersonalInfo";
import EditPersonalInfo from "./components/creator/EditPersonalInfo";
import AddAccountInfo from "./components/creator/AddAccountInfo";
import EditAccountInfo from "./components/creator/EditAccountInfo";
import AddCreatorAddtionalInfo from "./components/creator/AddCreatorAddtionalInfo";
import CreatorAdditionalInformation from "./components/creator/CreatorAdditionalInformation";
import EditCreatorAddtionalInfo from "./components/creator/EditCreatorAddtionalInfo";
import EditBrandInfo from "./components/creator/EditBrandInfo";
import PreOrderScreen from "./components/PreOrderScreen";
import Config from "./components/creator/Config";
import Test from "./components/Test";
import BusinessTypeComponent from "./components/BusinessTypeComponent";
import SellerInvoice from "./components/shop/purchase/SellerInvoice";

function App() {
  const type = localStorage.getItem("type");
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
    "/preorder",
    "/success",
    "/admin/allusers",
    "/test",
    "/selectbusinesstype",
  ].includes(location.pathname);

  const showSidebar1 = !location.pathname.includes("/ci");

  return (
    <div className="flex h-screen">
      {showSidebar && showSidebar1 && (
        <div>
          <div className="hidden lg:block">
            {type === CONTENT_CREATOR ? <CreatorSidebar /> : <Sidebar />}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Test />} />
          <Route path="/home" element={<Test />} />
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
          <Route path="/test" element={<Test />} />
          {/* About Us */}
          <Route path="/aboutus" element={<AboutUs />} />
          <Route path="/contactus" element={<ContactUs />} />
          <Route path="/privacypolicy" element={<PrivacyPolicy />} />
          <Route path="/termsofuse" element={<TermsOfUse />} />
          <Route path="/sms" element={<SMS />} />
          <Route path="/refresh" element={<Refresh />} />

          <Route path="/admin/allusers" element={<AllUsers />} />
          <Route path="/preorder" element={<PreOrderScreen />} />

          <Route path="/emailscheduler" element={<EmailScheduler />} />
          <Route path="/addemailscheduler" element={<AddEmailScheduler />} />
          <Route path="/editemailscheduler" element={<EditEmailScheduler />} />

          <Route path="/plans" element={<PricingPlans />} />

          {/* Creator Routes */}
          <Route path="/creator/personalinfo" element={<PersonalInfo />} />
          <Route
            path="/creator/addpersonalinfo"
            element={<AddPersonalInfo />}
          />
          <Route
            path="/creator/editpersonalinfo"
            element={<EditPersonalInfo />}
          />
          <Route path="/creator/accountinfo" element={<AccountInfo />} />
          <Route path="/creator/addaccountinfo" element={<AddAccountInfo />} />
          <Route
            path="/creator/editaccountinfo"
            element={<EditAccountInfo />}
          />
          <Route
            path="/creator/creatoradditionalinfo"
            element={<CreatorAdditionalInformation />}
          />
          <Route
            path="/creator/addcreatoradditionalinfo"
            element={<AddCreatorAddtionalInfo />}
          />
          <Route
            path="/creator/editcreatoradditionalinfo"
            element={<EditCreatorAddtionalInfo />}
          />
          <Route
            path="/creator/createinvoice"
            element={<CreatorAddInvoice />}
          />
          <Route path="/creator/invoice" element={<CreatorInvoice />} />
          <Route path="/creator/viewinvoice" element={<CreatorViewInvoice />} />
          <Route path="/creator/dashboard" element={<CreatorDashboard />} />
          <Route path="/creator/brands" element={<Brands />} />
          <Route path="/creator/editbrandinfo" element={<EditBrandInfo />} />

          <Route path="/configuration" element={<Config />} />
          <Route
            path="/selectbusinesstype"
            element={<BusinessTypeComponent />}
          />

          <Route path="/shop/sellerinvoice" element={<SellerInvoice />} />
        </Routes>

        <ToastContainer />
      </div>
    </div>
  );
}

export default App;
