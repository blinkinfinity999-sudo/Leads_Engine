const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Replace handleSearch
const handleSearchStart = html.indexOf('async function handleSearch() {');
const handleSearchEnd = html.indexOf('function toggleFilter(filterKey) {');
const handleSearchOld = html.substring(handleSearchStart, handleSearchEnd);

const handleSearchNew = `async function handleSearch() {
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
                const overpassQuery = \`[out:json][timeout:25];
                    area["name"~"^\${city}$",i]->.searchArea;
                    (
                      node["name"~"\${niche}",i](area.searchArea);
                      way["name"~"\${niche}",i](area.searchArea);
                      node["shop"~"\${niche}",i](area.searchArea);
                      node["craft"~"\${niche}",i](area.searchArea);
                      node["amenity"~"\${niche}",i](area.searchArea);
                      node["office"~"\${niche}",i](area.searchArea);
                    );
                    out center limit 80;\`;

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
                        if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
                        data = await res.json();
                        break; // Success, exit fallback loop
                    } catch (e) {
                        lastError = e;
                        console.warn(\`Overpass endpoint failed (\${endpoint}):\`, e);
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

                // Deduplicate by name
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
                    showToast(\`Extracted \${uniqueLeads.length} live leads successfully.\`);
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

        `;

html = html.replace(handleSearchOld, handleSearchNew);

// Replace verifyTransaction
const verifyTxStart = html.indexOf('async function verifyTransaction() {');
const verifyTxEnd = html.indexOf('async function generateSourceZip() {');
const verifyTxOld = html.substring(verifyTxStart, verifyTxEnd);

const verifyTxNew = `async function verifyTransaction() {
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
                // Public Blockchain Explorer API Checks
                if (currency === 'BTC') {
                    const res = await fetch(\`https://mempool.space/api/tx/\${txHash}\`);
                    if (!res.ok) throw new Error("Invalid BTC TxHash");
                    const data = await res.json();
                    
                    if (data && data.status && data.status.confirmed) {
                        // Check if expected address is in output
                        isValid = data.vout.some(out => out.scriptpubkey_address === expectedAddr);
                    } else if (data && data.status && !data.status.confirmed) {
                        // Accept in-mempool unconfirmed for instant delivery 
                        isValid = data.vout.some(out => out.scriptpubkey_address === expectedAddr);
                    }
                } else if (currency === 'ETH') {
                    // Fallback to blockcypher for public ETH checking (CORS friendly)
                    const res = await fetch(\`https://api.blockcypher.com/v1/eth/main/txs/\${txHash}\`);
                    if (!res.ok) throw new Error("Invalid ETH TxHash");
                    const data = await res.json();
                    
                    if (data) {
                        isValid = data.outputs && data.outputs.some(out => out.addresses && out.addresses.includes(expectedAddr.toLowerCase()));
                    }
                } else if (currency === 'SOL') {
                    // Basic SOL validation via public RPC
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
                        isValid = true; // Strict environment would check account keys and balances here
                    }
                } else {
                    // Generic validation for other chains (TRON, DOGE, LTC, etc) 
                    // In a true production environment, you would proxy these to a backend server.
                    // For this client-side demo, we ensure hash length is plausible for the chain.
                    if (txHash.length >= 32) {
                        isValid = true;
                    }
                }

                if (!isValid) {
                    throw new Error("Destination address mismatch or unconfirmed");
                }
                
                document.getElementById('crypto-payment-step').classList.add('hidden');
                document.getElementById('crypto-success-step').classList.remove('hidden');
                
                generateSourceZip();
                
            } catch (err) {
                console.error("Blockchain Verification Error:", err);
                showToast("Invalid Transaction Hash or unpaid amount. Please check your blockchain receipt and try again.", "error");
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }

        `;

html = html.replace(verifyTxOld, verifyTxNew);
fs.writeFileSync('index.html', html);
console.log("Replaced logic in index.html");
