const NETLIFY_TOKEN = 'nfp_XfaUrWiqvkP3wgZYGYXmiRSjZPfzUP6e0342';

async function checkStatus() {
    try {
        const sitesRes = await fetch('https://api.netlify.com/api/v1/sites', {
            headers: { 'Authorization': `Bearer ${NETLIFY_TOKEN}` }
        });
        const sites = await sitesRes.json();
        const site = sites.find(s => s.name.includes('tradesnap'));

        if (!site) {
            console.log('Site not found!');
            return;
        }

        console.log(`Site: ${site.name}.netlify.app`);
        console.log(`Site ID: ${site.id}\n`);

        const deploysRes = await fetch(`https://api.netlify.com/api/v1/sites/${site.id}/deploys`, {
            headers: { 'Authorization': `Bearer ${NETLIFY_TOKEN}` }
        });
        const deploys = await deploysRes.json();

        if (deploys.length > 0) {
            const latest = deploys[0];
            console.log(`Latest Deploy:`);
            console.log(`  ID: ${latest.id}`);
            console.log(`  State: ${latest.state}`);
            console.log(`  Created: ${latest.created_at}`);
            console.log(`  Context: ${latest.context}`);

            if (latest.error_message) {
                console.log(`\n❌ Error: ${latest.error_message}`);
            }

            if (latest.state === 'ready') {
                console.log(`\n✅ SITE IS LIVE!`);
                console.log(`🌐 URL: https://${site.name}.netlify.app`);
            } else if (latest.state === 'building' || latest.state === 'enqueued') {
                console.log(`\n⏳ Build in progress...`);
            } else if (latest.state === 'error') {
                console.log(`\n❌ Build failed!`);
                console.log(`Check logs at: ${latest.admin_url}`);
            }
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkStatus();
