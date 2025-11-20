# Blog Conversion Script

This script automatically converts your markdown blog posts to JSON format that works reliably on GitHub Pages while preserving ALL your markdown formatting.

## What the script does:

1. **Reads your markdown file** with YAML frontmatter (title, date, etc.)
2. **Extracts the markdown content** (preserves **bold**, *italic*, ## headings, [links](), images, etc.)
3. **Creates a JSON file** with the raw markdown stored as a string
4. **Auto-generates blog metadata** (ID, excerpt, etc.)
5. **Updates your blogs.json index** to include the new post
6. **Your existing JavaScript** in `blogs.html` parses the markdown to HTML

## Usage Examples:

### Convert a single blog post:
```bash
python3 convert-blog.py content/blogs/my-new-post.md
```

### Convert and automatically update the blog index:
```bash
python3 convert-blog.py content/blogs/my-new-post.md --update-index
```

### Convert all markdown files at once:
```bash
python3 convert-blog.py --convert-all
```

## Your workflow:

1. **Write your blog in markdown** as usual:
   ```markdown
   ---
   title: 'My Amazing Blog Post'
   date: 2025-02-25
   ---
   
   ## My heading
   
   This is **bold** and this is *italic*.
   
   [Link to somewhere](https://example.com)
   ```

2. **Convert to JSON when ready to publish:**
   ```bash
   python3 convert-blog.py content/blogs/my-new-post.md --update-index
   ```

3. **Commit and push:**
   ```bash
   git add .
   git commit -m "Add new blog post"
   git push
   ```

4. **Your blog loads perfectly on GitHub Pages!** ✅

## What gets preserved:

- ✅ **Bold text**: `**text**`
- ✅ **Italic text**: `*text*`
- ✅ **Headings**: `## Heading`
- ✅ **Links**: `[text](url)`
- ✅ **Images**: `![alt](src)` and `<figure>` tags
- ✅ **Lists**: numbered and bulleted
- ✅ **Paragraphs**: proper spacing
- ✅ **HTML tags**: like your `<figure>` blocks

## Generated files:

- **JSON file**: Contains your markdown content as a string
- **Updated blogs.json**: Points to the new JSON file
- **Your original .md file**: Kept unchanged (so you can edit it later)

The script is smart enough to handle everything automatically!