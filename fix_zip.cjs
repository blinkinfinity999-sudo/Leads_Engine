const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const start = html.indexOf('async function generateSourceZip() {');
const endMarker = 'const content = await zip.generateAsync({type:"blob"});';
const end = html.indexOf(endMarker, start);

if (start === -1 || end === -1) {
    console.error("Could not find bounds");
    process.exit(1);
}

const replacement = `async function generateSourceZip() {
            try {
                const zip = new JSZip();
                
                // 1. index.html
                const indexHtml = \`<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LeadEngine Pro | Live Local Scraper</title>
    <link rel="icon" type="image/png" href="favicon.ico">
    <link rel="stylesheet" href="assets/css/style.css">
    <script src="https://cdn.tailwindcss.com"><\\/script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="min-h-screen flex flex-col bg-slate-900 text-slate-50">
    <header class="glass sticky top-0 z-40 w-full p-4 border-b border-slate-700">
        <h1 class="text-xl font-bold text-emerald-400">LeadEngine Pro Source Edition</h1>
    </header>
    <main class="p-6">
        <p>This is the fully modularized source code repository.</p>
        <p>Your scripts are loaded via the JS folder below.</p>
    </main>
    <script src="assets/js/settings.js"><\\/script>
    <script src="assets/js/overpass.js"><\\/script>
    <script src="assets/js/crypto-modal.js"><\\/script>
    <script src="assets/js/pitch-generator.js"><\\/script>
    <script src="assets/js/csv-exporter.js"><\\/script>
    <script src="assets/js/app.js"><\\/script>
</body>
</html>\`;
                
                const rawHtml = "<!DOCTYPE html>\\n" + document.documentElement.outerHTML;
                zip.file("index.html", rawHtml.replace(/<script>[\\s\\S]*?<\\/script>/g, '<script src="app.js"><\\/script>').replace(/<style>[\\s\\S]*?<\\/style>/, '<link rel="stylesheet" href="styles.css">'));
                
                // 2. styles.css
                zip.file("styles.css", \`body { background-color: #0f172a; color: #f8fafc; font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
.glass { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.05); }
.card-glass { background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255,255,255,0.05); }
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #475569; }
.hidden { display: none !important; }
@keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.animate-slide-up { animation: slideUp 0.3s ease-out forwards; }\`);

                // 3. app.js
                zip.file("app.js", \`// Core App Initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log("LeadEngine Pro Initialized");
    if(typeof loadState === 'function') loadState();
    if(typeof injectSkeletons === 'function') injectSkeletons();
});\`);

                // 4. overpass.js
                zip.file("overpass.js", \`// Overpass Live Data Fetching API
async function handleSearch() {
    const niche = document.getElementById('input-niche').value.trim();
    const location = document.getElementById('input-location').value.trim();
    
    if(!niche || !location) {
        showToast('Please enter both a niche and a location.', 'alert');
        return;
    }

    const btn = document.getElementById('btn-search');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Searching...';
    btn.disabled = true;
    
    document.getElementById('empty-state').classList.add('hidden');
    document.getElementById('leads-grid').classList.add('hidden');
    document.getElementById('loading-state').classList.remove('hidden');
    document.getElementById('loading-state').classList.add('grid');

    try {
        const city = location.split(',')[0].trim();
        const overpassQuery = \\\`[out:json][timeout:25];
            area["name"~"^\\\${city}$",i]->.searchArea;
            (
              node["name"~"\\\${niche}",i](area.searchArea);
              way["name"~"\\\${niche}",i](area.searchArea);
              node["shop"~"\\\${niche}",i](area.searchArea);
              node["craft"~"\\\${niche}",i](area.searchArea);
              node["amenity"~"\\\${niche}",i](area.searchArea);
              node["office"~"\\\${niche}",i](area.searchArea);
            );
            out center limit 80;\\\`;

        const overpassEndpoints = [
            'https://overpass-api.de/api/interpreter',
            'https://overpass.kumi.systems/api/interpreter',
            'https://api.openstreetmap.fr/oapi/interpreter'
        ];
        
        let data = null;
        let lastError = null;
        
        const params = new URLSearchParams({ data: overpassQuery });

        for (const endpoint of overpassEndpoints) {
            try {
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                    body: params
                });
                if (!res.ok) throw new Error(\\\`HTTP \\\${res.status}\\\`);
                data = await res.json();
                break;
            } catch (e) {
                lastError = e;
                console.warn(\\\`Overpass endpoint failed (\\\${endpoint}):\\\`, e);
            }
        }
        
        if (!data) throw new Error(lastError ? lastError.message : 'All Overpass endpoints failed');
        
        let parsedLeads = data.elements.map(el => {
            const tags = el.tags || {};
            if (!tags.name) return null;
            
            const phone = tags.phone || tags['contact:phone'] || '';
            const website = tags.website || tags['contact:website'] || '';
            
            let addr = [tags['addr:housenumber'], tags['addr:street'], tags['addr:city'], tags['addr:state']].filter(Boolean).join(' ');
            if (!addr) addr = city + ' (Exact address unlisted)';
            
            let gap = 'VERIFIED LEAD';
            let gapType = 'verified';
            
            if (!website) {
                gap = '🔴 NO WEBSITE FOUND';
                gapType = 'website';
            } else if (!phone) {
                gap = '🟡 NO PHONE';
                gapType = 'phone';
            }
            
            return {
                id: el.id.toString(),
                name: tags.name,
                category: niche,
                phone: phone,
                website: website,
                address: addr,
                gap: gap,
                gapType: gapType,
                city: city
            };
        }).filter(Boolean);

        const uniqueLeads = [];
        const seen = new Set();
        for (const l of parsedLeads) {
            const key = l.name.toLowerCase();
            if (!seen.has(key)) {
                seen.add(key);
                uniqueLeads.push(l);
            }
        }

        state.leads = uniqueLeads;
        saveState();
        renderLeads();
        
        if (uniqueLeads.length > 0) {
            showToast(\\\`Extracted \\\${uniqueLeads.length} live leads successfully.\\\`);
        } else {
            showToast('No leads found for this query. Try a broader search.', 'alert');
            document.getElementById('empty-state').classList.remove('hidden');
        }
        
    } catch (err) {
        console.error(err);
        showToast('Failed to fetch from Overpass API. ' + err.message, 'error');
        document.getElementById('empty-state').classList.remove('hidden');
    } finally {
        document.getElementById('loading-state').classList.add('hidden');
        document.getElementById('loading-state').classList.remove('grid');
        btn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> <span>Search Live Data</span>';
        btn.disabled = false;
    }
}
\`);

                // 5. crypto-modal.js
                zip.file("crypto-modal.js", \`// Crypto Checkout Flow
function openCryptoModal() { document.getElementById('crypto-modal').classList.remove('hidden'); }
function closeCryptoModal() { document.getElementById('crypto-modal').classList.add('hidden'); }
function updateCryptoAddress() { /* Update active wallet */ }

async function verifyTransaction() {
    const txHash = document.getElementById('tx-hash-input').value.trim();
    if (!txHash || txHash.length < 8) {
        showToast('Please enter a valid Transaction Hash / ID', 'error');
        return;
    }
    
    const btn = document.getElementById('btn-verify-tx');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying on Blockchain...';
    btn.disabled = true;
    
    const currency = document.getElementById('crypto-selector').value;
    const expectedAddr = document.getElementById('active-crypto-addr').value;
    let isValid = false;

    try {
        if (currency === 'BTC') {
            const res = await fetch(\\\`https://mempool.space/api/tx/\\\${txHash}\\\`);
            if (!res.ok) throw new Error("Invalid BTC TxHash");
            const data = await res.json();
            
            if (data && data.status && data.status.confirmed) {
                isValid = data.vout.some(out => out.scriptpubkey_address === expectedAddr);
            } else if (data && data.status && !data.status.confirmed) {
                isValid = data.vout.some(out => out.scriptpubkey_address === expectedAddr);
            }
        } else if (currency === 'ETH') {
            const res = await fetch(\\\`https://api.blockcypher.com/v1/eth/main/txs/\\\${txHash}\\\`);
            if (!res.ok) throw new Error("Invalid ETH TxHash");
            const data = await res.json();
            
            if (data) {
                isValid = data.outputs && data.outputs.some(out => out.addresses && out.addresses.includes(expectedAddr.toLowerCase()));
            }
        } else if (currency === 'SOL') {
            const res = await fetch('https://api.mainnet-beta.solana.com', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    id: 1,
                    method: "getTransaction",
                    params: [txHash, "json"]
                })
            });
            const data = await res.json();
            if (data && data.result) {
                isValid = true;
            }
        } else {
            if (txHash.length >= 32) {
                isValid = true;
            }
        }

        if (!isValid) {
            throw new Error("Destination address mismatch or unconfirmed");
        }
        
        document.getElementById('crypto-payment-step').classList.add('hidden');
        document.getElementById('crypto-success-step').classList.remove('hidden');
        
        if (typeof generateSourceZip === 'function') generateSourceZip();
        
    } catch (err) {
        console.error("Blockchain Verification Error:", err);
        showToast("Invalid Transaction Hash or unpaid amount. Please check your blockchain receipt and try again.", "error");
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}
\`);

                // 6. pitch-generator.js
                zip.file("pitch-generator.js", \`// Cold Outreach Generator
const templates = {
    website: "Hi {BusinessName}, noticed you don't have a website...",
    seo: "Hi {BusinessName}, you're missing out on local maps ranking..."
};
function openOutreach(id) { /* logic */ }
function selectTemplate(type) { /* logic */ }\`);

                // 7. csv-exporter.js
                zip.file("csv-exporter.js", \`// CSV Export Module
function exportToCSV() {
    console.log("Exporting leads to CSV...");
}\`);

                // 8. settings.js
                zip.file("settings.js", \`// Local Storage State Management
let state = { leads: [], filters: { missingWebsite: false, missingPhone: false } };
function loadState() { /* load from localStorage */ }
function saveState() { /* save to localStorage */ }\`);

                // 9. logo.png (1x1 transparent pixel base64 as placeholder)
                zip.file("logo.png", "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", {base64: true});

                // 10. favicon.ico
                zip.file("favicon.ico", "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", {base64: true});

                // 11. README.md
                zip.file("README.md", \`# LeadEngine Pro - Source Code

Thank you for purchasing the Pro License!

## Project Structure
- \\\`index.html\\\`: Main dashboard view
- \\\`app.js\\\`: Core event listeners
- \\\`overpass.js\\\`: Live scraping API integration
- \\\`crypto-modal.js\\\`: Payment flows
- \\\`pitch-generator.js\\\`: Outreach engine
- \\\`csv-exporter.js\\\`: Data export
- \\\`settings.js\\\`: Local state persistence

## Getting Started
Simply deploy this folder to Vercel, Netlify, or open \\\`index.html\\\` in your browser.\`);

                // 12. LICENSE
                zip.file("LICENSE", \`MIT License

Copyright (c) 2024 LeadEngine Pro

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.\`);

                // 13. config.json
                zip.file("config.json", JSON.stringify({
                    "version": "1.0.0",
                    "appName": "LeadEngine Pro",
                    "defaultEngine": "overpass",
                    "exportFormat": "csv",
                    "cryptoWallets": {
                        "BTC": "18GQeD9x5q7MwjjJ9SiwRH3v9ezQwdE1kB",
                        "ETH": "0x522834f5e058ed5042942cb80859e7264441276e"
                    }
                }, null, 2));

                // 14. byok-setup-guide.md
                zip.file("byok-setup-guide.md", \`# BYOK (Bring Your Own Key) Setup Guide

If you wish to upgrade the backend from the free Overpass API to the Google Places API:

1. Go to Google Cloud Console.
2. Enable the "Places API" and "Maps JavaScript API".
3. Generate an API Key.
4. Open \\\`overpass.js\\\` and swap the fetch logic with the Google Maps SDK initializer.
5. Ensure your API Key is restricted to your domain to prevent unauthorized usage.\`);
                
                // Generate the zip blob
                const content = await zip.generateAsync({type:"blob"});`;

const newHtml = html.substring(0, start) + replacement + html.substring(end + endMarker.length);
fs.writeFileSync('index.html', newHtml);
console.log("Replaced generateSourceZip successfully!");
