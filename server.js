import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("OK");
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log("Server started on port", PORT);
});

process.stdin.resume();
