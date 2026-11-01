#!/usr/bin/env python3
"""
Blog Post Converter for GitHub Pages

This script converts markdown blog posts into standalone HTML pages for GitHub Pages.
It extracts YAML frontmatter, embeds the markdown content in each page, adds Open Graph
tags for social media sharing, and maintains the blogs.yaml index.

Key Features:
- Extracts YAML frontmatter (title, date, excerpt, thumbnail)
- Uses the `id` frontmatter field as the URL slug, or generates one from title and date
- Creates individual HTML files with Open Graph meta tags
- Maintains a master blogs.yaml index file
- Handles batch conversion of all markdown files

Usage:
    python3 convert-blog.py <markdown-file> [options]

Examples:
    # Convert a single post
    python3 convert-blog.py blogs/posts/my-new-post.md

    # Convert and auto-update blogs.yaml index
    python3 convert-blog.py blogs/posts/my-new-post.md --update-index

    # Convert all markdown files in the blogs/posts directory (also refreshes the home page's preview tags)
    python3 convert-blog.py --convert-all

    # Refresh only the home page's link-preview tags (index.html) from content/site/config.yaml
    python3 convert-blog.py --home
"""

# Standard library imports
import html
import json
import re
import sys
from datetime import datetime
from pathlib import Path

try:
    import yaml
except ImportError:
    print("Error: PyYAML is required. Install it with: pip install pyyaml")
    sys.exit(1)

# Configuration constants
DEFAULT_BLOGS_DIR = "blogs"
DEFAULT_POSTS_DIR = "blogs/posts"
BLOG_INDEX_FILENAME = "blogs.yaml"
SITE_CONFIG_PATH = "content/site/config.yaml"


def get_site_url(config_path=SITE_CONFIG_PATH):
    """Read site_url from config.yaml, with a clear warning if missing."""
    try:
        with open(config_path, "r", encoding="utf-8") as f:
            config = yaml.safe_load(f)
        url = config.get("site", {}).get("site_url", "")
        if not url:
            print("⚠️  Warning: 'site.site_url' not set in config.yaml. OG URLs will be broken.")
        return url.rstrip("/")
    except Exception as e:
        print(f"⚠️  Warning: Could not load site config from {config_path}: {e}")
        return ""


# The link-preview block in index.html and blogs/_blog_template.html, replaced with each page's own
OG_PATTERN = r'    <!-- Open Graph / Social Media Meta Tags -->.*?<meta name="twitter:card"[^>]+/>'


def og_tags(title, description, url, page_type, image, card):
    """Link-preview tags (LinkedIn, WhatsApp, X read these; they don't run JavaScript). Values are escaped."""
    e = lambda v: html.escape(str(v or ""))
    return f"""    <!-- Open Graph / Social Media Meta Tags -->
    <meta property="og:title" content="{e(title)}" />
    <meta property="og:description" content="{e(description)}" />
    <meta property="og:url" content="{e(url)}" />
    <meta property="og:type" content="{page_type}" />
    <meta property="og:image" content="{e(image)}" />
    <meta name="twitter:card" content="{card}" />"""


def update_home_page(index_path="index.html", config_path=SITE_CONFIG_PATH):
    """Write the home page's <title> and link-preview tags from config.yaml (name, role, description, photo)."""
    try:
        with open(config_path, "r", encoding="utf-8") as f:
            site = (yaml.safe_load(f) or {}).get("site", {})
        page = Path(index_path).read_text(encoding="utf-8")
    except Exception as e:
        print(f"⚠️  Warning: could not update {index_path}: {e}")
        return
    site_url = str(site.get("site_url") or "").rstrip("/")
    name, role = site.get("name", ""), (site.get("role") or {}).get("title", "")
    photo = site.get("profile_picture_path", "")
    tags = og_tags(
        f"{name} · {role}" if role else name,
        site.get("description", ""),
        f"{site_url}/" if site_url else "",
        "website",
        f"{site_url}/{photo}" if site_url and photo and not photo.startswith("http") else photo,
        "summary",  # a small square card: suits a portrait photo
    )
    if not re.search(OG_PATTERN, page, re.DOTALL):
        print(f"⚠️  Warning: could not find the OG tags section in {index_path}")
        return
    page = re.sub(OG_PATTERN, lambda _: tags, page, flags=re.DOTALL)
    title = html.escape(str(site.get("page_title") or name))
    page = re.sub(r'<title id="page-title">.*?</title>', lambda _: f'<title id="page-title">{title}</title>', page)
    Path(index_path).write_text(page, encoding="utf-8")
    print(f"✅ Updated link preview: {index_path}")


def parse_yaml_frontmatter(markdown_content):
    """
    Extract YAML frontmatter from the beginning of a markdown file.

    Args:
        markdown_content (str): Full markdown file content

    Returns:
        tuple: (frontmatter_dict, content_without_frontmatter)
               - frontmatter_dict: Dictionary of parsed YAML key-value pairs
               - content_without_frontmatter: Markdown content without the frontmatter block
    """
    frontmatter_data = {}

    # Check if content starts with YAML frontmatter delimiter
    if not markdown_content.startswith("---\n"):
        return frontmatter_data, markdown_content

    # Find the closing frontmatter delimiter
    closing_delimiter_match = re.search(r"\n---\n", markdown_content)
    if not closing_delimiter_match:
        return frontmatter_data, markdown_content

    # Extract frontmatter text (between the --- delimiters)
    frontmatter_start = 4  # After "---\n"
    frontmatter_end = closing_delimiter_match.start()
    frontmatter_text = markdown_content[frontmatter_start:frontmatter_end]
    content_without_frontmatter = markdown_content[closing_delimiter_match.end() :]

    # Values as text (dates too), except true/false; an empty field is ""
    parsed = yaml.safe_load(frontmatter_text) or {}
    frontmatter_data = {
        str(key): value if isinstance(value, bool) else "" if value is None else str(value).strip()
        for key, value in parsed.items()
    }

    return frontmatter_data, content_without_frontmatter


def create_blog_id(title, publication_date):
    """
    Generate a unique blog ID from title and date.

    The ID format is: cleaned-title-YYYY
    Example: "My Great Post" + "2024-01-15" → "my-great-post-2024"

    Args:
        title (str): Blog post title
        publication_date (str): Publication date in YYYY-MM-DD format

    Returns:
        str: Unique blog ID suitable for filenames and URLs
    """
    # Clean title: remove special characters, convert to lowercase
    cleaned_title = re.sub(r"[^a-zA-Z0-9\s]", "", title.lower())
    # Replace spaces with hyphens
    cleaned_title = re.sub(r"\s+", "-", cleaned_title.strip())

    # Extract year from date
    if isinstance(publication_date, str):
        try:
            # Parse date and format consistently
            parsed_date = datetime.strptime(publication_date, "%Y-%m-%d")
            year = parsed_date.year
        except ValueError:
            # If parsing fails, try to extract year directly
            year = (
                publication_date.split("-")[0]
                if "-" in publication_date
                else publication_date
            )
    else:
        year = str(publication_date)

    return f"{cleaned_title}-{year}"


def calculate_reading_time(content, wpm=200):
    """Estimate reading time from raw markdown content."""
    text = re.sub(r"```[\s\S]*?```", "", content)   # fenced code blocks
    text = re.sub(r"`[^`]+`", "", text)              # inline code
    text = re.sub(r"<[^>]+>", "", text)              # HTML tags
    words = len(text.split())
    minutes = max(1, round(words / wpm))
    return f"{minutes} min read"


def generate_blog_html(blog_metadata, blog_content, output_directory=DEFAULT_BLOGS_DIR):
    """
    Generate a standalone HTML file for a blog post with proper OG tags and embedded content.

    This function creates an individual HTML file for each blog post,
    using _blog_template.html and injecting specific OG meta tags and blog content
    for proper social media previews (WhatsApp, LinkedIn, etc.).

    Args:
        blog_metadata (dict): Blog metadata including id, title, date, excerpt, thumbnail
        blog_content (str): The markdown content of the blog post
        output_directory (str): Directory to save the HTML file

    Returns:
        str or None: Path to generated HTML file, or None if generation failed
    """
    try:
        # Read the template
        template_path = Path(output_directory) / "_blog_template.html"
        if not template_path.exists():
            print(f"⚠️ Warning: {template_path} not found. Skipping HTML generation.")
            return None

        with open(template_path, "r", encoding="utf-8") as file:
            template_content = file.read()

        # Extract blog metadata
        blog_id = blog_metadata["id"]
        thumbnail = blog_metadata.get("thumbnail", "content/site/profile_picture.jpg")

        # Ensure thumbnail is an absolute URL
        site_url = get_site_url()
        if not thumbnail.startswith("http"):
            thumbnail = f"{site_url}/{thumbnail}" if site_url else thumbnail

        # Replace the generic OG tags in the template with this post's
        tags = og_tags(blog_metadata["title"], blog_metadata.get("excerpt", ""), f"{site_url}/blogs/{blog_id}.html",
                       "article", thumbnail, "summary_large_image")
        if re.search(OG_PATTERN, template_content, re.DOTALL):
            updated_content = re.sub(OG_PATTERN, lambda _: tags, template_content, flags=re.DOTALL)
        else:
            print("⚠️ Warning: Could not find OG tags section in template")
            return None

        # Add a script to auto-load this specific blog post and embed the content
        blog_data_json = json.dumps(
            {
                "title": blog_metadata["title"],
                "short_title": blog_metadata.get("short_title", ""),
                "date": blog_metadata["date"],
                "reading_time": blog_metadata.get("reading_time", ""),
                "content": blog_content,
            },
            ensure_ascii=False,
        ).replace("</", "<\\/")  # a "</script>" in the post must not end the script tag

        auto_load_script = f"""
    <script>
        // Auto-load this specific blog post
        window.BLOG_POST_ID = '{blog_id}';
        
        // Embedded blog data (no need for separate JSON file!)
        window.BLOG_POST_DATA = {blog_data_json};
    </script>"""

        # Insert the script before the closing </head> tag
        updated_content = updated_content.replace(
            "</head>", f"{auto_load_script}\n</head>"
        )

        # Write the HTML file
        html_filename = f"{blog_id}.html"
        html_output_path = Path(output_directory) / html_filename

        with open(html_output_path, "w", encoding="utf-8") as file:
            file.write(updated_content)

        print(f"✅ Generated HTML: {html_filename}")
        return str(html_output_path)

    except Exception as error:
        print(f"❌ Error generating HTML file: {error}")
        return None


def convert_markdown_to_json(markdown_file_path, output_directory=None):
    """
    Convert a single markdown file to a standalone HTML page for GitHub Pages.

    This function:
    1. Reads the markdown file
    2. Extracts YAML frontmatter (title, date, etc.)
    3. Processes the content
    4. Generates a unique blog ID
    5. Generates a standalone HTML file with OG tags and embedded content
    6. Returns metadata for the blogs index

    Args:
        markdown_file_path (str): Path to the markdown file to convert
        output_directory (str, optional): Unused; HTML is always written to blogs/.

    Returns:
        dict or None: Blog metadata dictionary for the blogs.yaml index,
                     or None if conversion failed
    """
    input_path = Path(markdown_file_path)

    # Validate input file exists
    if not input_path.exists():
        print(f"❌ Error: File {markdown_file_path} does not exist")
        return None

    # Read the markdown file
    try:
        with open(input_path, "r", encoding="utf-8") as file:
            raw_content = file.read()
    except Exception as error:
        print(f"❌ Error reading file {markdown_file_path}: {error}")
        return None

    # Parse frontmatter and content
    frontmatter_data, markdown_content = parse_yaml_frontmatter(raw_content)

    # Extract or generate blog metadata
    post_title = frontmatter_data.get(
        "title", input_path.stem.replace("-", " ").title()
    )
    post_date = frontmatter_data.get("date", datetime.now().strftime("%Y-%m-%d"))
    post_excerpt = frontmatter_data.get("excerpt", "")
    post_thumbnail = frontmatter_data.get("thumbnail", "")
    post_short_title = frontmatter_data.get("short_title", "")
    post_hidden = frontmatter_data.get("hidden", "")
    # A pinned id keeps the URL (and like count) stable when the title is edited
    unique_blog_id = frontmatter_data.get("id") or create_blog_id(post_title, post_date)

    # Return metadata for blogs index
    blog_metadata = {
        "id": unique_blog_id,
        "title": post_title,
        "short_title": post_short_title,
        "date": post_date,
        "excerpt": post_excerpt,
        "thumbnail": post_thumbnail,
        "reading_time": calculate_reading_time(markdown_content),
    }

    if post_hidden and post_hidden != "false":
        blog_metadata["hidden"] = True

    # Generate standalone HTML file with OG tags and embedded content (save to blogs/ directory)
    html_path = generate_blog_html(
        blog_metadata, markdown_content.strip(), DEFAULT_BLOGS_DIR
    )

    if html_path:
        print(f"✅ Converted: {input_path.name} → {unique_blog_id}.html")

    return blog_metadata


def update_blogs_index_file(new_blog_metadata, index_file_path=None):
    """
    Update the master blogs.yaml index file with new or updated blog metadata.

    This function:
    1. Loads existing blogs from the index file
    2. Updates existing blog or adds new blog
    3. Sorts blogs by date (newest first)
    4. Saves the updated index

    Args:
        new_blog_metadata (dict): Blog metadata to add/update
        index_file_path (str, optional): Path to blogs.yaml.
                                       Defaults to "blogs/blogs.yaml"
    """
    if index_file_path is None:
        index_file_path = f"{DEFAULT_BLOGS_DIR}/{BLOG_INDEX_FILENAME}"

    index_path = Path(index_file_path)

    # Load existing blogs index
    existing_blogs = []
    if index_path.exists():
        try:
            with open(index_path, "r", encoding="utf-8") as file:
                existing_blogs = yaml.safe_load(file) or []
        except Exception as error:
            print(f"⚠️ Warning: Error reading existing index file: {error}")
            existing_blogs = []

    # Find if this blog already exists (for updates)
    blog_index_to_update = None
    for index, blog in enumerate(existing_blogs):
        if blog.get("id") == new_blog_metadata["id"]:
            blog_index_to_update = index
            break

    # Update existing or add new blog
    if blog_index_to_update is not None:
        existing_blogs[blog_index_to_update] = new_blog_metadata
        print(f"📝 Updated existing blog: {new_blog_metadata['title']}")
    else:
        existing_blogs.append(new_blog_metadata)
        print(f"➕ Added new blog: {new_blog_metadata['title']}")

    # Sort blogs by date (newest first)
    existing_blogs.sort(key=lambda blog: blog["date"], reverse=True)

    # Save updated index
    try:
        # Ensure directory exists
        index_path.parent.mkdir(parents=True, exist_ok=True)

        with open(index_path, "w", encoding="utf-8") as file:
            yaml.dump(
                existing_blogs,
                file,
                default_flow_style=False,
                allow_unicode=True,
                sort_keys=False,
            )
        print(f"✅ Updated index file: {index_file_path}")
    except Exception as error:
        print(f"❌ Error updating index file: {error}")


def batch_convert_all_markdown_files(posts_directory=DEFAULT_POSTS_DIR):
    """
    Convert all markdown files in a directory to HTML pages.

    This function finds all .md files in the specified directory,
    converts them to HTML, and creates a comprehensive blogs.yaml index.

    Args:
        posts_directory (str): Directory containing markdown blog files
    """
    posts_path = Path(posts_directory)

    # Validate directory exists
    if not posts_path.exists():
        print(f"❌ Error: Directory {posts_directory} does not exist")
        return

    # Find all markdown files
    markdown_files = list(posts_path.glob("*.md"))

    if not markdown_files:
        print(f"📝 No markdown files found in {posts_directory}")
        return

    print(f"🔄 Found {len(markdown_files)} markdown files to convert...")

    # Convert all markdown files
    all_blog_metadata = []
    successful_conversions = 0

    for markdown_file in markdown_files:
        blog_metadata = convert_markdown_to_json(markdown_file, DEFAULT_BLOGS_DIR)
        if blog_metadata:
            all_blog_metadata.append(blog_metadata)
            successful_conversions += 1
        else:
            print(f"⚠️ Skipped {markdown_file.name} due to conversion error")

    # Create comprehensive blogs index
    if all_blog_metadata:
        index_file_path = Path(DEFAULT_BLOGS_DIR) / BLOG_INDEX_FILENAME

        # Sort by date (newest first)
        all_blog_metadata.sort(key=lambda blog: blog["date"], reverse=True)

        try:
            with open(index_file_path, "w", encoding="utf-8") as file:
                yaml.dump(
                    all_blog_metadata,
                    file,
                    default_flow_style=False,
                    allow_unicode=True,
                    sort_keys=False,
                )

            print(f"✅ Successfully converted {successful_conversions} posts")
            print(
                f"✅ Created/updated blogs index with {len(all_blog_metadata)} entries"
            )
        except Exception as error:
            print(f"❌ Error creating index file: {error}")
    else:
        print("❌ No files were successfully converted")


def main():
    """
    Main entry point for the blog converter script.

    Handles command line arguments and coordinates the conversion process.

    Command line options:
    - --convert-all: Convert all markdown files in the blogs directory
    - --update-index or -u: Update the blogs.yaml index after conversion
    """
    # Show help if no arguments provided
    if len(sys.argv) < 2:
        print(__doc__)
        return

    # Handle batch conversion of all files
    if sys.argv[1] == "--convert-all":
        batch_convert_all_markdown_files()
        update_home_page()
        return
    if sys.argv[1] == "--home":
        update_home_page()
        return

    # Handle single file conversion
    markdown_file_path = sys.argv[1]
    should_update_index = "--update-index" in sys.argv or "-u" in sys.argv

    # Convert the specified file (output to blogs/ directory)
    blog_metadata = convert_markdown_to_json(markdown_file_path, DEFAULT_BLOGS_DIR)

    # Update the blogs index if requested and conversion was successful
    if blog_metadata and should_update_index:
        update_blogs_index_file(blog_metadata)

    # Show completion message and next steps
    print("\n🚀 Conversion complete! Your blog is ready for GitHub Pages.")
    print("\nNext steps:")
    print("1. git add .")
    print("2. git commit -m 'Add new blog post'")
    print("3. git push")


if __name__ == "__main__":
    main()
