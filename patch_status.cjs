const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const targetHtml = `<div id="leads-grid" class="hidden grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>`;
const replacementHtml = `
        <div id="search-status-container" class="hidden mb-6 flex justify-center"></div>
        <div id="leads-grid" class="hidden grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>`;

html = html.replace(targetHtml, replacementHtml);

// Fix bug report button
html = html.replace('<form id="bug-form" onsubmit="submitBugReport(event)">', '<form id="bug-form">');
html = html.replace('<button type="submit" id="bug-submit-btn"', '<button type="button" onclick="submitBugReport(event)" id="bug-submit-btn"');

fs.writeFileSync('index.html', html);
