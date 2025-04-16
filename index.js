require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const twilio = require("twilio");

const app = express();
const PORT = process.env.PORT || 3000;

// Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken  = process.env.TWILIO_AUTH_TOKEN;
const client     = twilio(accountSid, authToken);

app.use(cors());
app.use(bodyParser.json());

// ─── SMS endpoint ───────────────────────────────────────────────────────────────
app.post("/send-sms", async (req, res) => {
  const { message, to } = req.body;
  try {
    const sms = await client.messages.create({
      body: message,
      from: process.env.TWILIO_NUMBER,
      to,
    });
    return res.status(200).json({ success: true, sid: sms.sid });
  } catch (error) {
    console.error("Twilio SMS Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ─── Call endpoint (no external TwiML) ─────────────────────────────────────────
app.post("/make-call", async (req, res) => {
  const { to } = req.body;
  try {
    const call = await client.calls.create({
      to,
      from: process.env.TWILIO_NUMBER,
      twiml: `
        <Response>
          <Say voice="alice">
            Emergency alert! Please respond immediately.
          </Say>
        </Response>
      `
    });
    return res.status(200).json({ success: true, sid: call.sid });
  } catch (error) {
    console.error("Twilio Call Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ─── Start server ───────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));