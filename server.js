const express = require('express');

const app = express();
app.use(express.json());

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const FACEBOOK_API_VERSION = process.env.FACEBOOK_API_VERSION || 'v19.0';

if (!FACEBOOK_ACCESS_TOKEN || !PHONE_NUMBER_ID) {
  console.error(
    'Missing required env: FACEBOOK_ACCESS_TOKEN and/or PHONE_NUMBER_ID. Set them in Railway (or .env locally).'
  );
  process.exit(1);
}

const FACEBOOK_MESSAGES_URL = `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${PHONE_NUMBER_ID}/messages`;

app.post('/send', async (req, res) => {
  const body = req.body;

  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Request body must be a JSON object' });
  }

  try {
    const fbRes = await fetch(FACEBOOK_MESSAGES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${FACEBOOK_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(body),
    });

    const data = await fbRes.json().catch(() => ({}));

    if (!fbRes.ok) {
      return res.status(fbRes.status).json({
        error: 'Facebook API error',
        status: fbRes.status,
        ...data,
      });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
}); 
 