const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Fix live html
html = html.replace('<form id="bug-form">', '<form id="bug-form" onsubmit="event.preventDefault(); submitBugReport(event);">');
html = html.replace('<form id="bug-form" onsubmit="submitBugReport(event)">', '<form id="bug-form" onsubmit="event.preventDefault(); submitBugReport(event);">');

html = html.replace('<button type="button" onclick="submitBugReport(event)" id="bug-submit-btn"', '<button type="submit" id="bug-submit-btn"');
html = html.replace('<button type="submit" id="bug-submit-btn"', '<button type="submit" id="bug-submit-btn"');

// Replace any leftover incorrect forms in the zip string
html = html.replace(/<form id="bug-form" onsubmit="submitBugReport\(event\)">/g, '<form id="bug-form" onsubmit="event.preventDefault(); submitBugReport(event);">');

fs.writeFileSync('index.html', html);
