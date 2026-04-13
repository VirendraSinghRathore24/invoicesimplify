const axios = require("axios");
require("dotenv").config();

class WhitebooksService {
  constructor() {
    this.token = null;
    this.tokenExpiry = null;
  }

  // Step 1: Authenticate and get Access Token
  async getAccessToken() {
    // Check if current token is still valid (with 1 min buffer)
    if (this.token && this.tokenExpiry > Date.now() + 60000) {
      return this.token;
    }

    try {
      const response = await axios.post(process.env.WHITEBOOKS_AUTH_URL, {
        client_id: process.env.WHITEBOOKS_CLIENT_ID,
        client_secret: process.env.WHITEBOOKS_CLIENT_SECRET,
        grant_type: "client_credentials",
      });

      this.token = response.data.access_token;
      // Assume token is valid for the duration provided in response (usually 3600s)
      this.tokenExpiry = Date.now() + response.data.expires_in * 1000;

      return this.token;
    } catch (error) {
      console.error(
        "Whitebooks Auth Error:",
        error.response?.data || error.message
      );
      throw new Error("Failed to authenticate with GST Provider");
    }
  }

  // Step 2: Fetch Filing Status for a specific GSTIN
  async getFilingStatus(gstin) {
    const token = await this.getAccessToken();

    try {
      // Endpoint based on Whitebooks documentation for Return Filing Status
      const response = await axios.get(
        `${process.env.WHITEBOOKS_BASE_URL}/returns/status`,
        {
          params: { gstin, financial_year: "2025-26" },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        `Error fetching GST status for ${gstin}:`,
        error.response?.data || error.message
      );
      throw error;
    }
  }
}

module.exports = new WhitebooksService();
