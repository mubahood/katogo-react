#!/bin/bash

# PWA Icon Generator Script
# Generates all required PWA icons from a source image

echo "🎨 UgFlix PWA Icon Generator"
echo "================================"
echo ""

# Check if source image is provided
if [ -z "$1" ]; then
    echo "❌ Error: No source image provided"
    echo ""
    echo "Usage: ./generate-icons.sh <source-image>"
    echo "Example: ./generate-icons.sh logo.png"
    echo ""
    echo "Requirements:"
    echo "  - Source image should be at least 512x512px"
    echo "  - PNG format recommended"
    echo "  - ImageMagick must be installed (brew install imagemagick)"
    exit 1
fi

SOURCE_IMAGE=$1
OUTPUT_DIR="public/icons"

# Check if source image exists
if [ ! -f "$SOURCE_IMAGE" ]; then
    echo "❌ Error: Source image '$SOURCE_IMAGE' not found"
    exit 1
fi

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ Error: ImageMagick is not installed"
    echo ""
    echo "Install with: brew install imagemagick"
    exit 1
fi

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

echo "📁 Source: $SOURCE_IMAGE"
echo "📂 Output: $OUTPUT_DIR"
echo ""

# Icon sizes for PWA
sizes=(72 96 128 144 152 192 384 512)

echo "🔨 Generating icons..."
echo ""

for size in "${sizes[@]}"; do
    output_file="$OUTPUT_DIR/icon-${size}x${size}.png"
    echo "  ⚙️  Creating ${size}x${size}..."
    
    convert "$SOURCE_IMAGE" \
        -resize ${size}x${size} \
        -gravity center \
        -extent ${size}x${size} \
        "$output_file"
    
    if [ $? -eq 0 ]; then
        echo "  ✅ Generated: $output_file"
    else
        echo "  ❌ Failed: $output_file"
    fi
done

echo ""
echo "✨ Icon generation complete!"
echo ""
echo "📋 Generated files:"
ls -lh "$OUTPUT_DIR"
echo ""
echo "🎯 Next steps:"
echo "  1. Review generated icons in $OUTPUT_DIR"
echo "  2. Test PWA install on different devices"
echo "  3. Update manifest.json if needed"
echo ""
