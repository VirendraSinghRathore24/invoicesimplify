import React, { useState } from "react";
import Tesseract from "tesseract.js";

const PumpReader = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [entries, setEntries] = useState([
    { id: "entry.1665467257", label: "M1", value: "" },
    { id: "entry.384216560", label: "M2", value: "" },
    { id: "entry.228498166", label: "M3", value: "" },
  ]);

  const FORM_URL =
    "https://docs.google.com/forms/u/0/d/e/1FAIpQLSdi99YQscJ2BR_yY6-t9_j9u2CRc2nY1Md9evMrwTp27q5Luw/formResponse";

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);

    try {
      // Step 1: Perform OCR
      const {
        data: { text },
      } = await Tesseract.recognize(file, "eng");

      // Step 2: Extract patterns like M1: 12344 or M2: 56789
      // This regex looks for an 'M' followed by a digit, a colon, and then the reading.
      // Extracts "PRINT DATE: 13-MAY-2026"
      const dateRegex = /PRINT\s+DATE\s*:\s*(\d{1,2}-[A-Z]{3}-\d{4})/i;

      // Extracts "V:1073675.940"
      const vValueRegex = /V\s*:\s*([\d.]+)/i;

      const dateMatch = text.match(dateRegex);
      const vValueMatch = text.match(vValueRegex);

      let match;
      const updatedEntries = [...entries];

      //   while ((match = regex.exec(text)) !== null) {
      //     const meterIndex = parseInt(match[1]) - 1; // Convert "M1" to index 0
      //     const readingValue = match[2];

      //     if (updatedEntries[meterIndex]) {
      //       updatedEntries[meterIndex].value = readingValue;
      //     }
      //   }

      setEntries(updatedEntries);
    } catch (error) {
      console.error("OCR Error:", error);
    } finally {
      setIsScanning(false);
    }
  };
  const handleSubmit = () => {
    const formData = new FormData();
    // Map your state to these specific IDs you found
    formData.append(
      "entry.1665467257",
      entries[0].value === "" ? "" : entries[0].value
    );
    formData.append(
      "entry.384216560",
      entries[1].value === "" ? "" : entries[1].value
    );
    formData.append(
      "entry.228498166",
      entries[2].value === "" ? "" : entries[2].value
    );

    fetch(FORM_URL, {
      method: "POST",
      mode: "no-cors",
      body: formData,
    }).then(() => alert("All 3 readings sent!"));
  };

  return (
    <div style={{ padding: "20px", maxWidth: "450px", margin: "auto" }}>
      <h2>Quick Pump Entry</h2>

      <div
        style={{
          border: "2px dashed #ccc",
          padding: "20px",
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          id="file-upload"
          style={{ display: "none" }}
        />
        <label
          htmlFor="file-upload"
          style={{ cursor: "pointer", color: "#007bff", fontWeight: "bold" }}
        >
          {isScanning ? "Processing Image..." : "📸 Scan Reading Image"}
        </label>
      </div>

      {entries.map((entry, index) => (
        <div key={entry.id} style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", fontWeight: "500" }}>
            Pump {entry.label} Reading:
          </label>
          <input
            type="text"
            value={entry.value}
            onChange={(e) => {
              const newEntries = [...entries];
              newEntries[index].value = e.target.value;
              setEntries(newEntries);
            }}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
          />
        </div>
      ))}

      <button
        onClick={() => handleSubmit()}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: "#28a745",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          fontSize: "16px",
        }}
      >
        Submit to Google Sheets
      </button>
    </div>
  );
};

export default PumpReader;
