const fs = require('fs');

// Read the credentials file
const credentialsPath = './credentials.json';

if (!fs.existsSync(credentialsPath)) {
    console.error('❌ credentials.json file not found!');
    console.log('Please download your Google service account JSON file and save it as credentials.json');
    process.exit(1);
}

try {
    // Read and parse the JSON
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    
    // Minify the JSON (remove all whitespace and newlines)
    const minifiedJson = JSON.stringify(credentials);
    
    console.log('✅ Credentials formatted successfully!');
    console.log('\n📋 Copy this for your GOOGLE_APPLICATION_CREDENTIALS environment variable:');
    console.log('='.repeat(80));
    console.log(minifiedJson);
    console.log('='.repeat(80));
    console.log('\n💡 Instructions:');
    console.log('1. Copy the JSON above (the entire line)');
    console.log('2. Go to your Render service settings');
    console.log('3. Add environment variable: GOOGLE_APPLICATION_CREDENTIALS');
    console.log('4. Paste the JSON as the value');
    console.log('5. Save and redeploy!');
    
} catch (error) {
    console.error('❌ Error processing credentials:', error.message);
    process.exit(1);
} 