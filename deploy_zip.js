import fs from 'fs';

const NETLIFY_TOKEN = 'nfp_XfaUrWiqvkP3wgZYGYXmiRSjZPfzUP6e0342';
const SITE_ID = 'ee61bbfc-97bf-43e3-917a-0a05a6f2cfbf';

async function deployZip() {
    try {
        console.log('=== DEPLOYING ZIP TO NETLIFY ===\n');

        const zipData = fs.readFileSync('deploy.zip');
        console.log(`Zip file size: ${(zipData.length / 1024 / 1024).toFixed(2)} MB\n`);

        console.log('Uploading to Netlify...');

        const response = await fetch(`https://api.netlify.com/api/v1/sites/${SITE_ID}/deploys`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NETLIFY_TOKEN}`,
                'Content-Type': 'application/zip'
            },
            body: zipData
        });

        if (response.ok) {
            const deploy = await response.json();
            console.log('✅ Deploy successful!');
            console.log(`\nDeploy ID: ${deploy.id}`);
            console.log(`State: ${deploy.state}`);
            console.log(`\n🚀 Your site is live at: ${deploy.deploy_ssl_url || deploy.url}`);
            console.log(`📊 Admin URL: ${deploy.admin_url}`);
        } else {
            const error = await response.text();
            console.log(`❌ Deploy failed: ${response.status}`);
            console.log(error);
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

deployZip();
