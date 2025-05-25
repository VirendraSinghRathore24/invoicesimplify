import './App.css';
import { Route, Routes, useLocation } from 'react-router-dom';
import EditBusinessInfo from './components/businessInfo/EditBusinessInfo';
import AddtionalInfo from './components/additionalInfo/EditAddtionalInfo';
import AddInvoice from './components/invoice/AddInvoice';
import Invoice from './components/invoice/Invoice';
import Sidebar from './components/Sidebar';
import BusinessInfo from './components/businessInfo/BusinessInfo';
import TaxInfo from './components/tax/TaxInfo';
import AdditionalInformation from './components/additionalInfo/AdditionalInformation';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dashboard from './components/Dashboard';
import Home from './components/Home';
import Login from './components/login/Login';
import Signup from './components/login/Signup';
import ViewInvoice from './components/invoice/ViewInvoice';
import Logout from './components/login/Logout';
import AddBusinessInfo from './components/businessInfo/AddBusinessInfo';
import AddTaxInfo from './components/tax/AddTaxInfo';
import EditTaxInfo from './components/tax/EditTaxInfo';
import AddAddtionalInfo from './components/additionalInfo/AddAddtionalInfo';
import Inventory from './components/inventory/Inventory';


function App() {
  const location = useLocation();
  const showSidebar = !['/','/login', '/signup'].includes(location.pathname);
  return (
    <div className="flex h-screen">
     
     
      {showSidebar && <Sidebar/>}
     
      <div className="flex-1 p-6 overflow-y-auto">
      <Routes>
        <Route path="/" element={<Home/>}/> 
        <Route path="/login" element={<Login/>}/> 
        <Route path="/logout" element={<Logout/>}/> 
        <Route path="/signup" element={<Signup/>}/> 
        <Route path="/editbusinessinfo" element={<EditBusinessInfo/>}/>
        <Route path="/addbusinessinfo" element={<AddBusinessInfo/>}/>
        <Route path="/edittaxinfo" element={<EditTaxInfo/>}/>
        <Route path="/taxinfo" element={<TaxInfo/>}/>
        <Route path="/addtaxinfo" element={<AddTaxInfo/>}/>
        <Route path="/editadditionalinfo" element={<AddtionalInfo/>}/>
        <Route path="/addadditionalinfo" element={<AddAddtionalInfo/>}/>
        <Route path="/additionalinfo" element={<AdditionalInformation/>}/>

        <Route path="/createinvoice" element={<AddInvoice/>}/>
        <Route path="/viewinvoice" element={<ViewInvoice/>}/>
        <Route path="/invoice" element={<Invoice/>}/>
        <Route path="/businessinfo" element={<BusinessInfo/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/inventory" element={<Inventory/>}/>
      </Routes>
      <ToastContainer/>
      </div>
    </div>
  );
}

export default App;
