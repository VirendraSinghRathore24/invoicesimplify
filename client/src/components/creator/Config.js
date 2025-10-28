import React, { useState, useEffect } from "react";
import { Globe } from "lucide-react";
import CreatorMobileMenu from "./CreatorMobileMenu";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { LOGIN_INFO } from "../Constant";
import { db } from "../../config/firebase";

const currencies = [
  { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳" },
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", flag: "🇦🇪" },
];

const Config = ({ onCurrencyChange }) => {
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);
  const [open, setOpen] = useState(false);

  // 🧠 Load saved currency from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem("invoiceCurrency");
    if (savedCurrency) {
      const found = currencies.find((c) => c.symbol === savedCurrency);
      if (found) setSelectedCurrency(found);
    }
  }, []);

  // 💾 Save + notify parent
  const handleSelect = async (currency) => {
    setSelectedCurrency(currency);
    setOpen(false);

    // store into login db as well
    await updateInvoiceCurrency(currency);
    if (onCurrencyChange) onCurrencyChange(currency);
  };

  const login_CollectionRef = collection(db, LOGIN_INFO);
  const updateInvoiceCurrency = async (currency) => {
    const data = await getDocs(login_CollectionRef);
    const filteredData = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    const loggedInUser = localStorage.getItem("user");

    const loginInfo = filteredData.filter((x) => x.code === loggedInUser)[0];

    const codeDoc = doc(db, LOGIN_INFO, loginInfo.id);
    localStorage.setItem("invoiceCurrency", currency.symbol);

    await updateDoc(codeDoc, {
      invoiceCurrency: currency.symbol,
    });
  };

  return (
    <div className="">
      <div className="lg:left-64 right-0 top-0 left-0 lg:fixed bg-white">
        <div className="hidden max-lg:block mb-16">
          <CreatorMobileMenu />
        </div>
        <div className="top-14 lg:top-0 mx-auto w-full h-[56px] lg:h-[64px] text-white fixed lg:sticky border-b-2">
          <div className="flex justify-between mx-auto font-bold text-md p-2 rounded-md fixed w-full ">
            <div className="text-md lg:text-xl text-black  lg:block mt-1">
              Setup Configurations
            </div>
          </div>
        </div>
        <div className="relative inline-block w-full max-w-sm m-4 p-8 ">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Currency
          </label>

          {/* Dropdown Button */}
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center justify-between w-full bg-white border border-gray-300 rounded-xl px-4 py-3 shadow-sm hover:border-blue-400 focus:outline-none transition"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedCurrency.flag}</span>
              <div className="text-left">
                <p className="font-semibold text-gray-800">
                  {selectedCurrency.name}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedCurrency.code} — {selectedCurrency.symbol}
                </p>
              </div>
            </div>
            <Globe className="text-gray-500 w-5 h-5" />
          </button>

          {/* Dropdown List */}
          <div
            className={`absolute left-0 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-y-auto max-h-60 transform transition-all duration-200 ease-out origin-top ${
              open
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
            }`}
          >
            {currencies.map((currency) => (
              <button
                key={currency.code}
                onClick={() => handleSelect(currency)}
                className={`flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-blue-50 ${
                  selectedCurrency.code === currency.code ? "bg-blue-50" : ""
                }`}
              >
                <span className="text-2xl">{currency.flag}</span>
                <div>
                  <p className="font-medium text-gray-800">{currency.name}</p>
                  <p className="text-sm text-gray-500">
                    {currency.code} — {currency.symbol}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Config;
