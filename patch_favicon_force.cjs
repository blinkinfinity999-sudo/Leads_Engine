const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The AI Studio environment sometimes proxies things weirdly, or caches very aggressively.
// Let's use a Data URI to guarantee it displays without any network requests.
const svgContent = fs.readFileSync('public/favicon.svg', 'utf8');
const svgBase64 = Buffer.from(svgContent).toString('base64');
const dataUri = `data:image/svg+xml;base64,${svgBase64}`;

html = html.replace(/<link rel="icon" type="image\/svg\+xml" href="\/favicon\.svg\?v=3">/g, `<link rel="icon" type="image/svg+xml" href="${dataUri}">`);
html = html.replace(/<link rel="apple-touch-icon" href="\/favicon\.svg\?v=3">/g, `<link rel="apple-touch-icon" href="${dataUri}">`);

fs.writeFileSync('index.html', html);
