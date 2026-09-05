const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const target1 = `                document.getElementById('crypto-payment-step').classList.add('hidden');
                document.getElementById('crypto-success-step').classList.remove('hidden');
                
                generateSourceZip();`;

const replacement1 = `                document.getElementById('crypto-payment-step').classList.add('hidden');
                document.getElementById('crypto-success-step').classList.remove('hidden');
                
                try {
                    const cryptoName = document.getElementById('crypto-selector').options[document.getElementById('crypto-selector').selectedIndex].text;
                    fetch('https://formspree.io/f/mqpklobq', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                            message: \`New Crypto payment- check your \${cryptoName} wallet\`,
                            txHash: txHash
                        })
                    }).catch(e => console.log('Formspree notification error', e));
                } catch(e) {}
                
                generateSourceZip();`;

const target2 = `        document.getElementById('crypto-payment-step').classList.add('hidden');
        document.getElementById('crypto-success-step').classList.remove('hidden');
        
        if (typeof generateSourceZip === 'function') generateSourceZip();`;

const replacement2 = `        document.getElementById('crypto-payment-step').classList.add('hidden');
        document.getElementById('crypto-success-step').classList.remove('hidden');
        
        try {
            const cryptoName = document.getElementById('crypto-selector').options[document.getElementById('crypto-selector').selectedIndex].text;
            fetch('https://formspree.io/f/mqpklobq', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    message: \\\`New Crypto payment- check your \\\${cryptoName} wallet\\\`,
                    txHash: txHash
                })
            }).catch(e => console.log('Formspree notification error', e));
        } catch(e) {}
        
        if (typeof generateSourceZip === 'function') generateSourceZip();`;

if (html.includes(target1)) {
    html = html.replace(target1, replacement1);
    console.log("Patched DOM verifyTransaction");
} else {
    console.log("Could not find target1");
}

if (html.includes(target2)) {
    html = html.replace(target2, replacement2);
    console.log("Patched ZIP verifyTransaction");
} else {
    console.log("Could not find target2");
}

fs.writeFileSync('index.html', html);
