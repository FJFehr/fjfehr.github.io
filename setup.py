#!/usr/bin/env python3
"""
setup.py — Personal Website Template Setup

Run this script once after using the GitHub template button to replace all
personal content with blank starter files.

Usage:
    python3 setup.py
"""

import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).parent
TEMPLATE_DIR = ROOT / "_template"


def copy_template_files():
    """Copy blank template files from _template/ into their live locations."""
    copied = []
    for src in TEMPLATE_DIR.rglob("*"):
        if src.is_file():
            rel = src.relative_to(TEMPLATE_DIR)
            dst = ROOT / rel
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dst)
            copied.append(str(rel))
    return copied


def clear_blogs():
    """Remove personal blog posts and generated HTML files."""
    removed = []

    posts_dir = ROOT / "blogs" / "posts"
    if posts_dir.exists():
        for f in posts_dir.glob("*.md"):
            f.unlink()
            removed.append(f"blogs/posts/{f.name}")

    blogs_dir = ROOT / "blogs"
    for f in blogs_dir.glob("*.html"):
        if f.name not in ("_blog_template.html",):
            f.unlink()
            removed.append(f"blogs/{f.name}")

    blogs_yaml = ROOT / "blogs" / "blogs.yaml"
    blogs_yaml.write_text("[]\n")

    return removed


def clear_personal_files():
    """Remove personal binary files (profile picture and CV)."""
    removed = []

    for profile_pic in (ROOT / "content" / "site").glob("profile_picture*.jpg"):
        profile_pic.unlink()
        removed.append(str(profile_pic.relative_to(ROOT)))

    for pdf in (ROOT / "content" / "site").glob("*.pdf"):
        pdf.unlink()
        removed.append(str(pdf.relative_to(ROOT)))

    # Images and files referenced only by personal content
    for folder in ("projects/images", "publications/files", "timeline/logos"):
        for f in (ROOT / "content" / folder).glob("*"):
            if f.is_file():
                f.unlink()
                removed.append(str(f.relative_to(ROOT)))

    return removed


def main():
    print("Setting up your personal website template...\n")

    copy_template_files()
    removed_blogs = clear_blogs()
    removed_files = clear_personal_files()

    print("Done!\n")
    print("  Config blanked       ->  edit content/site/config.yaml")
    print("  Bio cleared          ->  edit content/site/bio.md")
    print("  Publications cleared ->  edit content/publications/publications.yaml")
    print("  Timeline cleared     ->  edit content/timeline/timeline.yaml")
    print("  Media cleared        ->  edit content/media/media.yaml")
    print("  Projects cleared     ->  edit content/projects/projects.yaml")
    if removed_blogs:
        print(f"  Blog posts removed   ->  {len(removed_blogs)} file(s) deleted")
    if removed_files:
        print(f"  Personal files       ->  {len(removed_files)} file(s) deleted")
    print()
    print("Next steps:")
    print("  1. Add your profile picture at content/site/profile_picture.jpg")
    print("     (or update profile_picture_path in config.yaml to point elsewhere)")
    print("  2. Fill in your details in content/site/config.yaml (name, links, site_url)")
    print("  3. Set cv_path in config.yaml and add your CV file")
    print("  4. Write your bio in content/site/bio.md")
    print("  5. Add your work history in content/timeline/timeline.yaml")
    print("  6. Add your publications in content/publications/publications.yaml")
    print("  7. Add media highlights in content/media/media.yaml")
    print("  8. Add highlighted projects in content/projects/projects.yaml")
    print()
    print("To add a blog post:")
    print("  python3 convert-blog.py blogs/posts/my-post.md --update-index")


if __name__ == "__main__":
    main()
