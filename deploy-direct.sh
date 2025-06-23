#!/bin/bash

# Direct deployment script - tries multiple FTP servers
echo "🚀 Attempting direct deployment to Hostinger..."

# Common Hostinger FTP servers
FTP_SERVERS=(
    "ftp.aiworkflows.at"
    "aiworkflows.at"
    "srv1.aiworkflows.at"
    "files.aiworkflows.at"
)

# Test each server
for server in "${FTP_SERVERS[@]}"; do
    echo "🔍 Testing FTP server: $server"
    
    # Try to connect and list directory
    timeout 10 curl -v ftp://$server/ --user "aiworkflows:password" 2>&1 | grep -E "(Connected|Access denied|Login|Directory|230|530)" | head -5
    
    echo "---"
done

echo ""
echo "📋 FTP Info Summary:"
echo "Domain: aiworkflows.at"
echo "Typical FTP servers for Hostinger:"
echo "- ftp.aiworkflows.at"
echo "- Domain name directly"
echo "- IP address from hosting panel"
echo ""
echo "🔧 To complete deployment:"
echo "1. Get FTP credentials from Hostinger hPanel"
echo "2. Use File Manager or FTP client"
echo "3. Upload deployment/pushup-panic/ to public_html/"
echo ""
echo "📦 Files ready in: deployment/pushup-panic/"
echo "🌐 Target URL: https://aiworkflows.at/pushup-panic/"