# TECHIBOY LLC — Website

Liquid-glass iOS style redesign of techiboyllc.com. Fully self-contained: `index.html` embeds all images, fonts, styles and scripts.

## Deploy to GitHub Pages
1. Create a new repository (e.g. `techiboyllc-website`).
2. Upload `index.html` (and this README) to the repository root.
3. Repo Settings → Pages → Source: "Deploy from a branch" → Branch: `main`, folder `/ (root)` → Save.
4. Your site goes live at `https://<username>.github.io/<repo>/`.

The contact form posts to Formspree (https://formspree.io/f/mblaeopz) — works on any static host.

## Animated version (`/animated`)
A hand-coded animated version of the site lives in `animated/` (plain HTML/CSS/JS, no build step):
interactive particle-network hero, loader, rotating headline, scroll reveals and character-split headings,
count-up stats, 3D tilt cards with cursor spotlight, magnetic buttons, animated process timeline,
tools marquee, animated pricing toggle and a spinning gradient border on the featured plan.
Respects `prefers-reduced-motion`.

Preview it at `https://techiboyllc.com/animated/`. To make it the homepage, move the contents of
`animated/` to the repo root (replacing `index.html`).
