const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// We need to inject `let isMockData = false;` right after `let uniqueLeads = [];`
html = html.replace(/let uniqueLeads = \[\];/g, 'let uniqueLeads = [];\n    let isMockData = false;');

// We need to inject `isMockData = true;` inside the mock block
html = html.replace(/console\.log\("External networks failed\. Generating mock safeguard data\.\.\."\);/g, 'console.log("External networks failed. Generating mock safeguard data...");\n            isMockData = true;');

// We need to inject the status HTML update before `state.leads = uniqueLeads;`
const newStatusUpdate = `
        const statusContainer = document.getElementById('search-status-container');
        if (statusContainer) {
            if (isMockData) {
                statusContainer.innerHTML = \`<div class="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-2 rounded-full text-sm font-medium inline-flex items-center gap-2 group relative cursor-help"><span>🟡 Demo Mode (Public API Busy - Showing Sample Leads)</span><div class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 bg-slate-800 text-slate-300 text-xs p-3 rounded-xl border border-slate-700 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center">Connect your own Google Places API key in settings.js for unlimited live data.</div></div>\`;
            } else {
                statusContainer.innerHTML = \`<div class="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium inline-flex items-center gap-2"><span>🟢 Live OpenStreetMap Data</span></div>\`;
            }
            statusContainer.classList.remove('hidden');
        }

        state.leads = uniqueLeads;`;

// Using regex to replace the state.leads part
// Ensure we handle both locations properly (the actual script and the zip template)
// `html = html.replace(/state\.leads = uniqueLeads;/g, newStatusUpdate);`
// Wait, we need to escape template literals for the zip payload!
// It's safer to do it in two steps.

let idx1 = html.indexOf('state.leads = uniqueLeads;');
let idx2 = html.indexOf('state.leads = uniqueLeads;', idx1 + 10);

if (idx1 !== -1 && idx2 !== -1) {
    // Modify first one normally
    html = html.substring(0, idx1) + newStatusUpdate + html.substring(idx1 + 'state.leads = uniqueLeads;'.length);
    
    // Calculate new idx2 after length changes
    idx2 = html.indexOf('state.leads = uniqueLeads;', idx1 + newStatusUpdate.length);
    
    // For the zip string, escape the backticks and dollar signs
    let escapedStatusUpdate = newStatusUpdate.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\\$/g, '\\$');
    html = html.substring(0, idx2) + escapedStatusUpdate + html.substring(idx2 + 'state.leads = uniqueLeads;'.length);
}

fs.writeFileSync('index.html', html);
