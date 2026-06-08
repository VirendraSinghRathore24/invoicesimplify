import React, { useState, useMemo } from "react";

const PaymentSettlement = ({ grandTotal = 0 }) => {
  // 1. State for various collection methods
  const [payments, setPayments] = useState({
    cash: 0,
    creditCard: 0,
    debitCard: 0,
    hpCard: 0,
    others: 0,
  });

  // 2. Calculate total collection
  const totalCollected = useMemo(() => {
    return Object.values(payments).reduce((acc, val) => acc + val, 0);
  }, [payments]);

  // 3. Calculate Difference (Grand Total vs Collected)
  const difference = totalCollected - grandTotal;

  const handleInputChange = (field, value) => {
    setPayments((prev) => ({
      ...prev,
      [field]: parseFloat(value) || 0,
    }));
  };

  const settlementRowStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 15px",
    borderBottom: "1px solid #f0f0f0",
  };

  const inputStyle = {
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #ced4da",
    textAlign: "right",
    width: "150px",
    fontSize: "16px",
  };

  return (
    <div
      style={{
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        background: "#fff",
      }}
    >
      <div
        style={{
          background: "#202124",
          color: "#fff",
          padding: "12px 15px",
          fontWeight: "bold",
        }}
      >
        Collections & Settlement
      </div>

      <div style={settlementRowStyle}>
        <span>Cash Collection</span>
        <input
          type="number"
          placeholder="0.00"
          onChange={(e) => handleInputChange("cash", e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={settlementRowStyle}>
        <span>Credit Card</span>
        <input
          type="number"
          placeholder="0.00"
          onChange={(e) => handleInputChange("creditCard", e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={settlementRowStyle}>
        <span>Debit Card</span>
        <input
          type="number"
          placeholder="0.00"
          onChange={(e) => handleInputChange("debitCard", e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={settlementRowStyle}>
        <span>HP Card</span>
        <input
          type="number"
          placeholder="0.00"
          onChange={(e) => handleInputChange("hpCard", e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={settlementRowStyle}>
        <span>Others / UPI / Wallets</span>
        <input
          type="number"
          placeholder="0.00"
          onChange={(e) => handleInputChange("others", e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* Summary Footer */}
      <div style={{ background: "#f8f9fa", padding: "20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px",
            fontWeight: "bold",
            fontSize: "18px",
          }}
        >
          <span style={{ fontWeight: "bold" }}>Total Collected:</span>
          <span style={{ fontWeight: "bold", color: "#1e8e3e" }}>
            ₹
            {totalCollected.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettlement;
