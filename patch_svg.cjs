const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace .jpg favicon with .svg for perfect crispness and cache-busting
html = html.replace(/<link rel="icon" type="image\/jpeg" href="\/favicon\.jpg">/g, '<link rel="icon" type="image/svg+xml" href="/favicon.svg?v=3">');
html = html.replace(/<link rel="apple-touch-icon" href="\/favicon\.jpg">/g, '<link rel="apple-touch-icon" href="/favicon.svg?v=3">');
html = html.replace(/<link rel="icon" type="image\/jpeg" href="favicon\.jpg">/g, '<link rel="icon" type="image/svg+xml" href="favicon.svg">');

fs.writeFileSync('index.html', html);

let manifest = fs.readFileSync('public/manifest.json', 'utf8');
manifest = manifest.replace(/\/favicon\.jpg/g, '/favicon.svg');
manifest = manifest.replace(/"type": "image\/jpeg"/g, '"type": "image/svg+xml"');
fs.writeFileSync('public/manifest.json', manifest);
