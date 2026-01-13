import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.status(200).send("OK");
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log("Server avviato su porta", PORT);
});

// Mantiene il processo vivo
process.stdin.resume();
