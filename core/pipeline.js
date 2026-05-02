const fs = require('fs');

async function runPipeline(){
    const id = Date.now();
    const dir = `./output/video_${id}`;
    fs.mkdirSync(dir, {recursive:true});

    fs.writeFileSync(`${dir}/script.txt`, "[whisper] They thought it was over...");
    fs.writeFileSync(`${dir}/visuals.json`, JSON.stringify({prompt:"cinematic anime"}));
    fs.writeFileSync(`${dir}/metadata.json`, JSON.stringify({video:{title:"Demo"},score:90}));

    console.log("Generated sample output");
}

module.exports = { runPipeline };
