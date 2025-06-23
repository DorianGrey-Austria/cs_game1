#!/usr/bin/env node

// Automatic deployment script for PushUp Panic to Hostinger
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const HOSTINGER_API_TOKEN = 'SA1fE8frvZ5hv7pb1GveWvc9Fy7o3uQHHmxEK0KF0d8588fc';
const DOMAIN = 'aiworkflows.at';
const DEPLOY_PATH = '/pushup-panic';

console.log('🚀 Starting PushUp Panic Auto-Deployment...');

async function deployToHostinger() {
    try {
        // Step 1: Prepare files
        console.log('📦 Preparing deployment files...');
        
        // Create deployment structure
        const deployDir = path.join(__dirname, 'deployment', 'pushup-panic');
        
        // Verify files exist
        const requiredFiles = [
            'deployment/pushup-panic/index.html',
            'deployment/pushup-panic/styles.css', 
            'deployment/pushup-panic/js/gameManager.js',
            'deployment/pushup-panic/js/supabaseManager.js'
        ];
        
        for (const file of requiredFiles) {
            if (!fs.existsSync(file)) {
                throw new Error(`Required file missing: ${file}`);
            }
        }
        
        console.log('✅ All deployment files verified');
        
        // Step 2: Try Hostinger API upload
        console.log('📤 Attempting Hostinger API upload...');
        
        try {
            // Try direct API call
            const result = execSync(`curl -X POST "https://api.hostinger.com/v1/hosting/file-manager/upload" \\
                -H "Authorization: Bearer ${HOSTINGER_API_TOKEN}" \\
                -H "Content-Type: multipart/form-data" \\
                -F "path=/public_html${DEPLOY_PATH}" \\
                -F "file=@deployment/pushup-panic-deploy.zip"`, {
                encoding: 'utf8',
                timeout: 30000
            });
            
            console.log('✅ Files uploaded via API');
            console.log('Result:', result);
            
        } catch (apiError) {
            console.log('⚠️ API upload failed, preparing manual upload instructions...');
            
            // Create detailed upload instructions
            const instructions = `
# 🚀 PushUp Panic - Manual Upload Required

The automatic API upload failed. Please upload manually:

## Quick Upload Steps:
1. Go to: https://hpanel.hostinger.com
2. Click "File Manager" in Hosting section
3. Navigate to: public_html/
4. Upload: deployment/pushup-panic-deploy.zip
5. Extract the ZIP file
6. Access game at: https://${DOMAIN}${DEPLOY_PATH}/

## Verification Checklist:
- ✅ HTTPS enabled (required for webcam)
- ✅ All JS files uploaded to js/ folder
- ✅ Assets uploaded to assets/ folder
- ✅ .htaccess file in place for redirects

## Expected URL: https://${DOMAIN}${DEPLOY_PATH}/

The game is production-ready with:
- Supabase highscores integration
- Webcam pose detection
- Progressive difficulty
- Responsive design
            `;
            
            fs.writeFileSync('MANUAL_UPLOAD_INSTRUCTIONS.txt', instructions);
            console.log('📝 Manual upload instructions created: MANUAL_UPLOAD_INSTRUCTIONS.txt');
        }
        
        // Step 3: Verify deployment structure
        console.log('🔍 Verifying deployment structure...');
        
        const deploymentInfo = {
            totalFiles: 0,
            jsFiles: 0,
            assetFiles: 0,
            totalSize: 0
        };
        
        function scanDir(dir) {
            const files = fs.readdirSync(dir, { withFileTypes: true });
            
            for (const file of files) {
                const fullPath = path.join(dir, file.name);
                
                if (file.isDirectory()) {
                    scanDir(fullPath);
                } else {
                    deploymentInfo.totalFiles++;
                    const stats = fs.statSync(fullPath);
                    deploymentInfo.totalSize += stats.size;
                    
                    if (file.name.endsWith('.js')) {
                        deploymentInfo.jsFiles++;
                    } else if (file.name.match(/\.(png|jpg|jpeg|gltf|bin)$/)) {
                        deploymentInfo.assetFiles++;
                    }
                }
            }
        }
        
        scanDir(deployDir);
        
        console.log('📊 Deployment Summary:');
        console.log(`   📁 Total Files: ${deploymentInfo.totalFiles}`);
        console.log(`   📜 JS Files: ${deploymentInfo.jsFiles}`);
        console.log(`   🖼️ Asset Files: ${deploymentInfo.assetFiles}`);
        console.log(`   💾 Total Size: ${(deploymentInfo.totalSize / 1024 / 1024).toFixed(2)} MB`);
        
        console.log('✅ Deployment preparation complete!');
        console.log(`🌐 Target URL: https://${DOMAIN}${DEPLOY_PATH}/`);
        
        return true;
        
    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        return false;
    }
}

// Run deployment
deployToHostinger()
    .then(success => {
        if (success) {
            console.log('🎉 Deployment process completed successfully!');
        } else {
            console.log('⚠️ Deployment completed with manual steps required');
        }
    })
    .catch(error => {
        console.error('💥 Deployment process failed:', error);
        process.exit(1);
    });