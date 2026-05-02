const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const OUTPUT_DIR = path.join(__dirname, 'output');

app.use(express.static('public'));

app.get('/api/videos', (req, res) => {
    if (!fs.existsSync(OUTPUT_DIR)) return res.json([]);
    const folders = fs.readdirSync(OUTPUT_DIR);

    const data = folders.map(folder => {
        const dir = path.join(OUTPUT_DIR, folder);
        const script = fs.existsSync(path.join(dir,'script.txt')) ? fs.readFileSync(path.join(dir,'script.txt'),'utf-8') : '';
        const visuals = fs.existsSync(path.join(dir,'visuals.json')) ? JSON.parse(fs.readFileSync(path.join(dir,'visuals.json'))) : {};
        const metadata = fs.existsSync(path.join(dir,'metadata.json')) ? JSON.parse(fs.readFileSync(path.join(dir,'metadata.json'))) : {};
        return {folder, script, visuals, metadata};
    });

    res.json(data);
});

app.listen(PORT, () => {
    console.log(`UI running at http://localhost:${PORT}`);
});

const { runPipeline } = require('./core/pipeline');

// run immediately
runPipeline();

// run every 5 minutes
setInterval(() => {
    console.log("Auto generating...");
    runPipeline();
}, 300000);
