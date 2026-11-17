# AUDIT: what remains

Date: 2026-11-17. Branch: `redesign`, uncommitted fix pass on top of `8dade57`.

The redesign pass closed the previous audit's findings: prerendered HTML with one `<h1>` and `<main>`, a localized 404 on `dist/404.html`, white card labels at 4.81:1, a trapped mobile menu, named logo links, 24 px tap targets, canonical + `og:url` + Person JSON-LD + `robots.txt` + sitemap, a 1200x630 OG image, the 45° handover, a neutral Skills card on touch, a measured nav rule, the About axis and the project cards' covers, lines and links. The GitHub chapter is live, so nothing of it is parked. That record is in git, not here. One item is left.

## Open

- **The print masters ship (6).** `public/images/portrait.png` (5.33 MB) and `public/Signatur.png` (44 KB) are copied into `dist/` and are fetchable by path, though only `portrait-1200.webp` and `signature.png` are served; the four project screenshots sit beside their WebP covers the same way. `DESIGN.md` documents them as the assets' originals. Deferred by the owner: they cost disk, not a visit.

## Decided, no code

- **The document head stays English.** `<html lang>` and the copy switch to German; `<title>`, the description, `og:locale` and the OG tags do not. Recorded in `DESIGN.md`.
- **Vue stays tier 2.** The owner has not worked with it long enough to rank it higher; the B.Eng. entry's emphasis is the side that reads high, and the CV line is not worth changing for it.
- **No card in the fold under reduced motion.** The hero's right column is simply empty there: the card is already home in the grid, and a still card would be a second object.
- **The Projects index answers hover with colour only.** The rule is the ring's readout, not a second cursor; letting it follow the pointer made the click pull it back to the scroll position, so it was reverted.
- **The German register is formal throughout**, including "Schreiben Sie mir." as the contact heading.

## Checks run

| Check | Result |
|---|---|
| `npm run build` (`tsc --noEmit` + `vite-react-ssg build`) | pass, before the foil, cover, OG and image changes |
| Prerendered page in Playwright's Chromium | hydration clean (no console or page errors), one `<h1>`, one `<main>`, 404 answers HTTP 404 with `noindex` and its own title |
| Projects ring, 1440 | turns on scroll (−76.5° → −229.5°); the index row walks it below `lg` (−90° after the third row) |
| Layout at 390 / 768 / 1440 | no horizontal overflow; the grid is one column at 390 and two at 768; all four cards fit name and line |
| Fold under reduced motion, 1440 | zero cards inside the hero; the right column is empty |
| Covers | `object-contain`, unframed, all four present; 1280-wide WebP, 10–50 KB each from 0.1–4.7 MB masters |
| OG image | `public/images/og.jpg`, 1200x630, cropped from the new portfolio screenshot above the hero's actions, so no control is cut |

Not run: the build since the foil, cover, OG and image changes, Safari and Firefox, real hardware, screen readers, a fresh LCP measurement after the prerender switch, and the Skills tooltip (the automated pointer hits a drifting rail). The card's landing on the hero gutter is measured per layout in the rig but was not re-measured in a browser.
