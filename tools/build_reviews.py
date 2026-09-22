#!/usr/bin/env python3
"""Render content/reviews.json into the review wheel on the home page.

    python3 tools/build_reviews.py

Rewrites everything between <!-- reviews:start --> and <!-- reviews:end --> in
site/index.html, so the reviews are plain HTML (they show without JavaScript)
and adding one is a JSON edit. Only 5-star reviews with text belong in the file.
"""
from html import escape
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "content" / "reviews.json"
PAGE = ROOT / "site" / "index.html"
START, END = "<!-- reviews:start -->", "<!-- reviews:end -->"
INDENT = " " * 10


def card(r):
    name = escape(r["name"])
    initial = escape(r["name"].strip()[0].upper())
    # Google avatars are hotlinked; if one fails, script.js drops the <img>
    # and the initial underneath shows instead, as on Google.
    img = ""
    if r.get("avatar"):
        extra = ' referrerpolicy="no-referrer"' if r["avatar"].startswith("http") else ""
        img = f'<img src="{escape(r["avatar"])}" width="128" height="128" loading="lazy" alt=""{extra}>'
    text = "<br>".join(escape(line) for line in r["text"].strip().split("\n"))
    return f"""<figure class="review">
  <div class="review__head">
    <span class="review__avatar" data-initial="{initial}">{img}</span>
    <figcaption><cite class="review__name">{name}</cite><div class="review__stars" aria-label="5 out of 5 stars">★★★★★</div></figcaption>
    <svg class="review__google" viewBox="0 0 48 48" role="img" aria-label="Google review"><use href="#google-g"/></svg>
  </div>
  <blockquote class="review__text">{text}</blockquote>
  <button class="review__more" type="button" aria-expanded="false" hidden>Read more</button>
</figure>"""


def main():
    reviews = json.loads(DATA.read_text())["reviews"]
    for r in reviews:
        assert r["text"].strip(), f"{r['name']}: no text"
    html = "\n".join(card(r) for r in reviews)
    html = "\n".join(INDENT + line if line else line for line in html.split("\n"))
    page = PAGE.read_text()
    pattern = re.compile(re.escape(START) + r".*?" + re.escape(END), re.S)
    assert pattern.search(page), "review markers missing from site/index.html"
    page = pattern.sub(lambda _: f"{START}\n{html}\n{INDENT}{END}", page)
    PAGE.write_text(page)
    print(f"{len(reviews)} reviews written to {PAGE.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
