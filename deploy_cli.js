const fs = require('fs');
const path = require('path');
const https = require('https');

const NETLIFY_TOKEN = 'nfp_XfaUrWiqvkP3wgZYGYXmiRSjZPfzUP6e0342';
const SITE_NAME = 'tradesnap-live';

async function deployToNetlify() {
    try {
        console.log('=== DEPLOYING TO NETLIFY ===\n');

        // Get site ID
        const sitesRes = await fetch('https://api.netlify.com/api/v1/sites', {
            headers: { 'Authorization': `Bearer ${NETLIFY_TOKEN}` }
        });
        const sites = await sitesRes.json();
        const site = sites.find(s => s.name === SITE_NAME);

        if (!site) {
            console.log('❌ Site not found!');
            return;
        }

        console.log(`Deploying to: ${site.name}.netlify.app`);
        console.log(`Site ID: ${site.id}\n`);

        // Use netlify-cli via npx
        console.log('Installing and running Netlify CLI...');
        console.log('This will deploy the dist folder directly.\n');

        // We'll use the command line for this
        console.log('Run this command:');
        console.log(`npx netlify-cli deploy --prod --dir=dist --site=${site.id} --auth=${NETLIFY_TOKEN}`);

    } catch (err) {
        console.error('Error:', err.message);
    }
}

deployToNetlify();
