import express from "express";
import axios from "axios";
import { parsePhoneNumberFromString } from "libphonenumber-js";

const app = express();
app.use(express.json());

const FB_TOKEN = process.env.FB_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

app.post("/send-message", async (req, res) => {
  try {
    const { to, ...rest } = req.body;

    if (!to) {
      return res.status(400).json({ error: "Missing phone number" });
    }

    const phoneNumber = parsePhoneNumberFromString(to);

    if (!phoneNumber || !phoneNumber.isValid()) {
      return res.status(400).json({ error: "Invalid phone number format" });
    }

    const normalizedNumber = phoneNumber.number; // E.164

    const payload = {
      messaging_product: "whatsapp",
      to: normalizedNumber,
      ...rest,
    };

    const response = await axios.post(
      `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${FB_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({
      error: "WhatsApp API request failed",
      details: err.response?.data,
    });
  }
});

app.listen(process.env.PORT || 3000);
