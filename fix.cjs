const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Banner & Modals
html = html.replace(/Enter your Google Places API Key in Settings/g, 'Enter your SerpApi Key in Settings');
html = html.replace(/Google Places API Key/g, 'SerpApi Key');
html = html.replace(/AIzaSy\.\.\./g, 'Enter your SerpApi key here...');

// Replace Guide Modal Content completely
const guideStart = html.indexOf('<div id="guide-modal"');
const guideEnd = html.indexOf('<!-- Outreach Slide-over / Modal -->');
const guideStr = html.substring(guideStart, guideEnd);

const newGuide = `<div id="guide-modal" class="hidden fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            <div class="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-850">
                <h2 class="text-xl font-bold text-white"><i class="fa-solid fa-map-location-dot text-emerald-500 mr-2"></i> How to Get Your Free SerpApi Key</h2>
                <button onclick="closeGuide()" class="text-slate-400 hover:text-white transition-colors">
                    <i class="fa-solid fa-xmark text-xl"></i>
                </button>
            </div>
            <div class="p-6 space-y-5 text-slate-300 text-sm leading-relaxed">
                <div class="flex gap-4">
                    <div class="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold border border-emerald-500/30">1</div>
                    <div>
                        <h3 class="text-white font-semibold mb-1">Create a SerpApi Account</h3>
                        <p>Go to <a href="https://serpapi.com/" target="_blank" class="text-emerald-400 hover:underline">serpapi.com</a> and sign up for a free account. They provide 100 free searches per month.</p>
                    </div>
                </div>
                <div class="flex gap-4">
                    <div class="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold border border-emerald-500/30">2</div>
                    <div>
                        <h3 class="text-white font-semibold mb-1">Get Your API Key</h3>
                        <p>Verify your email address, then navigate to your SerpApi Dashboard. You will see your private API Key listed there.</p>
                    </div>
                </div>
                <div class="flex gap-4">
                    <div class="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold border border-emerald-500/30">3</div>
                    <div>
                        <h3 class="text-white font-semibold mb-1">Paste Key & Search</h3>
                        <p>Copy your key and paste it into the LeadEngine settings below. You're ready to extract live leads instantly!</p>
                    </div>
                </div>
            </div>
            <div class="p-4 border-t border-slate-800 bg-slate-850 flex justify-end">
                <button onclick="closeGuide(); openSettings();" class="px-5 py-2 rounded-lg font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors">I have my key</button>
            </div>
        </div>
    </div>

    `;
html = html.replace(guideStr, newGuide);


// Javascript replacement
const logicStart = html.indexOf('/**\n         * Google Maps API Logic');
const logicEnd = html.indexOf('/**\n         * Rendering & Filtering');

const logicStr = html.substring(logicStart, logicEnd);

const newLogic = `/**
         * SerpApi Search Engine Controller
         */
        let isSearching = false;
        const delay = ms => new Promise(res => setTimeout(res, ms));

        function getDemoLeads(niche, location) {
            return [
                {
                    id: 'demo1',
                    name: \`Elite \${niche} Solutions\`,
                    category: niche,
                    phone: '(555) 123-4567',
                    website: null,
                    rating: 4.8,
                    reviews: 112,
                    address: \`123 Main St, \${location}\`,
                    gap: 'NO WEBSITE FOUND',
                    gapType: 'website'
                },
                {
                    id: 'demo2',
                    name: \`Local \${niche} Experts\`,
                    category: niche,
                    phone: '(555) 987-6543',
                    website: 'local-experts-example.com',
                    rating: 3.2,
                    reviews: 14,
                    address: \`456 Elm St, \${location}\`,
                    gap: 'LOW RATING (< 4.0)',
                    gapType: 'reputation'
                },
                {
                    id: 'demo3',
                    name: \`Premium \${niche} Group\`,
                    category: niche,
                    phone: '(555) 555-5555',
                    website: 'premium-group-example.com',
                    rating: 4.9,
                    reviews: 450,
                    address: \`789 Oak Ave, \${location}\`,
                    gap: 'VERIFIED LEAD',
                    gapType: 'verified'
                }
            ];
        }

        async function handleSearch() {
            if (isSearching) return;
            const niche = document.getElementById('input-niche').value.trim();
            const location = document.getElementById('input-location').value.trim();
            
            if(!niche || !location) {
                showToast('Please enter both a niche and a location.', 'alert');
                return;
            }

            isSearching = true;
            state.currentCategory = niche;
            
            const btn = document.getElementById('btn-search');
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Searching...';
            btn.disabled = true;
            
            document.getElementById('empty-state').classList.add('hidden');
            document.getElementById('leads-grid').classList.add('hidden');
            document.getElementById('load-more-container').classList.add('hidden');
            
            document.getElementById('loading-state').classList.remove('hidden');
            document.getElementById('loading-state').classList.add('grid');

            try {
                const apiKey = state.settings.apiKey;
                let newLeads = [];

                if (!apiKey) {
                    showToast('Demo Mode: No SerpApi Key found. Showing sample data.', 'alert');
                    await delay(1500); // Simulate network
                    newLeads = getDemoLeads(niche, location);
                } else {
                    const query = \`\${niche} in \${location}\`;
                    const url = \`https://serpapi.com/search.json?engine=google_maps&q=\${encodeURIComponent(query)}&type=search&api_key=\${apiKey}\`;
                    // Using corsproxy.io as a transparent bridge to avoid browser CORS blocks
                    const proxyUrl = \`https://corsproxy.io/?\${encodeURIComponent(url)}\`;
                    
                    const response = await fetch(proxyUrl);
                    if (!response.ok) throw new Error(\`HTTP error! status: \${response.status}\`);
                    
                    const data = await response.json();
                    if (data.error) throw new Error(data.error);
                    
                    const localResults = data.local_results || [];
                    
                    newLeads = localResults.map(place => {
                        const rating = place.rating || 0;
                        const reviews = place.reviews || 0;
                        const hasWebsite = !!place.website;
                        
                        let gap = 'VERIFIED LEAD';
                        let gapType = 'verified';
                        
                        if (!hasWebsite) {
                            gap = 'NO WEBSITE FOUND';
                            gapType = 'website';
                        } else if (rating > 0 && rating < 4.0) {
                            gap = 'LOW RATING (< 4.0)';
                            gapType = 'reputation';
                        }
                        
                        return {
                            id: place.place_id || Math.random().toString(36).substr(2, 9),
                            name: place.title || 'Unknown Business',
                            category: niche,
                            phone: place.phone || '',
                            website: place.website ? place.website.replace(/^https?:\\/\\//, '').replace(/\\/$/, '') : null,
                            rating: rating,
                            reviews: reviews,
                            address: place.address || '',
                            gap: gap,
                            gapType: gapType
                        };
                    });
                }

                state.leads = newLeads;
                saveState();
                renderLeads();
                
                showToast(\`Loaded \${newLeads.length} leads successfully.\`);
                
            } catch (err) {
                console.error(err);
                showToast(\`Search failed: \${err.message}\`, 'error');
                
                document.getElementById('loading-state').classList.add('hidden');
                document.getElementById('loading-state').classList.remove('grid');
                document.getElementById('empty-state').classList.remove('hidden');
                document.getElementById('empty-title').innerText = "Search Failed";
                document.getElementById('empty-desc').innerHTML = \`Error: \${err.message}. Please check your SerpApi Key and try again.\`;
            } finally {
                isSearching = false;
                btn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> <span>Find Live Leads</span>';
                btn.disabled = false;
            }
        }
        
        function handleLoadMore() {
            // Placeholder: SerpApi pagination requires extracting next_page token
            showToast('Pagination requires SerpApi next page token processing (Advanced).', 'alert');
        }

        `;
        
html = html.replace(logicStr, newLogic);
fs.writeFileSync('index.html', html);
console.log("Done");
