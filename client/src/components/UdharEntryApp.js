import React, { useState } from "react";
import {
  Search,
  Mic,
  MicOff,
  Plus,
  Save,
  RotateCcw,
  User,
  Phone,
  MapPin,
  IndianRupee,
  CheckCircle2,
  X,
  UserPlus,
  ShoppingBag,
  Trash2,
} from "lucide-react";

// Sample mock database of existing customers
const INITIAL_CUSTOMERS = [
  {
    id: "1",
    name: "Ramesh Kumar",
    mobile: "9876543210",
    address: "Near Main Bus Stand",
  },
  {
    id: "2",
    name: "Suresh Patel",
    mobile: "9123456789",
    address: "Behind Temple",
  },
  {
    id: "3",
    name: "Anita Sharma",
    mobile: "9988776655",
    address: "Shop No 12, Market",
  },
];

export default function UdharEntryApp() {
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Pop-up Modals visibility state
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showAddItemsModal, setShowAddItemsModal] = useState(false);

  // New Customer Form State
  const [newCustName, setNewCustName] = useState("");
  const [newCustMobile, setNewCustMobile] = useState("");
  const [newCustAddress, setNewCustAddress] = useState("");

  // Bill Items List
  const [itemsList, setItemsList] = useState([]);

  // Voice Input State
  const [activeMicField, setActiveMicField] = useState(null);
  const [isItemVoiceListening, setIsItemVoiceListening] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Web Speech API
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  // Single field voice recognition
  const startVoiceInput = (fieldKey, updateFn, currentVal = "") => {
    if (!SpeechRecognition) {
      alert(
        "Voice input is not supported on this browser. Use Chrome or Safari."
      );
      return;
    }

    if (activeMicField === fieldKey) {
      setActiveMicField(null);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN"; // English (India)
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setActiveMicField(fieldKey);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (fieldKey.includes("mobile")) {
        const digits = transcript.replace(/\D/g, "");
        updateFn(digits);
      } else {
        updateFn(currentVal ? `${currentVal} ${transcript}` : transcript);
      }
      setActiveMicField(null);
    };

    recognition.onerror = () => setActiveMicField(null);
    recognition.onend = () => setActiveMicField(null);

    recognition.start();
  };

  // Continuous Voice Item Entry for Add Items Pop-up
  const toggleContinuousItemVoice = () => {
    if (!SpeechRecognition) {
      alert("Voice input is not supported.");
      return;
    }

    if (isItemVoiceListening) {
      setIsItemVoiceListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onstart = () => setIsItemVoiceListening(true);

    recognition.onresult = (event) => {
      const lastIndex = event.results.length - 1;
      const speechText = event.results[lastIndex][0].transcript.trim();

      // Simple parsing logic: Extracts number as price, rest as item name
      const priceMatch = speechText.match(/\d+/);
      const amount = priceMatch ? priceMatch[0] : "";
      const name = speechText
        .replace(/\d+/, "")
        .replace(/(rupees|rs|rupee|INR)/gi, "")
        .trim();

      if (name || amount) {
        setItemsList((prev) => [
          ...prev,
          { id: Date.now(), name: name || speechText, amount: amount || "0" },
        ]);
      }
    };

    recognition.onerror = () => setIsItemVoiceListening(false);
    recognition.onend = () => setIsItemVoiceListening(false);

    recognition.start();
  };

  // Filter existing customers based on search query
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.mobile.includes(searchQuery)
  );

  const handleSelectCustomer = (cust) => {
    setSelectedCustomer(cust);
    setSearchQuery("");
  };

  const handleCreateCustomer = () => {
    if (!newCustName.trim()) {
      alert("Please enter customer name");
      return;
    }
    const newCust = {
      id: Date.now().toString(),
      name: newCustName,
      mobile: newCustMobile,
      address: newCustAddress,
    };
    setCustomers((prev) => [...prev, newCust]);
    setSelectedCustomer(newCust);
    setNewCustName("");
    setNewCustMobile("");
    setNewCustAddress("");
    setShowAddCustomerModal(false);
  };

  const handleRemoveItem = (id) => {
    setItemsList((prev) => prev.filter((item) => item.id !== id));
  };

  const calculateTotal = () => {
    return itemsList.reduce(
      (sum, item) => sum + (parseFloat(item.amount) || 0),
      0
    );
  };

  const handleSaveLedger = () => {
    if (!selectedCustomer) {
      alert("Please select or add a customer first");
      return;
    }
    if (itemsList.length === 0) {
      alert("Please add at least one item");
      return;
    }

    const ledgerRecord = {
      customer: selectedCustomer,
      items: itemsList,
      totalAmount: calculateTotal(),
      timestamp: new Date().toLocaleString(),
    };

    console.log("Saved Udhar Record:", ledgerRecord);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setSelectedCustomer(null);
      setItemsList([]);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans pb-12">
      {/* Header */}
      <header className="bg-emerald-700 text-white p-4 shadow-md text-center">
        <h1 className="text-xl font-bold tracking-wide">
          📖 Local Shop Udhar Khatabook
        </h1>
        <p className="text-emerald-100 text-xs">
          Search Customer • Voice-to-Text Entry
        </p>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Success Alert */}
        {savedSuccess && (
          <div className="bg-emerald-100 border-2 border-emerald-600 text-emerald-900 p-3 rounded-xl flex items-center gap-2 font-semibold shadow-sm animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Udhar entry saved successfully!</span>
          </div>
        )}

        {/* SECTION 1: SEARCH OR SELECT CUSTOMER */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
          <label className="block text-xs font-bold text-slate-600">
            🔍 Search Existing Customer
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Name or Mobile..."
              className="w-full pl-9 pr-10 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-medium focus:border-emerald-600 focus:outline-none text-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3" />
            <button
              type="button"
              onClick={() =>
                startVoiceInput("search", setSearchQuery, searchQuery)
              }
              className={`absolute right-2 p-1.5 rounded-lg ${
                activeMicField === "search"
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>

          {/* Search Results Dropdown */}
          {searchQuery && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-100">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleSelectCustomer(c)}
                    className="p-3 hover:bg-emerald-50 cursor-pointer flex justify-between items-center text-sm"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{c.name}</p>
                      <p className="text-xs text-slate-500">
                        {c.mobile} • {c.address}
                      </p>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md font-bold">
                      Select
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-xs text-slate-500">
                  No customer found for "{searchQuery}"
                </div>
              )}
            </div>
          )}

          {/* Selected Customer Card or Add New Button */}
          {selectedCustomer ? (
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold bg-emerald-600 text-white px-2 py-0.5 rounded-full uppercase">
                  Selected
                </span>
                <h3 className="font-bold text-slate-900 mt-1">
                  {selectedCustomer.name}
                </h3>
                <p className="text-xs text-slate-600">
                  {selectedCustomer.mobile} • {selectedCustomer.address}
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-xs text-red-500 hover:underline font-bold"
              >
                Change
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddCustomerModal(true)}
              className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 border-2 border-dashed border-emerald-400 text-emerald-700 rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition"
            >
              <UserPlus className="w-4 h-4" /> + Add New Customer
            </button>
          )}
        </div>

        {/* SECTION 2: ADDED ITEMS SUMMARY */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-bold text-slate-700 text-sm flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-emerald-600" /> Items List
            </h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              {itemsList.length} Items
            </span>
          </div>

          {itemsList.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">
              No items added yet. Click "+ Add Items" below.
            </p>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto">
              {itemsList.map((item, index) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg text-sm border border-slate-200"
                >
                  <div>
                    <p className="font-bold text-slate-800">
                      {index + 1}. {item.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-slate-900">
                      ₹{item.amount || "0"}
                    </span>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Total Calculation */}
          <div className="flex justify-between items-center bg-emerald-100/70 p-3 rounded-xl font-bold text-emerald-900">
            <span>Total Amount:</span>
            <span className="text-lg font-extrabold">₹ {calculateTotal()}</span>
          </div>
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={() => setShowAddItemsModal(true)}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md text-base"
          >
            <Plus className="w-5 h-5" /> Add Items
          </button>

          <button
            type="button"
            onClick={handleSaveLedger}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg text-base"
          >
            <Save className="w-5 h-5" /> Save Udhar Entry
          </button>
        </div>
      </div>

      {/* POP-UP MODAL 1: ADD NEW CUSTOMER */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4 relative animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="font-bold text-slate-800 text-base flex items-center gap-1.5">
                <UserPlus className="w-5 h-5 text-emerald-600" /> Add New
                Customer
              </h2>
              <button
                onClick={() => setShowAddCustomerModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Customer Name *
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium focus:border-emerald-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    startVoiceInput("newCustName", setNewCustName, newCustName)
                  }
                  className={`absolute right-2 p-1.5 rounded-lg ${
                    activeMicField === "newCustName"
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Mobile Number
              </label>
              <div className="relative flex items-center">
                <input
                  type="tel"
                  value={newCustMobile}
                  onChange={(e) => setNewCustMobile(e.target.value)}
                  placeholder="Enter 10 digit mobile"
                  className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium focus:border-emerald-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    startVoiceInput(
                      "newCustMobile",
                      setNewCustMobile,
                      newCustMobile
                    )
                  }
                  className={`absolute right-2 p-1.5 rounded-lg ${
                    activeMicField === "newCustMobile"
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Address
              </label>
              <div className="relative flex items-start">
                <textarea
                  rows={2}
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  placeholder="Enter address details"
                  className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium focus:border-emerald-600 focus:outline-none resize-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    startVoiceInput(
                      "newCustAddress",
                      setNewCustAddress,
                      newCustAddress
                    )
                  }
                  className={`absolute right-2 top-2 p-1.5 rounded-lg ${
                    activeMicField === "newCustAddress"
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCreateCustomer}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition text-sm"
            >
              Save Customer
            </button>
          </div>
        </div>
      )}

      {/* POP-UP MODAL 2: ADD ITEMS */}
      {showAddItemsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4 relative animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="font-bold text-slate-800 text-base flex items-center gap-1.5">
                <ShoppingBag className="w-5 h-5 text-blue-600" /> Add Items
              </h2>
              <button
                onClick={() => setShowAddItemsModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Continuous Voice Mic Control */}
            <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl text-center space-y-2">
              <p className="text-xs text-blue-900 font-medium">
                Tap Mic and speak items continuously (e.g., say{" "}
                <b>"Sugar 50 rupees"</b>)
              </p>
              <button
                type="button"
                onClick={toggleContinuousItemVoice}
                className={`py-3 px-6 rounded-xl font-bold text-sm inline-flex items-center gap-2 shadow-md transition ${
                  isItemVoiceListening
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isItemVoiceListening ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
                {isItemVoiceListening
                  ? "Listening... Speak Items"
                  : "Start Continuous Voice"}
              </button>
            </div>

            {/* Live Added List inside Pop-up */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {itemsList.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border text-sm"
                >
                  <span>
                    {idx + 1}. {item.name}
                  </span>
                  <span className="font-bold text-slate-800">
                    ₹{item.amount}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowAddItemsModal(false)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition text-sm"
            >
              Done Adding Items
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
