const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace line 7 logo.png with the new image
html = html.replace('<link rel="icon" type="image/png" href="/logo.png">', '<link rel="icon" type="image/png" href="/Gemini_Generated_Image_6geh2y6geh2y6geh.png">');

// Also in the ZIP template
html = html.replace('<link rel="icon" type="image/png" href="favicon.ico">', '<link rel="icon" type="image/png" href="Gemini_Generated_Image_6geh2y6geh2y6geh.png">');

fs.writeFileSync('index.html', html);
