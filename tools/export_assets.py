#!/usr/bin/env python3
"""Cut every image the site uses out of the design PSDs.

    python3 tools/export_assets.py

Reads design/psd/{home,about,logo}.psd (gitignored, too large for git) and
writes site/img/. The photos are the full-resolution originals embedded in
the PSDs' smart objects (9504 x 5344), cropped to the exact region each
layer shows in the design, so re-running this after a PSD changes picks up
a new crop automatically.

Needs psd-tools and Pillow.
"""
from pathlib import Path
import io

from PIL import Image, ImageDraw
from psd_tools import PSDImage

ROOT = Path(__file__).resolve().parent.parent
PSD = ROOT / "design" / "psd"
OUT = ROOT / "site" / "img"


def layers(psd):
    return {l.name: l for l in psd.descendants()}


def embedded(layer):
    return Image.open(io.BytesIO(layer.smart_object.data))


def crop_as_placed(layer, region):
    """Crop a smart object's embedded original to a canvas-space region.

    Smart objects in these files are only scaled and moved, never rotated,
    so canvas -> source is a straight linear map off the layer's bbox.
    """
    src = embedded(layer)
    x0, y0, x1, y1 = layer.bbox
    sx = src.width / (x1 - x0)
    sy = src.height / (y1 - y0)
    rx0, ry0, rx1, ry1 = region
    box = (
        round((rx0 - x0) * sx),
        round((ry0 - y0) * sy),
        round((rx1 - x0) * sx),
        round((ry1 - y0) * sy),
    )
    return src.crop(box).convert("RGB")


def save_jpeg(im, name, width, quality=80):
    h = round(im.height * width / im.width)
    im.resize((width, h), Image.LANCZOS).save(
        OUT / name, "JPEG", quality=quality, optimize=True, progressive=True
    )
    print(f"  {name:32} {width}x{h}")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "reviews").mkdir(exist_ok=True)
    (OUT / "partners").mkdir(exist_ok=True)

    home = layers(PSDImage.open(PSD / "home.psd"))
    about = layers(PSDImage.open(PSD / "about.psd"))
    stills = "INVICTUS Training_Stills_JPG_"

    print("photos")
    # Hero: the 1920 x 1080 the design shows.
    hero = crop_as_placed(home[stills + "DSC09247"], (0, 0, 1920, 1080))
    save_jpeg(hero, "hero.jpg", 2400, 78)
    save_jpeg(hero, "hero-1200.jpg", 1200, 78)

    # Programme cards: each photo is clipped to a 421 x 318 black box.
    for layer, box, out in [
        ("DSC09647", (93, 1332, 514, 1650), "program-adult-bjj.jpg"),
        ("DSC09933", (534, 1332, 954, 1650), "program-adult-muay-thai.jpg"),
        ("DSC08887", (975, 1332, 1395, 1650), "program-kids-jiu-jitsu.jpg"),
        ("DSC09054", (1414, 1332, 1835, 1650), "program-kids-muay-thai.jpg"),
    ]:
        save_jpeg(crop_as_placed(home[stills + layer], box), out, 840)

    # Coaches: the photo runs from the left edge to where the orange panel starts.
    coach = crop_as_placed(home[stills + "DSC097951"], (0, 2216, 927, 3054))
    save_jpeg(coach, "coaches.jpg", 1400)

    # FAQ background: the whole placed frame, so it can cover a taller
    # section on mobile. The design darkens it with a 54% black fill (CSS).
    faq = crop_as_placed(home[stills + "DSC09775"], (0, 3763, 1920, 4843))
    save_jpeg(faq, "faq-bg.jpg", 1920, 70)

    # About hero: a pre-tinted screenshot, placed from x=482 to past the right
    # edge. Its left 25px is a black strip and a teal UI line sits near the
    # bottom-left; both hide under the orange panel on desktop but show on
    # mobile, so trim the strip and patch the line with the rows just above it.
    about_img = crop_as_placed(
        about["Screenshot 2026-09-20 at 3.50.49\u202fPM copy"], (510, 0, 1920, 1121)
    )
    ys = [y for y in range(about_img.height - 200, about_img.height)
          if about_img.getpixel((40, y))[1] > 90]
    if ys:
        y0, y1 = ys[0] - 3, ys[-1] + 4
        about_img.paste(about_img.crop((0, 2 * y0 - y1, 260, y0)), (0, y0))
    save_jpeg(about_img, "about-hero.jpg", 1800, 80)

    print("logo")
    # The master is opaque white-on-black with a black margin; trim to the frame.
    logo = embedded(home["INVICTUS-Training-Center.png copy"]).convert("RGB")
    bbox = logo.convert("L").point(lambda v: 255 if v > 60 else 0).getbbox()
    pad = 14
    bbox = (bbox[0] - pad, bbox[1] - pad, bbox[2] + pad, min(logo.height, bbox[3] + pad))
    logo = logo.crop(bbox)
    w = 640
    logo.resize((w, round(logo.height * w / logo.width)), Image.LANCZOS).save(
        OUT / "logo.png", optimize=True
    )
    print(f"  logo.png                         {w}px wide, trimmed to {bbox}")
    # Favicon / touch icon: the logo centred on a black square.
    for size, name in [(64, "favicon.png"), (180, "apple-touch-icon.png")]:
        sq = Image.new("RGB", (size, size), "black")
        lw = round(size * 0.92)
        lg = logo.resize((lw, round(logo.height * lw / logo.width)), Image.LANCZOS)
        sq.paste(lg, ((size - lg.width) // 2, (size - lg.height) // 2))
        sq.save(OUT / name, optimize=True)
        print(f"  {name}")

    print("partners")
    # BJJ Fanatics exists only as a 192 x 35 raster pasted into the PSD.
    home["Layer 1"].topil().save(OUT / "partners" / "bjj-fanatics.png", optimize=True)
    # The embedded Atomic file is full colour; the design shows it grey (~#8a8a8a icon,
    # white type), so drop the colour and keep the alpha.
    atomic = embedded(home["Atomic-Logo-Side-White-Text-01-2048x615.png"]).convert("RGBA")
    grey = atomic.convert("L")
    atomic = Image.merge("RGBA", (grey, grey, grey, atomic.getchannel("A")))
    atomic.resize((480, round(615 * 480 / 2048)), Image.LANCZOS).save(
        OUT / "partners" / "atomic-nutrition.png", optimize=True
    )
    embedded(home["big-little-gyms-words-white-copy-blg-300-copy-1-2"]).convert("RGBA").save(
        OUT / "partners" / "big-little-gyms.png", optimize=True
    )
    print("  bjj-fanatics.png, atomic-nutrition.png, big-little-gyms.png")

    print("review avatars")
    # Cut from the Google-reviews screenshot the design pastes in (2x retina).
    shot = embedded(home["Screenshot 2026-09-20 at 2.55.44 PM"]).convert("RGB")
    for cx, name in [(160, "adam-richardson"), (896, "kaylee-drozewski"), (1632, "crystal-nadeau")]:
        r = 52
        face = shot.crop((cx - r, 147 - r, cx + r, 147 + r)).resize((128, 128), Image.LANCZOS)
        mask = Image.new("L", (512, 512), 0)
        ImageDraw.Draw(mask).ellipse((0, 0, 511, 511), fill=255)
        face.putalpha(mask.resize((128, 128), Image.LANCZOS))
        face.save(OUT / "reviews" / f"{name}.png", optimize=True)
        print(f"  reviews/{name}.png")


if __name__ == "__main__":
    main()
