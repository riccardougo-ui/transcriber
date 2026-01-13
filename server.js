import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.status(200).send("OK");
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log("Server avviato su porta", PORT);
});

// Impedisce a Node di terminare il processo
process.stdin.resume();
