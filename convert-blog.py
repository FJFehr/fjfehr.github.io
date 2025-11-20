#!/usr/bin/env python3
"""
Blog Post Converter for GitHub Pages

This script converts markdown blog posts to JSON format that works reliably on GitHub Pages.
It preserves all markdown formatting while ensuring compatibility with static hosting.

Usage:
    python3 convert-blog.py <markdown-file> [options]

Examples:
    # Convert a single post
    python3 convert-blog.py content/blogs/my-new-post.md
    
    # Convert and auto-update blogs.json
    python3 convert-blog.py content/blogs/my-new-post.md --update-index
    
    # Convert all markdown files in the blogs directory
    python3 convert-blog.py --convert-all
"""

import json
import re
import sys
from datetime import datetime
from pathlib import Path


def extract_frontmatter(content):
    """Extract YAML frontmatter from markdown content."""
    frontmatter = {}
    
    # Check if content starts with ---
    if content.startswith('---\n'):
        # Find the end of frontmatter
        end_match = re.search(r'\n---\n', content)
        if end_match:
            frontmatter_text = content[4:end_match.start()]
            content_without_frontmatter = content[end_match.end():]
            
            # Parse simple YAML (title, date, permalink)
            for line in frontmatter_text.split('\n'):
                if ':' in line:
                    key, value = line.split(':', 1)
                    key = key.strip()
                    value = value.strip().strip("'\"")
                    frontmatter[key] = value
            
            return frontmatter, content_without_frontmatter
    
    return frontmatter, content


def generate_blog_id(title, date):
    """Generate a blog ID from title and date."""
    # Convert title to lowercase, replace spaces/special chars with hyphens
    clean_title = re.sub(r'[^a-zA-Z0-9\s]', '', title.lower())
    clean_title = re.sub(r'\s+', '-', clean_title.strip())
    
    # Format date
    if isinstance(date, str):
        try:
            date_obj = datetime.strptime(date, '%Y-%m-%d')
            date_str = date_obj.strftime('%Y-%m-%d')
        except Exception:
            date_str = date
    else:
        date_str = date
    
    return f"{clean_title}-{date_str.split('-')[0]}"


def extract_excerpt(content, max_length=200):
    """Extract an excerpt from the content."""
    # Remove HTML tags and markdown formatting for excerpt
    clean_content = re.sub(r'<[^>]+>', '', content)  # Remove HTML
    clean_content = re.sub(r'\*\*([^*]+)\*\*', r'\1', clean_content)  # Remove bold
    clean_content = re.sub(r'\*([^*]+)\*', r'\1', clean_content)  # Remove italic
    clean_content = re.sub(r'##?\s+', '', clean_content)  # Remove headings
    clean_content = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', clean_content)  # Remove links
    
    # Take first paragraph or first max_length characters
    paragraphs = clean_content.split('\n\n')
    first_para = paragraphs[0].strip()
    
    if len(first_para) <= max_length:
        return first_para
    else:
        return first_para[:max_length].rsplit(' ', 1)[0] + '...'


def convert_markdown_to_json(md_file_path, output_dir=None):
    """Convert a markdown file to JSON format."""
    md_path = Path(md_file_path)
    
    if not md_path.exists():
        print(f"❌ Error: File {md_file_path} does not exist")
        return None
    
    # Read markdown content
    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract frontmatter and content
    frontmatter, markdown_content = extract_frontmatter(content)
    
    # Determine output directory
    if output_dir is None:
        output_dir = md_path.parent
    else:
        output_dir = Path(output_dir)
    
    # Generate blog data
    title = frontmatter.get('title', md_path.stem.replace('-', ' ').title())
    date = frontmatter.get('date', datetime.now().strftime('%Y-%m-%d'))
    blog_id = generate_blog_id(title, date)
    
    # Create JSON structure
    blog_data = {
        "title": title,
        "date": date,
        "content": markdown_content.strip()
    }
    
    # Write JSON file
    json_filename = f"{blog_id}.json"
    json_path = output_dir / json_filename
    
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(blog_data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Converted: {md_path.name} → {json_path.name}")
    
    # Return blog metadata for blogs.json
    return {
        "id": blog_id,
        "title": title,
        "date": date,
        "excerpt": extract_excerpt(markdown_content),
        "thumbnail": f"images/blogs/{blog_id}/thumbnail.jpg",  # Placeholder
        "contentFile": f"content/blogs/{json_filename}"
    }


def update_blogs_index(new_blog_data, blogs_json_path="content/blogs/blogs.json"):
    """Update the main blogs.json index file."""
    blogs_path = Path(blogs_json_path)
    
    # Load existing blogs
    if blogs_path.exists():
        with open(blogs_path, 'r', encoding='utf-8') as f:
            blogs = json.load(f)
    else:
        blogs = []
    
    # Check if blog already exists (update) or add new
    existing_blog = None
    for i, blog in enumerate(blogs):
        if blog['id'] == new_blog_data['id']:
            existing_blog = i
            break
    
    if existing_blog is not None:
        blogs[existing_blog] = new_blog_data
        print(f"📝 Updated existing blog: {new_blog_data['title']}")
    else:
        blogs.append(new_blog_data)
        print(f"➕ Added new blog: {new_blog_data['title']}")
    
    # Sort blogs by date (newest first)
    blogs.sort(key=lambda x: x['date'], reverse=True)
    
    # Write back to file
    with open(blogs_path, 'w', encoding='utf-8') as f:
        json.dump(blogs, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Updated {blogs_json_path}")


def convert_all_markdown_files(blogs_dir="content/blogs"):
    """Convert all markdown files in the blogs directory."""
    blogs_path = Path(blogs_dir)
    
    if not blogs_path.exists():
        print(f"❌ Error: Directory {blogs_dir} does not exist")
        return
    
    md_files = list(blogs_path.glob("*.md"))
    
    if not md_files:
        print(f"📝 No markdown files found in {blogs_dir}")
        return
    
    print(f"🔄 Found {len(md_files)} markdown files to convert...")
    
    all_blogs = []
    for md_file in md_files:
        blog_data = convert_markdown_to_json(md_file, blogs_path)
        if blog_data:
            all_blogs.append(blog_data)
    
    # Update blogs.json with all converted blogs
    if all_blogs:
        blogs_json_path = blogs_path / "blogs.json"
        
        # Sort by date (newest first)
        all_blogs.sort(key=lambda x: x['date'], reverse=True)
        
        with open(blogs_json_path, 'w', encoding='utf-8') as f:
            json.dump(all_blogs, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Created/updated blogs index with {len(all_blogs)} posts")


def main():
    """Main function to handle command line arguments."""
    if len(sys.argv) < 2:
        print(__doc__)
        return
    
    # Parse arguments
    if sys.argv[1] == "--convert-all":
        convert_all_markdown_files()
        return
    
    # Single file conversion
    md_file = sys.argv[1]
    update_index = "--update-index" in sys.argv or "-u" in sys.argv
    
    # Convert the file
    blog_data = convert_markdown_to_json(md_file)
    
    if blog_data and update_index:
        update_blogs_index(blog_data)
    
    print("\n🚀 Conversion complete! Your blog is ready for GitHub Pages.")
    print("\nNext steps:")
    print("1. git add .")
    print("2. git commit -m 'Add new blog post'")
    print("3. git push")


if __name__ == "__main__":
    main()