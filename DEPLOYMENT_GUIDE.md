# 🚀 BlitXpress Production Deployment Guide

This guide covers the complete deployment process for BlitXpress e-commerce application to production.

## 📋 Pre-Deployment Checklist

### High Priority (Must Complete)
- [x] ✅ Production API endpoint configured (`https://blit.blitxpress.com`)
- [x] ✅ Error boundary implemented for production error handling
- [x] ✅ Analytics service ready (Google Analytics 4)
- [x] ✅ Performance monitoring implemented
- [x] ✅ Production configuration optimized
- [ ] 🔄 Security headers configured
- [ ] 🔄 SSL certificate installed
- [ ] 🔄 Environment variables set
- [ ] 🔄 Google Analytics ID updated

### Medium Priority (Recommended)
- [ ] Performance testing completed
- [ ] Cross-browser testing done
- [ ] Mobile responsiveness verified
- [ ] CDN configuration (optional)
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting set up

### Low Priority (Nice to Have)
- [ ] Progressive Web App features
- [ ] Service worker for offline functionality
- [ ] Advanced caching strategies
- [ ] A/B testing setup

## 🛠️ Build Process

### 1. Production Build
```bash
# Run the automated production build
./build-production.sh

# Or manually:
npm ci --only=production
npm run build
```

### 2. Build Verification
```bash
# Test the build locally
npx serve dist

# Check build size
du -sh dist/

# Verify all assets are generated
ls -la dist/
```

## 🔧 Environment Configuration

### 1. Create Production Environment File
Create `.env.production`:
```env
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
```

### 2. Update Google Analytics
1. Create a new GA4 property for production
2. Update `AnalyticsService.ts` with production tracking ID
3. Verify tracking is working

## 🔒 Security Configuration

### 1. Web Server Configuration

#### Nginx Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name blitxpress.com www.blitxpress.com;

    # SSL Configuration
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Frame-Options "DENY" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # CSP Header
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https://blit.blitxpress.com; connect-src 'self' https://blit.blitxpress.com https://pesapal.com;" always;

    # Compression
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
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name blitxpress.com www.blitxpress.com;
    return 301 https://$server_name$request_uri;
}
```

#### Apache .htaccess
```apache
# Security Headers
<IfModule mod_headers.c>
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set X-Frame-Options "DENY"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# HTTPS Redirect
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
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
```

## 📁 Deployment Steps

### 1. File Upload
```bash
# Using rsync (recommended)
rsync -avz --delete dist/ user@your-server:/var/www/html/

# Using SCP
scp -r dist/* user@your-server:/var/www/html/

# Using FTP/SFTP
# Upload all files from dist/ to your web root
```

### 2. File Permissions
```bash
# Set correct permissions on server
sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/
```

### 3. SSL Certificate
```bash
# Using Let's Encrypt (recommended)
sudo certbot --nginx -d blitxpress.com -d www.blitxpress.com

# Or install your purchased SSL certificate
```

## 📊 Monitoring and Analytics

### 1. Google Analytics Setup
1. Create GA4 property
2. Add tracking code to production
3. Set up conversion goals
4. Configure ecommerce tracking

### 2. Performance Monitoring
- **Core Web Vitals**: Automatically tracked
- **Page Load Times**: Monitored via PerformanceService
- **API Response Times**: Tracked for all API calls
- **Error Rates**: Captured via ErrorBoundary

### 3. Error Monitoring
- **JavaScript Errors**: Caught by ErrorBoundary
- **API Errors**: Logged via analytics
- **Performance Issues**: Tracked and reported

## 🧪 Testing in Production

### 1. Smoke Testing
```bash
# Test key functionality
curl -I https://blitxpress.com
curl -I https://blitxpress.com/api/health

# Test core pages
curl https://blitxpress.com/
curl https://blitxpress.com/products
curl https://blitxpress.com/cart
```

### 2. Performance Testing
```bash
# Using Lighthouse
npx lighthouse https://blitxpress.com --view

# Using PageSpeed Insights
# Visit: https://pagespeed.web.dev/
```

### 3. Security Testing
```bash
# SSL Test
https://www.ssllabs.com/ssltest/analyze.html?d=blitxpress.com

# Security Headers Test
https://securityheaders.com/?q=blitxpress.com
```

## 🔄 Continuous Deployment

### 1. GitHub Actions (Optional)
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - name: Deploy
        run: |
          # Your deployment commands here
```

## 📈 Post-Deployment

### 1. Monitoring Setup
- Set up uptime monitoring
- Configure performance alerts
- Monitor error rates
- Track conversion metrics

### 2. Backup Strategy
- Daily automated backups
- Database backup procedures
- Recovery testing

### 3. Maintenance Schedule
- Regular security updates
- Performance optimizations
- Content updates
- Feature releases

## 🚨 Troubleshooting

### Common Issues
1. **White Screen**: Check console for JavaScript errors
2. **API Errors**: Verify CORS settings and API endpoints
3. **Slow Loading**: Check bundle size and enable compression
4. **SSL Issues**: Verify certificate installation and configuration

### Performance Optimization
1. **Bundle Analysis**: Use `npm run analyze` to check bundle size
2. **Image Optimization**: Compress images and use modern formats
3. **CDN Setup**: Consider using a CDN for static assets
4. **Caching Strategy**: Implement proper cache headers

## 📞 Support

For deployment issues or questions:
- Check the error logs on your server
- Review the browser console for client-side errors
- Monitor analytics for user behavior insights
- Use the ErrorBoundary logs for debugging

---

## 🎉 Deployment Complete!

Once deployed, your BlitXpress e-commerce application will be running in production with:
- ✅ Production-optimized build
- ✅ Security headers configured
- ✅ Analytics and monitoring active
- ✅ Error handling and reporting
- ✅ Performance tracking
- ✅ SEO optimization complete

Monitor the application closely for the first 24-48 hours to ensure everything is working correctly.