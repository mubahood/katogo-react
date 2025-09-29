#!/bin/bash

# Production Build Script for BlitXpress
# This script optimizes and builds the project for production deployment

echo "🚀 Starting BlitXpress Production Build..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# 1. Clean previous builds
print_status "Cleaning previous builds..."
rm -rf dist/
rm -rf build/
print_success "Previous builds cleaned"

# 2. Install dependencies (production only)
print_status "Installing production dependencies..."
npm ci --only=production
print_success "Dependencies installed"

# 3. Run security audit
print_status "Running security audit..."
npm audit --audit-level moderate
if [ $? -ne 0 ]; then
    print_warning "Security vulnerabilities found. Consider running 'npm audit fix'"
fi

# 4. Run tests
print_status "Running tests..."
npm run test -- --watchAll=false --coverage
if [ $? -ne 0 ]; then
    print_error "Tests failed. Aborting build."
    exit 1
fi
print_success "All tests passed"

# 5. Type checking
print_status "Running TypeScript type checking..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
    print_error "TypeScript errors found. Aborting build."
    exit 1
fi
print_success "TypeScript check passed"

# 6. Lint code
print_status "Running ESLint..."
npm run lint
if [ $? -ne 0 ]; then
    print_warning "Linting issues found. Consider fixing them."
fi

# 7. Build for production
print_status "Building for production..."
export NODE_ENV=production
npm run build

if [ $? -ne 0 ]; then
    print_error "Build failed!"
    exit 1
fi
print_success "Production build completed"

# 8. Analyze bundle size
print_status "Analyzing bundle size..."
if command -v npx &> /dev/null; then
    npx bundlesize
fi

# 9. Generate build report
print_status "Generating build report..."
BUILD_DIR="dist"
if [ -d "$BUILD_DIR" ]; then
    echo "📊 Build Analysis Report" > build-report.txt
    echo "========================" >> build-report.txt
    echo "Build Date: $(date)" >> build-report.txt
    echo "Build Size: $(du -sh $BUILD_DIR | cut -f1)" >> build-report.txt
    echo "" >> build-report.txt
    
    echo "📁 File Breakdown:" >> build-report.txt
    find $BUILD_DIR -name "*.js" -exec ls -lh {} \; | awk '{print $9 " - " $5}' >> build-report.txt
    find $BUILD_DIR -name "*.css" -exec ls -lh {} \; | awk '{print $9 " - " $5}' >> build-report.txt
    
    print_success "Build report generated: build-report.txt"
fi

# 10. Performance audit (if lighthouse-ci is available)
print_status "Running performance audit..."
if command -v lhci &> /dev/null; then
    lhci autorun
else
    print_warning "Lighthouse CI not found. Install with: npm install -g @lhci/cli"
fi

# 11. Create deployment package
print_status "Creating deployment package..."
tar -czf blitxpress-production-$(date +%Y%m%d-%H%M%S).tar.gz $BUILD_DIR/
print_success "Deployment package created"

# 12. Validate build
print_status "Validating build..."
if [ -f "$BUILD_DIR/index.html" ]; then
    print_success "Build validation passed"
    
    echo ""
    echo "🎉 Production build completed successfully!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Review build-report.txt for optimization opportunities"
    echo "2. Test the build locally: npx serve dist"
    echo "3. Deploy the contents of '$BUILD_DIR' to your web server"
    echo "4. Configure security headers (see SECURITY_CONFIG.ts)"
    echo "5. Set up monitoring and analytics"
    echo ""
    echo "🔧 Deployment Checklist:"
    echo "□ Update Google Analytics ID in production"
    echo "□ Configure security headers"
    echo "□ Set up HTTPS and SSL certificates"
    echo "□ Configure CDN if needed"
    echo "□ Set up error monitoring"
    echo "□ Configure backup strategy"
    echo ""
else
    print_error "Build validation failed - index.html not found"
    exit 1
fi

# 13. Optional: Deploy to staging
read -p "Deploy to staging environment? (y/N): " deploy_staging
if [[ $deploy_staging =~ ^[Yy]$ ]]; then
    print_status "Deploying to staging..."
    # Add your staging deployment commands here
    # Example: rsync -avz dist/ user@staging-server:/var/www/html/
    print_warning "Staging deployment not configured. Add your deployment commands to this script."
fi

print_success "🚀 Production build process completed!"