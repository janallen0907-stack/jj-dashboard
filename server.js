const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const OUTPUT_DIR = path.join(__dirname, 'output');

app.use(express.static('public'));


// ✅ TEST ROUTE (must be AFTER app is created)
app.get('/test', (req, res) => {
    res.send('TEST OK');
});


// ✅ API CONTENT
app.get('/api/content', (req, res) => {
    try {
        if (!fs.existsSync(OUTPUT_DIR)) {
            return res.json([]);
        }

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
        res.status(500).json({ error: "Server error" });
    }
});


// 🚀 START SERVER
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


// 🤖 AUTO PIPELINE
const { runPipeline } = require('./core/pipeline');

runPipeline();

setInterval(() => {
    console.log("Auto generating...");
    runPipeline();
}, 300000);
