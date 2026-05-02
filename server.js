const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

// ✅ REQUIRED FOR RENDER
const PORT = process.env.PORT || 3000;

const OUTPUT_DIR = path.join(__dirname, 'output');

app.use(express.static('public'));


// ===============================
// 📦 EXISTING: GET GENERATED VIDEOS
// ===============================
app.get('/api/videos', (req, res) => {
    try {
        if (!fs.existsSync(OUTPUT_DIR)) return res.json([]);

        const folders = fs.readdirSync(OUTPUT_DIR);

        const data = folders.map(folder => {
            const dir = path.join(OUTPUT_DIR, folder);

            const scriptPath = path.join(dir, 'script.txt');
            const visualsPath = path.join(dir, 'visuals.json');
            const metadataPath = path.join(dir, 'metadata.json');

            const script = fs.existsSync(scriptPath)
                ? fs.readFileSync(scriptPath, 'utf-8')
                : '';

            const visuals = fs.existsSync(visualsPath)
                ? JSON.parse(fs.readFileSync(visualsPath))
                : {};

            const metadata = fs.existsSync(metadataPath)
                ? JSON.parse(fs.readFileSync(metadataPath))
                : {};

            return { folder, script, visuals, metadata };
        });

        res.json(data);

    } catch (err) {
        console.error("Error reading videos:", err);
        res.status(500).json({ error: "Failed to load videos" });
    }
});


// ===============================
// 🚀 NEW: PIPELINE + LIVE CONTENT
// ===============================
const { runPipeline } = require('./core/pipeline');

// API endpoint for frontend
app.get('/api/content', async (req, res) => {
    try {
        const result = await runPipeline();
        res.json(result);
    } catch (err) {
        console.error("Pipeline error:", err);
        res.status(500).json({ error: "Pipeline failed" });
    }
});


// ===============================
// 🔁 AUTO GENERATION LOOP
// ===============================

// run immediately (on deploy)
(async () => {
    console.log("Initial pipeline run...");
    await runPipeline();
})();

// run every 5 minutes
setInterval(async () => {
    console.log("Auto generating...");
    await runPipeline();
}, 300000);


// ===============================
// 🚀 START SERVER
// ===============================
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
