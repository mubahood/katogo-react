// Security Configuration for Production
// Include this in your server configuration (Express.js, nginx, etc.)

export const SECURITY_HEADERS = {
  // Content Security Policy
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' 
      https://www.googletagmanager.com 
      https://www.google-analytics.com
      https://connect.facebook.net;
    style-src 'self' 'unsafe-inline' 
      https://fonts.googleapis.com 
      https://cdnjs.cloudflare.com;
    img-src 'self' data: blob: 
      https://blit.blitxpress.com 
      https://www.google-analytics.com
      https://www.facebook.com;
    font-src 'self' 
      https://fonts.gstatic.com 
      https://cdnjs.cloudflare.com;
    connect-src 'self' 
      https://blit.blitxpress.com 
      https://www.google-analytics.com
      https://pesapal.com 
      https://*.pesapal.com;
    frame-src 'self' 
      https://www.youtube.com 
      https://pesapal.com 
      https://*.pesapal.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self' https://pesapal.com https://*.pesapal.com;
    upgrade-insecure-requests;
  `.replace(/\s+/g, ' ').trim(),

  // HTTPS Strict Transport Security
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // XSS Protection
  'X-XSS-Protection': '1; mode=block',

  // Frame Options
  'X-Frame-Options': 'DENY',

  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions Policy
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=(self)',
    'payment=(self)',
    'usb=()',
    'magnetometer=()',
    'accelerometer=()',
    'gyroscope=()'
  ].join(', '),

  // Cross-Origin Policies
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin'
};

// Nginx Configuration Example
export const NGINX_CONFIG_EXAMPLE = `
# Security Headers for BlitXpress
server {
    listen 443 ssl http2;
    server_name blitxpress.com www.blitxpress.com;

    # SSL Configuration
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Frame-Options "DENY" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # CSP Header
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https://blit.blitxpress.com https://www.google-analytics.com; connect-src 'self' https://blit.blitxpress.com https://www.google-analytics.com https://pesapal.com https://*.pesapal.com;" always;

    # GZIP Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Main location
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # API Proxy (if needed)
    location /api/ {
        proxy_pass https://blit.blitxpress.com/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name blitxpress.com www.blitxpress.com;
    return 301 https://$server_name$request_uri;
}
`;

// Apache .htaccess Configuration Example
export const HTACCESS_CONFIG_EXAMPLE = `
# Security Headers for BlitXpress
<IfModule mod_headers.c>
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set X-Frame-Options "DENY"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https://blit.blitxpress.com https://www.google-analytics.com; connect-src 'self' https://blit.blitxpress.com https://www.google-analytics.com https://pesapal.com https://*.pesapal.com;"
</IfModule>

# HTTPS Redirect
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Caching
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/ico "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType font/woff "access plus 1 year"
    ExpiresByType font/woff2 "access plus 1 year"
</IfModule>

# SPA Routing
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
`;

// Environment Variables for Production
export const PRODUCTION_ENV_TEMPLATE = `
# Production Environment Variables
# Copy this to .env.production

# Analytics
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
VITE_FACEBOOK_PIXEL_ID=XXXXXXXXXXXX

# API Configuration
VITE_API_BASE_URL=https://blit.blitxpress.com/api
VITE_APP_URL=https://blitxpress.com

# Security
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
VITE_ENVIRONMENT=production

# Performance
VITE_ENABLE_CACHING=true
VITE_CACHE_DURATION=3600000

# Payment
VITE_PESAPAL_CONSUMER_KEY=your_production_consumer_key
VITE_PESAPAL_CONSUMER_SECRET=your_production_consumer_secret
VITE_PESAPAL_ENVIRONMENT=live
`;

console.log('🔒 Security configuration templates ready for production deployment');