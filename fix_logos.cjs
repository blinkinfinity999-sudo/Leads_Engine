const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace header logo back to bolt
html = html.replace(
    '<img src="/logo.png" alt="LeadEngine Logo" class="h-8 w-auto object-contain rounded-md drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">',
    '<i class="fa-solid fa-bolt text-xl"></i>'
);

// Replace empty state logo back to robot
html = html.replace(
    '<div class="mb-8 relative rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl shadow-emerald-500/10 flex items-center justify-center bg-slate-800 w-64 h-auto mx-auto aspect-video">\n                <img src="/logo.png" alt="LeadEngine Pro Logo" class="w-full h-full object-contain">\n            </div>',
    '<div class="mb-8 relative rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl shadow-emerald-500/10 flex items-center justify-center bg-slate-800 w-48 h-48 mx-auto">\n                <i class="fa-solid fa-robot text-6xl text-emerald-400 opacity-50"></i>\n            </div>'
);

// Replace ZIP generation logo fetching
const zipLogoStr = `                // 9. logo.png (1x1 transparent pixel base64 as placeholder)
                zip.file("logo.png", "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", {base64: true});

                // 10. favicon.ico
                zip.file("favicon.ico", "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", {base64: true});`;

const newZipLogoStr = `                // 9 & 10 Fetch actual user logo
                try {
                    const logoRes = await fetch("/logo.png");
                    const logoBlob = await logoRes.blob();
                    zip.file("logo.png", logoBlob);
                    zip.file("favicon.ico", logoBlob);
                } catch(e) {
                    console.log("Could not fetch logo, using fallback");
                    zip.file("logo.png", "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", {base64: true});
                    zip.file("favicon.ico", "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", {base64: true});
                }`;

html = html.replace(zipLogoStr, newZipLogoStr);

// Use logo for favicon
html = html.replace(
    '<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%2334d399\'%3E%3Cpath d=\'M11.666 4.143L3.109 13.91c-.328.375-.062.949.435.949h5.719v6.998c0 .487.575.748.94.423l8.69-7.75c.34-.303.111-.861-.341-.861h-5.918V5.093c0-.528-.65-.772-.968-.38z\'/%3E%3C/svg%3E">',
    '<link rel="icon" type="image/png" href="/logo.png">'
);

fs.writeFileSync('index.html', html);
