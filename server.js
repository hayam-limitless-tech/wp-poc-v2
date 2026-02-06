const express = require('express');

const app = express();
app.use(express.json());

// Keep process alive on uncaught errors (log and avoid exit so container stays up)
process.on('uncaughtException', (err) => {
  console.error('uncaughtException:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('unhandledRejection at', promise, 'reason:', reason);
});

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const FACEBOOK_API_VERSION = process.env.FACEBOOK_API_VERSION || 'v19.0';

function getMessagesUrl() {
  if (!PHONE_NUMBER_ID) return null;
  return `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${PHONE_NUMBER_ID}/messages`;
}

// Health check (Railway / load balancers often hit GET /)
app.get('/', (req, res) => {
  res.status(200).json({ ok: true, service: 'whatsapp-proxy' });
});

app.post('/send', async (req, res) => {
  const body = req.body;

  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Request body must be a JSON object' });
  }

  if (!FACEBOOK_ACCESS_TOKEN || !PHONE_NUMBER_ID) {
    console.error('Missing FACEBOOK_ACCESS_TOKEN and/or PHONE_NUMBER_ID. Set them in Railway Variables.');
    return res.status(503).json({
      error: 'Server not configured',
      message: 'Set FACEBOOK_ACCESS_TOKEN and PHONE_NUMBER_ID in Railway Variables.',
    });
  }

  const url = getMessagesUrl();
  try {
    const fbRes = await fetch(url, {
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
const HOST = '0.0.0.0'; // required on Railway/Docker so the service is reachable
app.listen(PORT, HOST, () => {
  console.log(`Server listening on ${HOST}:${PORT}`);
}); 
 