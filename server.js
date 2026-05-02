const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

// ✅ REQUIRED for Render
const PORT = process.env.PORT || 3000;

const OUTPUT_DIR = path.join(__dirname, 'output');

app.use(express.static('public'));

// 🔹 GET CONTENT (for dashboard)
app.get('/api/content', (req, res) => {
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
});

// 🔹 IMPORT PIPELINE
const { runPipeline } = require('./core/pipeline');

// 🔹 MANUAL GENERATE BUTTON
app.get('/api/generate', async (req, res) => {
    try {
        console.log("Manual generation triggered...");
        await runPipeline();
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Generation failed" });
    }
});

// 🔹 AUTO GENERATION (every 5 min)
setInterval(() => {
    console.log("Auto generating...");
    runPipeline();
}, 300000);

// 🔹 START SERVER
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
