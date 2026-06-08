import React, { useState } from "react";
import Tesseract from "tesseract.js";

const FuelStationPro = () => {
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [ms1opening, setMS1Opening] = useState(0);
  const [ms2opening, setMS2Opening] = useState(0);
  const [ms3opening, setMS3Opening] = useState(0);
  const [hsd1opening, setHSD1Opening] = useState(0);
  const [hsd2opening, setHSD2Opening] = useState(0);

  const [ms1closing, setMS1Closing] = useState(0);
  const [ms2closing, setMS2Closing] = useState(0);
  const [ms3closing, setMS3Closing] = useState(0);
  const [hsd1closing, setHSD1Closing] = useState(0);
  const [hsd2closing, setHSD2Closing] = useState(0);

  // Table state for 5 nozzles
  const [nozzleData, setNozzleData] = useState(
    Array.from({ length: 5 }, (_, i) => ({
      nozzleId: i + 1,
      opening: 0,
      closing: 0,
      difference: 0,
      serialNo: "", // Added to track the specific pump hardware
    }))
  );

  const updateCell = (index, field, value) => {
    const updated = [...nozzleData];
    updated[index][field] =
      field === "serialNo" ? value : parseFloat(value) || 0;

    // Auto-calculate sales difference
    if (field !== "serialNo") {
      updated[index].difference = (
        updated[index].closing - updated[index].opening
      ).toFixed(3);
    }
    setNozzleData(updated);
  };

  const handleScan = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);

    try {
      const processedImage = await preprocessImage(file);
      const {
        data: { text },
      } = await Tesseract.recognize(processedImage, "eng", {
        logger: (m) => console.log(m),

        tessedit_pageseg_mode: 6,

        preserve_interword_spaces: 1,

        tessedit_char_whitelist:
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789:.-/ ",
      });

      console.log("OCR TEXT =>", text);

      // -------------------------
      // REGEX
      // -------------------------
      const dateRegex = /PRINT\s+DATE\s*:\s*([\d]{1,2}-[A-Z]{3}-\d{4})/i;

      const timeRegex = /PRINT\s+TIME\s*:\s*(\d{2}):(\d{2})/i;

      const nozzleRegex = /NOZZLE\s*:\s*(\d+)/i;

      const vRegex = /V\s*:\s*([\d.]+)/i;

      const serialRegex = /SERIAL\s+NUMBER\s*:?\s*([A-Z0-9]+)/i;

      // -------------------------
      // MATCHES
      // -------------------------
      const dateMatch = text.match(dateRegex);
      const timeMatch = text.match(timeRegex);
      const nozzleMatch = text.match(nozzleRegex);
      const vMatch = text.match(vRegex);

      // -------------------------
      // SERIAL NUMBER FALLBACK
      // -------------------------
      let serialNo = null;

      let serialMatch = text.match(serialRegex);

      if (serialMatch && serialMatch[1]) {
        serialNo = serialMatch[1];
      }

      // Fallback => Pump SNo
      if (!serialNo) {
        const pumpRegex = /Pump\s*SNo\s*:?\s*([A-Z0-9]+)/i;

        const pumpMatch = text.match(pumpRegex);

        if (pumpMatch && pumpMatch[1]) {
          serialNo = pumpMatch[1];
        }
      }

      serialNo = serialNo || "Unknown";

      console.log("SERIAL NO =>", serialNo);

      // =====================================================
      // CASE 1:
      // 13EH0941V => NO NEED TO FIND NOZZLE ENTRY - MS - 1
      // =====================================================
      if (serialNo.startsWith("13E")) {
        if (vMatch && timeMatch) {
          const reading = parseFloat(vMatch[1]);
          const hour = parseInt(timeMatch[1]);

          if (hour < 12) {
            setMS1Opening(reading);
          } else {
            setMS1Closing(reading);
          }
        }
      }

      // =====================================================
      // CASE 2:
      // 13DH0305V => FIND BOTH NOZZLE ENTRY
      // CASE 3:
      // 20141000183 => FIND BOTH NOZZLE ENTRY
      // =====================================================
      else if (serialNo.startsWith("13D") || serialNo.startsWith("2014")) {
        // Find ALL nozzle blocks
        const regex = /NOZZLE\s*:?\s*(\d+)[\s\S]*?[VWM]\s*:?\s*([\d\s.]+)/gis;

        const matches = [...text.matchAll(regex)];

        const value1 = getValue(matches[0][2]);
        const value2 = getValue(matches[1][2]);

        const hour = parseInt(timeMatch[1]);

        if (hour < 12) {
          setHSD1Opening(value1);
          setHSD2Opening(value2);
        } else {
          setHSD1Closing(value1);
          setHSD2Closing(value2);
        }
      }

      // =====================================================
      // DEFAULT LOGIC
      // =====================================================
      else {
        if (nozzleMatch && vMatch && timeMatch) {
          const nozzleNum = parseInt(nozzleMatch[1]);
          const reading = parseFloat(vMatch[1]);
          const hour = parseInt(timeMatch[1]);

          const field = hour < 12 ? "opening" : "closing";

          const index = nozzleData.findIndex((n) => n.nozzleId === nozzleNum);

          if (index !== -1) {
            const updated = [...nozzleData];

            updated[index][field] = reading;
            updated[index].serialNo = serialNo;

            updated[index].difference = (
              updated[index].closing - updated[index].opening
            ).toFixed(3);

            setNozzleData(updated);
          }
        }
      }
    } catch (error) {
      console.error("OCR Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const preprocessImage = (file) => {
    return new Promise((resolve) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Increase resolution
        canvas.width = img.width * 3;
        canvas.height = img.height * 3;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;

          // Strong threshold
          const value = avg > 160 ? 255 : 0;

          data[i] = value;
          data[i + 1] = value;
          data[i + 2] = value;
        }

        ctx.putImageData(imageData, 0, 0);

        canvas.toBlob((blob) => {
          resolve(blob);
        });
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const getValue = (rawValue) => {
    const cleanedValue = rawValue
      .replace(/\s+/g, "") // remove spaces/newlines
      .trim();
    const finalValue = parseFloat(cleanedValue);
    return finalValue;
  };
  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "900px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <h2>Fuel Station Dashboard</h2>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      {/* Dashed Upload Design */}
      <div
        style={{
          border: "2px dashed #007bff",
          padding: "30px",
          textAlign: "center",
          borderRadius: "8px",
          backgroundColor: "#f0f7ff",
          marginBottom: "25px",
        }}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleScan}
          style={{ display: "none" }}
          id="receipt-upload"
        />
        <label
          htmlFor="receipt-upload"
          style={{ cursor: "pointer", color: "#007bff", fontWeight: "bold" }}
        >
          {loading
            ? "Validating Receipt Data..."
            : "📷 Scan Receipt (Auto-Detect Row & Column)"}
        </label>
      </div>

      {/* Results Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#007bff", color: "white" }}>
            <th style={{ padding: "12px", border: "1px solid #ddd" }}>
              Nozzle
            </th>
            {/* <th style={{ padding: "12px", border: "1px solid #ddd" }}>
              Pump Serial No
            </th> */}
            <th style={{ padding: "12px", border: "1px solid #ddd" }}>
              Opening Value
            </th>
            <th style={{ padding: "12px", border: "1px solid #ddd" }}>
              Closing Value
            </th>
            <th style={{ padding: "12px", border: "1px solid #ddd" }}>
              Sales Difference
            </th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ textAlign: "center" }}>
            <td
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                fontWeight: "bold",
              }}
            >
              MS - 1
            </td>

            <td style={{ padding: "10px", border: "1px solid #ddd" }}>
              <input
                type="number"
                value={ms1opening}
                onChange={(e) => updateCell(0, "opening", e.target.value)}
                style={{ width: "90%", padding: "5px", textAlign: "center" }}
              />
            </td>
            <td style={{ padding: "10px", border: "1px solid #ddd" }}>
              <input
                type="number"
                value={ms1closing}
                onChange={(e) => updateCell(0, "closing", e.target.value)}
                style={{
                  width: "90%",
                  padding: "5px",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              />
            </td>
            <td
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                backgroundColor: "#f9f9f9",
                fontWeight: "bold",
              }}
            >
              {ms1closing - ms1opening}
            </td>
          </tr>
          <tr style={{ textAlign: "center" }}>
            <td
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                fontWeight: "bold",
              }}
            >
              MS - 2
            </td>

            <td style={{ padding: "10px", border: "1px solid #ddd" }}>
              <input
                type="number"
                value={ms2opening}
                onChange={(e) => updateCell(0, "opening", e.target.value)}
                style={{ width: "90%", padding: "5px", textAlign: "center" }}
              />
            </td>
            <td style={{ padding: "10px", border: "1px solid #ddd" }}>
              <input
                type="number"
                value={ms2closing}
                onChange={(e) => updateCell(0, "closing", e.target.value)}
                style={{
                  width: "90%",
                  padding: "5px",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              />
            </td>
            <td
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                backgroundColor: "#f9f9f9",
                fontWeight: "bold",
              }}
            >
              {ms2closing - ms2opening}
            </td>
          </tr>
          <tr style={{ textAlign: "center" }}>
            <td
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                fontWeight: "bold",
              }}
            >
              MS - 3
            </td>

            <td style={{ padding: "10px", border: "1px solid #ddd" }}>
              <input
                type="number"
                value={ms3opening}
                onChange={(e) => updateCell(0, "opening", e.target.value)}
                style={{ width: "90%", padding: "5px", textAlign: "center" }}
              />
            </td>
            <td style={{ padding: "10px", border: "1px solid #ddd" }}>
              <input
                type="number"
                value={ms3closing}
                onChange={(e) => updateCell(0, "closing", e.target.value)}
                style={{
                  width: "90%",
                  padding: "5px",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              />
            </td>
            <td
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                backgroundColor: "#f9f9f9",
                fontWeight: "bold",
              }}
            >
              {ms3closing - ms3opening}
            </td>
          </tr>
          <tr style={{ textAlign: "center" }}>
            <td
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                fontWeight: "bold",
              }}
            >
              HSD - 1
            </td>

            <td style={{ padding: "10px", border: "1px solid #ddd" }}>
              <input
                type="number"
                value={hsd1opening}
                onChange={(e) => updateCell(0, "opening", e.target.value)}
                style={{ width: "90%", padding: "5px", textAlign: "center" }}
              />
            </td>
            <td style={{ padding: "10px", border: "1px solid #ddd" }}>
              <input
                type="number"
                value={hsd1closing}
                onChange={(e) => updateCell(0, "closing", e.target.value)}
                style={{
                  width: "90%",
                  padding: "5px",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              />
            </td>
            <td
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                backgroundColor: "#f9f9f9",
                fontWeight: "bold",
              }}
            >
              {hsd1closing - hsd1opening}
            </td>
          </tr>
          <tr style={{ textAlign: "center" }}>
            <td
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                fontWeight: "bold",
              }}
            >
              HSD - 2
            </td>

            <td style={{ padding: "10px", border: "1px solid #ddd" }}>
              <input
                type="number"
                value={hsd2opening}
                onChange={(e) => updateCell(0, "opening", e.target.value)}
                style={{ width: "90%", padding: "5px", textAlign: "center" }}
              />
            </td>
            <td style={{ padding: "10px", border: "1px solid #ddd" }}>
              <input
                type="number"
                value={hsd2closing}
                onChange={(e) => updateCell(0, "closing", e.target.value)}
                style={{
                  width: "90%",
                  padding: "5px",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              />
            </td>
            <td
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                backgroundColor: "#f9f9f9",
                fontWeight: "bold",
              }}
            >
              {hsd2closing - hsd2opening}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default FuelStationPro;
