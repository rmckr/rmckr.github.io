# Design notes

## Brief

A personal portfolio for Lukas Romacker, a computer science student in Ulm. Dark, modern, premium: soft surfaces, generous space, one accent. No motion in this pass.

## Direction

A quiet, product-grade interface rather than a poster. Structure comes from a single card language and scale contrast in one type family, not from rules and frames.

- **Ground** `#080808` — flat near-black, with one soft neutral light at the top of the page.
- **Ink** `#cdcbca` — warm paper, not white. Headings, names, primary text.
- **Muted** `#8a8786` — body copy and secondary labels.
- **Accent** `#d41514` — red, used *only* to accentuate: primary action, availability dot, wordmark tile, the period after the name, selection, focus ring. Never for structure, dividers, or body text.
- **Lines** `#1f1f20` / `#2c2c2e` — hairlines for card borders and control outlines.

## Surfaces

- `.card` — 1rem radius, hairline border, a vertical near-black gradient and a 1px inset top highlight. `.card-xl` (1.25rem) for the contact panel.
- `.chip` — 0.5rem rounded rectangle for metadata (availability, location, tier legend).
- `.btn` — 0.625rem rounded action; `.btn-solid` is the only red fill on the page.
- No pill shapes anywhere; dots stay circular because they are dots.
- Nested radii step down (1rem card → 0.5rem image) so corners stay concentric.

## Type

Outfit only, plus Fira Code for micro-labels.

- Hero name: `clamp(3.25rem, 9.5vw, 7.5rem)`, weight 300, tracking `-0.045em`.
- Section headings: weight 300, tracking `-0.04em`, balanced.
- Body: 1rem / 1.7, muted; highlighted phrases are ink + medium weight.
- Labels: 12px Fira Code, uppercase, 0.14em tracking.

## Layout

Twelve-column grid on an 84rem container. The hero pairs the name with the portrait card; About is prose plus a small contact/CV card; Experience and Skills are stacks of cards; Contact is one large panel.

## Motion

None. Motion and Lenis remain installed but are no longer called; `Reveal`, `useSmoothScroll` and `lib/motion` are kept on disk for the animation pass. Hover and active states are instant.

## Content

From `src/i18n` and `src/data` only. No invented facts. GitHub section stays out of `sections.ts`.

## Implementation contract

Tokens live in `src/index.css` under `@theme`; components use them through Tailwind classes (`bg-surface`, `text-muted`, `border-line`, `text-accent`) and never through new hex values.

| token | value | role |
| --- | --- | --- |
| `ground` | `#080808` | page |
| `surface` | `#0e0e0f` | raised blocks (mobile menu) |
| `raise` | `#151516` | image wells |
| `ink` | `#cdcbca` | headings, primary text |
| `muted` | `#8a8786` | body, secondary text |
| `faint` | `#7a7773` | counters, decorative labels |
| `line` | `#1f1f20` | card borders, dividers |
| `line-strong` | `#2c2c2e` | control outlines |
| `accent` | `#d41514` | see below |

Red appears in exactly six places: `.btn-solid` fill, availability dot, wordmark tile, the period after the name, `::selection`, `:focus-visible`. Nowhere else — not borders, not dividers, not meters, not body text.

Radii: `.card` 1rem, `.card-xl` 1.25rem, nested image 0.5rem, `.btn` 0.625rem, `.chip` 0.5rem, nav bar 0.75rem, nav items 0.5rem, social rows 0.75rem. No pill radii; circles only for dots.

Type: Outfit 300/400/500 and Fira Code 400/500 only. Display text is weight 300 with −0.04…−0.045em tracking; micro-labels use `.label-mono`.

## Working across chats

New chats do not inherit this conversation, so the contract has to live in files. Every chat should read `AGENTS.md` and this file before touching UI. A prompt that holds the line:

> Read AGENTS.md and DESIGN.md, then <task>. Keep the existing design language: tokens only, red for accentuation only, no pill shapes, no motion.

- One section or one concern per chat, so diffs stay reviewable and the language is not re-invented in three places at once.
- Build/critique: `awwwards` (build), `emil-design-eng` (polish critique), `unslop` (remove generic AI tells), `break-ui` (worst-case data), `mobile-native` (touch behaviour).
- Motion pass: `animate`, `animation-performance`, `review-animations`; the dormant `Reveal.tsx`, `useSmoothScroll.ts` and `lib/motion.ts` are the starting points.
- Installed skills live in `.agents/skills/`. Add more with `npx skills find <query>` and `npx skills add <owner/repo> --skill <name> --yes`.
- Skills that drive a browser (`jury`, visual runs of `unslop`/`break-ui`) conflict with `AGENTS.md` §1; lift that rule for that chat or run the check yourself.
- Commit a checkpoint before starting a new chat, so the next agent has a diff to respect.
