#!/usr/bin/env python3
"""
Blog Post Converter for GitHub Pages

This script converts markdown blog posts to JSON format for use with GitHub Pages.
It extracts YAML frontmatter, processes markdown content, and generates structured JSON
files that can be easily consumed by JavaScript on static hosting platforms.

Key Features:
- Extracts YAML frontmatter (title, date, etc.)
- Generates unique blog IDs from title and date
- Creates individual JSON files for each blog post
- Maintains a master blogs.yaml index file
- Handles batch conversion of all markdown files

Usage:
    python3 convert-blog.py <markdown-file> [options]

Examples:
    # Convert a single post
    python3 convert-blog.py content/blogs/my-new-post.md

    # Convert and auto-update blogs.yaml index
    python3 convert-blog.py content/blogs/my-new-post.md --update-index

    # Convert all markdown files in the blogs directory
    python3 convert-blog.py --convert-all
"""

# Standard library imports
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
DEFAULT_BLOGS_DIR = "content/blogs"
DEFAULT_EXCERPT_LENGTH = 200
BLOG_INDEX_FILENAME = "blogs.yaml"


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

    # Parse simple YAML key-value pairs
    for line in frontmatter_text.split("\n"):
        line = line.strip()
        if not line or ":" not in line:
            continue

        # Split on first colon only
        key, value = line.split(":", 1)
        key = key.strip()
        value = value.strip().strip("'\"")  # Remove quotes if present
        frontmatter_data[key] = value

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


def clean_text_for_excerpt(raw_content, max_length=DEFAULT_EXCERPT_LENGTH):
    """
    Extract a clean, readable excerpt from markdown content.

    This function removes all markdown formatting and HTML tags to create
    a plain text excerpt suitable for previews and meta descriptions.

    Args:
        raw_content (str): Raw markdown content
        max_length (int): Maximum length of the excerpt in characters

    Returns:
        str: Clean text excerpt, truncated to max_length if necessary
    """
    # Remove HTML tags
    clean_text = re.sub(r"<[^>]+>", "", raw_content)

    # Remove markdown formatting
    clean_text = re.sub(r"\*\*([^*]+)\*\*", r"\1", clean_text)  # Bold
    clean_text = re.sub(r"\*([^*]+)\*", r"\1", clean_text)  # Italic
    clean_text = re.sub(r"##?\s+", "", clean_text)  # Headings
    clean_text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", clean_text)  # Links

    # Get first paragraph or sentence
    paragraphs = clean_text.split("\n\n")
    first_paragraph = paragraphs[0].strip()

    # Truncate to max_length if needed
    if len(first_paragraph) <= max_length:
        return first_paragraph
    else:
        # Truncate at word boundary to avoid cutting words
        truncated = first_paragraph[:max_length].rsplit(" ", 1)[0]
        return truncated + "..."


def convert_markdown_to_json(markdown_file_path, output_directory=None):
    """
    Convert a single markdown file to JSON format for GitHub Pages.

    This function:
    1. Reads the markdown file
    2. Extracts YAML frontmatter (title, date, etc.)
    3. Processes the content
    4. Generates a unique blog ID
    5. Creates a JSON file with the blog data
    6. Returns metadata for the blogs index

    Args:
        markdown_file_path (str): Path to the markdown file to convert
        output_directory (str, optional): Directory to save JSON file.
                                        Defaults to same directory as markdown file.

    Returns:
        dict or None: Blog metadata dictionary for blogs.json index,
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

    # Determine output directory
    if output_directory is None:
        output_path = input_path.parent
    else:
        output_path = Path(output_directory)

    # Extract or generate blog metadata
    post_title = frontmatter_data.get(
        "title", input_path.stem.replace("-", " ").title()
    )
    post_date = frontmatter_data.get("date", datetime.now().strftime("%Y-%m-%d"))
    post_excerpt = frontmatter_data.get("excerpt", "")
    post_thumbnail = frontmatter_data.get("thumbnail", "")
    unique_blog_id = create_blog_id(post_title, post_date)

    # Create the blog data structure
    blog_json_data = {
        "title": post_title,
        "date": post_date,
        "content": markdown_content.strip(),
    }

    # Write JSON file
    json_filename = f"{unique_blog_id}.json"
    json_output_path = output_path / json_filename

    try:
        with open(json_output_path, "w", encoding="utf-8") as json_file:
            json.dump(blog_json_data, json_file, indent=2, ensure_ascii=False)
        print(f"✅ Converted: {input_path.name} → {json_filename}")
    except Exception as error:
        print(f"❌ Error writing JSON file: {error}")
        return None

    # Return metadata for blogs index
    blog_metadata = {
        "id": unique_blog_id,
        "title": post_title,
        "date": post_date,
        "excerpt": post_excerpt,
        "thumbnail": post_thumbnail,
        "content_file": f"content/blogs/{json_filename}",
    }

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
                                       Defaults to "content/blogs/blogs.yaml"
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


def batch_convert_all_markdown_files(blogs_directory=DEFAULT_BLOGS_DIR):
    """
    Convert all markdown files in a directory to JSON format.

    This function finds all .md files in the specified directory,
    converts them to JSON, and creates a comprehensive blogs.yaml index.

    Args:
        blogs_directory (str): Directory containing markdown blog files
    """
    blogs_path = Path(blogs_directory)

    # Validate directory exists
    if not blogs_path.exists():
        print(f"❌ Error: Directory {blogs_directory} does not exist")
        return

    # Find all markdown files
    markdown_files = list(blogs_path.glob("*.md"))

    if not markdown_files:
        print(f"📝 No markdown files found in {blogs_directory}")
        return

    print(f"🔄 Found {len(markdown_files)} markdown files to convert...")

    # Convert all markdown files
    all_blog_metadata = []
    successful_conversions = 0

    for markdown_file in markdown_files:
        blog_metadata = convert_markdown_to_json(markdown_file, blogs_path)
        if blog_metadata:
            all_blog_metadata.append(blog_metadata)
            successful_conversions += 1
        else:
            print(f"⚠️ Skipped {markdown_file.name} due to conversion error")

    # Create comprehensive blogs index
    if all_blog_metadata:
        index_file_path = blogs_path / BLOG_INDEX_FILENAME

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
        return

    # Handle single file conversion
    markdown_file_path = sys.argv[1]
    should_update_index = "--update-index" in sys.argv or "-u" in sys.argv

    # Convert the specified file
    blog_metadata = convert_markdown_to_json(markdown_file_path)

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
