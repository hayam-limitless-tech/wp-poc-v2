import express from "express";
import axios from "axios";
import { parsePhoneNumberFromString } from "libphonenumber-js";

const app = express();
app.use(express.json());

const FB_TOKEN = process.env.FB_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const PORT = process.env.PORT || 3000;

if (!FB_TOKEN || !PHONE_NUMBER_ID) {
  console.error("Missing env vars");
  process.exit(1);
}

app.post("/send-message", async (req, res) => {
  try {
    const { to, ...rest } = req.body;

    const phone = parsePhoneNumberFromString(to);
    if (!phone || !phone.isValid()) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    const payload = {
      messaging_product: "whatsapp",
      to: phone.number,
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
    res.status(500).json(err.response?.data || err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
