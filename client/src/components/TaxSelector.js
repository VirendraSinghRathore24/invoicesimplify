import React, { useState } from "react";

const TaxSelector = () => {
  const [selected, setSelected] = useState("tax");
  const [tax, setTax] = useState("");
  const [allTax, setAllTax] = useState({
    cgst: "",
    sgst: "",
    igst: "",
    other: "",
  });

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-blue-700">
        Select Tax Option
      </h2>

      <div className="flex gap-6 mb-6">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            value="tax"
            checked={selected === "tax"}
            onChange={() => setSelected("tax")}
            className="form-radio text-blue-600"
          />
          Tax
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            value="alltax"
            checked={selected === "alltax"}
            onChange={() => setSelected("alltax")}
            className="form-radio text-blue-600"
          />
          All Tax
        </label>
      </div>

      {selected === "tax" && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tax %
          </label>
          <input
            type="number"
            value={tax}
            onChange={(e) => setTax(e.target.value)}
            placeholder="Enter Tax %"
            className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-blue-300"
          />
        </div>
      )}

      {selected === "alltax" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {["cgst", "sgst", "igst", "other"].map((key) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                {key} %
              </label>
              <input
                type="number"
                value={allTax[key]}
                onChange={(e) =>
                  setAllTax((prev) => ({ ...prev, [key]: e.target.value }))
                }
                placeholder={`Enter ${key.toUpperCase()} %`}
                className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-blue-300"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaxSelector;
