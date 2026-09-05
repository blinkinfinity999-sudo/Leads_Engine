const fs = require('fs');
let manifest = fs.readFileSync('public/manifest.json', 'utf8');

manifest = manifest.replace(/\/Gemini_Generated_Image_6geh2y6geh2y6geh\.png/g, '/favicon.jpg');
manifest = manifest.replace(/"type": "image\/png"/g, '"type": "image/jpeg"');

fs.writeFileSync('public/manifest.json', manifest);
