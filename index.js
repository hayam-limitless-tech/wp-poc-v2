import express from "express";

const app = express();

const PORT = process.env.PORT;

if (!PORT) {
  console.error("PORT not set");
  process.exit(1);
}

app.get("/", (req, res) => res.send("OK"));

// Bind to :: (IPv4 + IPv6) — required for Railway's proxy/health checks
const server = app.listen(Number(PORT), "::", () => {
  console.log("Listening on port", PORT);
});

// Handle SIGTERM so Railway can stop the container cleanly (e.g. on redeploy)
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down");
  server.close(() => process.exit(0));
});
