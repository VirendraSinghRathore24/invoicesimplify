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

const pdf = require("html-pdf");

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
  //service: "SendGrid",
  host: "smtpout.secureserver.net",
  port: 587, // Use 587 for TLS
  secure: false,
  auth: {
    user: "support@invoicesimplify.com",
    pass: process.env.EMAIL_PASSWORD,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP verification failed:", error);
  } else {
    console.log("SMTP server is ready to send emails");
  }
});

const dns = require("dns");
dns.lookup("smtpout.secureserver.net", (err, address) => {
  if (err) console.error("DNS Error:", err);
  else console.log("SMTP IP:", address);
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
  return result;
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

  return result;
};

const generateHtmlTableHtml1 = async (pdfPath, uid, frequency, date) => {
  const html = await generateHtmlTableHtml(uid, frequency, date);

  if (!html) {
    console.log("No HTML generated for PDF.");
    return false;
  }

  const options = { format: "A4" };

  pdf.create(html, options).toFile(pdfPath, (err, res) => {
    if (err) return console.error(err);
    console.log("PDF created:", res.filename);
  });
  return true;
};

const generateHtmlTableHtml = async (uid, frequency, yesterday) => {
  let data = [];
  if (frequency === "daily") {
    data = await fetchTableRowsFromFirebaseForDaily(uid);
  } else if (frequency === "weekly") {
    data = await fetchTableRowsFromFirebaseForWeekly(uid);
  } else if (frequency === "monthly") {
    data = await fetchTableRowsFromFirebaseForMonthly(uid);
  }
  if (data.length === 0) {
    console.log("No invoices found for yesterday.");
    return;
  }
  let dateRange = "";
  if (frequency === "daily") {
    dateRange = yesterday;
  } else if (frequency === "weekly") {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 6);
    dateRange = `${lastWeek.toISOString().split("T")[0]} to ${
      today.toISOString().split("T")[0]
    }`;
  } else if (frequency === "monthly") {
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);
    dateRange = `${lastMonth.toISOString().split("T")[0]} to ${
      today.toISOString().split("T")[0]
    }`;
  }

  let html = `
    <h3 style="font-size: 12px;">Invoice Summary - ${dateRange}</h3>
    <table border="1" cellpadding="4" cellspacing="0" style="border-collapse: collapse; width: 100%; font-size: 10px;">
      <thead style="background-color: #f2f2f2;">
        <tr>
          <th>Invoice#</th>
          <th>Name</th>
          <th>Phone</th>
          <th>Date</th>
          <th>Amount</th>
          <th>Type</th>
        </tr>
      </thead>
      <tbody>
  `;

  data.forEach((row) => {
    html += `
      <tr>
        <td>${row.invoiceInfo.invoiceNumber}</td>
        <td>${row.customerInfo.customerName}</td>
        <td>${row.customerInfo.customerPhone}</td>
        <td>${row.invoiceInfo.date}</td>
        <td>${row.amountInfo.amount}</td>
        <td>${
          row.amountInfo.paymentType === "fullyPaid" ? "Paid" : "Advance"
        }</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;
  html += `
    <hr style="border: 1px solid #ccc; margin: 20px 0;">
    `;
  data.forEach((row) => {
    html += `
    <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 10px;">
      <div>
        <p><strong>Customer Name:</strong> ${
          row?.customerInfo?.customerName || "N/A"
        }</p>
        <p><strong>Customer Phone:</strong> ${
          row?.customerInfo?.customerPhone || "N/A"
        }</p>
      </div>
      <div style="text-align: right;">
        <p><strong>Invoice #:</strong> ${
          row?.invoiceInfo?.invoiceNumber || "N/A"
        }</p>
        <p><strong>Date:</strong> ${row?.invoiceInfo?.date || "N/A"}</p>
      </div>
    </div>
  `;

    if (row?.vehicleInfo) {
      html += `
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 10px;">
      <div>
        <p><strong>Vehicle Number:</strong> ${
          row?.vehicleInfo?.vehicleNumber || "N/A"
        }</p>
        <p><strong>Kilometer:</strong> ${
          row?.vehicleInfo?.vehicleKM || "N/A"
        }</p>
        <p><strong>Type:</strong> ${row?.vehicleInfo?.vehicleType || "N/A"}</p>
      </div>
      </div>
      `;
    }

    // Add headers for the new table
    html += `
    <h3 style="font-size: 12px;">Item Details</h3>
    <table border="1" cellpadding="4" cellspacing="0" style="border-collapse: collapse; width: 100%; font-size: 10px;">
      <thead style="background-color: #f2f2f2;">
        <tr>
          <th>SN</th>
          <th>Description</th>
          <th>Rate</th>
          <th>Quantity</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
  `;

    let totalAmount = 0;

    row?.rows?.forEach((row1, index) => {
      const rowAmount = row1.rate * row1.qty;
      totalAmount += rowAmount;

      html += `
      <tr>
        <td>${index + 1}.</td>
        <td>${row1.desc}</td>
        <td>₹${row1.rate}</td>
        <td>${row1.qty}</td>
        <td>₹${rowAmount}</td>
      </tr>
    `;
    });

    html += `
      </tbody>
    </table>
    <h4 style="text-align: right; font-size: 12px;">Total Amount: ₹${totalAmount}</h4>
     
      <h4 style="text-align: right; font-size: 12px;">
      ${
        row?.amountInfo?.paymentType === "fullyPaid"
          ? "Fully Paid"
          : `Advance: ₹${row?.amountInfo?.advance || 0} <br> Balance: ₹${
              totalAmount - (row?.amountInfo?.advance || 0)
            }`
      }
      </h4>
      
    `;
    html += `
    <hr style="border: 1px solid #ccc; margin: 20px 0;">
    `;
  });
  return html;
};

const sendEmail = async (email, frequency, uid) => {
  const pdfPath = path.join(__dirname, "report.pdf");

  const isPdfGenerated = await generateHtmlTableHtml1(
    pdfPath,
    uid,
    frequency,
    frequency === "daily"
      ? getYestderdayDate()
      : frequency === "weekly"
      ? getLastWeekDate()
      : getLastMonthDate()
  );
  if (!isPdfGenerated) {
    console.log(`❌ No data found for ${frequency} report for ${email}`);
    return;
  }

  let dateRange = "";
  if (frequency === "daily") {
    dateRange = getYestderdayDate();
  } else if (frequency === "weekly") {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 6);
    dateRange = `${lastWeek.toISOString().split("T")[0]} to ${
      today.toISOString().split("T")[0]
    }`;
  } else if (frequency === "monthly") {
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);
    dateRange = `${lastMonth.toISOString().split("T")[0]} to ${
      today.toISOString().split("T")[0]
    }`;
  }

  const mailOptions = {
    from: "support@invoicesimplify.com",
    to: email,
    subject: `Your ${frequency} report - ${dateRange}`,
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
        sendEmail(data.email, frequency, data.uid);
      }
    });
  } catch (err) {
    console.error("Error fetching schedule info:", err);
  }
};

// 12:10 AM daily night for prev day
cron.schedule(
  "10 0 * * *",
  () => {
    checkAndSendEmails("daily");
    console.log("✅ Daily email check completed at 12:10 AM in the night");
  },
  {
    timezone: "Asia/Kolkata",
  }
);
// TODO - Future work

cron.schedule(
  "20 0 * * 1",
  () => {
    checkAndSendEmails("weekly");
    console.log("✅ Weekly email check completed at 12:20 AM in the night");
  },
  {
    timezone: "Asia/Kolkata",
  }
); // 12:20 AM every Monday for prev week
cron.schedule(
  "30 0 1 * *",
  () => {
    checkAndSendEmails("monthly");
    console.log("✅ Monthly email check completed at 12:30 AM in the night");
  },
  {
    timezone: "Asia/Kolkata",
  }
); // 12:30 AM every Monday for prev week

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
    console.log("Options:", options);
    const order = await razorpay.orders.create(options);
    console.log(order);

    if (!order) {
      return res.status(500).send("Error");
    }

    res.json(order);
  } catch (er) {
    res.status(500).send(er);
    console.log(er);
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

const razorpay = new Razorpay({
  key_id: "rzp_test_kkMM3XGefJOEFm",
  key_secret: "tJ1scFo8Dh6UJQff0otXd3fz",
});

app.post("/create-order", async (req, res) => {
  const { amount, currency = "INR" } = req.body;

  const options = {
    amount: amount * 100, // in paise
    currency,
    receipt: `receipt_order_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    console.log("Order created1:", order);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.error("Error creating order1:", err);
  }
});

app.listen(5001, () => console.log("Server running on port 5001"));
