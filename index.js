import express from "express";

const app = express();

const PORT = process.env.PORT;

if (!PORT) {
  console.error("PORT not set");
  process.exit(1);
}

app.get("/", (req, res) => res.send("OK"));

// Bind to 0.0.0.0 so Railway (and any proxy) can reach the app from outside the container
const server = app.listen(Number(PORT), "0.0.0.0", () => {
  console.log("Listening on port", PORT);
});

// Handle SIGTERM so Railway can stop the container cleanly (e.g. on redeploy)
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down");
  server.close(() => process.exit(0));
});
