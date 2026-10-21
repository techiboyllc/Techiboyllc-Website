# TECHIBOY LLC — Website

Animated, hand-coded site for techiboyllc.com (plain HTML/CSS/JS — no build step, no frameworks).

## Structure
| Path | What it is |
| --- | --- |
| `index.html`, `styles.css`, `script.js` | The homepage |
| `theme.js` | Light/dark switch shared by every page |
| `privacy.html`, `terms.html`, `refund.html` | Legal pages |
| `assets/` | Logo, portfolio images (WebP), social preview image, touch icon |
| `classic/` | The previous liquid-glass design, kept as a self-contained backup |
| `animated/` | Redirects old `/animated/` links to the homepage |
| `CNAME` | Custom domain for GitHub Pages |

## Design & animations
Light and dark themes follow each visitor's device setting automatically; the switch in the menu cycles
System → Light → Dark and remembers the choice. Animations include an aurora hero background, letter-by-letter
rotating headline, auto-cycling 3D card stack of portfolio logos, brand marquee, number tickers, a sticky-scroll
services showcase (orbit, identity system, before/after morph, flipping business card, 3D cube, typing terminal),
a horizontal-scroll portfolio, a scroll-drawn process timeline, sliding pricing toggle with an animated border on
**Pro**, a testimonial carousel, an FAQ accordion, a cursor-spotlight footer wordmark and a ⌘K / Ctrl+K command
palette. Animations switch off for visitors who have "reduce motion" enabled.

## Editing
- Text, prices, services, testimonials and FAQ: `index.html`. The ⌘K search entries and rotating hero words: `script.js`.
- Colours: CSS variables at the top of `styles.css` (one block for light, one for dark).

## Deploy (GitHub Pages)
Repo Settings → Pages → Source: "Deploy from a branch" → Branch: `main`, folder `/ (root)`.
The contact form posts to Formspree (https://formspree.io/f/mblaeopz) — works on any static host.
