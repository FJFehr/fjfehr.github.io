#!/usr/bin/env python3
"""
Template check: run setup.py on a scratch copy of this repo and check that it leaves a clean, working,
personal-data-free site, and that the blog converter escapes what it embeds.

Usage:
    python3 tests/check_template.py

Exits non-zero on the first failure. Needs PyYAML; node (optional) also renders the example background scene.
"""

import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
# Personal data that must not survive setup.py (the "Template by Fabio J. Fehr" footer credit is intended)
PERSONAL = ["Fablogio", "phc_wmz", "264811", "Johannesburg", "Cape Town", "F. Fehr", "fabiofehr96", "SYNTHIA"]
# What setup.py leaves for the user; the docs (README, CLAUDE.md, .guides) and _template/ are not the site
SITE = ["index.html", "css", "js", "blogs", "content", ".github"]


def fail(message):
    sys.exit(f"FAIL: {message}")


def main():
    with tempfile.TemporaryDirectory() as tmp:
        site = Path(tmp) / "site"
        shutil.copytree(ROOT, site, ignore=shutil.ignore_patterns(".git", "TODO.md", "notes"))
        subprocess.run([sys.executable, "setup.py"], cwd=site, check=True, capture_output=True)

        # every YAML file parses
        for f in site.rglob("*.yaml"):
            try:
                yaml.safe_load(f.read_text(encoding="utf-8"))
            except yaml.YAMLError as e:
                fail(f"{f.relative_to(site)} does not parse: {e}")

        # no personal data left in the site
        for top in SITE:
            for f in [site / top] if (site / top).is_file() else (site / top).rglob("*"):
                if not f.is_file() or f.suffix in (".png", ".jpg", ".jpeg", ".svg", ".pdf", ".ico"):
                    continue
                text = f.read_text(encoding="utf-8", errors="ignore")
                for word in PERSONAL:
                    if word in text:
                        fail(f"{f.relative_to(site)} still contains {word!r}")

        # the background engine and starter scene stay, the personal scene goes, and no background is on
        bg = site / "js" / "background"
        for name in ("engine.js", "example.js", "background.example.json"):
            if not (bg / name).is_file():
                fail(f"js/background/{name} was removed")
        if (bg / "background.json").exists() or (bg / "capetown.js").exists():
            fail("the personal background survived setup.py")
        if shutil.which("node"):
            js = f"const m = await import({str(bg / 'example.js')!r}); m.default({{ hour: 19.3, seed: 1 }})(0);"
            subprocess.run(["node", "--input-type=module", "-e", js], check=True)

        # the converter escapes a title in meta tags and a "</script>" in the embedded post
        post = site / "blogs" / "posts" / "check.md"
        post.write_text('---\ntitle: \'Say "hi" </script>\'\ndate: 2026-01-01\nexcerpt: >\n  Two\n  lines\n'
                        'thumbnail: x.png\nid: check\n---\nText </script><b>bold</b>\n', encoding="utf-8")
        subprocess.run([sys.executable, "convert-blog.py", str(post), "--update-index"], cwd=site, check=True,
                       capture_output=True)
        page = (site / "blogs" / "check.html").read_text(encoding="utf-8")
        if 'content="Say &quot;hi&quot; &lt;/script&gt;"' not in page:
            fail("blog title is not escaped in the meta tags")
        data = re.search(r"window\.BLOG_POST_DATA = (.*);", page).group(1)
        if "</script>" in data:
            fail('a "</script>" in a post ends the embedding script')
        if '"excerpt": "Two lines"' not in data and 'content="Two lines"' not in page:
            fail("a multi-line YAML excerpt is not read")

    print("OK: setup.py leaves a clean template; the converter escapes titles and posts")


if __name__ == "__main__":
    main()
