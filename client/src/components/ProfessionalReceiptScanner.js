import React, { useState, useRef, useMemo } from "react";
import Tesseract from "tesseract.js";
import PaymentSettlement from "./PaymentSettlement";

const ReceiptFixer = () => {
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

  const [msTesting, setMsTesting] = useState(15);
  const [hsdTesting, setHsdTesting] = useState(10);

  const [extracted, setExtracted] = useState({
    serial: "",
    vValue: "",
    nozzle: "",
  });
  let msVolume =
    parseFloat(ms1closing) -
    parseFloat(ms1opening) +
    parseFloat(ms2closing) -
    parseFloat(ms2opening) +
    parseFloat(ms3closing) -
    parseFloat(ms3opening);
  let hsdVolume =
    parseFloat(hsd1closing) -
    parseFloat(hsd1opening) +
    parseFloat(hsd2closing) -
    parseFloat(hsd2opening);

  // State for manual rates (Price per Liter)
  const [msRate, setMsRate] = useState(0);
  const [hsdRate, setHsdRate] = useState(0);

  // Calculations
  const msSubtotal = useMemo(
    () => (parseFloat(msVolume) - parseFloat(msTesting)) * msRate,
    [msVolume, msRate]
  );
  const hsdSubtotal = useMemo(
    () => (parseFloat(hsdVolume) - parseFloat(hsdTesting)) * hsdRate,
    [hsdVolume, hsdRate]
  );
  const grandTotal = useMemo(
    () => msSubtotal + hsdSubtotal,
    [msSubtotal, hsdSubtotal]
  );

  const rowStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "15px",
    background: "#fff",
    borderBottom: "1px solid #eee",
    gap: "20px",
  };

  const inputStyle = {
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    width: "120px",
    textAlign: "right",
    fontSize: "16px",
  };
  const updateCell = (index, field, value) => {};
  const canvasRef = useRef(null);

  const cleanAndScan = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = async () => {
        setLoading(true);
        // const canvas = canvasRef.current;
        // const ctx = canvas.getContext("2d");

        // // Increase resolution for better character definition
        // canvas.width = img.width * 2;
        // canvas.height = img.height * 2;
        // // Add this to your preprocessImage function for better thin-font capture
        // ctx.filter =
        //   "contrast(200%) brightness(120%) grayscale(100%) blur(0.5px)";
        // ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        //const processedImage = canvas.toDataURL("image/png");
        const processedImage = applyPreprocessing(img);

        try {
          const {
            data: { text },
          } = await Tesseract.recognize(processedImage, "eng", {
            // High-precision mode
            tessedit_pageseg_mode: "6",
          });

          const AA = parseFuelReceipt(text, selectedDate);
          // Refined Regex for Screenshot 2026-05-14 at 10.20.09 AM_3.jpg
          // 1. Matches 13EH0941V (Looks for Alphanumeric after 'NUMBER')
          const serialRegex =
            /(?:PUMP\s*SERIAL\s*NUMBER|PUMP\s*[SE]No|NUMBER)?\s*[:\s]*\n?([0-9]{2}[A-Z]{2}[0-9]{4,6}[A-Z]|[0-9]{10,12})/i;
          const pumpSerialNumber = text.match(serialRegex)?.[1];

          if (!pumpSerialNumber) {
            alert(
              "Serial Number not found. Please try scanning again with better lighting or focus."
            );
            return;
          }

          // extract time
          //const timeRegex = /TIME\s*:\s*(\d{2}):(\d{2})/i;
          const dateRegex =
            /(\d{1,2})[-/7,]\s?([A-Z]{3}|\d{2})[-/7,]\s?(\d{4})/;
          const printDate = text.match(dateRegex)?.[0];
          const timeRegex = /(\d{2}):(\d{2}):(\d{2})/;
          const printTime = parseInt(text.match(timeRegex)?.[1] || "0");

          const isOpening = validateShiftTime(
            selectedDate,
            printDate,
            printTime
          );
          if (isOpening === "not_allowed") return;

          if (pumpSerialNumber.startsWith("13E")) {
            handleM1NozzleScan(processedImage, isOpening);
          } else if (pumpSerialNumber.startsWith("13D")) {
            handleMultiNozzleScan(processedImage, isOpening);
          } else {
            handleMultiNozzleScan1(processedImage, isOpening);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleM1NozzleScan = async (processedImage, isOpening) => {
    try {
      const {
        data: { text },
      } = await Tesseract.recognize(processedImage, "eng", {
        tessedit_pageseg_mode: "6",
      });

      // get v value
      const vValueRegex = /V\s*[:\s]*([\d]+\.[\d]{3})/i;
      const vValue = text.match(vValueRegex)?.[1] || "Check Manual";

      if (isOpening === "opening") {
        setMS1Opening(vValue);
      } else {
        setMS1Closing(vValue);
      }
    } catch (err) {
      console.error("M1 Nozzle Scan error:", err);
    }
  };

  const handleMultiNozzleScan = async (processedImage, isOpening) => {
    try {
      const {
        data: { text },
      } = await Tesseract.recognize(processedImage, "eng", {
        tessedit_pageseg_mode: "6",
      });

      const nozzleBlocks = text.split(/NOZZLE/i).slice(1);

      let index = 1;
      nozzleBlocks.forEach((block) => {
        // Find the V value within this specific block
        const vMatch = block.match(/V\s*[:\s]*\n?\s*([\d\s]+\.[\d\s]{3})/i);

        const value = getValue(vMatch[1]);

        if (index === 1) {
          if (isOpening === "opening") {
            setHSD1Opening(value);
          } else {
            setHSD1Closing(value);
          }
        }

        if (index === 2) {
          if (isOpening === "opening") {
            setHSD2Opening(value);
          } else {
            setHSD2Closing(value);
          }
        }
        index++;
      });

      // setNozzleData(updatedData);
    } catch (err) {
      console.error("Multi-scan error:", err);
    }
  };

  const handleMultiNozzleScan1 = async (processedImage, isOpening) => {
    try {
      const {
        data: { text },
      } = await Tesseract.recognize(processedImage, "eng", {
        tessedit_pageseg_mode: "6",
      });

      // 2. Split by "Nozzle No" to isolate blocks
      const nozzleBlocks = text.split(/Nozzle\s*No/i).slice(1);

      const cumVolumeRegex =
        /(?:cumv|cum\s*vo).*?[:\s]*\n?\s*([\d\s]+\.[\d\s]+)/i;

      let index = 1;
      nozzleBlocks.forEach((block) => {
        // Target "CumVolume" instead of "V:" for this specific receipt format
        // It handles the newline between the label and the number

        const vMatch = block.match(cumVolumeRegex);
        const value = getValue(vMatch[1]);

        if (index === 1) {
          if (isOpening === "opening") {
            setMS2Opening(value);
          } else {
            setMS2Closing(value);
          }
        }

        if (index === 2) {
          if (isOpening === "opening") {
            setMS3Opening(value);
          } else {
            setMS3Closing(value);
          }
        }
        index++;
      });
    } catch (err) {
      console.error("Extraction error:", err);
    }
  };
  const getValue = (rawValue) => {
    const cleanedValue = rawValue
      .replace(/\s+/g, "") // remove spaces/newlines
      .trim();
    const finalValue = parseFloat(cleanedValue);
    return finalValue;
  };

  const handleScan = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    cleanAndScan(file);
  };

  const validateShiftTime = (selectedDateStr, printDateStr, printTimeStr) => {
    // Normalize dates to midnight for accurate comparison
    const selected = new Date(selectedDateStr);
    selected.setHours(0, 0, 0, 0);

    const printDate = parseReceiptDate(printDateStr);
    printDate.setHours(0, 0, 0, 0);

    // Extract the hour from "21:02:27" or similar
    const printHour = printTimeStr;

    // Calculations for Relative Dates
    const yesterday = new Date(selected);
    yesterday.setDate(yesterday.getDate() - 1);

    const tomorrow = new Date(selected);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // --- BUSINESS LOGIC RULES ---

    // 1. If print date is YESTERDAY and time is AFTER 12 PM -> OPENING
    if (printDate.getTime() === yesterday.getTime() && printHour >= 12) {
      return "opening";
    }

    // 2. If print date is TOMORROW and time is BEFORE 12 PM -> CLOSING
    if (printDate.getTime() === tomorrow.getTime() && printHour < 12) {
      return "closing";
    }

    // 3. If print date is TODAY
    if (printDate.getTime() === selected.getTime()) {
      if (printHour < 12) {
        return "opening"; // Today morning
      } else {
        return "closing"; // Today after 12 PM
      }
    }

    // 4. Any other date combination
    alert(
      "Invalid Receipt: The print date/time does not match the selected shift window."
    );
    return "not_allowed";
  };

  const parseReceiptDate = (dateStr) => {
    // 1. Standardize the string: replace common OCR errors (7, ,) with /
    const cleanStr = dateStr.replace(/[7,]/g, "/");

    // 2. Split by / or -
    const parts = cleanStr.split(/[-/]/);

    if (parts.length === 3) {
      const day = parts[0].padStart(2, "0");
      const monthStr = parts[1];
      const year = parts[2];

      // 3. Handle Word Months (MAY, JUN) vs Numeric Months (05)
      let month;
      const months = [
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MAY",
        "JUN",
        "JUL",
        "AUG",
        "SEP",
        "OCT",
        "NOV",
        "DEC",
      ];

      if (isNaN(monthStr)) {
        month = (months.indexOf(monthStr.toUpperCase()) + 1)
          .toString()
          .padStart(2, "0");
      } else {
        month = monthStr.padStart(2, "0");
      }

      // 4. Construct ISO String: "YYYY-MM-DD" (JavaScript loves this format)
      return new Date(`${year}-${month}-${day}`);
    }
    return new Date(); // Fallback to today if parsing fails
  };

  const parseFuelReceipt = (rawText, selectedDate) => {
    // 1. Pre-Clean the text (standardize separators and remove noise)
    const cleanText = rawText
      .replace(/[7,]/g, "/") // Fix common slash misreads
      .replace(/I\s?1me/i, "Time") // Fix "I 1me" -> "Time"
      .replace(/Pump\s*[SE]No/i, "Pump_Serial"); // Standardize Serial label

    // 2. Define Multi-Pattern Regexes
    const patterns = {
      // Captures both 201401000183 and 13EH0941V formats
      serial: /(?:Pump_Serial|SERIAL\s+NUMBER)\s*[:\s]*([A-Z0-9\s]{8,15})/i,

      // Captures 13/05/2026 or 13-MAY-2026
      date: /(\d{1,2})[-/]\s?([A-Z]{3}|\d{1,2})[-/]\s?(\d{4})/,

      // Captures HH:MM:SS
      time: /(\d{2}):(\d{2}):(\d{2})/,

      // Captures Cumulative Volume (V: or CumVolume:)
      volume: /(?:V|CumVolume)\s*[:\s]*\n?\s*([\d\s]+\.\d{2,3})/i,
    };

    // 3. Extraction Helper
    const extract = (regex) => {
      const match = cleanText.match(regex);
      return match ? match[1].replace(/\s/g, "") : null;
    };

    // 4. Data Assembly
    const extractedDate = extract(patterns.date); // Need specialized cleaning for Date
    const extractedTime = cleanText.match(patterns.time)?.[0];
    const serialRaw = extract(patterns.serial);

    return {
      serial: serialRaw ? serialRaw.replace(/O/g, "0") : "N/A", // Common O -> 0 fix
      date: extractedDate,
      time: extractedTime,
      volume: parseFloat(extract(patterns.volume) || 0),
      shiftType: determineShift(selectedDate, extractedDate, extractedTime),
    };
  };
  const determineShift = (selectedDateStr, printDateStr, printTimeStr) => {
    if (!printDateStr || !printTimeStr) return "UNKNOWN";

    // Convert "15/05/2026" to "2026-05-15" so JS Date can read it
    const formatDate = (s) => {
      const p = s.split(/[-/]/);
      return new Date(
        `${p[2]}-${p[1].padStart(2, "0")}-${p[0].padStart(2, "0")}`
      );
    };

    const selected = new Date(selectedDateStr).setHours(0, 0, 0, 0);
    const printDate = formatDate(printDateStr).setHours(0, 0, 0, 0);
    const hour = parseInt(printTimeStr.split(":")[0]);

    const diffDays = (printDate - selected) / (1000 * 60 * 60 * 24);

    if (diffDays === -1 && hour >= 12) return "OPENING"; // Yesterday PM
    if (diffDays === 1 && hour < 12) return "CLOSING"; // Tomorrow AM
    if (diffDays === 0) return hour < 12 ? "OPENING" : "CLOSING";

    return "INVALID_WINDOW";
  };
  const applyPreprocessing = (imageElement) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // 1. Scale up for better resolution
    canvas.width = imageElement.width * 2;
    canvas.height = imageElement.height * 2;
    ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // 2. Grayscale & High Contrast Thresholding
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;

      // Threshold value (adjust 128 based on your lighting)
      const b = brightness > 128 ? 255 : 0;

      data[i] = data[i + 1] = data[i + 2] = b; // Set R, G, B to the threshold
    }
    sharpenImage(ctx, canvas.width, canvas.height);

    //ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL("image/jpeg", 1.0);
  };
  const sharpenImage = (ctx, w, h) => {
    const weights = [0, -1, 0, -1, 5, -1, 0, -1, 0]; // Sharpening kernel
    const side = Math.round(Math.sqrt(weights.length));
    const halfSide = Math.floor(side / 2);
    const src = ctx.getImageData(0, 0, w, h).data;
    const output = ctx.createImageData(w, h);
    const dst = output.data;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let r = 0,
          g = 0,
          b = 0;
        for (let cy = 0; cy < side; cy++) {
          for (let cx = 0; cx < side; cx++) {
            const scx = x + cx - halfSide;
            const scy = y + cy - halfSide;
            if (scx >= 0 && scx < w && scy >= 0 && scy < h) {
              const offset = (scy * w + scx) * 4;
              const wt = weights[cy * side + cx];
              r += src[offset] * wt;
              g += src[offset + 1] * wt;
              b += src[offset + 2] * wt;
            }
          }
        }
        const i = (y * w + x) * 4;
        dst[i] = r;
        dst[i + 1] = g;
        dst[i + 2] = b;
        dst[i + 3] = 255;
      }
    }
    ctx.putImageData(output, 0, 0);
  };
  return (
    <div>
      <div
        style={{
          padding: "20px",
          maxWidth: "1100px",
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
          <div className="">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition">
              Submit to Google Sheets
            </button>
          </div>
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
        <canvas ref={canvasRef} style={{ display: "none" }} />
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
            onChange={(e) => cleanAndScan(e.target.files[0])}
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
        <div className="flex justify-between w-full mx-auto">
          <div>
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
                      onChange={(e) => setMS1Opening(e.target.value)}
                      style={{
                        width: "90%",
                        padding: "5px",
                        textAlign: "center",
                      }}
                    />
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    <input
                      type="number"
                      value={ms1closing}
                      onChange={(e) => setMS1Closing(e.target.value)}
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
                    {(ms1closing - ms1opening).toFixed(2)}
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
                      onChange={(e) => setMS2Opening(e.target.value)}
                      style={{
                        width: "90%",
                        padding: "5px",
                        textAlign: "center",
                      }}
                    />
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    <input
                      type="number"
                      value={ms2closing}
                      onChange={(e) => setMS2Closing(e.target.value)}
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
                    {(ms2closing - ms2opening).toFixed(2)}
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
                      onChange={(e) => setMS3Opening(e.target.value)}
                      style={{
                        width: "90%",
                        padding: "5px",
                        textAlign: "center",
                      }}
                    />
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    <input
                      type="number"
                      value={ms3closing}
                      onChange={(e) => setMS3Closing(e.target.value)}
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
                    {(ms3closing - ms3opening).toFixed(2)}
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
                      onChange={(e) => setHSD1Opening(e.target.value)}
                      style={{
                        width: "90%",
                        padding: "5px",
                        textAlign: "center",
                      }}
                    />
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    <input
                      type="number"
                      value={hsd1closing}
                      onChange={(e) => setHSD1Closing(e.target.value)}
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
                    {(hsd1closing - hsd1opening).toFixed(2)}
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
                      onChange={(e) => setHSD2Opening(e.target.value)}
                      style={{
                        width: "90%",
                        padding: "5px",
                        textAlign: "center",
                      }}
                    />
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    <input
                      type="number"
                      value={hsd2closing}
                      onChange={(e) => setHSD2Closing(e.target.value)}
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
                    {(hsd2closing - hsd2opening).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>

            <div
              style={{
                marginTop: "20px",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                background: "#fcfcfc",
              }}
            >
              <div
                style={{
                  background: "#343a40",
                  color: "#fff",
                  padding: "12px 15px",
                  fontWeight: "bold",
                }}
              >
                Sales & Revenue Calculator
              </div>

              {/* MS Row */}
              <div style={rowStyle}>
                <div style={{ flex: 2 }}>
                  <strong style={{ color: "#007bff" }}>
                    MS Total (Petrol)
                  </strong>
                  <div style={{ fontSize: "14px", color: "#666" }}>
                    Volume: {msVolume.toFixed(2)} Ltrs
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      fontSize: "11px",
                      display: "block",
                      color: "#888",
                    }}
                  >
                    Testing (Ltr)
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={msTesting || ""}
                    onChange={(e) =>
                      setMsTesting(parseFloat(e.target.value) || 0)
                    }
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      fontSize: "11px",
                      display: "block",
                      color: "#888",
                    }}
                  >
                    Rate (₹/Ltr)
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={msRate || ""}
                    onChange={(e) => setMsRate(parseFloat(e.target.value) || 0)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: 1, textAlign: "right" }}>
                  <label
                    style={{
                      fontSize: "11px",
                      display: "block",
                      color: "#888",
                    }}
                  >
                    Subtotal
                  </label>
                  <span style={{ fontWeight: "bold", fontSize: "18px" }}>
                    ₹
                    {msSubtotal.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>

              {/* HSD Row */}
              <div style={rowStyle}>
                <div style={{ flex: 2 }}>
                  <strong style={{ color: "#dc3545" }}>
                    HSD Total (Diesel)
                  </strong>
                  <div style={{ fontSize: "14px", color: "#666" }}>
                    Volume: {hsdVolume.toFixed(2)} Ltrs
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      fontSize: "11px",
                      display: "block",
                      color: "#888",
                    }}
                  >
                    Testing (Ltr)
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={hsdTesting || ""}
                    onChange={(e) =>
                      setHsdTesting(parseFloat(e.target.value) || 0)
                    }
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      fontSize: "11px",
                      display: "block",
                      color: "#888",
                    }}
                  >
                    Rate (₹/Ltr)
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={hsdRate || ""}
                    onChange={(e) =>
                      setHsdRate(parseFloat(e.target.value) || 0)
                    }
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: 1, textAlign: "right" }}>
                  <label
                    style={{
                      fontSize: "11px",
                      display: "block",
                      color: "#888",
                    }}
                  >
                    Subtotal
                  </label>
                  <span style={{ fontWeight: "bold", fontSize: "18px" }}>
                    ₹
                    {hsdSubtotal.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>

              {/* Grand Total Footer */}
              <div
                style={{
                  ...rowStyle,
                  background: "#e9ecef",
                  borderBottom: "none",
                }}
              >
                <div
                  style={{
                    flex: 3,
                    textAlign: "right",
                    fontSize: "18px",
                    fontWeight: "bold",
                  }}
                >
                  OVERALL TOTAL:
                </div>
                <div
                  style={{
                    flex: 1,
                    textAlign: "right",
                    color: "#28a745",
                    fontSize: "22px",
                    fontWeight: "bold",
                  }}
                >
                  ₹
                  {grandTotal.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </div>
              </div>
            </div>
          </div>
          <PaymentSettlement />
        </div>
      </div>
    </div>
  );
};

export default ReceiptFixer;
