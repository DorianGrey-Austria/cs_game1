#!/bin/bash
# PushUp Panic Deployment Script für Hostinger

echo "🚀 Preparing PushUp Panic for deployment..."

# Create deployment directory
mkdir -p deployment/pushup-panic

# Copy production files
cp index-production.html deployment/pushup-panic/index.html
cp styles.css deployment/pushup-panic/
cp sw.js deployment/pushup-panic/

# Copy JS files
mkdir -p deployment/pushup-panic/js
cp js/*.js deployment/pushup-panic/js/

# Copy assets
mkdir -p deployment/pushup-panic/assets
cp -r assets/* deployment/pushup-panic/assets/

# Create .htaccess for proper routing and HTTPS
cat > deployment/pushup-panic/.htaccess << 'EOF'
# Force HTTPS for webcam functionality
RewriteEngine On
RewriteCond %{HTTPS} !=on
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Enable compression
<ifModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</ifModule>

# Set cache headers
<ifModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
</ifModule>

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"

# MIME types for game assets
AddType application/javascript .js
AddType text/css .css
AddType image/png .png
EOF

# Create README for deployment
cat > deployment/README.md << 'EOF'
# PushUp Panic - Deployment Files

## Upload Instructions:

1. **Via Hostinger File Manager:**
   - Login to Hostinger Dashboard
   - Go to File Manager
   - Navigate to public_html/
   - Create folder: pushup-panic/
   - Upload all files from this deployment folder

2. **Via FTP:**
   - Connect to your FTP
   - Navigate to public_html/
   - Upload the entire pushup-panic/ folder

3. **Access Game:**
   - Visit: https://aiworkflows.at/pushup-panic/
   - Allow webcam access when prompted
   - Game requires HTTPS for webcam functionality

## Requirements:
- HTTPS enabled (required for webcam)
- Modern browser (Chrome/Firefox recommended)
- Webcam access permission

## Features:
- AI Pose Detection with TensorFlow.js
- Real-time collision detection
- Supabase highscore system
- Progressive difficulty
- Responsive design
EOF

echo "✅ Deployment files prepared in deployment/pushup-panic/"
echo "📁 Ready to upload to aiworkflows.at"
echo ""
echo "Next steps:"
echo "1. Go to Hostinger File Manager"
echo "2. Upload deployment/pushup-panic/ to public_html/"
echo "3. Access at https://aiworkflows.at/pushup-panic/"