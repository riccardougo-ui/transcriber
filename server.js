import express from "express";
import multer from "multer";
import { execSync } from "child_process";
import fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data";

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.static("public"));

app.post("/upload", upload.single("file"), async (req, res) => {
  const input = req.file.path;
  const base = input.split(".")[0];

  execSync(
    `ffmpeg -i ${input} -f segment -segment_time 1200 ${base}_%03d.mp3`
  );

  const parts = fs
    .readdirSync("uploads")
    .filter((f) => f.startsWith(base));

  let transcript = "";

  for (const p of parts) {
    const form = new FormData();
    form.append("file", fs.createReadStream("uploads/" + p));
    form.append("model", "gpt-4o-transcribe");

    const r = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          ...form.getHeaders(),
        },
        body: form,
      }
    );

    const j = await r.json();
    transcript += j.text + "\n\n";
  }

  res.setHeader("Content-Type", "text/plain");
  res.send(transcript);
});

app.listen(3000, () => console.log("Server avviato"));
