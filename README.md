# TECHIBOY LLC — Website

Animated, hand-coded site for techiboyllc.com (plain HTML/CSS/JS — no build step, no frameworks).

## Structure
| Path | What it is |
| --- | --- |
| `index.html`, `styles.css`, `script.js` | The homepage |
| `theme.js` | Light/dark switch shared by every page |
| `scene3d.js` | The 3D hero scene (Three.js) |
| `assets/vendor/` | Bundled Three.js and Motion libraries (MIT licences included) |
| `.claude/skills/` | Claude Code skills used to build the site: `framer-motion` and `ui-ux-pro-max` (not published by GitHub Pages) |
| `privacy.html`, `terms.html`, `refund.html` | Legal pages |
| `assets/` | Logo, portfolio images (WebP), social preview image, touch icon |
| `classic/` | The previous liquid-glass design, kept as a self-contained backup |
| `animated/` | Redirects old `/animated/` links to the homepage |
| `robots.txt`, `sitemap.xml` | Tell search engines what to crawl and list every public page |
| `llms.txt` | Plain-text summary of the business for AI assistants (ChatGPT, Gemini, Claude); update it when services or prices change |
| `404.html` | "Page not found" page served by GitHub Pages |
| `favicon.ico`, `site.webmanifest`, `assets/icon-*.png` | Icons for browsers and Google search results |
| `_config.yml` | GitHub Pages settings (keeps this README off the public site) |
| `CNAME` | Custom domain for GitHub Pages |

## Design & animations
**3D style.** The hero is a real-time WebGL scene (Three.js): a glossy medallion carrying the Techiboy logo, orbiting
iridescent shapes and particles. It follows the cursor, drifts with scroll, can be dragged to spin and pauses when
off-screen. Sections swing in from depth on spring physics (Motion), cards tilt in 3D with a moving glare and layered
depth on the pricing cards, the portfolio is a 3D ring that spins as you scroll (a swipeable row on phones),
testimonials are a 3D coverflow, the headline is extruded, buttons press like physical keys and the contact section
sits on a moving perspective grid. If WebGL isn't available, the hero falls back to an animated card stack.

Light and dark themes follow each visitor's device setting automatically; the switch in the menu cycles
System → Light → Dark and remembers the choice. Visitors with "reduce motion" enabled get a still 3D scene and no
scroll or entrance animation.

## SEO
- Each page has a keyword-focused title and description, a canonical URL and link-preview tags.
- The homepage carries structured data for Google: organisation (name, logo, contact), website name,
  the logo design service with the three plan prices, and the FAQ.
- `sitemap.xml` lists the homepage (with portfolio images) and the legal pages. Update its `lastmod`
  dates when a page changes, and add any new page to it.
- `/classic/` (previous design) and `/animated/` (old address) are marked `noindex` so they don't compete
  with the homepage.
- All text is in the HTML and stays visible if JavaScript fails; the 3D scene loads after the page.

## Editing
- Text, prices, services, testimonials and FAQ: `index.html`. The ⌘K search entries and rotating hero words: `script.js`.
- 3D scene colours, shapes and speeds: `scene3d.js`.
- Colours: CSS variables at the top of `styles.css` (one block for light, one for dark).

## Deploy (GitHub Pages)
Repo Settings → Pages → Source: "Deploy from a branch" → Branch: `main`, folder `/ (root)`.
The contact form posts to Formspree (https://formspree.io/f/mblaeopz) — works on any static host.
