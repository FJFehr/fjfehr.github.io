#!/bin/bash

# Blog Converter Script
# Converts markdown blog posts to JSON format for the website

echo "📝 Blog Converter"
echo "================="

if [ $# -eq 0 ]; then
    echo "Usage: $0 <markdown-file>"
    echo ""
    echo "Example:"
    echo "  $0 content/blogs/my-new-post.md"
    echo ""
    echo "This script will:"
    echo "  1. Convert your markdown to JSON"
    echo "  2. Update the blog index"
    echo "  (No git operations - you'll need to commit manually)"
    exit 1
fi

MARKDOWN_FILE="$1"

if [ ! -f "$MARKDOWN_FILE" ]; then
    echo "❌ Error: File '$MARKDOWN_FILE' does not exist"
    exit 1
fi

echo ""
echo "📝 Converting '$MARKDOWN_FILE' to JSON..."
python3 convert-blog.py "$MARKDOWN_FILE" --update-index

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Blog post converted successfully!"
    echo ""
    echo "📋 Next steps (manual):"
    echo "  1. Review the generated JSON files"
    echo "  2. git add ."
    echo "  3. git commit -m 'Add blog post: $(basename "$MARKDOWN_FILE" .md)'"
    echo "  4. git push"
    echo ""
    echo "🌐 Your blog will be live at: https://fabiojfehr.github.io"
else
    echo "❌ Conversion failed. Please check the errors above."
    exit 1
fi