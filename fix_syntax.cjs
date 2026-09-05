const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// There are two places with:
//         btn.disabled = false;
//     }
// }
//         }
//         function toggleFilter(filterKey) {

html = html.replace(/btn\.disabled = false;\s*\}\s*\}\s*\}/g, 'btn.disabled = false;\n    }\n}');

fs.writeFileSync('index.html', html);
