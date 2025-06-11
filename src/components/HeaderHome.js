import { Link, NavLink, useNavigate } from "react-router-dom";

function HeaderHome() {
  const navigate = useNavigate();
  // let loggedInUser = localStorage.getItem("user");

  // const handleClick = () => {
  //     localStorage.removeItem("user");
  //     localStorage.removeItem("auth");

  //     loggedInUser = '';
  // }
  const handleCreateInvoice = () => {
    const user = localStorage.getItem("user");

    if (user && user !== "undefined" && user !== "null") {
      navigate("/createinvoice");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="quicksand-med">
      <div
        className="flex top-0 justify-between items-center fixed bg-white mx-auto w-full h-20 px-5 shadow-lg text-white
       "
      >
        <Link to="/">
          <div className="flex">
            {/* <img src="../../images/logosvg12.svg" alt="Logo" width={55} loading='lazy'/> */}
            <div className="mt-3 text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-black quicksand-bold">
              InvoiceSimplify
            </div>
          </div>
        </Link>
        <div className="md:hidden flex justify-end w-full">
          <button
            onClick={handleCreateInvoice}
            className="bg-[#FF5721] text-md text-white p-4 font-semibold rounded-md text-richblack-700 hover:bg-white hover:text-[#FF5721] hover:border-2 hover:border-[#FF5721] cursor-pointer uppercase tracking-wide"
          >
            Try it Free !
          </button>
        </div>
        <nav className="flex max-w-maxScreen">
          <ul className="hidden items-center gap-x-8 md:flex">
            <li className="text-md text-[#FF5721] font-semibold">
              Online Invoice Generator
            </li>
            {/* {!loggedInUser && <li className="text-md text-black font-semibold cursor-pointer">Login</li>}
             { loggedInUser && <li onClick={handleClick} className="text-md text-black font-semibold cursor-pointer">Logout
             </li>} */}
            <li className="max-md:hidden">
              <button
                onClick={handleCreateInvoice}
                className="bg-[#FF5721] text-md text-white p-4 font-semibold rounded-md text-richblack-700 hover:bg-white hover:text-[#FF5721] hover:border-2 hover:border-[#FF5721] cursor-pointer uppercase tracking-wide"
              >
                Try it Free !
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default HeaderHome;
