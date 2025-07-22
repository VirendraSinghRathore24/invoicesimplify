const express = require("express");
const twilio = require("twilio");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cors = require("cors");
const app = express();
const PDFDocument = require("pdfkit");
const FormData = require("form-data");
const ejs = require("ejs");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const admin = require("firebase-admin");
const serviceAccount = require("./firebaseServiceAccount.json");
dotenv.config();

const Razorpay = require("razorpay");
const crypto = require("crypto");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use(cors());
app.use(express.json());

const dayjs = require("dayjs");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const accountSid = process.env.TWITTER_ACCOUNT_SID; // Use environment variables

const authToken = process.env.TWITTER_AUTH_TOKEN;
const twilioPhoneNumber = "+18565175241"; // Your Twilio phone number;
const client = new twilio(accountSid, authToken);

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN; // from WhatsApp Cloud API
const PHONE_NUMBER_ID = "598950383311139"; // from WhatsApp Cloud API
const SERVER_URL =
  "/Users/virendrasingh/Downloads/Amit Singh Rathore_invoice.pdf"; // public URL to serve PDFs

app.use("/pdfs", express.static(path.join(__dirname, "pdfs")));

app.use(cors());

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

//middlewares
app.use(express.json());

app.use(
  cors({
    //origin: "http://localhost:3000",
    origin: "https://invoicesimplify.com",
    credentials: true,
  })
);

const transporter = nodemailer.createTransport({
  service: "Godaddy",
  host: "smtpout.secureserver.net",
  secure: false,
  port: 465,
  auth: {
    user: "support@invoicesimplify.com",
    pass: process.env.EMAIL_PASSWORD,
  },
});

const tableHeaders = [
  "Invoice #",
  "Name",
  "Phone",
  "Date",
  "Amount",
  "Type",
  "Link",
];

const tableDescHeaders = ["Description", "Rate", "Quantity", "Amount"];

const fetchTableRowsFromFirebaseForDaily = async (uid) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const invoicesSnapshot = await db
    .collection("Users")
    .doc(uid)
    .collection("Invoice_Info")
    .get();

  const filteredDocs = invoicesSnapshot.docs.filter((doc) => {
    const data = doc.data();
    const invoiceDate = data?.invoiceInfo?.date; // assuming invoiceInfo.date exists
    return invoiceDate === yesterdayStr;
  });

  const result = filteredDocs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return result;
  // const rows = result.map((d, index) => {
  //   return [
  //     d.invoiceInfo.invoiceNumber,
  //     d.customerInfo.customerName,
  //     d.customerInfo.customerPhone,
  //     d.invoiceInfo.date,
  //     d.amountInfo.amount,
  //     d.amountInfo.paymentType,
  //     "https://invoicesimplify.com/ci/" + d.linkStr,
  //   ];
  // });

  // return rows;
};

const fetchTableRowsFromFirebaseForDailyDesc = async (uid) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const invoicesSnapshot = await db
    .collection("Users")
    .doc(uid)
    .collection("Invoice_Info")
    .get();

  const filteredDocs = invoicesSnapshot.docs.filter((doc) => {
    const data = doc.data();
    const invoiceDate = data?.invoiceInfo?.date; // assuming invoiceInfo.date exists
    return invoiceDate === yesterdayStr;
  });

  const result = filteredDocs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return result;
};

const fetchTableRowsFromFirebaseForWeekly = async (uid) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 6);

  const todayStr = today.toISOString().split("T")[0];
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const invoicesSnapshot = await db
    .collection("Users")
    .doc(uid)
    .collection("Invoice_Info")
    .get();

  const filteredDocs = invoicesSnapshot.docs.filter((doc) => {
    const data = doc.data();
    const invoiceDate = data?.invoiceInfo?.date; // assuming invoiceInfo.date exists
    return invoiceDate >= yesterdayStr && invoiceDate <= todayStr;
  });

  const result = filteredDocs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  const rows = result.map((d, index) => {
    return [
      d.invoiceInfo.invoiceNumber,
      d.customerInfo.customerName,
      d.customerInfo.customerPhone,
      d.invoiceInfo.date,
      d.amountInfo.amount,
      d.amountInfo.paymentType,
      "https://invoicesimplify.com/ci/" + d.linkStr,
    ];
  });
  return rows;
};

const fetchTableRowsFromFirebaseForMonthly = async (uid) => {
  const today = new Date();

  const lastMonth = new Date(today);
  lastMonth.setMonth(today.getMonth() - 1);
  lastMonth.setHours(0, 0, 0, 0);

  const todayStr = today.toISOString().split("T")[0];
  const lastMonthStr = lastMonth.toISOString().split("T")[0];

  const invoicesSnapshot = await db
    .collection("Users")
    .doc(uid)
    .collection("Invoice_Info")
    .get();

  const filteredDocs = invoicesSnapshot.docs.filter((doc) => {
    const data = doc.data();
    const invoiceDate = data?.invoiceInfo?.date; // assuming invoiceInfo.date exists
    return invoiceDate >= lastMonthStr && invoiceDate <= todayStr;
  });

  const result = filteredDocs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  const rows = result.map((d, index) => {
    return [
      d.invoiceInfo.invoiceNumber,
      d.customerInfo.customerName,
      d.customerInfo.customerPhone,
      d.invoiceInfo.date,
      d.amountInfo.amount,
      d.amountInfo.paymentType,
      "https://invoicesimplify.com/ci/" + d.linkStr,
    ];
  });
  return rows;
};
const generatePdfTable = async (filePath, uid, frequency) => {
  let tableRows = [];
  let tableDescRows = [];
  if (frequency === "daily") {
    tableRows = await fetchTableRowsFromFirebaseForDaily(uid);
    if (tableRows.length === 0) {
      console.log("No invoices found for yesterday.");
      return;
    }
    //tableDescRows = await fetchTableRowsFromFirebaseForDailyDesc(uid);
  } else if (frequency === "weekly") {
    tableRows = await fetchTableRowsFromFirebaseForWeekly(uid);
    if (tableRows.length === 0) {
      console.log("No invoices found for the last week.");
      return;
    }
  } else if (frequency === "monthly") {
    tableRows = await fetchTableRowsFromFirebaseForMonthly(uid);
    if (tableRows.length === 0) {
      console.log("No invoices found for the last month.");
      return;
    }
  }
  return new Promise(async (resolve, reject) => {
    const doc = new PDFDocument({ margin: 10 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(16).text("Invoice Report", { align: "center" });
    doc.moveDown(1);

    doc.fontSize(10);
    const columnWidths = [50, 100, 70, 70, 90, 80, 120];
    const columnDescWidths = [50, 100, 90, 90, 70];
    const tableTop = doc.y;

    // Draw headers
    const xVal = doc.x;
    let x = doc.x;

    tableHeaders.forEach((header, i) => {
      doc.rect(x, tableTop, columnWidths[i], 20).stroke();
      doc.text(header, x + 5, tableTop + 5, {
        width: columnWidths[i] - 10,
        align: "left",
      });
      x += columnWidths[i];
    });

    // Draw rows
    let y = tableTop + 20;
    tableRows.forEach((row) => {
      const heights = row.map((cell, i) => {
        const textOptions = { width: columnWidths[i] - 10 };
        return doc.heightOfString(cell, textOptions);
      });
      const rowHeight = Math.max(...heights) + 10;
      x = xVal;
      row.forEach((cell, i) => {
        doc.rect(x, y, columnWidths[i], rowHeight).stroke();
        if (i === 6 && cell.startsWith("https://invoicesimplify.com")) {
          doc
            .fillColor("blue")
            .text(cell, x + 5, y + 5, {
              width: columnWidths[i] - 10,
              height: rowHeight - 10,
              align: "left",
              link: cell,
              underline: true,
            })
            .fillColor("black");
        } else {
          doc.text(cell, x + 5, y + 5, {
            width: columnWidths[i] - 10,
            height: rowHeight - 10,
            align: "left",
          });
        }
        x += columnWidths[i];
      });
      y += rowHeight;
    });

    // doc.fontSize(16).text("Customer Invoices", { align: "center" });
    // doc.moveDown();

    // // Loop through JSON data
    // tableDescRows.forEach((entry, index) => {
    //   doc.fontSize(12).text(`Customer #${index + 1}`);
    //   doc.text(`Name: ${entry.id}`);
    //   doc.text(`Age: ${entry.invoiceInfo.date}`);
    //   doc.text(`Gender: ${entry.customerInfo.customerName}`);
    //   doc.text(`Occupation: ${entry.customerInfo.customerPhone}`);
    //   doc.moveDown();
    // });

    // tableDescHeaders.forEach((header, i) => {
    //   doc.rect(x, tableTop, columnDescWidths[i], 20).stroke();
    //   doc.text(header, x + 5, tableTop + 5, {
    //     width: columnDescWidths[i] - 10,
    //     align: "left",
    //   });
    //   x += columnDescWidths[i];
    // });

    // console.log("basu bhuvaji");
    // console.log(tableDescRows[0]);

    // tableDescRows.forEach((row) => {
    //   const heights = 100;
    //   //  row.map((cell, i) => {
    //   //   const textOptions = { width: columnDescWidths[i] - 10 };
    //   //   return doc.heightOfString(cell, textOptions);
    //   // });
    //   const rowHeight = Math.max(...heights) + 10;
    //   x = xVal;
    //   row.forEach((cell, i) => {
    //     doc.rect(x, y, columnDescWidths[i], rowHeight).stroke();

    //     doc.text(cell, x + 5, y + 5, {
    //       width: columnDescWidths[i] - 10,
    //       height: rowHeight - 10,
    //       align: "left",
    //     });

    //     x += columnDescWidths[i];
    //   });
    //   y += rowHeight;
    // });

    doc.end();

    stream.on("finish", () => resolve());
    stream.on("error", reject);
  });
};

const generatePdfTable1 = async (filePath) => {
  const doc = new PDFDocument({ margin: 30 });
  doc.pipe(fs.createWriteStream(filePath));

  // Sample summary data
  const invoices = [
    {
      invoiceNo: "INV-1001",
      name: "John Doe",
      phone: "9876543210",
      date: "2025-07-18",
      amount: 1200,
      type: "Online",
      link: "https://example.com/invoice/INV-1001",
      status: "Paid",
      details: [
        { desc: "Product A", price: 200, qty: 2 },
        { desc: "Service B", price: 400, qty: 2 },
      ],
    },
    {
      invoiceNo: "INV-1002",
      name: "Jane Smith",
      phone: "9123456780",
      date: "2025-07-17",
      amount: 600,
      type: "Offline",
      link: "https://example.com/invoice/INV-1002",
      status: "Unpaid",
      details: [
        { desc: "Item X", price: 150, qty: 2 },
        { desc: "Item Y", price: 100, qty: 3 },
      ],
    },
  ];

  // Helper function to draw summary table
  function drawSummaryTable(data) {
    const headers = [
      "Invoice #",
      "Name",
      "Phone",
      "Date",
      "Amount",
      "Type",
      "Link",
    ];
    const columnWidths = [30, 80, 60, 50, 40, 40, 100];
    let y = doc.y;
    let x = doc.x;
    let x1 = doc.x;
    let y1 = doc.y;
    doc.font("Helvetica-Bold").fontSize(10);
    headers.forEach((header, i) => {
      doc.text(
        header,
        x + columnWidths.slice(0, i).reduce((a, b) => a + b, 0),
        y,
        {
          width: columnWidths[i],
          align: "left",
        }
      );
    });
    doc.moveDown(1);

    x = x1;
    y = doc.x;
    doc.font("Helvetica").fontSize(10);
    data.forEach((row) => {
      y = y + 15; // Move down for each row
      const values = [
        row.invoiceNo,
        row.name,
        row.phone,
        row.date,
        row.amount,
        row.type,
        row.link,
      ];
      values.forEach((value, i) => {
        doc.text(
          String(value),
          x + columnWidths.slice(0, i).reduce((a, b) => a + b, 0),
          y,
          {
            width: columnWidths[i],
            align: "left",
          }
        );
      });
      doc.moveDown(0.8);
    });
  }

  // Helper function to draw detailed invoice
  function drawInvoiceDetail(invoice) {
    doc.addPage(); // New page for each invoice
    doc
      .fontSize(14)
      .text(`Invoice Detail: ${invoice.invoiceNo}`, { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).text(`Name: ${invoice.name}`);
    doc.text(`Phone: ${invoice.phone}`);
    doc.text(`Date: ${invoice.date}`);
    doc.text(`Status: ${invoice.status}`);
    doc.moveDown(1);

    // Invoice item table
    const itemHeaders = ["Description", "Price", "Qty", "Total"];
    const colWidths = [200, 80, 60, 80];
    let y = doc.y;

    doc.font("Helvetica-Bold");
    itemHeaders.forEach((header, i) => {
      doc.text(
        header,
        doc.x + colWidths.slice(0, i).reduce((a, b) => a + b, 0),
        y,
        {
          width: colWidths[i],
          align: "left",
        }
      );
    });
    doc.moveDown(0.5);

    doc.font("Helvetica");
    let grandTotal = 0;
    invoice.details.forEach((item) => {
      const total = item.price * item.qty;
      grandTotal += total;
      const values = [item.desc, item.price, item.qty, total];
      y = doc.y;
      values.forEach((val, i) => {
        doc.text(
          String(val),
          doc.x + colWidths.slice(0, i).reduce((a, b) => a + b, 0),
          y,
          {
            width: colWidths[i],
            align: "left",
          }
        );
      });
      doc.moveDown(0.5);
    });

    // Grand Total
    doc.moveDown(0.5);
    doc
      .font("Helvetica-Bold")
      .text(`Total: ₹${grandTotal}`, { align: "right" });
  }

  // Build PDF
  doc.fontSize(16).text("Invoice Summary Report", { align: "center" });
  doc.moveDown(1);
  drawSummaryTable(invoices);
  invoices.forEach(drawInvoiceDetail);

  doc.end();
};
const generateHtmlTable = async () => {
  let data = await fetchTableRowsFromFirebaseForDaily(uid);
  let html = `
    <h3>Daily Invoice Summary</h3>
    <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">
      <thead style="background-color: #f2f2f2;">
        <tr>
          <th>Invoice</th>
          <th>Name</th>
          <th>Amount</th>
          <th>Date</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
  `;

  data.forEach((row) => {
    html += `
      <tr>
        <td>${row.invoice}</td>
        <td>${row.name}</td>
        <td>₹${row.amount}</td>
        <td>${row.date}</td>
        <td>${row.status}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  return html;
};

const generateHtmlTableHtml = async (uid) => {
  let data = await fetchTableRowsFromFirebaseForDaily(uid);
  let html = `
    <h3>Daily Invoice Summary</h3>
    <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">
      <thead style="background-color: #f2f2f2;">
        <tr>
          <th>Invoice#</th>
          <th>Name</th>
          <th>Phone</th>
          <th>Date</th>
          <th>Amount</th>
          <th>Type</th>
          <th>Link</th>
        </tr>
      </thead>
      <tbody>
  `;

  console.log("Data fetched for HTML table:", data);

  data.forEach((row) => {
    html += `
      <tr>
       <td>${row.invoiceInfo.invoiceNumber}</td>
        <td>${row.customerInfo.customerName}</td>
         <td>${row.customerInfo.customerPhone}</td>
          <td>${row.invoiceInfo.date}</td>
           <td>${row.amountInfo.amount}</td>
            <td>${row.amountInfo.paymentType}</td>
             <td>${row.linkStr}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  return html;
};

const sendEmailHtml = async (email, frequency, uid) => {
  const htmlBody = await generateHtmlTableHtml(uid);
  const mailOptions = {
    from: "support@invoicesimplify.com",
    to: email,
    subject: "Daily Invoice Report",
    html: htmlBody,
  };

  console.log("Sending email to:", email);
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) return console.error("Error:", error);
    console.log("Email sent:", info.response);
  });
};

const sendEmail = async (email, frequency, uid) => {
  const pdfPath = path.join(__dirname, "report.pdf");

  //await generatePdfTable1(pdfPath);

  await generatePdfTable(pdfPath, uid, frequency);
  const mailOptions = {
    from: "support@invoicesimplify.com",
    to: email,
    subject: `Your ${frequency} report - ${
      frequency === "daily"
        ? getYestderdayDate()
        : frequency === "weekly"
        ? getLastWeekDate()
        : getLastMonthDate()
    }`,
    text: `Hello, this is your ${frequency} scheduled report.`,
    attachments: [
      {
        filename: "report.pdf",
        path: pdfPath,
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${email} for ${frequency}`);
  } catch (err) {
    console.error(`❌ Error sending to ${email}:`, err);
  }
};

const getYestderdayDate = () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  return yesterday.toISOString().split("T")[0];
};

const getLastWeekDate = () => {
  const today = new Date();
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7);
  return lastWeek.toISOString().split("T")[0];
};
const getLastMonthDate = () => {
  const today = new Date();
  const lastMonth = new Date(today);
  lastMonth.setMonth(today.getMonth() - 1);
  return lastMonth.toISOString().split("T")[0];
};

const checkAndSendEmails = async (frequency) => {
  try {
    const basicInfoRef = db.collection("scheduledEmails");
    const basicSnapshot = await basicInfoRef.get();

    basicSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.frequencies.includes(frequency)) {
        sendEmailHtml(data.email, frequency, data.uid);
      }
    });
  } catch (err) {
    console.error("Error fetching schedule info:", err);
  }
};

cron.schedule("29 11 * * *", () => {
  checkAndSendEmails("daily");
  // const html = generateHtmlTable();
  // sendEmail(html);
});
// TODO - Future work
//cron.schedule("15 10 * * *", () => checkAndSendEmails("daily")); // 12:10 AM daily night for prev day
//cron.schedule("20 00 * * 1", () => checkAndSendEmails("weekly")); // 12:20 AM every Monday for prev week
//cron.schedule("30 00 1 * *", () => checkAndSendEmails("monthly")); // 12:30 AM on the 1st of every month

app.get("/ping", (req, res) => res.send("Server is running"));

app.post("/send-sms", async (req, res) => {
  const { to, message } = req.body;

  try {
    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to,
    });
    res.status(200).json({ success: true, sid: result.sid });
  } catch (error) {
    console.error("Error sending SMS:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/send-whatsapp", async (req, res) => {
  const { to, message } = req.body;
  try {
    await client.messages.create({
      from: `whatsapp:${+14155238886}`, // Replace with your Twilio Sandbox number
      to: `whatsapp:${to}`,
      body: message,
    });
    res.status(200).json({ success: true, message: "WhatsApp message sent!" });
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/download-pdf", async (req, res) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const data = {
    businessInfo: {
      name: "Your Business",
      subTitle1: "Best Clothes in Town",
      phonePrimary: "1234567890",
      phoneSecondary: "9876543210",
      address1: "MG Road",
      address2: "Jaipur",
      address3: "302001",
    },
    taxInfo: {
      gstNumber: "22AAAAA0000A1Z5",
      cgstAmount: 9,
      sgstAmount: 9,
    },
    invoiceInfo: {
      invoiceNumber: "INV-001",
      expectedDate: "2025-06-10",
    },
    customerInfo: {
      customerName: "Virendra Singh",
      customerPhone: "9999999999",
    },
    date: "2025-06-05",
    rows: [
      { desc: "Kurti", rate: 500, qty: 2, amount: 1000 },
      { desc: "Saree", rate: 1200, qty: 1, amount: 1200 },
    ],
    amountInfo: {
      amount: 2200,
      advance: 500,
    },
    taxCalculatedInfo: {
      cgst: 198,
      sgst: 198,
      balance: 1700,
    },
    additionalInfo: {
      note1: "Goods once sold won't be returned",
      note2: "Color may vary",
      middlenote1: "Thanks for shopping!",
      rnote1: "Authorized Signature",
      additionaldesc: "Visit again!",
    },
  };

  const invoiceHTML = await ejs.renderFile(
    path.join(__dirname, "views/invoice.ejs"),
    { ...data }
  );
  await page.setContent(invoiceHTML);
  const pdfBuffer = await page.pdf({ format: "A4" });

  await browser.close();

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": "attachment; filename=invoice.pdf",
  });
  res.send(pdfBuffer);
});

const CLOUDINARY_PDF_URL =
  "https://res.cloudinary.com/dixqxdivr/image/upload/v1695621741/jalmahal3_sd6for.jpg";
app.get("/generate-pdf", async (req, res) => {
  try {
    // Upload media to WhatsApp

    const response = await axios.post(
      `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/media`,
      {
        messaging_product: "whatsapp",
        type: "image", // use 'image', 'video', etc. if needed
        url: CLOUDINARY_PDF_URL,
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Uploaded:", response.data);
  } catch (error) {
    console.error("❌ Upload error:", error.response?.data || error.message);
  }
});

app.get("/invoice", async (req, res) => {
  try {
    const payload = {
      messaging_product: "whatsapp",
      to: "918095528424",
      type: "interactive",
      interactive: {
        type: "button",
        body: {
          text: "Thank you for your interest! Click the button below to view your invoice.",
        },
        action: {
          buttons: [
            {
              type: "url",
              url: "https://res.cloudinary.com/your-cloud-name/raw/upload/v123456/invoice.pdf", // Replace with your actual Cloudinary URL
              title: "View Invoice",
            },
          ],
        },
      },
    };

    const response = await axios.post(
      `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Message sent with button:", response.data);
  } catch (error) {
    console.error(
      "❌ Error sending button message:",
      error.response?.data || error.message
    );
  }
});

app.post("/send-message", async (req, res) => {
  try {
    const { name, phone, businessname, amount, urllink, date } = req.body;

    console.log(req.body);

    const response = await axios.post(
      `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: "91" + phone, // Example: "919999999999"
        type: "text",
        // text: {
        //   name: "invoice",
        //   language: { code: "en_US" },
        //   components: [
        //     {
        //       type: "body",
        //       parameters: [
        //         { type: "text", text: "Virendra" }, // {{1}}
        //         { type: "text", text: "dashboard" }, // {{3}} — invoice ID in URL
        //       ],
        //     },
        //   ],
        // },
        text: {
          body: "dashboard",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("✅ Message sent:", response.data);
    res.json({ success: true, response: response.data });
  } catch (error) {
    console.error(error?.response?.data || error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

function createPDF(filePath, text = "Hello from Node.js and WhatsApp API!") {
  return new Promise((resolve) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    doc.text(text);
    doc.end();

    stream.on("finish", () => {
      resolve(filePath);
    });
  });
}

async function uploadMedia(filePath) {
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));
  form.append("type", "application/pdf");
  form.append("messaging_product", "whatsapp");

  const response = await axios.post(
    `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/media`,
    form,
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        ...form.getHeaders(),
      },
    }
  );
  console.log(response.data.id);
  console.log(filePath);
  return response.data.id; // media_id
}

// 3. Send PDF as document message
async function sendDocument(mediaId, filename) {
  const payload = {
    messaging_product: "whatsapp",
    to: "918095528424",
    type: "document",
    document: {
      id: mediaId,
      filename: filename,
    },
  };

  const response = await axios.post(
    `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
  console.log("Soniya");
  console.log(response.data);
  return response.data;
}

// 🔄 Full flow: Create, upload, and send
app.get("/send-pdf", async (req, res) => {
  //const filePath = "./sample.pdf";
  const filePath =
    "https://res.cloudinary.com/dixqxdivr/image/upload/v1695621741/jalmahal4_hendt5.jpg";
  try {
    //await createPDF(filePath);
    const mediaId = await uploadMedia(filePath);
    const result = await sendDocument(mediaId, "sample.pdf");
    res.json({ success: true, result });
  } catch (err) {
    console.error("Error sending PDF:", err.response?.data || err.message);
    res
      .status(500)
      .json({ success: false, error: err.response?.data || err.message });
  }
});

app.get("/send-pdf-whatsapp", async (req, res) => {
  const { html } = req.body;
  const fileName = `invoice-${Date.now()}.pdf`;
  const filePath = path.join(__dirname, "pdfs", fileName);
  const publicUrl = `${SERVER_URL}/pdfs/${fileName}`;

  console.log("viren");
  console.log("HTML:", html);
  // console.log("Phone:", phone);
  // console.log("File Path:", filePath);
  // console.log("Public URL:", publicUrl);

  try {
    // Generate PDF
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setContent(html);
    await page.pdf({ path: filePath, format: "A4" });
    await browser.close();

    // Upload media to WhatsApp
    const mediaRes = await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/media`,
      {
        messaging_product: "whatsapp",
        type: "document",
        url: publicUrl,
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const mediaId = mediaRes.data.id;

    // Send document message
    await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: phone,
        type: "document",
        document: {
          id: mediaId,
          caption: "Your Invoice",
          filename: fileName,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ message: "PDF sent to WhatsApp!" });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to send WhatsApp message" });
  }
});

app.post("/order", async (req, res) => {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const options = req.body;
    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).send("Error");
    }

    res.json(order);
  } catch (er) {
    res.status(500).send(er);
  }
});

app.post("/order/validate", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const sha = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
  //order_id + "|" + razorpay_payment_id
  sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = sha.digest("hex");

  if (digest !== razorpay_signature) {
    return res.status(400).json({ msg: "Transaction is not legit!" });
  }

  res.json({
    msg: "success",
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
  });
});

app.listen(5001, () => console.log("Server running on port 5001"));
