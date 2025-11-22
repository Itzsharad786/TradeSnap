const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 TradeSnap Netlify Deployment Script\n');

// Step 1: Verify dist folder exists
const distPath = path.join(__dirname, 'dist');
const fs = require('fs');

if (!fs.existsSync(distPath)) {
    console.error('❌ Error: dist folder not found!');
    console.log('Running npm run build first...\n');
    execSync('npm run build', { stdio: 'inherit' });
}

console.log('✅ dist folder verified\n');

// Step 2: Deploy to Netlify
console.log('📦 Deploying to Netlify...\n');
console.log('This will:');
console.log('1. Upload your dist folder to Netlify');
console.log('2. Generate a live URL for your site');
console.log('3. You can claim this site in your Netlify dashboard\n');

try {
    // Deploy the dist folder
    console.log('Running: netlify deploy --dir=dist --prod\n');
    execSync('netlify deploy --dir=dist --prod', { stdio: 'inherit' });

    console.log('\n✅ Deployment successful!');
    console.log('\n📋 Next steps:');
    console.log('1. Copy the "Website URL" shown above');
    console.log('2. Visit that URL to see your live site');
    console.log('3. Log into https://app.netlify.com to claim and manage your site');

} catch (error) {
    console.error('\n❌ Deployment failed!');
    console.error('Error:', error.message);
    console.log('\n💡 You may need to:');
    console.log('1. Run: netlify login');
    console.log('2. Then try this script again');
    process.exit(1);
}
