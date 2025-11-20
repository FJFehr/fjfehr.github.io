#!/bin/bash

# Quick Blog Publisher
# Makes it super easy to publish a new blog post

echo "🚀 Quick Blog Publisher"
echo "======================="

if [ $# -eq 0 ]; then
    echo "Usage: $0 <markdown-file>"
    echo ""
    echo "Example:"
    echo "  $0 content/blogs/my-new-post.md"
    echo ""
    echo "This script will:"
    echo "  1. Convert your markdown to JSON"
    echo "  2. Update the blog index"
    echo "  3. Git add, commit, and push"
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
    echo "📦 Adding files to git..."
    git add .
    
    echo "💾 Committing changes..."
    BLOG_TITLE=$(basename "$MARKDOWN_FILE" .md)
    git commit -m "Add blog post: $BLOG_TITLE"
    
    echo "🚀 Pushing to GitHub..."
    git push
    
    echo ""
    echo "✅ Blog post published successfully!"
    echo "🌐 Your blog should be live at: https://fabiojfehr.github.io"
else
    echo "❌ Conversion failed. Please check the errors above."
    exit 1
fi