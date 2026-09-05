const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The original zip html has this block:
const origCryptoUI = `<div class="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-8">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-xs font-bold text-slate-400 uppercase" id="crypto-label">Send Exactly $80 in BTC to:</span>
                    </div>
                    <div class="flex gap-2">`;

const newCryptoUI = `<div class="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-8">
                    <div class="flex justify-center mb-4 bg-white p-2 rounded-lg w-max mx-auto shadow-sm">
                        <img id="crypto-qr-code" src="https://quickchart.io/qr?text=18GQeD9x5q7MwjjJ9SiwRH3v9ezQwdE1kB&size=150" alt="Crypto QR Code" class="w-32 h-32 object-contain rounded">
                    </div>
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-xs font-bold text-slate-400 uppercase" id="crypto-label">Send Exactly $80 in BTC to:</span>
                    </div>
                    <div class="flex gap-2">`;

// It exists TWICE in the file - one in the actual DOM (which we already replaced with edit_file) and one in the zip template
html = html.replace(origCryptoUI, newCryptoUI);

// Now for the JS part in the zip
const origZipJs = `function updateCryptoAddress() { /* Update active wallet */ }`;
const newZipJs = `function updateCryptoAddress() {
    const select = document.getElementById('crypto-selector');
    const selectedOption = select.options[select.selectedIndex];
    const addr = selectedOption.getAttribute('data-addr');
    const name = selectedOption.text;
    document.getElementById('active-crypto-addr').value = addr;
    document.getElementById('crypto-label').innerText = \\\`Send Exactly $80 in \\\${select.value.split('_')[0]} to:\\\`;
    document.getElementById('crypto-qr-code').src = \\\`https://quickchart.io/qr?text=\\\${encodeURIComponent(addr)}&size=150\\\`;
}`;

html = html.replace(origZipJs, newZipJs);

fs.writeFileSync('index.html', html);
