const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// I need to add zip.file("favicon.svg", svgContent) where the zip generation happens.
// Look for zip.file("sw.js"
const svgContent = fs.readFileSync('public/favicon.svg', 'utf8');

const targetStr = `zip.file("sw.js",`;
const replaceStr = `zip.file("favicon.svg", \`${svgContent}\`);
                zip.file("sw.js",`;

html = html.replace(targetStr, replaceStr);

fs.writeFileSync('index.html', html);
