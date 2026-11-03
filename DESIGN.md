# Efitco Design Guide

Design intent for the Efitco theme, for people and agents (Sidekick in Canvas,
coding agents) who change how the theme looks. `AGENTS.md` covers code
structure; this file covers visual decisions. When they disagree, `AGENTS.md`
wins.

Sources: Figma "Efitco T10" frame `Homepage` (node 1:359, desktop 1920 only),
`docs/tokens.json`, `docs/token-compliance.md`, `docs/figma-inventory.md`,
ADR 0001, 0003, 0005. Values in this file are copied from those sources; do not
add a token that is not in `docs/tokens.json`.

## Intent

- Athletic, confident, product-first. Large condensed uppercase headings, plain
  body copy, lots of whitespace, one warm accent for actions.
- One accent color means "do something" (buttons, active controls). Do not use
  it for decoration. Why: a single action color keeps CTAs findable and keeps
  contrast checks to one pair.
- Every value comes from a theme setting. Why: merchants and Sidekick change the
  look in theme settings without editing CSS (ADR 0001).

## How to change the design

- Change a color, font, spacing base, radius or page width in **Theme settings**
  (`config/settings_schema.json`). Do not edit CSS for that. Why: CSS only reads
  CSS variables; a hardcoded value would ignore the merchant's setting.
- CSS in `assets/*.css` uses only `var(--color-*)`, `var(--font-*)`,
  `var(--space-*)`, `var(--radius-*)`. No hex, `rgb()` or `hsl()` literals.
  Tints and shadows use `color-mix()` with a variable. Why: 0 hardcoded colors
  is a release check (ADR 0001).
- A new token needs, in one change: `docs/tokens.json` → setting in
  `config/settings_schema.json` → variable in `snippets/css-variables.liquid` →
  row in this file. Why: the four places drift apart otherwise.
- Keep contrast at WCAG AA (4.5:1 normal text, 3:1 text ≥ 24px or ≥ 18.66px
  bold). Why: Lighthouse accessibility must stay ≥ 98.

## Color tokens (19)

Setting id → CSS variable: `<token>_color` → `--color-<token>` (underscores
become hyphens).

| Token | Default | Setting id | CSS variable | Use |
| --- | --- | --- | --- | --- |
| background | #FFFFFF | `background_color` | `--color-background` | Page background |
| foreground | #1A1A1A | `foreground_color` | `--color-foreground` | Body and heading text |
| muted | #4D4D4D | `muted_color` | `--color-muted` | Secondary text on any light background, including sand |
| muted_light | #6B6B6B | `muted_light_color` | `--color-muted-light` | Tertiary text, placeholders on white, alt, cream. Not on sand |
| border | #E5E5E5 | `border_color` | `--color-border` | Dividers, input and card borders |
| background_alt | #F4F4F4 | `background_alt_color` | `--color-background-alt` | Alternate band |
| background_alt_foreground | #1A1A1A | `background_alt_foreground_color` | `--color-background-alt-foreground` | Text on alt |
| background_cream | #F5F5F1 | `background_cream_color` | `--color-background-cream` | Inspiration banner, highlight cards |
| background_cream_foreground | #1A1A1A | `background_cream_foreground_color` | `--color-background-cream-foreground` | Text on cream |
| background_sand | #EBE6E0 | `background_sand_color` | `--color-background-sand` | Rich text + training level band, product cards |
| background_sand_foreground | #1A1A1A | `background_sand_foreground_color` | `--color-background-sand-foreground` | Text on sand |
| background_dark | #1E1E1E | `background_dark_color` | `--color-background-dark` | Footer, hero fallback, image overlay |
| background_dark_foreground | #FFFFFF | `background_dark_foreground_color` | `--color-background-dark-foreground` | Text on dark and on hero images |
| muted_on_dark | #999999 | `muted_on_dark_color` | `--color-muted-on-dark` | Secondary text on dark only |
| accent | #C8400E | `accent_color` | `--color-accent` | Primary buttons, active controls |
| accent_foreground | #FFFFFF | `accent_foreground_color` | `--color-accent-foreground` | Text on accent |
| sale | #BD1616 | `sale_color` | `--color-sale` | Sale badge, sale price |
| sale_foreground | #FFFFFF | `sale_foreground_color` | `--color-sale-foreground` | Text on sale badge |
| rating | #FFC107 | `rating_color` | `--color-rating` | Rating stars only, never text |

Section backgrounds are set in the template, not in a block setting:
`{% block 'container', background: 'alt' | 'cream' | 'sand' | 'dark' %}`.
The container sets both the background and its matching foreground. Why: one
line in the template changes a band, and text color always follows (ADR 0005).

## Contrast decisions (CTO)

These override the colors read from Figma. Visual diffs must not flag them.

| Decision | Figma | Theme | Ratio | Why |
| --- | --- | --- | --- | --- |
| Accent | #D94610 | #C8400E | 5.01:1 white text on accent, 4.55:1 on #F4F4F4 | #D94610 is 4.34:1, fails AA for 16px CTA text (CTO 30/10) |
| Secondary gray on light | #999999, #808080 | #6B6B6B (`muted_light`) | 5.33 on white, 4.85 on #F4F4F4, 4.88 on #F5F5F1 | Figma grays are 2.85:1 and 3.95:1 (CTO 27/10) |
| Gray on dark | #999999 | #999999 (`muted_on_dark`) | 5.85 on #1E1E1E | Allowed on dark only |
| Text on sand | — | `muted` #4D4D4D for secondary text | 6.81 | `muted_light` is 4.30 on sand, fails AA |
| Accent text on sand | — | only ≥ 24px or ≥ 18.66px bold | 4.03 | Passes AA large text only (ADR 0005) |

Hero text sits on photos: keep the slide overlay (`overlay_opacity`, default
30%, `--color-background-dark` mixed with transparent). Why: white text on an
uncontrolled photo has no guaranteed contrast.

## Typography

Two fonts, both from the Shopify font library through `font_picker`. Never
self-host or add a third family. Why: one heading + one body family is the
theme standard; Figma's two stray fonts (Sofia Sans 800, Host Grotesk 700)
render with the heading font (CTO 30/10).

| Role | Setting id | Default | CSS variables | Weights |
| --- | --- | --- | --- | --- |
| Heading | `type_heading_font` | Sofia Sans Condensed 700 (`sofia_sans_condensed_n7`) | `--font-heading--family`, `--font-heading--weight`, `--font-heading--weight-display` (800) | 700 headings, 800 display and wordmark |
| Body | `type_primary_font` | Inter 400 (`inter_n4`) | `--font-primary--family`, `--font-primary--weight` | 400, 500, 600, 700 |

Type scale (9 steps, px at 1280+). Headings use `clamp()` and shrink on small
screens.

| Figma px | CSS variable | Use |
| --- | --- | --- |
| 13 | `--font-size-xs` | Badges, cart count, editor hints |
| 14 | `--font-size-sm` | Navigation, footer, captions |
| 16 | `--font-size-base` | Body, buttons |
| 18 | `--font-size-lg` | Lead text, footer column headings, h4 |
| 28 | `--font-size-h3` | h3, link CTA |
| 36 | `--font-size-h2` | h2 |
| 48 | `--font-size-h1` | h1, block section headings (featured collection, Figma 1:495) |
| 100 | `--font-size-display` | Hero and rich text display headings |
| 200 | `--font-size-wordmark` | Footer EFITCO wordmark |

- Display headings: heading font, weight 800, uppercase, letter-spacing
  -0.04em, line-height 1, `text-wrap: balance`.
- Headings line-height `--line-height-heading` (1.1); body
  `--line-height-body` (1.5).
- Body copy in sentence case. Do not uppercase body text. Why: uppercase is
  reserved for display headings and eyebrows so they stand out.

## Spacing

One setting, `space_base` (default 4px), drives an 8-step scale. Why: the
merchant changes overall density with one control.

| Variable | Multiplier | Default px | Typical use |
| --- | --- | --- | --- |
| `--space-1` | × 1 | 4 | Icon nudge, tight gaps |
| `--space-2` | × 2 | 8 | Inline gaps, small padding |
| `--space-3` | × 3 | 12 | Button padding (block), icon + label gap |
| `--space-4` | × 4 | 16 | Card padding, list gaps |
| `--space-5` | × 6 | 24 | Heading → content gap, form spacing |
| `--space-6` | × 8 | 32 | Button padding (inline), column gaps |
| `--space-7` | × 12 | 48 | Block padding on small screens, footer gaps |
| `--space-8` | × 30 | 120 | Block padding on large screens |

Values between steps are written as multiples of `--space-1`
(for example `calc(var(--space-1) * 10)` = 40). Do not write raw px for
spacing.

## Corner radius (4)

| Setting id | CSS variable | Default | Use |
| --- | --- | --- | --- |
| `input_corner_radius` | `--radius-input` | 4 | Inputs, selects, textareas |
| `button_corner_radius` | `--radius-button` | 4 | Buttons |
| `card_corner_radius` | `--radius-card` | 12 | Cards, panels, dropdowns, inline images (product card, Figma 1:502) |
| `hero_corner_radius` | `--radius-hero` | 12 | Slideshow / hero frame |

Round controls (slideshow arrows, dots) use `50%`; that is a shape, not a
token.

## Page rhythm

- Content width: `max_page_width` → `--page-width`, default `91rem`
  (1416px content from Figma + 2 × 20px margin); option `110rem` for wide.
- Side margin: `min_page_margin` → `--page-margin`, default 20px (10–100).
- Layout is the container grid: margin | content | margin. Children sit in the
  content column; `.full-width` spans the viewport. Why: every band lines up to
  the same 1416px edge as Figma.
- Vertical rhythm between bands: `--space-7` (48) below 64rem, `--space-8`
  (120) from 64rem. Inside a block: heading → content `--space-5` (24),
  stacked content 40 on large screens.
- Header height: `--header-height` = `space_base` × 20 (80px). On a page that
  starts with a hero, the header overlays the hero with white text and turns
  solid with a light shadow after 80px of scroll.
- Breakpoints (mobile-first from 360): `48rem` (768), `64rem` (1024),
  `80rem` (1280). Figma has desktop only; mobile and tablet are derived
  (CTO 27/10).
- Touch targets ≥ 44px for buttons and links in controls; ≥ 24px minimum
  anywhere.

## Images

- Render through `snippets/image.liquid` (srcset 360/720/1080/1440,
  `sizes`, focal point from `image_picker`). Why: one place for responsive
  images and lazy loading.
- First slide of the hero: `loading="eager"` and `fetchpriority="high"`; every
  other image `loading="lazy"`. Why: only the hero is the LCP element.
- Hero image budget ≤ 200 KB WebP; no autoplay video with sound (ADR 0003).
- Alt text comes from the image's alt in Shopify. Decorative images (for
  example the image inside the rich text heading) use `alt=""`.
- Empty image in the editor: show a placeholder; on the storefront use the
  dark background color, never a broken image.
- Aspect ratios follow the Figma frames:

| Place | Ratio | Source |
| --- | --- | --- |
| Hero / slideshow | 1798 / 827 at 1280+, 4 / 3 at 768, 4 / 5 below | Figma 1:422, derived mobile |
| Collection card (Browse Categories) | 336 / 270 | Figma 1:395 |
| Training level card | 1 / 1 (456 × 456) | Figma 1:464 |
| Blog card | 300 / 448 | Figma 1:1022 |
| Inline heading image | 165 / 94, scales with the heading em | Figma 1:455 |

Ratios for blocks not built yet are provisional until Product and Design
confirm them (question ES1-T39).

## Calls to action

- Voice: Title Case, 2–4 words, starts with a verb, says what happens next.
  Figma copy: "Explore Equipment", "Become A Member", "View About Us",
  "Add Setup To Cart", "Add Bundle To Cart". Provisional until ES1-T39.
- Standard commerce actions ("Add to cart", "Sold out", "Checkout") use the
  theme locale strings, not custom copy. Why: they must match Shopify checkout
  wording and translations.
- No fake urgency or fake discounts: countdowns hide when the end date passes;
  bundle discounts shown in the theme must match a real automatic discount.
  Why: Theme Store requirement R8.
- Button styles, in `assets/base.css`:
  - `.button`: accent background, accent foreground, `--radius-button`,
    weight 600, min height 44px (52px from 80rem). Primary action, one per
    view.
  - `.button--secondary`: transparent, border and text in current color.
  - `.button--link`: heading font 700, 28/34, no background, arrow icon
    20 × 16; hover underlines the label and nudges the arrow `--space-1`
    toward inline-end (off with `prefers-reduced-motion`).
- Focus ring: 2px solid current color, offset 2px, on every interactive
  element.

## Direction (RTL-ready)

- CSS uses logical properties: `margin-block-start`, `padding-inline`,
  `inset-inline-start`, `inset-block-end`, `text-align: start | end`,
  `justify-self: start`. No `left`/`right`/`top`/`bottom` properties and no
  `margin-left`-style properties. Why: an RTL locale can be turned on later
  without rewriting CSS (Editions Fall '26, SRS TE-14 AC4).
- Merchant alignment settings keep the values `left` / `center` / `right`;
  `blocks/container.liquid` outputs `start` / `center` / `end` to CSS.
- Direction icons flip with `:dir(rtl)` and `scale: -1 1`: slideshow
  `previous`, `next` and the CTA `arrow` (`snippets/slideshow-icon.liquid`).
  Pause, play and the vertical header chevron do not flip.
- Properties with no logical keyword (for example `object-position`) get a
  `:dir(rtl)` override next to the LTR rule.
- `layout/theme.liquid` does not set `dir` yet; there is no RTL locale.
  `assets/slideshow.js` still scrolls in LTR terms and needs work before an
  RTL launch.
