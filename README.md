# TECHIBOY LLC — Website

Animated, hand-coded site for techiboyllc.com (plain HTML/CSS/JS — no build step, no frameworks).

## Structure
| Path | What it is |
| --- | --- |
| `index.html`, `styles.css`, `script.js` | The homepage |
| `privacy.html`, `terms.html`, `refund.html` | Legal pages |
| `assets/` | Logo, portfolio images (WebP), social preview image, touch icon |
| `classic/` | The previous liquid-glass design, kept as a self-contained backup |
| `animated/` | Redirects old `/animated/` links to the homepage |
| `CNAME` | Custom domain for GitHub Pages |

## Animations
Styled after the 21st.dev component aesthetic: spotlight "lamp" hero with sparkles and blur-in headline,
animated-border announcement pill and shimmer button, 3D tilted marquee of portfolio logos, number tickers,
bento services grid with cursor-following glowing borders (orbit, swatches, 3D cube and typing-terminal
visuals), animated beam process timeline, sliding pricing tabs with a border beam on the featured plan,
testimonials marquee and a ⌘K / Ctrl+K command palette. Animations switch off for visitors who have
"reduce motion" enabled.

## Editing
- Text, prices and services: `index.html`. Testimonials and the ⌘K search entries: `script.js`.
- Colors and spacing: CSS variables at the top of `styles.css`.

## Deploy (GitHub Pages)
Repo Settings → Pages → Source: "Deploy from a branch" → Branch: `main`, folder `/ (root)`.
The contact form posts to Formspree (https://formspree.io/f/mblaeopz) — works on any static host.
