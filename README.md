# INVICTUS Training Center: website

The new site for INVICTUS Training Center (BJJ and Muay Thai, 48 Dunham Ridge Rd, Beverly, MA),
built from scratch from the Storyhaus PSDs. Plain HTML and CSS, no framework, no build step.

**Preview:** <https://ethansuquet.github.io/invictus-website/>. It is a staging URL to show people
before anything goes to the real domain, and every page is served `noindex`.

```
site/                ← the deployable. Upload this directory, nothing else.
  index.html            Home
  about.html            About ("Unconquered")
  styles.css            the whole design system
  script.js             mobile menu, coach switcher, review wheel, pinned button; the site works without it
  img/                  every image, cut from the PSDs by tools/export_assets.py
tools/export_assets.py ← regenerates site/img/ from the PSDs
design/psd/          ← the three PSDs (gitignored: 243 MB)
.github/workflows/   ← GitHub Pages deploy
```

## Working on it

```bash
python3 -m http.server 8765 --directory site
```

Then open <http://localhost:8765>. Push to `main` and the preview redeploys in about a minute.

## Source designs

| PSD (in `design/psd/`) | Became |
|---|---|
| `home.psd`: *Invictus homepage orange*, 1920 × 5922 | `index.html` |
| `about.psd`: *Invictus about us*, 1920 × 1437 | `about.html` |
| `logo.psd`: *INVICTUS-Training-Center.png*, 1312 × 488 | the logo master (the same art is embedded in both page PSDs) |

The originals arrived on 2026-09-21 in `~/Downloads/`. **Match the PSD** is the rule: copy is
transcribed from the text layers word for word, colours are read from the fill layers, and every
size in `styles.css` is the PSD value scaled with the viewport.

`python3 tools/export_assets.py` (needs `psd-tools` and Pillow) rebuilds `site/img/`. It crops the
**full-resolution originals embedded in the smart objects** (9504 × 5344) to exactly the region each
layer shows, so a changed crop in a PSD carries through on the next run.

Tokens: orange `#f29821`, hero type `#fdf9f5`, location band `#cdcdcd`, black.

### Where the build departs from the PSD, and why

- **Font.** The design is set in **Gotham** (Black, Medium, Light), which needs a paid web licence
  from Hoefler&Co. The preview uses **Montserrat** from Google Fonts, the standard stand-in.
  Medium and Light set within 2% of Gotham's widths at the PSD sizes. Black runs about 20% wider,
  so the hero headline is a little smaller than in the PSD to keep the same line lengths. If a
  Gotham licence is bought, put the files in `site/fonts/`, add `@font-face` rules, move Gotham to
  the front of `--font` in `styles.css`, and bring `--fs-display` and `--fs-nav` back to the PSD
  sizes of 119 and 20.
- **The reviews** are a screenshot of three Google reviews in the PSD. They are a wheel of **every
  5-star review with text** (Ethan, 2026-09-22): arrows wrap round at both ends, it turns every 6s
  while on screen, stops once someone uses it, and stays still for reduced motion. Long reviews
  clamp to seven lines with *Read more*. The PSD's three come first; text is verbatim, typos
  included, because they are quotes. See **Reviews** below.
- **The map** is a screenshot in the PSD. It is a live Google Maps embed here.
- **Social icons** were pasted into the PSD as screenshots. They are redrawn as SVG in the same
  colours (`#415893`, `#d7a93a`).
- **The Atomic Nutrition logo** is embedded in full colour but shows grey in the design. The export
  script desaturates it to match.
- **Coaches.** The PSD shows Nate's bio open and Bobby and Michael as boxed buttons. That is built
  as a switcher: click a coach to open their bio.
- **One Get Started, pinned.** The home PSD draws a Get Started button at the bottom-left of every
  screenful. It is one button, not four: hidden over the hero, pinned bottom-left from there, and at
  rest at the foot of the location band so it never covers the footer (Ethan, 2026-09-22).
- **FAQ.** The PSD shows the questions only. They are built as an accordion, with a `+` added as the
  open affordance.
- **Two typos fixed** in Nate's copy: "coacheswho" → "coaches who", "wellrounded" → "well-rounded".
- **The About image** has a black strip and a teal UI line from the screenshot it came from. Both
  are hidden under the orange panel on desktop but would show on mobile, so the export trims and
  patches them.

## Reviews

`content/reviews.json` is the source; `python3 tools/build_reviews.py` renders it into the wheel in
`site/index.html` as plain HTML. Edit the JSON, never the cards.

🔴 **12 of 41 are in so far.** The Google listing has 41 reviews, all 5 stars (2026-09-22), but
signed-out visitors get *"a limited view of Google Maps"*: 10 reviews, with *See more reviews (31)*
behind a Google sign-in. Those 10 are in, plus Adam Richardson's and Kaylee Drozewski's from the PSD
screenshot (Crystal Nadeau's is in both). To add the other 29, read them from a signed-in Google
account (or the owner's Business Profile), add one entry per review to the JSON, and rebuild.

Avatars from the PSD are local; the Google ones are hotlinked from `lh3.googleusercontent.com`,
and if one stops loading the reviewer's initial shows instead.

## 🔴 Placeholders: nothing below exists in the PSDs

Written in `[SQUARE BRACKETS]` or marked `data-todo` so they cannot ship unnoticed:

```bash
grep -rn "TO COME\|data-todo" site/*.html
```

| What | Where | Behaviour now |
|---|---|---|
| **Answers to the 8 FAQ questions** | Home, *Before your first class* | `[ANSWER TO COME]` |
| **Bobby McCarron and Michael Zenga bios** | Home, *Meet the Coaches* | `[… BIO TO COME]` |
| **Get Started / Book your free intro session** destination: a form, a booking tool, a page? | nav, hero, and the pinned button | shows "link coming soon" |
| **Schedule** destination | nav | shows "link coming soon" |
| **Facebook and Instagram URLs** | footer | shows "link coming soon" |
| **BJJ / Muay Thai / Kids pages** | nav | jump to the programs section on Home until those pages are designed |
| **BJJ Fanatics logo** | footer | only a 192 × 35 raster exists in the PSD, so it is soft on retina screens. Ask for a vector |

## Before this goes live

1. Fill every placeholder above.
2. Settle the font: license Gotham or sign off on Montserrat.
3. Choose the host and point the domain. For GitHub Pages, add a `CNAME` and remove the noindex
   step from `.github/workflows/pages.yml`. For any other host, upload `site/`: the committed HTML
   carries no noindex.

## Deploying

`.github/workflows/pages.yml` publishes `site/` to GitHub Pages on every push to `main`, injecting
`noindex,nofollow` into each page at deploy time. No `CNAME` is committed.

Repo: <https://github.com/EthanSuquet/invictus-website>. It is public, because Pages on a free
plan needs a public repo, so keep nothing private in it.
