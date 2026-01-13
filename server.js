import express from "express";
import multer from "multer";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const app = express();
const upload = multer({ dest: "uploads/" });

if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("Server attivo");
});

function splitAudio(inputPath, outputPrefix) {
  return new Promise((resolve, reject) => {
    const ff = spawn("ffmpeg", [
      "-i", inputPath,
      "-f", "segment",
      "-segment_time", "1200",
      `${outputPrefix}_%03d.mp3`
    ]);
    ff.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error("FFmpeg failed"));
    });
  });
}

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const input = req.file.path;
    const base = path.parse(input).name;
    const prefix = `uploads/${base}`;

    await splitAudio(input, prefix);

    const parts = fs.readdirSync("uploads").filter((f) => f.startsWith(base));
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
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: form
        }
      );

      const j = await r.json();
      transcript += (j.text || "") + "\n\n";
    }

    res.type("text").send(transcript);
  } catch (err) {
    console.error(err);
    res.status(500).send("Errore server");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server avviato su porta", PORT));

// Error handling
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Keep process alive
process.stdin.resume();
