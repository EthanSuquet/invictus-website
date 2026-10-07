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
  motion.js             scroll motion, after the Teeej site (see Motion below); the site works without it
  img/                  every image, cut from the PSDs by tools/export_assets.py
  video/hero-loop*.mp4  the header loops, desktop and phone (see Header loop below)
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
- **The hero moves.** The PSD's hero is a still. It plays a muted 29s montage loop: a landscape cut on
  screens 901px and wider (Ethan, 2026-09-29) and a portrait cut on phones (2026-10-07); see **Header loop** below. A dark fade was added
  across the top of the hero so the white nav stays legible over the loop's brighter shots.
- **The reviews** are a screenshot of three Google reviews in the PSD. They are a wheel of **every
  5-star review with text** (Ethan, 2026-09-22): arrows wrap round at both ends, it turns every 6s
  while on screen, stops once someone uses it, and stays still for reduced motion. Long reviews
  clamp to seven lines with *Read more*. The PSD's three come first; text is verbatim, typos
  included, because they are quotes. See **Reviews** below.
- **The map** is a screenshot in the PSD. It is a live Google Maps embed here.
- **Social icons** were pasted into the PSD as screenshots. They are redrawn as SVG, plain white on
  the black footer with no coloured tile (Ethan, 2026-10-07; the PSD had blue and gold tiles).
- **Partners: BJJ Fanatics only** (Ethan, 2026-10-07). The PSD also shows Atomic Nutrition and Big
  Little Gyms; both were removed, and BJJ Fanatics sits centred alone.
- **The logo's left edge is the headline's** (the page content edge), not the PSD's tighter inset.
- **About on phones** shows two paragraphs, then *Read more* for the rest (Ethan, 2026-10-07). Desktop
  shows the whole story, as in the PSD.
- **Coaches.** The PSD shows Nate's bio open and Bobby and Michael as boxed buttons. That is built
  as a switcher: click a coach to open their bio. Bobby's and Michael's bios are not in the PSD; Ethan
  supplied them on 2026-09-23.
- **One Get Started, pinned.** The home PSD draws a Get Started button at the bottom-left of every
  screenful. It is one button, not four: hidden over the hero, pinned bottom-left from there, and at
  rest at the foot of the location band so it never covers the footer (Ethan, 2026-09-22).
- **FAQ.** The PSD shows the questions only. They are built as an accordion, with a `+` added as the
  open affordance. The **answers** come from the FAQ at the foot of the old site, invictus-tc.com
  (pulled 2026-09-23), word for word except one missing word: "if we are good fit" → "if we are a
  good fit". Nothing else on the new site comes from the old one: it is a fresh start.
- **Two typos fixed** in Nate's copy: "coacheswho" → "coaches who", "wellrounded" → "well-rounded".
- **The About image** has a black strip and a teal UI line from the screenshot it came from. Both
  are hidden under the orange panel on desktop but would show on mobile, so the export trims and
  patches them.

## Motion

`site/motion.js` borrows the Teeej site's motion (`Teeej Website/curtain.js`, the same set-up its
Author page uses), at the same timings and easing (Ethan, 2026-09-28):

- **Curtain, home, desktop and phones:** the hero pins while its photo slowly zooms and its copy
  fades up and away, then the white programs section rises over it. Uses GSAP + ScrollTrigger 3.13
  from cdnjs, as Teeej does. While it runs the hero is exactly one screen tall: on 16:10 screens a
  little taller than the PSD's 16:9, and on phones the full screen instead of 88%. It is off for
  screens under 480px tall (landscape phones) and for any screen too short to hold all the hero
  copy, which keep the plain scroll. On phones the pin ignores the address bar sliding in and out,
  and the strip it uncovers under the hero is painted the hero's dark (Ethan, 2026-09-28).
- **Fade-in:** headings, copy, each program card (staggered across the row), the review wheel, each
  FAQ and the map rise 22px into view, and replay whenever they come back on screen.
- **Side-in, desktop:** the coaches photo and orange panel, and the About panel and photo, slide in
  from their own edges. On phones their copy fades in instead.
- **FAQ** answers slide open and shut; **nav links** get an orange underline that sweeps in on hover.

All of it is off under *reduced motion*, and nothing starts hidden unless the script is running.
Because the hero stays on screen while it is pinned, the pinned Get Started watches the programs
section instead: it appears once programs is 40% of the way up the screen.

## Header loop

`site/video/hero-loop.mp4` is the desktop hero video (Ethan, 2026-09-29), from Vimeo
<https://vimeo.com/1231402177/f2ce6c0f57>: a 29s training montage at 1920 × 1080, 23.976 fps, no
audio. It is re-encoded from Vimeo's 1080p rendition to 6.3 MB (H.264, CRF 26, `+faststart`):

```bash
ffmpeg -i source.mp4 -an -c:v libx264 -preset slow -crf 26 -profile:v high -pix_fmt yuv420p -movflags +faststart site/video/hero-loop.mp4
```

**The page opens on the loop, with no photo first and no fade** (Ethan, 2026-09-29). The hero's still
is the loop's own first frame (`img/hero-loop-start.jpg`), and a small inline script right after the
`<video>` in `index.html` starts it as the page is parsed rather than waiting for `script.js`. So
whatever shows before the video's first frame decodes is already that frame. Reduced motion
(`hero.jpg`, the PSD photo) keeps the photo and never downloads a video; so does a desktop without JS,
which sees the loop's first frame. `script.js` pauses the loop while the hero is off screen or the tab
is hidden, and the curtain zooms it with the still.

**Phones (900px and under) get a portrait cut** (Ethan, 2026-10-07), `site/video/hero-loop-mobile.mp4`,
from Vimeo <https://vimeo.com/1233799394/fd3fa58b99>: the same 29s montage at 390 × 844, which is the
largest Vimeo has (the upload itself is that size, so it is soft on 3x screens). It is Vimeo's
rendition remuxed, not re-encoded (2.9 MB):

```bash
ffmpeg -i source.mp4 -an -c:v copy -movflags +faststart site/video/hero-loop-mobile.mp4
ffmpeg -y -i site/video/hero-loop-mobile.mp4 -frames:v 1 -q:v 3 site/img/hero-loop-start-mobile.jpg
```

The inline script picks `data-src` or `data-src-mobile` by width, once, at load. The portrait loop is
centred (`object-position: 50% 50%`), and the phone gradient gained the same top fade as desktop so
the nav stays legible.

To swap in a new desktop loop, replace the file at the same path and re-export its first frame:

```bash
ffmpeg -y -i site/video/hero-loop.mp4 -frames:v 1 -q:v 3 site/img/hero-loop-start.jpg
```

## Reviews

`content/reviews.json` is the source; `python3 tools/build_reviews.py` renders it into the wheel in
`site/index.html` as plain HTML. Edit the JSON, never the cards.

**All of them are in: 37 reviews** (2026-09-22). The Google listing has 41 reviews, all 5 stars;
37 have text. The other four (Cady, Dan Germain, Michael Henriquez, Rachel Jerke) are stars only and
are left out. The PSD's three come first, as designed; the rest follow Google's *Most relevant* order.
Aaron Chase appears twice because he left two separate reviews.

⚠️ **Refreshing it needs a signed-in Google account.** Signed out, Google shows *"a limited view of
Google Maps"*: 10 reviews, with the rest behind a sign-in. The 2026-09-22 pull was done in Ethan's
signed-in Chrome, with the tab in front, because Maps stops loading reviews in a background tab.
For a new review, add an entry to the JSON and rebuild.

Avatars from the PSD are local; the Google ones are hotlinked from `lh3.googleusercontent.com`,
and if one stops loading the reviewer's initial shows instead.

## 🔴 Placeholders: nothing below exists in the PSDs

Written in `[SQUARE BRACKETS]` or marked `data-todo` so they cannot ship unnoticed:

```bash
grep -rn "TO COME\|data-todo" site/*.html
```

| What | Where | Behaviour now |
|---|---|---|
| **Get Started / Book your free intro session** destination: a form, a booking tool, a page? | nav, hero, and the pinned button | shows "link coming soon" |
| **Schedule** destination | nav | shows "link coming soon" |
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
