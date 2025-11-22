const NETLIFY_TOKEN = 'nfp_XfaUrWiqvkP3wgZYGYXmiRSjZPfzUP6e0342';

async function checkStatus() {
    try {
        // Get all sites to find our new one
        const sitesRes = await fetch('https://api.netlify.com/api/v1/sites', {
            headers: { 'Authorization': `Bearer ${NETLIFY_TOKEN}` }
        });
        const sites = await sitesRes.json();

        // Find tradesnap site
        const site = sites.find(s => s.name.includes('tradesnap'));

        if (!site) {
            console.log('Site not found!');
            return;
        }

        console.log(`Site: ${site.name}.netlify.app`);
        console.log(`URL: ${site.url}`);

        // Get latest deploy
        const deploysRes = await fetch(`https://api.netlify.com/api/v1/sites/${site.id}/deploys`, {
            headers: { 'Authorization': `Bearer ${NETLIFY_TOKEN}` }
        });
        const deploys = await deploysRes.json();

        if (deploys.length > 0) {
            const latest = deploys[0];
            console.log(`\nLatest Deploy:`);
            console.log(`  State: ${latest.state}`);
            console.log(`  Created: ${latest.created_at}`);
            if (latest.error_message) {
                console.log(`  Error: ${latest.error_message}`);
            }
            if (latest.state === 'ready') {
                console.log(`\n✅ SITE IS LIVE!`);
            } else if (latest.state === 'building' || latest.state === 'enqueued') {
                console.log(`\n⏳ Build in progress...`);
            }
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkStatus();
