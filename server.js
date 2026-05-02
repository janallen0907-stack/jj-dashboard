const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const OUTPUT_DIR = path.join(__dirname, 'output');

app.use(express.static('public'));


// ===============================
// EXISTING: VIDEOS
// ===============================
app.get('/api/videos', (req, res) => {
    try {
        if (!fs.existsSync(OUTPUT_DIR)) return res.json([]);

        const folders = fs.readdirSync(OUTPUT_DIR);

        const data = folders.map(folder => {
            const dir = path.join(OUTPUT_DIR, folder);

            const script = fs.existsSync(path.join(dir, 'script.txt'))
                ? fs.readFileSync(path.join(dir, 'script.txt'), 'utf-8')
                : '';

            const visuals = fs.existsSync(path.join(dir, 'visuals.json'))
                ? JSON.parse(fs.readFileSync(path.join(dir, 'visuals.json')))
                : {};

            const metadata = fs.existsSync(path.join(dir, 'metadata.json'))
                ? JSON.parse(fs.readFileSync(path.join(dir, 'metadata.json')))
                : {};

            return { folder, script, visuals, metadata };
        });

        res.json(data);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to load videos" });
    }
});


// ===============================
// 🚀 NEW: CONTENT API (THIS IS WHAT YOU'RE MISSING)
// ===============================
const { runPipeline } = require('./core/pipeline');

app.get('/api/content', async (req, res) => {
    try {
        const result = await runPipeline();
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Pipeline failed" });
    }
});


// ===============================
// AUTO RUN
// ===============================
(async () => {
    console.log("Initial pipeline run...");
    await runPipeline();
})();

setInterval(async () => {
    console.log("Auto generating...");
    await runPipeline();
}, 300000);


// ===============================
// START SERVER
// ===============================
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
