const express = require("express");
const twilio = require("twilio");
const QRCode = require("qrcode");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cors = require("cors");
const app = express();
const OpenAI = require("openai");
const PDFDocument = require("pdfkit");
const FormData = require("form-data");
const ejs = require("ejs");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const admin = require("firebase-admin");
const serviceAccount = require("./firebaseServiceAccount.json");
const bodyParser = require("body-parser");
const { GoogleGenerativeAI } = require("@google/generative-ai");
dotenv.config();
const multer = require("multer");
app.use(bodyParser.json({ limit: "10mb" }));

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

app.get("/api/gst/searchgst/:id", async (req, res) => {
  try {
    const { id } = req.params; // from URL

    const response1 = await axios.post(
      "https://api.sandbox.co.in/authenticate",
      {}, // Empty body (Sandbox expects keys in headers)
      {
        headers: {
          "x-api-key": process.env.X_API_KEY,
          "x-api-secret": process.env.X_API_SECRET,
          "x-api-version": "1.0.0", // Recommended
        },
      }
    );

    const accessToken = response1.data.access_token;

    const response2 = await axios.post(
      "https://api.sandbox.co.in/gst/compliance/public/gstin/search",
      {
        // 1. Request Body (JSON)
        gstin: id,
      },
      {
        // 3. Headers
        headers: {
          Authorization: accessToken, // Sandbox usually expects token without "Bearer"
          "x-api-key": process.env.X_API_KEY,
          "x-api-version": "1.0.0",
        },
      }
    );

    const result = JSON.stringify(response2.data.data?.data);

    return res.status(200).json(result);
  } catch (error) {
    console.error("GST API Error:", error?.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch GST details",
      error: error?.response?.data || error.message,
    });
  }
});

app.get("/api/sellers/check/:id", async (req, res) => {
  try {
    const { id } = req.params; // from URL
    const { year } = req.query;

    const response1 = await axios.post(
      "https://api.sandbox.co.in/authenticate",
      {}, // Empty body (Sandbox expects keys in headers)
      {
        headers: {
          "x-api-key": process.env.X_API_KEY,
          "x-api-secret": process.env.X_API_SECRET,
          "x-api-version": "1.0.0", // Recommended
        },
      }
    );

    const accessToken = response1.data.access_token;

    const responseSearch = await axios.post(
      "https://api.sandbox.co.in/gst/compliance/public/gstin/search",
      {
        // 1. Request Body (JSON)
        gstin: id,
      },
      {
        // 3. Headers
        headers: {
          Authorization: accessToken, // Sandbox usually expects token without "Bearer"
          "x-api-key": process.env.X_API_KEY,
          "x-api-version": "1.0.0",
        },
      }
    );

    const result = JSON.stringify(responseSearch.data.data?.data);

    const response2 = await axios.post(
      "https://api.sandbox.co.in/gst/compliance/public/gstrs/track",
      {
        // 1. Request Body (JSON)
        gstin: id,
      },
      {
        // 2. Query Parameters (?financial_year=2024-25)
        params: {
          financial_year: "FY " + year.toString(), // Format e.g., "2024-25"
        },
        // 3. Headers
        headers: {
          Authorization: accessToken, // Sandbox usually expects token without "Bearer"
          "x-api-key": process.env.X_API_KEY,
          "x-api-version": "1.0.0",
        },
      }
    );

    const eFilingList = JSON.stringify(response2.data.data?.data);

    // const response = await axios.get(
    //   "https://apisandbox.whitebooks.in/public/rettrack",
    //   {
    //     params: {
    //       email: process.env.WHITEBOOKS_EMAIL,
    //       gstin: id,
    //       fy: year,
    //     },
    //     headers: {
    //       client_id: process.env.WHITEBOOKS_CLIENT_ID,
    //       client_secret_id: process.env.WHITEBOOKS_CLIENT_SECRET,
    //       "Content-Type": "application/json",
    //     },
    //     timeout: 10000,
    //   }
    // );

    return res
      .status(200)
      .json({ eFilingList: eFilingList, searchResult: result });
  } catch (error) {
    console.error("GST API Error:", error?.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch GST details",
      error: error?.response?.data || error.message,
    });
  }
});

app.get("/api/gst/gstr2b1", async (req, res) => {
  try {
    // How to get gstr2b data from gst portal - step by step:

    // Prerequisites:
    // You must have an active GST account and access to the GST Portal.
    // Before requesting OTP, enable API access for the GST user from
    // View Profile > Manage API Access on the GST Portal. For the full portal walkthrough, see Enable API Access.
    // https://developer.sandbox.co.in/recipes/gst/authentication/generate_tax_payer_session

    // 1. Get Access Token (Sandbox) => https://api.sandbox.co.in/authenticate
    // 2. Request OTP => https://api.sandbox.co.in/gst/compliance/tax-payer/otp , pass username and gst
    // 3. Verify OTP => https://api.sandbox.co.in/gst/compliance/tax-payer/otp/verify?otp=575757 => it will provide taxpayer access token
    // 4. Refresh Taxpayer Session => https://api.sandbox.co.in/gst/compliance/tax-payer/session/refresh, using taxpayer access token => for 6 hours access
    // 5. Call GSTR2B => https://api.sandbox.co.in/gst/compliance/tax-payer/gstrs/gstr-2b/{year}/{month} , header auth is taxpayer access token

    const { gstin, fp } = req.query;

    // 1. Get Access Token (Sandbox) => https://api.sandbox.co.in/authenticate
    const response1 = await axios.post(
      "https://api.sandbox.co.in/authenticate",
      {}, // Empty body (Sandbox expects keys in headers)
      {
        headers: {
          "x-api-key": process.env.X_API_KEY,
          "x-api-secret": process.env.X_API_SECRET,
          "x-api-version": "1.0.0", // Recommended
        },
      }
    );

    const sandboxAccessToken = response1.data.access_token;

    // 2. Request OTP => https://api.sandbox.co.in/gst/compliance/tax-payer/otp , pass username and gst
    const response2 = await axios.post(
      "https://api.sandbox.co.in/gst/compliance/tax-payer/otp",
      { username: "acme.com", gstin: gstin },
      {
        headers: {
          "x-api-key": process.env.X_API_KEY,
          "x-api-secret": process.env.X_API_SECRET,
          "x-api-version": "1.0.0", // Recommended
          accept: "application/json",
          authorization: sandboxAccessToken,
          "x-source": "primary",
        },
      }
    );

    // 3. Verify OTP => https://api.sandbox.co.in/gst/compliance/tax-payer/otp/verify?otp=575757 => it will provide taxpayer access token
    const response3 = await axios.post(
      "https://api.sandbox.co.in/gst/compliance/tax-payer/otp/verify?otp={575757}",
      { username: "acme.com", gstin: gstin },
      {
        headers: {
          "x-api-key": process.env.X_API_KEY,
          "x-api-secret": process.env.X_API_SECRET,
          "x-api-version": "1.0.0", // Recommended
          accept: "application/json",
          authorization: sandboxAccessToken,
          "x-source": "primary",
        },
      }
    );

    // 4. Refresh Taxpayer Session => https://api.sandbox.co.in/gst/compliance/tax-payer/session/refresh, using taxpayer access token => for 6 hours access
    const taxpayerAccessToken = response3.data.access_token;
    await axios.post(
      "https://api.sandbox.co.in/gst/compliance/tax-payer/session/refresh",
      {},
      {
        headers: {
          "x-api-key": process.env.X_API_KEY,
          "x-api-secret": process.env.X_API_SECRET,
          "x-api-version": "1.0.0", // Recommended
          accept: "application  json",
          authorization: taxpayerAccessToken,
        },
      }
    );

    // 5. Call GSTR2B => https://api.sandbox.co.in/gst/compliance/tax-payer/gstrs/gstr-2b/{year}/{month} , header auth is taxpayer access token
    await axios.post(
      "https://api.sandbox.co.in/gst/compliance/tax-payer/gstrs/gstr-2b/{year}/{month}",
      {},
      {
        headers: {
          "x-api-key": process.env.X_API_KEY,
          "x-api-secret": process.env.X_API_SECRET,
          "x-api-version": "1.0.0", // Recommended
          accept: "application  json",
          authorization: taxpayerAccessToken,
        },
      }
    );

    const mockResponse = {
      success: true,
      gstr2bData: [
        {
          gstin: "27AAAAA0000A1Z5",
          fp: "112024",
          dt: "14-12-2024",
          data: {
            b2b: [
              {
                ctin: "24ACRPP7935N1ZO",
                trdnm: "HITESHKUMAR DWARKADAS PATEL",
                supfildt: "07-12-2024",
                supprd: "112024",
                ttldocs: 1,
                txval: 26250.0,
                igst: 0.0,
                cgst: 2362.5,
                sgst: 2362.5,
                cess: 0.0,
              },
              {
                ctin: "06AACCG0527D1Z8",
                trdnm: "GOOGLE INDIA PVT LTD",
                supfildt: "11-11-2024",
                supprd: "102024",
                ttldocs: 1,
                txval: 2208.0,
                igst: 397.44,
                cgst: 0.0,
                sgst: 0.0,
                cess: 0.0,
              },
              {
                ctin: "24AAAAA0000A1Z5",
                trdnm: "HARDWARE SUPPLIER LTD",
                supfildt: "10-12-2024",
                supprd: "112024",
                ttldocs: 1,
                txval: 8000.0, // Mismatch: Registered as 8000 instead of 10000
                igst: 1440.0,
                cgst: 0.0,
                sgst: 0.0,
                cess: 0.0,
              },
            ],
            cdnr: [],
          },
        },
      ],
    };

    return res.status(200).json(mockResponse);

    // return res.status(200).json({
    //   success: true,
    //   data: response.data,
    // });
  } catch (error) {
    console.error("GST API Error:", error?.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch GST details",
      error: error?.response?.data || error.message,
    });
  }
});
app.get("/api/gst/gstr2b", async (req, res) => {
  try {
    const { gstin, fp } = req.query;
    // const response = await axios.get(
    //   "https://apisandbox.whitebooks.in/public/rettrack",
    //   {
    //     params: {
    //       email: process.env.WHITEBOOKS_EMAIL,
    //       gstin: gstin,
    //       fy: fp,
    //     },
    //     headers: {
    //       client_id: process.env.WHITEBOOKS_CLIENT_ID,
    //       client_secret_id: process.env.WHITEBOOKS_CLIENT_SECRET,
    //       "Content-Type": "application/json",
    //     },
    //     timeout: 10000,
    //   }
    // );

    const mockResponse = {
      code: 200,
      data: {
        data: {
          chksum:
            "e6255f8e01d58128775e20b2405bf4b93f74fc9f737b3f7da1829927f357bb61",
          data: {
            cpsumm: {
              b2b: [
                {
                  cess: 0,
                  cgst: 23.5,
                  ctin: "24ACRPP7935N1ZO",
                  igst: 0,
                  sgst: 23.5,
                  supfildt: "07-12-2024",
                  supprd: "112024",
                  trdnm: "HITESHKUMAR DWARKADAS PATEL",
                  ttldocs: 1,
                  txval: 26250,
                },
                {
                  cess: 0,
                  cgst: 0,
                  ctin: "06AACCG0527D1Z8",
                  igst: 397.44,
                  sgst: 0,
                  supfildt: "11-11-2024",
                  supprd: "102024",
                  trdnm: "GOOGLE INDIA PVT LTD",
                  ttldocs: 1,
                  txval: 2208,
                },
                {
                  cess: 0,
                  cgst: 198.31,
                  ctin: "24AACFI9070L1Z5",
                  igst: 0,
                  sgst: 198.31,
                  supfildt: "10-12-2024",
                  supprd: "112024",
                  trdnm: "I TECH STORE",
                  ttldocs: 1,
                  txval: 2203.39,
                },
                {
                  cess: 0,
                  cgst: 30.59,
                  ctin: "24AAJCC9783E1ZD",
                  igst: 0,
                  sgst: 30.59,
                  supfildt: "11-11-2024",
                  supprd: "102024",
                  trdnm: "CLICKTECH RETAIL PRIVATE LIMITED",
                  ttldocs: 1,
                  txval: 339.84,
                },
                {
                  cess: 0,
                  cgst: 0,
                  ctin: "27AAFCV6085L1ZO",
                  igst: 237.38,
                  sgst: 0,
                  supfildt: "10-12-2024",
                  supprd: "112024",
                  trdnm: "VAY NETWORK SERVICES PRIVATE LIMITED",
                  ttldocs: 1,
                  txval: 1318.8,
                },
                {
                  cess: 0,
                  cgst: 0,
                  ctin: "08BMNPP2457E2ZR",
                  igst: 18.76,
                  sgst: 0,
                  supfildt: "11-12-2024",
                  supprd: "112024",
                  trdnm: "DM Marketing",
                  ttldocs: 1,
                  txval: 375.24,
                },
                {
                  cess: 0,
                  cgst: 0,
                  ctin: "29AAICP2912R1ZR",
                  igst: 130822.64,
                  sgst: 0,
                  supfildt: "11-12-2024",
                  supprd: "112024",
                  trdnm: "CASHFREE PAYMENTS INDIA PRIVATE LIMITED",
                  ttldocs: 1,
                  txval: 726792.4,
                },
                {
                  cess: 0,
                  cgst: 648.16,
                  ctin: "24AABCI6363G1ZP",
                  igst: 0,
                  sgst: 648.16,
                  supfildt: "11-12-2024",
                  supprd: "112024",
                  trdnm: "Reliance Jio Infocomm  Limited",
                  ttldocs: 1,
                  txval: 7201.8,
                },
                {
                  cess: 0,
                  cgst: 152.54,
                  ctin: "24AAWFG9936H1ZP",
                  igst: 0,
                  sgst: 152.54,
                  supfildt: "11-12-2024",
                  supprd: "112024",
                  trdnm: "GOURMESSERIE LLP",
                  ttldocs: 1,
                  txval: 1694.92,
                },
                {
                  cess: 0,
                  cgst: 0,
                  ctin: "06AAGCG5872M1Z3",
                  igst: 27,
                  sgst: 0,
                  supfildt: "11-12-2024",
                  supprd: "112024",
                  trdnm: "Grey Swift Private Limited",
                  ttldocs: 1,
                  txval: 150,
                },
                {
                  cess: 0,
                  cgst: 2362.5,
                  ctin: "24AIYPP5747M1Z8",
                  igst: 0,
                  sgst: 2362.5,
                  supfildt: "04-12-2024",
                  supprd: "112024",
                  trdnm: "SHRI SAI TEXTILES",
                  ttldocs: 1,
                  txval: 26250,
                },
                {
                  cess: 0,
                  cgst: 0,
                  ctin: "32BEGPM1696R1ZU",
                  igst: 49.36,
                  sgst: 0,
                  supfildt: "13-11-2024",
                  supprd: "102024",
                  trdnm: "ONLY MAT",
                  ttldocs: 1,
                  txval: 408.79,
                },
                {
                  cess: 0,
                  cgst: 432.11,
                  ctin: "24AAECJ6878N1ZU",
                  igst: 0,
                  sgst: 432.11,
                  supfildt: "11-12-2024",
                  supprd: "112024",
                  trdnm: "JIO PLATFORMS LIMITED",
                  ttldocs: 1,
                  txval: 4801.2,
                },
                {
                  cess: 0,
                  cgst: 4725,
                  ctin: "24AQDPP4462E1Z0",
                  igst: 0,
                  sgst: 4725,
                  supfildt: "07-12-2024",
                  supprd: "112024",
                  trdnm: "PATEL YOGINABEN HITESHKUMAR",
                  ttldocs: 1,
                  txval: 52500,
                },
                {
                  cess: 0,
                  cgst: 26.91,
                  ctin: "24AAACB2894G1ZT",
                  igst: 0,
                  sgst: 26.91,
                  supfildt: "10-12-2024",
                  supprd: "112024",
                  trdnm: "BHARTI  AIRTEL LTD.",
                  ttldocs: 1,
                  txval: 299,
                },
                {
                  cess: 0,
                  cgst: 0,
                  ctin: "29AAHCD5090M1Z3",
                  igst: 4079.23,
                  sgst: 0,
                  supfildt: "11-12-2024",
                  supprd: "112024",
                  trdnm: "DIGITAP.AI ENTERPRISE SOLUTIONS PRIVATE LIMITED",
                  ttldocs: 1,
                  txval: 22662.4,
                },
                {
                  cess: 0,
                  cgst: 10883.91,
                  ctin: "24AAACU6278M1ZV",
                  igst: 0,
                  sgst: 10883.91,
                  supfildt: "10-12-2024",
                  supprd: "112024",
                  trdnm: "UNICORN INFOSOLUTIONS PRIVATE LIMITED",
                  ttldocs: 1,
                  txval: 120932.18,
                },
                {
                  cess: 0,
                  cgst: 0,
                  ctin: "27AAGCG4576J1Z6",
                  igst: 4.65,
                  sgst: 0,
                  supfildt: "11-12-2024",
                  supprd: "112024",
                  trdnm: "Google Cloud India Private Limited",
                  ttldocs: 1,
                  txval: 25.84,
                },
                {
                  cess: 0,
                  cgst: 0,
                  ctin: "06AACCG0527D1Z8",
                  igst: 384.19,
                  sgst: 0,
                  supfildt: "11-12-2024",
                  supprd: "112024",
                  trdnm: "GOOGLE INDIA PVT LTD",
                  ttldocs: 1,
                  txval: 2134.4,
                },
                {
                  cess: 0,
                  cgst: 0,
                  ctin: "07AAJCA9880A1ZL",
                  igst: 79345.02,
                  sgst: 0,
                  supfildt: "10-12-2024",
                  supprd: "112024",
                  trdnm: "AMAZON WEB SERVICES INDIA PRIVATE LIMITED",
                  ttldocs: 6,
                  txval: 440805.62,
                },
                {
                  cess: 0,
                  cgst: 2333.9,
                  ctin: "24AAWFG9936H1ZP",
                  igst: 0,
                  sgst: 2333.9,
                  supfildt: "13-11-2024",
                  supprd: "102024",
                  trdnm: "GOURMESSERIE LLP",
                  ttldocs: 2,
                  txval: 25932.21,
                },
                {
                  cess: 0,
                  cgst: 0,
                  ctin: "33AAACZ4322M2Z9",
                  igst: 288,
                  sgst: 0,
                  supfildt: "11-12-2024",
                  supprd: "112024",
                  trdnm: "ZOHO CORPORATION PRIVATE LIMITED",
                  ttldocs: 1,
                  txval: 1600,
                },
                {
                  cess: 0,
                  cgst: 0,
                  ctin: "27AAFCN3372G1ZF",
                  igst: 2535.19,
                  sgst: 0,
                  supfildt: "11-12-2024",
                  supprd: "112024",
                  trdnm: "NSDL PAYMENTS BANK LIMITED",
                  ttldocs: 2,
                  txval: 14084.4,
                },
                {
                  cess: 0,
                  cgst: 258.62,
                  ctin: "24AAECR0564M1Z9",
                  igst: 0,
                  sgst: 258.62,
                  supfildt: "09-12-2024",
                  supprd: "112024",
                  trdnm: "RK WORLDINFOCOM PRIVATE LIMITED",
                  ttldocs: 1,
                  txval: 2873.53,
                },
              ],
            },
            docdata: {
              b2b: [
                {
                  ctin: "24AAWFG9936H1ZP",
                  inv: [
                    {
                      cess: 0,
                      cgst: 152.54,
                      dt: "29-11-2024",
                      igst: 0,
                      imsStatus: "N",
                      inum: "PRN-1289",
                      itcavl: "Y",
                      pos: "24",
                      rev: "N",
                      rsn: "",
                      sgst: 152.54,
                      txval: 1694.92,
                      typ: "R",
                      val: 2000,
                    },
                  ],
                  supfildt: "11-12-2024",
                  supprd: "112024",
                  trdnm: "GOURMESSERIE LLP",
                },
                {
                  ctin: "24AACFI9070L1Z5",
                  inv: [
                    {
                      cess: 0,
                      cgst: 198.31,
                      dt: "08-11-2024",
                      igst: 0,
                      imsStatus: "N",
                      inum: "IT/24-25/978",
                      irn: "aa77ad30f54d5660be7ebbf4c64c146e150eda6b332622dafb5c72bdc9d4c3c4",
                      irngendate: "08-11-2024",
                      itcavl: "Y",
                      pos: "24",
                      rev: "N",
                      rsn: "",
                      sgst: 198.31,
                      srctyp: "e-Invoice",
                      txval: 2203.39,
                      typ: "R",
                      val: 2600,
                    },
                  ],
                  supfildt: "10-12-2024",
                  supprd: "112024",
                  trdnm: "I TECH STORE",
                },
                {
                  ctin: "24AAECJ6878N1ZU",
                  inv: [
                    {
                      cess: 0,
                      cgst: 432.11,
                      dt: "05-11-2024",
                      igst: 0,
                      imsStatus: "N",
                      inum: "C24E242500023146",
                      itcavl: "Y",
                      pos: "24",
                      rev: "N",
                      rsn: "",
                      sgst: 432.11,
                      txval: 4801.2,
                      typ: "R",
                      val: 5665.42,
                    },
                  ],
                  supfildt: "11-12-2024",
                  supprd: "112024",
                  trdnm: "JIO PLATFORMS LIMITED",
                },
                {
                  ctin: "32BEGPM1696R1ZU",
                  inv: [
                    {
                      cess: 0,
                      cgst: 0,
                      dt: "16-10-2024",
                      igst: 49.36,
                      imsStatus: "N",
                      inum: "OI-30587/24-25",
                      irn: "82b4218619a08e138e63bdbc883a31715d80af5e02bf902b544828639c944f6d",
                      irngendate: "11-11-2024",
                      itcavl: "Y",
                      pos: "24",
                      rev: "N",
                      rsn: "",
                      sgst: 0,
                      srctyp: "e-Invoice",
                      txval: 408.79,
                      typ: "R",
                      val: 458.15,
                    },
                  ],
                  supfildt: "13-11-2024",
                  supprd: "102024",
                  trdnm: "ONLY MAT",
                },
                {
                  ctin: "27AAGCG4576J1Z6",
                  inv: [
                    {
                      cess: 0,
                      cgst: 0,
                      dt: "30-11-2024",
                      igst: 4.65,
                      imsStatus: "N",
                      inum: "5129155089",
                      itcavl: "Y",
                      pos: "24",
                      rev: "N",
                      rsn: "",
                      sgst: 0,
                      txval: 25.84,
                      typ: "R",
                      val: 30.49,
                    },
                  ],
                  supfildt: "11-12-2024",
                  supprd: "112024",
                  trdnm: "Google Cloud India Private Limited",
                },
                {
                  ctin: "24AAECR0564M1Z9",
                  inv: [
                    {
                      cess: 0,
                      cgst: 258.62,
                      dt: "13-11-2024",
                      igst: 0,
                      imsStatus: "N",
                      inum: "AMD2-3993079",
                      itcavl: "Y",
                      pos: "24",
                      rev: "N",
                      rsn: "",
                      sgst: 258.62,
                      txval: 2873.53,
                      typ: "R",
                      val: 3390.77,
                    },
                  ],
                  supfildt: "09-12-2024",
                  supprd: "112024",
                  trdnm: "RK WORLDINFOCOM PRIVATE LIMITED",
                },
                {
                  ctin: "07AAJCA9880A1ZL",
                  inv: [
                    {
                      cess: 0,
                      cgst: 0,
                      dt: "02-11-2024",
                      igst: 12461.39,
                      imsStatus: "N",
                      inum: "AIN2425002587878",
                      itcavl: "Y",
                      pos: "24",
                      rev: "N",
                      rsn: "",
                      sgst: 0,
                      txval: 69229.92,
                      typ: "R",
                      val: 81691.31,
                    },
                    {
                      cess: 0,
                      cgst: 0,
                      dt: "02-11-2024",
                      igst: 35686.04,
                      imsStatus: "N",
                      inum: "AIN2425002589127",
                      itcavl: "Y",
                      pos: "24",
                      rev: "N",
                      rsn: "",
                      sgst: 0,
                      txval: 198255.78,
                      typ: "R",
                      val: 233941.82,
                    },
                    {
                      cess: 0,
                      cgst: 0,
                      dt: "02-11-2024",
                      igst: 27316.7,
                      imsStatus: "N",
                      inum: "AIN2425002589265",
                      itcavl: "Y",
                      pos: "24",
                      rev: "N",
                      rsn: "",
                      sgst: 0,
                      txval: 151759.42,
                      typ: "R",
                      val: 179076.12,
                    },
                    {
                      cess: 0,
                      cgst: 0,
                      dt: "02-11-2024",
                      igst: 3878.32,
                      imsStatus: "N",
                      inum: "AIN2425002596389",
                      itcavl: "Y",
                      pos: "24",
                      rev: "N",
                      rsn: "",
                      sgst: 0,
                      txval: 21546.21,
                      typ: "R",
                      val: 25424.53,
                    },
                    {
                      cess: 0,
                      cgst: 0,
                      dt: "02-11-2024",
                      igst: 0.3,
                      imsStatus: "N",
                      inum: "AIN2425002815796",
                      itcavl: "Y",
                      pos: "24",
                      rev: "N",
                      rsn: "",
                      sgst: 0,
                      txval: 1.68,
                      typ: "R",
                      val: 1.98,
                    },
                    {
                      cess: 0,
                      cgst: 0,
                      dt: "03-11-2024",
                      igst: 2.27,
                      imsStatus: "N",
                      inum: "AIN2425002877822",
                      itcavl: "Y",
                      pos: "24",
                      rev: "N",
                      rsn: "",
                      sgst: 0,
                      txval: 12.61,
                      typ: "R",
                      val: 14.88,
                    },
                  ],
                  supfildt: "10-12-2024",
                  supprd: "112024",
                  trdnm: "AMAZON WEB SERVICES INDIA PRIVATE LIMITED",
                },
                {
                  ctin: "06AAGCG5872M1Z3",
                  inv: [
                    {
                      cess: 0,
                      cgst: 0,
                      dt: "19-11-2024",
                      igst: 27,
                      imsStatus: "N",
                      inum: "LE/25/1/07976",
                      irn: "90c6352d3136cd3f296a1d80bce1b2fbc5b2a4eceef8ca187674e2dcfe4269e8",
                      irngendate: "19-11-2024",
                      itcavl: "Y",
                      pos: "24",
                      rev: "N",
                      rsn: "",
                      sgst: 0,
                      srctyp: "e-Invoice",
                      txval: 150,
                      typ: "R",
                      val: 177,
                    },
                  ],
                  supfildt: "11-12-2024",
                  supprd: "112024",
                  trdnm: "Grey Swift Private Limited",
                },
                {
                  ctin: "29AAHCD5090M1Z3",
                  inv: [
                    {
                      cess: 0,
                      cgst: 0,
                      dt: "11-11-2024",
                      igst: 4079.23,
                      imsStatus: "N",
                      inum: "2024-25/DIG01231",
                      itcavl: "Y",
                      pos: "24",
                      rev: "N",
                      rsn: "",
                      sgst: 0,
                      txval: 22662.4,
                      typ: "R",
                      val: 26741.63,
                    },
                  ],
                  supfildt: "11-12-2024",
                  supprd: "112024",
                  trdnm: "DIGITAP.AI ENTERPRISE SOLUTIONS PRIVATE LIMITED",
                },
                {
                  ctin: "24ACRPP7935N1ZO",
                  inv: [
                    {
                      cess: 0,
                      cgst: 2362.5,
                      dt: "01-11-2024",
                      igst: 0,
                      imsStatus: "N",
                      inum: "R22",
                      itcavl: "Y",
                      pos: "24",
                      rev: "N",
                      rsn: "",
                      sgst: 2362.5,
                      txval: 26250,
                      typ: "R",
                      val: 30975,
                    },
                  ],
                  supfildt: "07-12-2024",
                  supprd: "112024",
                  trdnm: "HITESHKUMAR DWARKADAS PATEL",
                },
                {
                  ctin: "24AIYPP5747M1Z8",
                  inv: [
                    {
                      cess: 0,
                      cgst: 2362.5,
                      dt: "01-11-2024",
                      igst: 0,
                      imsStatus: "N",
                      inum: "15R",
                      itcavl: "Y",
                      pos: "24",
                      rev: "N",
                      rsn: "",
                      sgst: 2362.5,
                      txval: 26250,
                      typ: "R",
                      val: 30975,
                    },
                  ],
                  supfildt: "04-12-2024",
                  supprd: "112024",
                  trdnm: "SHRI SAI TEXTILES",
                },
                {
                  ctin: "24AAACU6278M1ZV",
                  inv: [
                    {
                      cess: 0,
                      cgst: 10883.91,
                      dt: "05-11-2024",
                      igst: 0,
                      imsStatus: "A",
                      inum: "AO2SA2425002517",
                      irn: "d373832e40491f8c4a02405a3add9cc28a4f762078bd4133f8b083c018bc2efd",
                      irngendate: "05-11-2024",
                      itcavl: "Y",
                      pos: "24",
                      rev: "N",
                      rsn: "",
                      sgst: 10883.91,
                      srctyp: "e-Invoice",
                      txval: 120932.18,
                      typ: "R",
                      val: 142700,
                    },
                  ],
                  supfildt: "10-12-2024",
                  supprd: "112024",
                  trdnm: "UNICORN INFOSOLUTIONS PRIVATE LIMITED",
                },
                {
                  ctin: "24AQDPP4462E1Z0",
                  inv: [
                    {
                      cess: 0,
                      cgst: 4725,
                      dt: "01-11-2024",
                      igst: 0,
                      imsStatus: "N",
                      inum: "R-15",
                      itcavl: "Y",
                      pos: "24",
                      rev: "N",
                      rsn: "",
                      sgst: 4725,
                      txval: 52500,
                      typ: "R",
                      val: 61950,
                    },
                  ],
                  supfildt: "07-12-2024",
                  supprd: "112024",
                  trdnm: "PATEL YOGINABEN HITESHKUMAR",
                },
                {
                  ctin: "24AAJCC9783E1ZD",
                  inv: [
                    {
                      cess: 0,
                      cgst: 30.59,
                      dt: "16-10-2024",
                      igst: 0,
                      imsStatus: "N",
                      inum: "AMD2-1463535",
                      itcavl: "Y",
                      pos: "24",
                      rev: "N",
                      rsn: "",
                      sgst: 30.59,
                      txval: 339.84,
                      typ: "R",
                      val: 401.02,
                    },
                  ],
                  supfildt: "11-11-2024",
                  supprd: "102024",
                  trdnm: "CLICKTECH RETAIL PRIVATE LIMITED",
                },
                {
                  ctin: "29AAICP2912R1ZR",
                  inv: [
                    {
                      cess: 0,
                      cgst: 0,
                      dt: "30-11-2024",
                      igst: 130822.64,
                      imsStatus: "N",
                      inum: "CF/24-25/62727",
                      itcavl: "Y",
                      pos: "24",
                      rev: "N",
                      rsn: "",
                      sgst: 0,
                      txval: 726792.4,
                      typ: "R",
                      val: 857615.03,
                    },
                  ],
                  supfildt: "11-12-2024",
                  supprd: "112024",
                  trdnm: "CASHFREE PAYMENTS INDIA PRIVATE LIMITED",
                },
                {
                  ctin: "06AACCG0527D1Z8",
                  inv: [
                    {
                      cess: 0,
                      cgst: 0,
                      dt: "31-10-2024",
                      igst: 397.44,
                      imsStatus: "N",
                      inum: "5096411148",
                      itcavl: "Y",
                      pos: "24",
                      rev: "N",
                      rsn: "",
                      sgst: 0,
                      txval: 2208,
                      typ: "R",
                      val: 2605.44,
                    },
                  ],
                  supfildt: "11-11-2024",
                  supprd: "102024",
                  trdnm: "GOOGLE INDIA PVT LTD",
                },
                {
                  ctin: "27AAFCN3372G1ZF",
                  inv: [
                    {
                      cess: 0,
                      cgst: 0,
                      dt: "30-11-2024",
                      igst: 11.23,
                      imsStatus: "N",
                      inum: "NPBL/24-25/11192",
                      itcavl: "Y",
                      pos: "24",
                      rev: "N",
                      rsn: "",
                      sgst: 0,
                      txval: 62.4,
                      typ: "R",
                      val: 73.63,
                    },
                    {
                      cess: 0,
                      cgst: 0,
                      dt: "30-11-2024",
                      igst: 2523.96,
                      imsStatus: "N",
                      inum: "NPBL/24-25/11199",
                      itcavl: "Y",
                      pos: "24",
                      rev: "N",
                      rsn: "",
                      sgst: 0,
                      txval: 14022,
                      typ: "R",
                      val: 16545.96,
                    },
                  ],
                  supfildt: "11-12-2024",
                  supprd: "112024",
                  trdnm: "NSDL PAYMENTS BANK LIMITED",
                },
                {
                  ctin: "33AAACZ4322M2Z9",
                  inv: [
                    {
                      cess: 0,
                      cgst: 0,
                      dt: "02-11-2024",
                      igst: 288,
                      imsStatus: "N",
                      inum: "1024250260344",
                      irn: "44297107201907e74e42716012e1ec8b25b2b1b62c6942e0c5cb6e1cf9aed90e",
                      irngendate: "11-11-2024",
                      itcavl: "Y",
                      pos: "24",
                      rev: "N",
                      rsn: "",
                      sgst: 0,
                      srctyp: "e-Invoice",
                      txval: 1600,
                      typ: "R",
                      val: 1888,
                    },
                  ],
                  supfildt: "11-12-2024",
                  supprd: "112024",
                  trdnm: "ZOHO CORPORATION PRIVATE LIMITED",
                },
                {
                  ctin: "06AACCG0527D1Z8",
                  inv: [
                    {
                      cess: 0,
                      cgst: 0,
                      dt: "30-11-2024",
                      igst: 384.19,
                      imsStatus: "N",
                      inum: "5117213122",
                      itcavl: "Y",
                      pos: "24",
                      rev: "N",
                      rsn: "",
                      sgst: 0,
                      txval: 2134.4,
                      typ: "R",
                      val: 2518.59,
                    },
                  ],
                  supfildt: "11-12-2024",
                  supprd: "112024",
                  trdnm: "GOOGLE INDIA PVT LTD",
                },
                {
                  ctin: "08BMNPP2457E2ZR",
                  inv: [
                    {
                      cess: 0,
                      cgst: 0,
                      dt: "13-11-2024",
                      igst: 18.76,
                      imsStatus: "N",
                      inum: "IN-21576",
                      itcavl: "Y",
                      pos: "24",
                      rev: "N",
                      rsn: "",
                      sgst: 0,
                      txval: 375.24,
                      typ: "R",
                      val: 394,
                    },
                  ],
                  supfildt: "11-12-2024",
                  supprd: "112024",
                  trdnm: "DM Marketing",
                },
                {
                  ctin: "24AABCI6363G1ZP",
                  inv: [
                    {
                      cess: 0,
                      cgst: 648.16,
                      dt: "05-11-2024",
                      igst: 0,
                      imsStatus: "N",
                      inum: "C24E242500143276",
                      irn: "04e156eaa4b42fc37474c23c93c74771dcf79ddf5402b056e186e9e857f7e710",
                      irngendate: "05-11-2024",
                      itcavl: "Y",
                      pos: "24",
                      rev: "N",
                      rsn: "",
                      sgst: 648.16,
                      srctyp: "e-Invoice",
                      txval: 7201.8,
                      typ: "R",
                      val: 8498.12,
                    },
                  ],
                  supfildt: "11-12-2024",
                  supprd: "112024",
                  trdnm: "Reliance Jio Infocomm  Limited",
                },
                {
                  ctin: "24AAWFG9936H1ZP",
                  inv: [
                    {
                      cess: 0,
                      cgst: 2181.36,
                      dt: "17-10-2024",
                      igst: 0,
                      imsStatus: "N",
                      inum: "PRN-1050",
                      itcavl: "Y",
                      pos: "24",
                      rev: "N",
                      rsn: "",
                      sgst: 2181.36,
                      txval: 24237.29,
                      typ: "R",
                      val: 28600,
                    },
                    {
                      cess: 0,
                      cgst: 152.54,
                      dt: "25-10-2024",
                      igst: 0,
                      imsStatus: "N",
                      inum: "PRN-1094",
                      itcavl: "Y",
                      pos: "24",
                      rev: "N",
                      rsn: "",
                      sgst: 152.54,
                      txval: 1694.92,
                      typ: "R",
                      val: 2000,
                    },
                  ],
                  supfildt: "13-11-2024",
                  supprd: "102024",
                  trdnm: "GOURMESSERIE LLP",
                },
                {
                  ctin: "24AAACB2894G1ZT",
                  inv: [
                    {
                      cess: 0,
                      cgst: 26.91,
                      dt: "27-11-2024",
                      igst: 0,
                      imsStatus: "N",
                      inum: "BM2524I007134077",
                      irn: "b79c9c9cc5efcabf1d626b23efa56da6dc00e998d5b3bb35ca7e981858c40275",
                      irngendate: "27-11-2024",
                      itcavl: "Y",
                      pos: "24",
                      rev: "N",
                      rsn: "",
                      sgst: 26.91,
                      srctyp: "e-Invoice",
                      txval: 299,
                      typ: "R",
                      val: 352.82,
                    },
                  ],
                  supfildt: "10-12-2024",
                  supprd: "112024",
                  trdnm: "BHARTI  AIRTEL LTD.",
                },
                {
                  ctin: "27AAFCV6085L1ZO",
                  inv: [
                    {
                      cess: 0,
                      cgst: 0,
                      dt: "06-11-2024",
                      igst: 237.38,
                      imsStatus: "N",
                      inum: "VN1024D11312",
                      itcavl: "Y",
                      pos: "24",
                      rev: "N",
                      rsn: "",
                      sgst: 0,
                      txval: 1318.8,
                      typ: "R",
                      val: 1556.18,
                    },
                  ],
                  supfildt: "10-12-2024",
                  supprd: "112024",
                  trdnm: "VAY NETWORK SERVICES PRIVATE LIMITED",
                },
              ],
            },
            gendt: "14-12-2024",
            gstin: "24ABKCS2033B1ZV",
            itcsumm: {
              itcavl: {
                nonrevsup: {
                  b2b: {
                    cess: 0,
                    cgst: 24415.05,
                    igst: 218188.86,
                    sgst: 24415.05,
                    txval: 1483843.96,
                  },
                  cess: 0,
                  cgst: 24415.05,
                  igst: 218188.86,
                  sgst: 24415.05,
                },
              },
            },
            rtnprd: "112024",
            version: "1.0",
          },
        },
        status_cd: "1",
      },
      timestamp: 1735643392000,
      transaction_id: "f3fee28c-1498-41e1-ad39-1c5516881bfe",
    };

    return res.status(200).json(mockResponse);

    // return res.status(200).json({
    //   success: true,
    //   data: response.data,
    // });
  } catch (error) {
    console.error("GST API Error:", error?.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch GST details",
      error: error?.response?.data || error.message,
    });
  }
});

app.get("/api/sellers1/check/:id", async (req, res) => {
  const { id } = req.params;

  const result = await checkGSTStatus(id);

  res.json({
    id,
    ...seller,
    ...result,
  });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "uploads");
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow common image formats
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extName = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimeType = allowedTypes.test(file.mimetype);

    if (extName && mimeType) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files (JPG, PNG, WEBP) are allowed!"));
    }
  },
});

// 2. Initialize Gemini
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/api/extract-invoice", upload.single("invoice"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // Read image and convert to Base64
    const imageData = fs.readFileSync(req.file.path).toString("base64");
    const base64Image = `data:${req.file.mimetype};base64,${imageData}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Use GPT-4o for best vision results
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract data from this Indian GST invoice. Return ONLY a JSON object with: gstin, invoice_no, date (DD-MM-YYYY), taxable_value, total_tax, total, cgst, sgst, igst, and items (desc and total).",
            },
            {
              type: "image_url",
              image_url: { url: base64Image },
            },
          ],
        },
      ],
      response_format: { type: "json_object" }, // Ensures valid JSON output
    });

    // Cleanup file from local storage
    fs.unlinkSync(req.file.path);

    const result = JSON.parse(response.choices[0].message.content);
    res.json(result);
  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({ error: "AI extraction failed." });
  }
});

const transporter = nodemailer.createTransport({
  //service: "SendGrid",
  host: "smtpout.secureserver.net",
  port: 587, // Use 587 for TLS
  secure: false,
  auth: {
    user: "support@invoicesimplify.com",
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // Important on VPS to bypass strict cert checks
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

const { log } = require("console");
dns.lookup("smtpout.secureserver.net", (err, address) => {
  if (err) console.error("DNS Error:", err);
  else console.log("SMTP IP:", address);
});

// API Endpoint to send email
app.post("/send-reminderemail", async (req, res) => {
  const { brandEmail, ccEmail, subject, textData } = req.body;

  try {
    await sendReminderEmail(brandEmail, ccEmail, subject, textData, res);
    return res
      .status(200)
      .json({ success: true, message: "Email sent successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ error: err.message || "Failed to create and send email" });
  }
});

const sendReminderEmail = async (
  brandEmail,
  ccEmail,
  subject,
  textData,
  res
) => {
  const customerName = textData[0];
  const invoiceNumber = textData[1];
  const amount = textData[2];
  const yourName = textData[3];
  const date = textData[4];
  const phoneNumber = textData[5];
  const email = textData[6];
  const product = textData[7];

  const mailOptions = {
    from: "support@invoicesimplify.com",
    to: brandEmail,
    cc: ccEmail || undefined, // only add CC if provided
    subject: subject,
    text:
      "Hi " +
      customerName +
      "," +
      "\n\n" +
      "I hope you’re doing well." +
      "\n" +
      "This is a friendly reminder that " +
      product +
      " Collab for " +
      currencySymbol +
      amount +
      " is due on " +
      date +
      "." +
      "\n\n" +
      "If you’ve already made the payment, please disregard this message." +
      "\n\n" +
      "Thank you for your prompt attention!" +
      "\n\n" +
      "Best regards," +
      "\n" +
      yourName +
      "\n" +
      phoneNumber +
      "\n" +
      email,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Email send error:", error);
  }
};

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
        <td>${currencySymbol}${row1.rate}</td>
        <td>${row1.qty}</td>
        <td>${currencySymbol}${rowAmount}</td>
      </tr>
    `;
    });

    html += `
      </tbody>
    </table>
    <h4 style="text-align: right; font-size: 12px;">Total Amount: ${currencySymbol}${totalAmount}</h4>
     
      <h4 style="text-align: right; font-size: 12px;">
      ${
        row?.amountInfo?.paymentType === "fullyPaid"
          ? "Fully Paid"
          : `Advance: ${currencySymbol}${
              row?.amountInfo?.advance || 0
            } <br> Balance:${currencySymbol}${
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
  "40 23 * * *",
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
  "50 23 * * 1",
  () => {
    checkAndSendEmails("weekly");
    console.log("✅ Weekly email check completed at 12:20 AM in the night");
  },
  {
    timezone: "Asia/Kolkata",
  }
); // 12:20 AM every Monday for prev week
cron.schedule(
  "57 23 1 * *",
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

app.post("/generate-pdf1", async (req, res) => {
  try {
    const { invoiceData } = req.body;

    const html = await buildHtml(invoiceData);

    if (!html) {
      return res.status(400).json({ error: "HTML content is required" });
    }
    const fontLink = `<link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet">`;
    const html1 = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Invoice</title>
      ${fontLink}
      <style>
        body {
          font-family: 'Inter', sans-serif;
        }
      </style>
    </head>
    <body>
      ${html}
    </body>
  </html>
`;

    const pdfBuffer = await getPdfBuffer(html1);

    // Send as downloadable PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");
    res.send(pdfBuffer);
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ error: err });
  }
});

const getDate = (utcDate) => {
  var today = new Date(utcDate);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "July",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  var month = months[today.getMonth()];
  const date = month + " " + today.getDate() + ", " + today.getFullYear();
  return date;
};

app.post("/send-email-pdf1", async (req, res) => {
  const { invoiceData } = req.body;

  try {
    await sendEmailPdf(invoiceData, invoiceData.email, res);
    return res
      .status(200)
      .json({ success: true, message: "Email sent successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ error: err.message || "Failed to create and send email" });
  }
});

// app.post("/send-email-pdf-view", async (req, res) => {
//   const { emailData } = req.body;

//   const id = emailData.id;
//   const email = emailData.email;
//   const uid = emailData.uid;

//   // call to db to get invoice data
//   const invoiceSnapshot = await db
//     .collection("Creators")
//     .doc(uid)
//     .collection("Invoice_Info")
//     .get();

//   const filteredDocs = invoiceSnapshot.docs.filter((doc) => doc.id === id);

//   const data = filteredDocs.map((doc) => ({
//     id: doc.id,
//     ...doc.data(),
//   }));

//   if (data.length === 0) {
//     return res.status(404).json({ error: "No invoice data found" });
//   }

//   const result = data[0]; // Assuming you want the first document

//   const personalInfo = result.personalInfo;
//   const customerInfo = result.customerInfo;
//   const invoiceInfo = result.invoiceInfo;
//   const rows = result.rows;
//   const amountInfo = result.amountInfo;
//   const accountInfo = result.accountInfo;
//   const signedInfo = result.signedInfo;
//   const additionalInfo = result.additionalInfo;

//   const invoiceData = {
//     personalInfo,
//     customerInfo,
//     invoiceInfo,
//     rows,
//     amountInfo,
//     accountInfo,
//     signedInfo,
//     additionalInfo,
//     logoBase64: result.logoBase64, // Assuming logo is sent as base64 string
//   };

//   try {
//     await sendEmailPdf(invoiceData, email, res);
//     return res
//       .status(200)
//       .json({ success: true, message: "Email sent successfully" });
//   } catch (err) {
//     return res.status(500).json({ error: "Failed to create and send email" });
//   }
// });

const buildHtml = async (invoiceData) => {
  const personalInfo = invoiceData.personalInfo;
  const taxInfo = invoiceData.taxInfo;
  const customerInfo = invoiceData.customerInfo;
  const logoUrl = invoiceData.logoUrl;
  const invoiceInfo = invoiceData.invoiceInfo;
  const rows = invoiceData.rows;
  const amountInfo = invoiceData.amountInfo;
  const accountInfo = invoiceData.accountInfo;
  const signedInfo = invoiceData.signedInfo;
  const additionalInfo = invoiceData.additionalInfo;
  const currencySymbol = invoiceData.currencySymbol || "₹";

  let qrImage = null;
  if (accountInfo?.upi) {
    const upiLink = `upi://pay?pa=${accountInfo?.upi}&pn=${encodeURIComponent(
      personalInfo?.name
    )}&am=${amountInfo}&cu=INR`;

    const qrBuffer = await QRCode.toBuffer(upiLink, {
      errorCorrectionLevel: "H", // High correction for better printing
      margin: 1,
      width: 200,
    });

    // --- 2. Convert Buffer to Base64 String ---
    qrImage = `data:image/png;base64,${qrBuffer.toString("base64")}`;
  }

  let totalAmt = 0;

  let html = "";
  const logoBase64 = invoiceData.logoBase64; // Assuming logo is sent as base64 string
  html += `
          <div style="padding: 2rem; font-family: 'Inter', sans-serif; font-size: 14px; text-align: left;">
            <div>`;
  if (logoUrl && logoUrl !== "null" && logoUrl !== "") {
    html += `
    <div style="text-align: left; margin-bottom: 1rem; width: "40px" height: "40px";">
             <img
                  src=${logoUrl}
                  alt="Company Logo"
                  style="width: 100px; marginBottom: 1rem;"
                />
                </div>`;
  }
  html += `
            
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="display: flex; flex-direction: column;">`;

  if (personalInfo?.name) {
    html += ` <div style="font-weight: bold; font-size: 1rem;">
                    ${personalInfo?.name}
                  </div>`;
  }
  if (personalInfo?.address) {
    html += ` <div style="color: #6B7280; font-size: 0.875rem; margin-top: 0.2rem;">
                    ${personalInfo?.address},
                  </div>`;
  }

  if (personalInfo?.address1) {
    html += `
                    <div style="color: #6B7280; font-size: 0.875rem; margin-top: 0.2rem;">
                      ${personalInfo?.address1},
                    </div>`;
  }
  if (personalInfo?.address2) {
    html += `
                    <div style="color: #6B7280; font-size: 0.875rem; margin-top: 0.2rem;">
                      ${personalInfo?.address2} - ${personalInfo?.address3}
                    </div>`;
  }
  if (personalInfo?.phonePrimary) {
    html += ` <div style="color: #6B7280; font-size: 0.875rem; margin-top: 0.2rem;">
                    Phone: ${personalInfo?.phonePrimary}
                  </div>`;
  }
  if (personalInfo?.email) {
    html += `      
    <div style="color: #6B7280; font-size: 0.875rem; margin-top: 0.2rem;">
      Email: ${personalInfo?.email}
    </div>`;
  }

  if (personalInfo?.socialMedia) {
    html += `
                    <div style="color: #6B7280; font-size: 0.875rem; margin-top: 0.2rem;">
                      ${personalInfo?.socialMedia}
                    </div>`;
  }
  if (taxInfo?.gstin) {
    html += `
                    <div style="color: #6B7280; font-size: 0.875rem; margin-top: 0.2rem;">
                      GST: ${taxInfo?.gstin}
                    </div>`;
  }
  html += `
                </div>
                <div style="text-align: right;">
                  <div style="font-weight: bold; font-size: 1rem; color: #374151;">
                    INVOICE
                  </div>
                  <div style="font-weight: bold; font-size: 0.875rem; color: #6B7280;">
                    ${invoiceInfo.invoiceNumber}
                  </div>
                </div>
              </div>
              <div style="margin-top: 1.5rem; display: flex; justify-content: space-between;">
                <div>
                  <div style="text-transform: uppercase; color: #374151; font-weight: bold; font-size: 0.875rem;">
                    Invoice To
                  </div>
                  <div style="font-weight: bold; font-size: 1rem; margin-top: 0.25rem;">
                    ${customerInfo.customerName}
                  </div>`;
  if (customerInfo.address) {
    html += `
                    <div style="color: #6B7280; font-size: 0.875rem; margin-top: 0.2rem;">
                      ${customerInfo.address}, 
                    </div>`;
  }
  if (customerInfo.address1) {
    html += `
                    <div style="color: #6B7280; font-size: 0.875rem; margin-top: 0.2rem;">
                      ${customerInfo.address1},
                    </div>`;
  }
  if (customerInfo.address2) {
    html += `
                    <div style="color: #6B7280; font-size: 0.875rem; margin-top: 0.2rem;">
                      ${customerInfo.address2} - ${customerInfo.address3}
                    </div>`;
  }
  if (customerInfo.customerPhone) {
    html += `
                    <div style="font-size: 0.875rem; color: #6B7280; display: flex; column-gap: 0.5rem; margin-top: 0.2rem;">
                      <div>Phone:</div>
                      <div>${customerInfo.customerPhone}</div>
                    </div>`;
  }
  if (customerInfo.customerEmail) {
    html += `
                    <div style="font-size: 0.875rem; color: #6B7280; margin-top: 0.2rem;">
                      Email: ${customerInfo.customerEmail}
                    </div>`;
  }
  if (customerInfo.gst) {
    html += `
                    <div style="margin-top: 0.5rem; font-size: 0.875rem; color: #6B7280;">
                      GSTIN: ${customerInfo.gst}
                    </div>`;
  }
  if (customerInfo.tin) {
    html += `
                    <div style="font-size: 0.875rem; color: #6B7280; margin-top: 0.2rem;">
                      TIN: ${customerInfo.tin}
                    </div>`;
  }
  if (customerInfo.cin) {
    html += `
                    <div style="font-size: 0.875rem; color: #6B7280; margin-top: 0.2rem;">
                      CIN: ${customerInfo.cin}
                    </div>`;
  }
  if (customerInfo.pan) {
    html += `
                    <div style="font-size: 0.875rem; color: #6B7280; margin-top: 0.2rem;">
                      PAN: ${customerInfo.pan}
                    </div>`;
  }
  html += `
                </div>
                <div style="font-weight: bold; font-size: 0.875rem; margin-top: 0.2rem;">
                  <div style="text-transform: uppercase; text-align: right;">
                    Date
                  </div>
                  <div style="color: #6B7280; text-align: right; font-weight: 600; margin-top: 0.2rem;">
                    ${getDate(invoiceInfo?.date)}
                  </div>
                </div>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1.2px solid black; margin-top: 1.5rem;"></div>
              <div style="overflow: hidden; margin-top: 0.5rem;">
                <table style="width: 100%; margin: auto; text-align: center; font-size: 0.475rem; font-weight: 300;">
                  <thead style="font-size: 0.85rem; text-transform: uppercase;">
                    <tr style="display: flex; justify-content: space-between;">
                      <th style="width: 40%; text-align: left;">Description</th>
                      <th style="width: 20%;">Rate</th>
                      <th style="width: 10%;">Quantity</th>
                      <th style="width: 20%;">Amount</th>
                    </tr>
                    <tr style="display: flex; justify-content: space-between; border-bottom: 1.2px solid black; margin-top: 0.5rem;"></tr>
                  </thead>
                  <tbody>`;
  let index = -1;
  let amount = 0;
  if (rows && rows.length > 0) {
    rows.forEach((row) => {
      index++;
      html += `
                        <tr style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-top: 0.25rem; font-weight: 300;">
                          <td style="width: 40%; text-align: left;">${row.desc}</td>
                          <td style="width: 20%;">${currencySymbol}${row.rate}</td>
                          <td style="width: 10%;">${row.qty}</td>
                          <td style="width: 20%;">${currencySymbol}${row.amount}</td>
                        </tr>`;
      amount += parseFloat(row.amount);
      if (rows.length > index + 1) {
        html += `
                          <tr style="display: flex; justify-content: space-between; font-size: 1rem;  margin-top: 0.5rem;  border-bottom: 1px dashed black;"></tr>`;
      }
    });
    if (taxInfo?.gstpercentage) {
      totalAmt = Math.round(amount + amount * (taxInfo.gstpercentage / 100));
    } else {
      totalAmt = amount;
    }
  }
  html += `
                  </tbody>
                </table>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1.2px solid black; margin-top: 0.5rem;"></div>`;

  if (taxInfo?.gstpercentage) {
    html += `
                <div style="display: flex; justify-content: flex-end; width: 100%;">
                <div style="width: 100%; display: flex; justify-content: space-between;">
                  <div style="margin-top: 0.5rem; margin-bottom: 0.5rem; padding: 0.5rem; font-size: 0.95rem; border-radius: 0.375rem;">
                    Sub Total
                  </div>
                  <div style="margin-top: 0.5rem; margin-bottom: 0.5rem; padding: 0.5rem; font-size: 0.95rem; border-radius: 0.375rem;">
                    ${currencySymbol} ${amount}
                  </div>
                </div>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1.2px dotted black;"></div>`;
  }

  if (taxInfo?.gstpercentage) {
    html += `
                              <div style="display: flex; justify-content: flex-end; width: 100%;">
                              <div style="width: 100%; display: flex; justify-content: space-between;">
                                <div style="margin-top: 0.5rem; margin-bottom: 0.5rem; padding: 0.5rem; font-size: 0.95rem; border-radius: 0.375rem;">
                                  Tax (${taxInfo.gstpercentage}%)
                                </div>
                                <div style="margin-top: 0.5rem; margin-bottom: 0.5rem; padding: 0.5rem; font-size: 0.95rem; border-radius: 0.375rem;">
                                  ${currencySymbol} ${(
      amount *
      (taxInfo.gstpercentage / 100)
    ).toFixed(2)}
                                </div>
                              </div>
                            </div>
                             <div style="display: flex; justify-content: space-between; border-bottom: 1.2px dotted black;"></div>`;
  }

  html += `
              <div style="display: flex; justify-content: flex-end; width: 100%;">
                <div style="width: 100%; display: flex; justify-content: space-between;">
                  <div style="margin-top: 0.5rem; margin-bottom: 0.5rem; padding: 0.5rem; font-size: 0.95rem; font-weight: bold; border-radius: 0.375rem; text-transform: uppercase;">
                    Total
                  </div>
                  <div style="margin-top: 0.5rem; margin-bottom: 0.5rem; padding: 0.5rem; font-size: 0.95rem; font-weight: bold; border-radius: 0.375rem;">
                    ${currencySymbol} ${totalAmt}
  
                  </div>
                </div>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1.2px solid black;"></div>
              <div style="display: flex; justify-content: flex-end; margin-top: 0.5rem; width: 100%; font-weight: bold;">${priceInWords(
                amount
              )}</div>
              <div style="display: flex; justify-content: space-between;">`;

  if (accountInfo) {
    html += `
                <div>
                  <div style="font-weight: bold; font-size: 0.875rem; margin-top: 1.5rem; color: #374151; text-transform: uppercase;">
                    Account Information
                  </div>
                  <div style="font-size: 0.875rem; margin-top: 1rem;">

  
                    <div>Bank Name: <span style="font-weight: bold;">${accountInfo.bankName}</span></div>
                    <div style="margin-top: 0.25rem;">Name: <span style="font-weight: bold;">${accountInfo.name}</span></div>
                    <div style="margin-top: 0.25rem;">Account Number: <span style="font-weight: bold;">${accountInfo.accountNumber}</span></div>
                    <div style="margin-top: 0.25rem;">Account Type: <span style="font-weight: bold;">${accountInfo.accountType}</span></div>
                    <div style="margin-top: 0.25rem;">IFSC Code: <span style="font-weight: bold;">${accountInfo.ifscCode}</span></div>
                    <div style="margin-top: 0.25rem;">Branch: <span style="font-weight: bold;">${accountInfo.branch}</span></div>`;
  }
  if (accountInfo && accountInfo.pan) {
    html += `
                    
                    <div style="margin-top: 0.25rem;">PAN: <span style="font-weight: bold;">${accountInfo.pan}</span></div>`;
  }
  if (accountInfo && accountInfo.upi) {
    html += `
                    <div style="margin-top: 0.25rem;">UPI: <span style="font-weight: bold;">${accountInfo.upi}</span></div>`;
  }
  html += `
                  </div>
                </div>
                <div style="display: flex; flex-direction: column; margin-top: 2rem;">`;

  if (signedInfo.signature) {
    html += `
                  <div style="display: flex; justify-content: flex-end; font-size: 0.875rem;">
                    <div>
                      <img style="width: 100px;" src="${signedInfo?.signature}" alt="sign" />
                      <div style="font-weight: bold;">Date Signed</div>
                      <div>${signedInfo?.signedDate}</div>
                    </div>
                  </div>`;
  }
  html += `
                </div>
              </div>`;
  if (qrImage) {
    html += `<img src="${qrImage}" style="margin-bottom: 1rem; margin-top: 1.5rem;" />`;
  }
  if (additionalInfo?.additionaldesc) {
    html += `
              <div style="color: #6B7280; font-size: 0.875rem; margin-top: 1.5rem;">
               ${additionalInfo?.additionaldesc}
              </div>`;
  }
  html += `
              <div style="color: #4B5563; text-align: right; margin-top: 1.5rem;">
                <div style="font-size: 0.75rem;">
                  Thank you for your business!
                </div>
              </div>
            </div>
            <footer style="
  position: fixed;
  bottom: 15px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 10px;
  color: #666;
">
  Powered by <a href="https://invoicesimplify.com" target="_blank" style="color: #007bff;">InvoiceSimplify</a> — Smart, Secure & Professional Invoicing.
</footer>
          </div>`;

  return html;
};

const getPdfBuffer = async (html1) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html1, { waitUntil: "networkidle0" });
  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
  });
  await browser.close();
  return pdfBuffer;
};

const sendEmailPdf = async (invoiceData, email, res) => {
  const customerInfo = invoiceData.customerInfo;
  const html = await buildHtml(invoiceData);

  if (!html) {
    console.log("No HTML generated for PDF.");
    return false;
  }

  const fontLink = `<link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet">`;
  const html1 = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Invoice</title>
      ${fontLink}
      <style>
        body {
          font-family: 'Inter', sans-serif;
        }
      </style>
    </head>
    <body>
      ${html}
    </body>
  </html>
`;

  const pdfBuffer = await getPdfBuffer(html1);

  const mailOptions = {
    from: "support@invoicesimplify.com",
    to: email,
    subject: `Your Invoice for ${customerInfo.productName} — InvoiceSimplify`,
    text: `Hello ${customerInfo.customerName || ""},
  
  Thank you for using InvoiceSimplify!
  
  Please find the attached invoice for : ${customerInfo.productName}.
  
  Explore more features and manage all your invoices easily:
  https://invoicesimplify.com
  
  Best regards,  
  InvoiceSimplify Support Team
  support@invoicesimplify.com`,
    attachments: [
      {
        filename: `${customerInfo.productName}.pdf`,
        content: pdfBuffer,
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    // res
    //   .status(200)
    //   .json({ success: true, message: "Email sent successfully1" });
    console.log(`✅ Email sent to ${email}`);
  } catch (err) {
    console.error(`❌ Error sending to ${email}:`, err);
    // res
    //   .status(200)
    //   .json({ success: true, message: err.message || "Email sent failed" });
  }
};

app.post("/send-email-pdf", async (req, res) => {
  const { html, product, yourname, email } = req.body;
  const pdfPath = path.join(__dirname, "invoice.pdf");

  try {
    if (!html) {
      return res.status(400).json({ error: "HTML content is required" });
    }
    const fontLink = `<link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet">`;
    const html1 = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Invoice</title>
      ${fontLink}
      <style>
        body {
          font-family: 'Inter', sans-serif;
        }
      </style>
    </head>
    <body>
      ${html}
    </body>
  </html>
`;

    // Convert HTML to PDF
    //const file = { content: html1 };
    const options = { format: "A4", printBackground: true };

    pdf.create(html1, options).toFile(pdfPath, (err, res) => {
      if (err) return console.error(err);
      console.log("PDF created:", res.filename);
    });
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }

  const mailOptions = {
    from: "support@invoicesimplify.com",
    to: email,
    subject: `Invoice for ${product} by ${yourname}`,
    text: `Hello, Please find the attached invoice for ${product} by ${yourname}.`,
    attachments: [
      {
        filename: "invoice.pdf",
        path: pdfPath,
      },
    ],
  };

  try {
    // await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${email} for ${frequency}`);
  } catch (err) {
    console.error(`❌ Error sending to ${email}:`, err);
  }
});

const CLOUDINARY_PDF_URL =
  "https://res.cloudinary.com/dixqxdivr/image/upload/v1695621741/jalmahal3_sd6for.jpg";
app.post("/generate-pdf", async (req, res) => {
  const { html } = req.body;

  if (!html) return res.status(400).send("No HTML content provided.");

  try {
    const browser = await puppeteer.launch({
      headless: true,
      ignoreDefaultArgs: ["--disable-extensions"],
      args: ["--no-sandbox", "--use-gl=egl", "--disable-setuid-sandbox"],
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebkit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36"
    );

    const fontLink = `<link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet">`;
    const html1 = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Invoice</title>
      ${fontLink}
      <style>
        body {
          font-family: 'Inter', sans-serif;
        }
      </style>
    </head>
    <body>
      ${html}
    </body>
  </html>
`;

    await page.setContent(html1, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");
    res.send(pdfBuffer);
  } catch (err) {
    console.error("Error generating PDF:", err);
    res.status(500).send("Failed to generate PDF");
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

const numberToWords = (num) => {
  if (num === 0) return "Zero";

  const singleDigits = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const doubleDigits = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tensPlace = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const formatData = (n, suffix) => {
    let str = "";
    if (n > 19) {
      str += tensPlace[Math.floor(n / 10)] + " " + singleDigits[n % 10];
    } else if (n > 9) {
      str += doubleDigits[n - 10];
    } else {
      str += singleDigits[n];
    }

    if (n !== 0) str += suffix;
    return str;
  };

  let res = "";
  // Crores
  res += formatData(Math.floor(num / 10000000), " Crore ");
  // Lakhs
  res += formatData(Math.floor((num / 100000) % 100), " Lakh ");
  // Thousands
  res += formatData(Math.floor((num / 1000) % 100), " Thousand ");
  // Hundreds
  res += formatData(Math.floor((num / 100) % 10), " Hundred ");

  if (num > 100 && num % 100 !== 0) res += "and ";

  // Remaining tens and units
  res += formatData(num % 100, "");

  return res.trim() + " Rupees Only";
};

const priceInWords = (price) => {
  const [rupees, paisa] = price.toString().split(".");

  let result = numberToWords(parseInt(rupees));

  if (paisa && parseInt(paisa) > 0) {
    // Ensuring "05" becomes "Five" and "50" stays "Fifty"
    const paisaVal =
      paisa.length === 1
        ? parseInt(paisa) * 10
        : parseInt(paisa.substring(0, 2));
    result =
      result.replace(" Only", "") +
      " and " +
      numberToWords(paisaVal).replace(" Only", "") +
      " Paisa Only";
  }

  return result;
};

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
  key_id: "rzp_live_RSDNVBshEK8VH1",
  key_secret: "W2q7FFABsH3qyXeJhG75IhNk",
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
