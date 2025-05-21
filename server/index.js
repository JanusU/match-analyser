import express from 'express';
import cors from 'cors';
import fs from "fs/promises";
import path from "path";
import { analyzeMatch } from './helpers/matchAnalyser.js';
import multer from "multer";

// Use memory storage instead of saving the file
const upload = multer({ storage: multer.memoryStorage() });

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 5000;

// matches folder
const matches_folder = path.resolve("matches");

//get matches for main page
app.get("/api/matches", async (req, res) => {
  try {
    const files = await fs.readdir(matches_folder);
    // Filter for .json only and return IDs (filenames without extension)
    const matchIds = files
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""));

    res.json(matchIds);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list matches" });
  }
});

//get selected match and return json data
app.get("/api/matches/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const filePath = path.join(matches_folder, id + ".json");
    const data = await fs.readFile(filePath, "utf-8");
    res.json(JSON.parse(data));
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: "Match not found" });
  }
});

//upload match data in form of txt file.
app.post("/api/analyze", upload.single("matchFile"), async (req, res) => {
  try {
    const text = req.file.buffer.toString("utf-8"); // Parse buffer directly
    const analysis = await analyzeMatch(text);

    //save json output
    const outputPath = `matches/${analysis.match.map}-${analysis.timeStamp}-${Date.now()}.json`;
    await fs.writeFile(outputPath, JSON.stringify(analysis, null, 2));

    res.json({
      message: "Analysis complete match saved",
      analysis,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to analyze uploaded file." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});