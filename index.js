import express from "express";

const app = express();

const PORT = process.env.PORT;

if (!PORT) {
  console.error("PORT not set");
  process.exit(1);
}

app.get("/", (req, res) => res.send("OK"));

app.listen(PORT, () => {
  console.log("Listening on port", PORT);
});
