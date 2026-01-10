Icon implementation guide for Adrenalink

Summary

- Official image used: `/public/ADR.webp` (source of truth).
- For now we only use `/ADR.webp` for social/meta and mobile icons. SVG files were removed until verified.

What you need to provide

- High-resolution source logo (SVG preferred; PNG/WebP acceptable) at least 1200×1200 or vector.
- Preferred background: `transparent` or hex color. Provide both if you want separate variants.

Files we produce (recommended)

- `public/favicon-16x16.png` — 16×16 PNG (square)
- `public/favicon-32x32.png` — 32×32 PNG (square)
- `public/apple-touch-icon.png` — 180×180 PNG (square)
- `public/ADR.webp` — canonical official image (user-supplied)
- `public/og.png` — 1200×630 PNG (rasterized OG image for social)
- Optional: `public/favicon.ico` combining several sizes for legacy browsers

Why PNG/WebP are used

- Social networks and some platforms expect raster images (PNG/JPEG/WebP).
- Browser favicons accept SVG in some cases but raster fallbacks provide wide compatibility.

How to generate the recommended files (ImageMagick)

- Ensure ImageMagick is installed (macOS: `brew install imagemagick`).
- From project root, run (example commands):

```bash
# create square apple touch icon (180x180)
magick public/ADR.webp -resize 180x180 -background none -gravity center -extent 180x180 public/apple-touch-icon.png

# create 32x32 and 16x16 favicons
magick public/ADR.webp -resize 32x32 -background none -gravity center -extent 32x32 public/favicon-32x32.png
magick public/ADR.webp -resize 16x16 -background none -gravity center -extent 16x16 public/favicon-16x16.png

# create OG image (1200x630)
magick public/ADR.webp -resize 1000x1000 -background '#0f172a' -gravity center -extent 1200x630 public/og.png

# optional: create favicon.ico (include 16/32/48)
magick public/favicon-16x16.png public/favicon-32x32.png public/apple-touch-icon.png -colors 256 public/favicon.ico
```

Where to update the site

- `src/app/layout.tsx` — update `metadata.icons`, `openGraph.images` and `twitter.images` to point to the chosen assets (e.g., `/ADR.webp`, `/og.png`, `/favicon-32x32.png`).
- `public/manifest.json` — include entries for the icons.
- `public/robots.txt` / `public/sitemap.xml` — ensure domain references match production.

Notes and troubleshooting

- If using SVG for favicons, test in multiple browsers (Safari/Chrome/Firefox) — not all support SVG favicons consistently.
- Social platforms often ignore SVG `og:image` entries; provide PNG/JPEG/WebP OG images for reliable previews.
- Keep the canonical source (`/public/ADR.webp`) under version control so we can regenerate assets when needed.

If you want, I can:

- Generate `og.png` from `/ADR.webp` now and wire it into `metadata`.
- Recreate SVG variants after you confirm the vector source works across browsers.
