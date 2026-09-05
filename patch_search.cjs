const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const queryToReplace1 = `const overpassQuery = \`[out:json][timeout:25];
                    area["name"~"^\\${city}$",i]->.searchArea;
                    (
                      node["name"~"\\${niche}",i](area.searchArea);
                      way["name"~"\\${niche}",i](area.searchArea);
                      node["shop"~"\\${niche}",i](area.searchArea);
                      node["craft"~"\\${niche}",i](area.searchArea);
                      node["amenity"~"\\${niche}",i](area.searchArea);
                      node["office"~"\\${niche}",i](area.searchArea);
                    );
                    out center limit 80;\`;`;

const newQuery1 = `const overpassQuery = \`[out:json][timeout:10];
                    area["name"~"\\${city}", i]->.a;
                    (
                      node["amenity"~"\\${niche}", i](area.a);
                      node["shop"~"\\${niche}", i](area.a);
                      node["craft"~"\\${niche}", i](area.a);
                      node["office"~"\\${niche}", i](area.a);
                    );
                    out center 30;\`;`;

// For the ZIP version, the original string looks like this in the output:
// const overpassQuery = \\`[out:json][timeout:25];            area["name"~"^\\${city}$",i]->.searchArea;            (              node["name"~"\\${niche}",i](area.searchArea);              way["name"~"\\${niche}",i](area.searchArea);              node["shop"~"\\${niche}",i](area.searchArea);              node["craft"~"\\${niche}",i](area.searchArea);              node["amenity"~"\\${niche}",i](area.searchArea);              node["office"~"\\${niche}",i](area.searchArea);            );            out center limit 80;\\`;
// But we can just use regex for both:

html = html.replace(/const overpassQuery = `\[out:json\]\[timeout:25\];[\s\S]*?out center limit 80;`;/, newQuery1);

const queryToReplace2 = `const overpassQuery = \\\`[out:json][timeout:25];
            area["name"~"^\\\${city}$",i]->.searchArea;
            (
              node["name"~"\\\${niche}",i](area.searchArea);
              way["name"~"\\\${niche}",i](area.searchArea);
              node["shop"~"\\\${niche}",i](area.searchArea);
              node["craft"~"\\\${niche}",i](area.searchArea);
              node["amenity"~"\\\${niche}",i](area.searchArea);
              node["office"~"\\\${niche}",i](area.searchArea);
            );
            out center limit 80;\\\`;`;

const newQuery2 = `const overpassQuery = \\\`[out:json][timeout:10];
            area["name"~"\\\${city}", i]->.a;
            (
              node["amenity"~"\\\${niche}", i](area.a);
              node["shop"~"\\\${niche}", i](area.a);
              node["craft"~"\\\${niche}", i](area.a);
              node["office"~"\\\${niche}", i](area.a);
            );
            out center 30;\\\`;`;
            
html = html.replace(/const overpassQuery = \\`\[out:json\]\[timeout:25\];[\s\S]*?out center limit 80;\\`;/, newQuery2);

const fetchLoopToReplace = `for (const endpoint of overpassEndpoints) {
                    try {
                        const res = await fetch(endpoint, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                            body: params
                        });
                        if (!res.ok) throw new Error(\`HTTP \${res.status}\${bugJS}\`);
                        data = await res.json();
                        break; // Success, exit fallback loop
                    } catch (e) {
                        lastError = e;
                        console.warn(\`Overpass endpoint failed (\${endpoint}):\`, e);
                    }
                }`;

const newFetchLoop1 = `for (const endpoint of overpassEndpoints) {
                    try {
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 8000);
                        
                        const res = await fetch(endpoint, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                            body: params,
                            signal: controller.signal
                        });
                        
                        clearTimeout(timeoutId);
                        if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
                        data = await res.json();
                        break; // Success, exit fallback loop
                    } catch (e) {
                        lastError = e;
                        console.warn(\`Overpass endpoint failed (\${endpoint}):\`, e);
                    }
                }`;

// The bugJS was accidentally injected inside `HTTP \${res.status}\${bugJS}` when I injected earlier. Let's fix that along with it!
html = html.replace(/for \(const endpoint of overpassEndpoints\) {[\s\S]*?break; \/\/ Success, exit fallback loop[\s\S]*?\} catch \(e\) {[\s\S]*?\}[\s\S]*?\}/, newFetchLoop1);

// Now for the ZIP zip.file version
const newFetchLoop2 = `for (const endpoint of overpassEndpoints) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000);
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                    body: params,
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                if (!res.ok) throw new Error(\\\`HTTP \\\${res.status}\\\`);
                data = await res.json();
                break;
            } catch (e) {
                lastError = e;
                console.warn(\\\`Overpass endpoint failed (\\\${endpoint}):\\\`, e);
            }
        }`;

html = html.replace(/for \(const endpoint of overpassEndpoints\) {[\s\S]*?data = await res.json\(\);[\s\S]*?break;[\s\S]*?\} catch \(e\) {[\s\S]*?\}[\s\S]*?\}/, newFetchLoop2);

// Now update the toast message on empty leads
// It should be: "No leads found for this search. Try a broader term (e.g., 'dentist', 'plumber') or a different city."
const oldToastStr = "showToast('No leads found for this query. Try a broader search.', 'alert');";
const newToastStr = "showToast('No leads found for this search. Try a broader term (e.g., \\'dentist\\', \\'plumber\\') or a different city.', 'alert');";
html = html.split(oldToastStr).join(newToastStr);

fs.writeFileSync('index.html', html);
