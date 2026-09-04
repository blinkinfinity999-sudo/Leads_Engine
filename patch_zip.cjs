const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The zip generator logic creates index.html
// We need to inject the button in the zip's index.html
const buttonToReplaceZip = `<button onclick="exportToCSV()" class="text-slate-300 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg hover:bg-slate-800">
                    <i class="fa-solid fa-download"></i> <span class="hidden sm:inline">Export</span>
                </button>`;
                
const buttonWithBugModalZip = `<button onclick="openBugModal()" class="text-slate-300 hover:text-rose-400 transition-colors flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg hover:bg-slate-800">
                    <i class="fa-solid fa-bug"></i> <span class="hidden sm:inline">Report a Bug</span>
                </button>
                <button onclick="exportToCSV()" class="text-slate-300 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg hover:bg-slate-800">
                    <i class="fa-solid fa-download"></i> <span class="hidden sm:inline">Export</span>
                </button>`;

html = html.replace(
    '// 1. index.html', 
    '// 1. index.html\n                const bugModalHTML = `\\n    <!-- Bug Report Modal -->\\n    <div id="bug-modal" class="hidden fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">\\n        <div class="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">\\n            <div class="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-850 shrink-0">\\n                <h2 class="text-xl font-bold text-white"><i class="fa-solid fa-bug text-rose-500 mr-2"></i> Report a Bug</h2>\\n                <button onclick="closeBugModal()" class="text-slate-400 hover:text-white transition-colors">\\n                    <i class="fa-solid fa-xmark text-xl"></i>\\n                </button>\\n            </div>\\n            <div class="p-6 overflow-y-auto">\\n                <form id="bug-form" onsubmit="submitBugReport(event)">\\n                    <div class="mb-4">\\n                        <label class="block text-sm font-medium text-slate-400 mb-2">Your Email</label>\\n                        <input type="email" id="bug-email" required class="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">\\n                    </div>\\n                    <div class="mb-4">\\n                        <label class="block text-sm font-medium text-slate-400 mb-2">Category</label>\\n                        <select id="bug-category" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 appearance-none">\\n                            <option value="Search / Scraping">Search / Scraping</option>\\n                            <option value="UI / Design">UI / Design</option>\\n                            <option value="Source Code Download">Source Code Download</option>\\n                            <option value="Other">Other</option>\\n                        </select>\\n                    </div>\\n                    <div class="mb-6">\\n                        <label class="block text-sm font-medium text-slate-400 mb-2">Bug Description</label>\\n                        <textarea id="bug-message" required rows="4" placeholder="Please describe what happened..." class="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"></textarea>\\n                    </div>\\n                    <div class="flex gap-4">\\n                        <button type="button" onclick="closeBugModal()" class="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl transition-colors">Cancel</button>\\n                        <button type="submit" id="bug-submit-btn" class="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2">\\n                            <span>Submit Report</span>\\n                        </button>\\n                    </div>\\n                </form>\\n            </div>\\n        </div>\\n    </div>`;\n'
);

// We need to inject the html and js in the zip payload
// Find the <div id="crypto-modal"> in the zip string and inject bugModalHTML before it
let zipCryptoModalStr = '<div id="crypto-modal"';
let indexHtmlPos = html.indexOf('const indexHtml =');
let endHtmlPos = html.indexOf('`;', indexHtmlPos);

let firstPart = html.substring(0, indexHtmlPos);
let middlePart = html.substring(indexHtmlPos, endHtmlPos);
let lastPart = html.substring(endHtmlPos);

middlePart = middlePart.replace(
    '<button onclick="exportToCSV()" class="text-slate-300 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg hover:bg-slate-800">',
    `<button onclick="openBugModal()" class="text-slate-300 hover:text-rose-400 transition-colors flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg hover:bg-slate-800">
                    <i class="fa-solid fa-bug"></i> <span class="hidden sm:inline">Report a Bug</span>
                </button>
                <button onclick="exportToCSV()" class="text-slate-300 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg hover:bg-slate-800">`
);

middlePart = middlePart.replace(
    '<!-- Crypto Modal -->',
    '${bugModalHTML}\n    <!-- Crypto Modal -->'
);

html = firstPart + middlePart + lastPart;


// Inject JS into app.js
const appJsInjection = `

// Bug Modal Logic
window.openBugModal = function() { document.getElementById('bug-modal').classList.remove('hidden'); };
window.closeBugModal = function() { document.getElementById('bug-modal').classList.add('hidden'); };
window.submitBugReport = async function(e) {
    e.preventDefault();
    const email = document.getElementById('bug-email').value;
    const category = document.getElementById('bug-category').value;
    const message = document.getElementById('bug-message').value;
    const btn = document.getElementById('bug-submit-btn');
    
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Sending...</span>';
    btn.disabled = true;

    try {
        const response = await fetch('https://formspree.io/f/xbgjkdbz', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, category, message, _replyto: email })
        });

        if (response.ok) {
            window.showToast('Bug report sent successfully! We will review it shortly.');
            document.getElementById('bug-form').reset();
            closeBugModal();
        } else {
            throw new Error('Formspree returned ' + response.status);
        }
    } catch (error) {
        console.error("Bug submission failed:", error);
        const mailtoLink = \\\`mailto:rage99582@gmail.com?subject=LeadEngine Pro Bug Report: \\\${encodeURIComponent(category)}&body=\\\${encodeURIComponent("From: " + email + "\\\\n\\\\n" + message)}\\\`;
        window.location.href = mailtoLink;
        closeBugModal();
    } finally {
        btn.innerHTML = '<span>Submit Report</span>';
        btn.disabled = false;
    }
};
`;

html = html.replace('// 3. app.js', '// 3. app.js\n                const bugJS = `' + appJsInjection.replace(/\\/g, '\\\\').replace(/`/g, '\\`') + '`;\n');

let zipAppJsPos = html.indexOf('zip.file("assets/js/app.js", `');
let zipAppJsEnd = html.indexOf('`);', zipAppJsPos);
let aFirstPart = html.substring(0, zipAppJsPos);
let aMiddlePart = html.substring(zipAppJsPos, zipAppJsEnd);
let aLastPart = html.substring(zipAppJsEnd);

aMiddlePart += '${bugJS}';
html = aFirstPart + aMiddlePart + aLastPart;

fs.writeFileSync('index.html', html);

