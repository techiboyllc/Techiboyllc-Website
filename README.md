# TECHIBOY LLC — Website

Liquid-glass iOS style redesign of techiboyllc.com. Fully self-contained: `index.html` embeds all images, fonts, styles and scripts.

## Deploy to GitHub Pages
1. Create a new repository (e.g. `techiboyllc-website`).
2. Upload `index.html` (and this README) to the repository root.
3. Repo Settings → Pages → Source: "Deploy from a branch" → Branch: `main`, folder `/ (root)` → Save.
4. Your site goes live at `https://<username>.github.io/<repo>/`.

The contact form posts to Formspree (https://formspree.io/f/mblaeopz) — works on any static host.

## Animated version (`/animated`)
A hand-coded animated version of the site lives in `animated/` (plain HTML/CSS/JS, no build step), styled after
the 21st.dev component aesthetic: spotlight "lamp" hero with sparkles and blur-in headline, animated-border
announcement pill and shimmer button, 3D tilted marquee of portfolio logos, number tickers, bento services grid
with cursor-following glowing borders (orbit, swatches, 3D cube and typing-terminal visuals), animated beam
process timeline, sliding pricing tabs with a border beam on the featured plan, testimonials marquee and a
⌘K / Ctrl+K command palette. Respects `prefers-reduced-motion`.

Preview it at `https://techiboyllc.com/animated/`. To make it the homepage, move the contents of
`animated/` to the repo root (replacing `index.html`).
