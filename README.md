# Personal Website Template

🍴 Fork Me. ⭐ Star Me.

[![GitHub stars](https://img.shields.io/github/stars/FJFehr/fjfehr.github.io?style=social)](https://github.com/FJFehr/fjfehr.github.io/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/FJFehr/fjfehr.github.io?style=social)](https://github.com/FJFehr/fjfehr.github.io/fork)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> Your personal site shouldn't require a effort

A GitHub Pages portfolio template with no build tools, no Node, no config hell. Edit YAML files, push, done.

**What you get out of the box:**
- Publications list, timeline, media highlights — all from YAML
- Blog with social-share OG tags (WhatsApp, LinkedIn, Slack previews)
- Dark mode + configurable design system (colours, fonts, spacing)
- Mobile-friendly responsive layout
- Single-command blog converter

If this saves you time, a ⭐ goes a long way.

## Use This Template

[![Use this template](https://img.shields.io/badge/Use_this_template-2ea44f?style=for-the-badge&logo=github&logoColor=white)](https://github.com/FJFehr/fjfehr.github.io/generate)

Then run the setup script to blank all personal content:

```bash
python3 setup.py
```

This replaces all personal data with blank starter templates and clears blog posts. Then fill in:
- `content/site/config.yaml` — your name, role, social links, and `site_url`
- `content/site/bio.md` — your bio
- `content/publications/publications.yaml` — your publications
- `content/timeline/timeline.yaml` — your work/education history
- `content/media/media.yaml` — your media highlights
- `content/projects/projects.yaml` — highlighted projects (optional)
- Replace `content/site/profile_picture.jpg` with your photo

## Quick Start

**Change site content (no code needed):**
- **Profile bio** - Edit `content/site/bio.md`
- **Site name/role** - Edit `content/site/config.yaml` (site section)
- **Navigation links** - Edit `content/site/config.yaml` (layout section)
- **Social links** - Edit `content/site/config.yaml` (contacts section)
- **Publications** - Edit `content/publications/publications.yaml`
- **Timeline** - Edit `content/timeline/timeline.yaml`
- **Media highlights** - Edit `content/media/media.yaml`

**Change appearance:**
- **Colours, fonts, spacing** - Edit `content/site/config.yaml` (design section)
- **Swap colour palette** - Change `design.colors.active_palette` in `config.yaml` (`indigo` / `violet` / `teal`). See `.guides/colour_palettes.md` for details.
- **Advanced styling** - Edit `css/style.css` (CSS variables at top)

## Adding Blog Posts

1. **Create a markdown file** in `blogs/posts/` with YAML frontmatter:
   ```markdown
   ---
   title: 'My Awesome Blog Post'
   date: 2025-01-15
   excerpt: "A brief description for social media previews (WhatsApp, LinkedIn, etc.)"
   thumbnail: "blogs/images/my-image.jpg"
   short_title: "Short card title"    # optional – shorter title for blog cards
   id: "custom-url-slug"              # optional – pins the URL slug (default: from title + year); keep it once a post is shared
   ---
   
   ## Introduction
   
   Your blog content here in markdown format...
   ```

2. **Add images** (optional): Place images in `blogs/images/` and reference them in your markdown:
   ```markdown
   ![Alt text](images/my-image.jpg)
   ```

3. **Convert and generate** (required for each blog):
   ```bash
   pip install pyyaml  # one-time setup
   python3 convert-blog.py blogs/posts/your-post.md --update-index
   ```
   
   This creates:
   - `blogs/your-post.html` — standalone shareable page with OG tags
   - Updates `blogs/blogs.yaml` — blog index for homepage

4. **Preview locally**: Open `blogs/your-post.html` in your browser

5. **Commit and push**:
   ```bash
   git add .
   git commit -m "Add blog post: My Awesome Blog Post"
   git push
   ```

6. **Share**: Your blog will be live at `https://yourusername.github.io/blogs/your-post.html` — with rich previews on WhatsApp, LinkedIn, and Slack.

> **Tip:** Set `site_url` in `content/site/config.yaml` before running the converter so OG tags point to your domain.

## View Locally
Open `index.html` in a browser or use Live Server in VS Code.

## Structure

**Design Philosophy:** All site content (publications, timeline, media, config) lives in the `content/` directory for easy organisation. **Exception:** Blogs are in the root-level `blogs/` directory — this creates cleaner, shareable URLs (`yourusername.github.io/blogs/post-name.html`).

```
index.html          # Main homepage
blogs/              # Blog content (separate for cleaner URLs!)
  posts/            # ← Your markdown source files
    *.md
  images/           # ← Blog images
  *.html            # ← Generated shareable blog pages (embedded content + OG tags)
  blogs.yaml        # Blog index (auto-updated)
  _blog_template.html  # Template for generating HTML
css/
  style.css         # Consolidated styles with CSS variables
js/
  main.js           # Consolidated JavaScript (routing, theme, content loading)
content/            # All other site content lives here
  site/
    config.yaml     # Site configuration (name, layout, contacts, design, site_url)
    bio.md          # Profile bio content
    profile_picture.jpg
    icons/          # Social media icons
  publications/
    publications.yaml
    files/          # Publication PDFs, thumbnails, posters
  timeline/
    timeline.yaml
    logos/          # Timeline event logos
  media/
    media.yaml
convert-blog.py     # Script to convert markdown → HTML with embedded content
```

## Configuration

All site configuration lives in **`content/site/config.yaml`** — a single, human-readable file.

**Key fields:**
- **site** — Name, role, affiliation, `site_url` (your GitHub Pages URL), footer text
- **layout** — Navigation menu, section titles, footer content
- **contacts** — Social media links with icons
- **design** — Complete design system (colours, typography, spacing, sizes)

**`site_url`** is used by `convert-blog.py` to generate absolute OG tag URLs for social sharing. Set it to your GitHub Pages URL (no trailing slash), e.g. `https://yourusername.github.io`.

## Content Files

- **`content/site/config.yaml`** — Site configuration, layout, contacts, and design system
- **`content/site/bio.md`** — Profile bio content in markdown
- **`content/publications/publications.yaml`** — Publications list
- **`content/timeline/timeline.yaml`** — Work experience and education timeline
- **`content/media/media.yaml`** — YouTube videos and media highlights

Each YAML file has clear structure with comments. No code knowledge needed — just edit the fields directly.

## Blog Converter

The `convert-blog.py` script converts markdown blog posts to standalone HTML files with embedded content and social media meta tags.

**Commands:**
- `python3 convert-blog.py <file.md>` — Convert single file to HTML
- `python3 convert-blog.py <file.md> --update-index` — Convert and update blogs.yaml index
- `python3 convert-blog.py --convert-all` — Convert all markdown files in blogs/posts/

**What it does:**
- Extracts YAML frontmatter (title, date, excerpt, thumbnail)
- Reads `site_url` from `content/site/config.yaml` for absolute OG tag URLs
- Creates standalone HTML file with Open Graph meta tags and embedded blog content
- Updates `blogs/blogs.yaml` index for homepage display

## Architecture

**Single-file philosophy:** All CSS is in `css/style.css` and all JavaScript is in `js/main.js`. Both files use clearly marked section headers so you can navigate by searching.

**Content vs. code separation:**
- Site content (bio, publications, timeline, media, design tokens) lives in `content/` as YAML/markdown — no code changes needed for content updates
- Blogs live in `blogs/` (not `content/blogs/`) to produce clean shareable URLs

This site uses a **single-file structure** for CSS and JavaScript to optimise for:
- **Agentic Editing** — AI agents can understand and modify the entire codebase in one context
- **Maintainability** — All related code is in one place with clear section markers
- **Performance** — Single HTTP request for CSS/JS, better browser caching
- **Simplicity** — No build tools, bundlers, or complex dependency chains

## Development Notes

- All CSS is in `css/style.css` with `/* ====== SECTION NAME ====== */` markers
- All JavaScript is in `js/main.js` with `/** === SECTION NAME === */` markers
- No build step required — edit and reload
- CSS variables at top of `style.css` for quick theme changes
- All content stored in YAML — no code changes needed for updates

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=FJFehr/fjfehr.github.io&type=Date)](https://star-history.com/#FJFehr/fjfehr.github.io&Date)

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

**TL;DR:**
- ✅ Free to use as a template for your own website
- ✅ Code, design, and structure are open source
- ❌ Personal content (bio, photos, blog posts, publications) is NOT included
- 🔄 You MUST replace all content in `content/` with your own
