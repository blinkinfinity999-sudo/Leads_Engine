const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/<link rel="icon" type="image\/png" href="\/Gemini_Generated_Image_6geh2y6geh2y6geh\.png">/g, '<link rel="icon" type="image/jpeg" href="/favicon.jpg">');
html = html.replace(/<link rel="apple-touch-icon" href="\/Gemini_Generated_Image_6geh2y6geh2y6geh\.png">/g, '<link rel="apple-touch-icon" href="/favicon.jpg">');
html = html.replace(/<link rel="icon" type="image\/png" href="Gemini_Generated_Image_6geh2y6geh2y6geh\.png">/g, '<link rel="icon" type="image/jpeg" href="favicon.jpg">');

fs.writeFileSync('index.html', html);
