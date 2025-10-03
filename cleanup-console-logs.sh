#!/bin/bash

# =================================================================
# Console.log Cleanup Script
# Removes or comments out console.log statements for production
# =================================================================

echo "🧹 Starting console.log cleanup..."
echo ""

# Function to process files
process_files() {
    local file_pattern=$1
    local file_count=0
    local log_count=0
    
    # Find all matching files
    while IFS= read -r file; do
        if [ -f "$file" ]; then
            # Count console.logs in this file
            local logs_in_file=$(grep -c "console\.log" "$file" 2>/dev/null || echo "0")
            
            if [ "$logs_in_file" -gt 0 ]; then
                ((file_count++))
                log_count=$((log_count + logs_in_file))
                
                echo "📝 Processing: $file ($logs_in_file console.logs found)"
                
                # Comment out console.log lines (safer than removing)
                sed -i.backup 's/^\(\s*\)console\.log(/\1\/\/ console.log(/g' "$file"
                
                # Alternative: Completely remove console.log lines
                # Uncomment below to remove instead of commenting
                # sed -i.backup '/console\.log(/d' "$file"
            fi
        fi
    done < <(find src/app -type f -name "$file_pattern" 2>/dev/null)
    
    echo "✅ Processed $file_count files with $log_count console.logs"
    echo ""
}

# Process TypeScript/JavaScript files
echo "🔍 Scanning TypeScript files..."
process_files "*.tsx"

echo "🔍 Scanning TypeScript files (ts)..."
process_files "*.ts"

echo "🔍 Scanning JavaScript files..."
process_files "*.jsx"

echo "🔍 Scanning JavaScript files (js)..."
process_files "*.js"

echo ""
echo "✨ Cleanup complete!"
echo ""
echo "📌 Backup files created with .backup extension"
echo "📌 Review changes before committing"
echo ""
echo "To restore backups:"
echo "  find src/app -name '*.backup' -exec sh -c 'mv \"\$1\" \"\${1%.backup}\"' _ {} \\;"
echo ""
echo "To delete backups:"
echo "  find src/app -name '*.backup' -delete"
echo ""
