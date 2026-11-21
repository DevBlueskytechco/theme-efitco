# Efitco Design Guide

Design intent for the Efitco theme, for people and agents (Sidekick in Canvas,
coding agents) who change how the theme looks. `AGENTS.md` covers code
structure; this file covers visual decisions. When they disagree, `AGENTS.md`
wins.

Sources: Figma "Efitco T10" frame `Homepage` (node 1:359, desktop 1920 only),
Figma "Efitco Theme Final / Design System 2" (text styles, Space and Radius
variables; DS check 20/11, ES1-T527), `docs/tokens.json`, `docs/token-compliance.md`, `docs/figma-inventory.md`,
ADR 0001, 0003, 0005. Values in this file are copied from those sources; do not
add a token that is not in `docs/tokens.json`. Component detail (anatomy,
states, do / don't) lives in `docs/ui-spec/foundation.md` and the mockup kit
`drafts/designer/_kit/kit.css`; when this file and foundation.md disagree,
foundation.md and `docs/design/decisions.md` win.

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

## Color tokens (22 settings + 3 derived)

Setting id → CSS variable: `<token>_color` → `--color-<token>` (underscores
become hyphens).

| Token | Default | Setting id | CSS variable | Use |
| --- | --- | --- | --- | --- |
| background | #FFFFFF | `background_color` | `--color-background` | Page background |
| foreground | #1A1A1A | `foreground_color` | `--color-foreground` | Body and heading text |
| muted | #4D4D4D | `muted_color` | `--color-muted` | Secondary text on any light background, including sand |
| muted_light | #6B6B6B | `muted_light_color` | `--color-muted-light` | Tertiary text, placeholders on white, alt, cream. Not on sand |
| border | #E5E5E5 | `border_color` | `--color-border` | Dividers, input and card borders |
| background_alt | #F4F4F5 | `background_alt_color` | `--color-background-alt` | Alternate band |
| background_alt_foreground | #1A1A1A | `background_alt_foreground_color` | `--color-background-alt-foreground` | Text on alt |
| background_cream | #F5F5F1 | `background_cream_color` | `--color-background-cream` | Highlight cards |
| background_cream_foreground | #1A1A1A | `background_cream_foreground_color` | `--color-background-cream-foreground` | Text on cream |
| background_sand | #EBE6E0 | `background_sand_color` | `--color-background-sand` | Rich text + training level band, inspiration banner (1:625, ES1-T116), product cards |
| background_sand_foreground | #1A1A1A | `background_sand_foreground_color` | `--color-background-sand-foreground` | Text on sand |
| background_dark | #1A1A1A | `background_dark_color` | `--color-background-dark` | Header bar, footer, dark bands, hero fallback, image overlay |
| background_dark_foreground | #FFFFFF | `background_dark_foreground_color` | `--color-background-dark-foreground` | Text on dark and on hero images |
| background_panel | #393942 | `background_panel_color` | `--color-background-panel` | Quiz, shop the look and bundle panels (1:507, 1:611, 1:718). Text uses `background_dark_foreground` |
| muted_on_dark | #999999 | `muted_on_dark_color` | `--color-muted-on-dark` | Secondary text on dark only |
| accent | #C8400E | `accent_color` | `--color-accent` | Primary buttons, active controls |
| accent_foreground | #FFFFFF | `accent_foreground_color` | `--color-accent-foreground` | Text on accent |
| sale | #BD1616 | `sale_color` | `--color-sale` | Sale badge, sale price |
| sale_foreground | #FFFFFF | `sale_foreground_color` | `--color-sale-foreground` | Text on sale badge |
| badge_new | #4B824D | `badge_new_color` | `--color-badge-new` | New badge background only, with white text (4.57:1). Never as text color |
| badge_new_foreground | #FFFFFF | `badge_new_foreground_color` | `--color-badge-new-foreground` | Text on New badge |
| rating | #FFC107 | `rating_color` | `--color-rating` | Rating stars only, never text |

Derived colors (no setting; computed from tokens with `color-mix()`):

| Name | Formula | Default | Use |
| --- | --- | --- | --- |
| `--color-accent-on-sand` | accent 90% + foreground | #B73C0F (4.62 on sand) | Eyebrow and accent text on sand |
| `--panel-muted` | dark foreground 70% + panel | #C4C4C6 (6.56) | Secondary text on every dark panel |
| `--panel-saving` | badge_new 50% + dark foreground | #A5C0A6 (5.82) | Discount lines on dark panels, always with a tag icon and U+2212 minus |

Section backgrounds are set in the template, not in a block setting:
`{% block 'container', background: 'alt' | 'cream' | 'sand' | 'dark' %}`.
The container sets both the background and its matching foreground. Why: one
line in the template changes a band, and text color always follows (ADR 0005).

## Contrast decisions (CTO)

These override the colors read from Figma. Visual diffs must not flag them.

| Decision | Figma | Theme | Ratio | Why |
| --- | --- | --- | --- | --- |
| Accent | #D94610 | #C8400E | 5.01:1 white text on accent, 4.55:1 on #F4F4F5 | #D94610 is 4.34:1, fails AA for 16px CTA text (CTO 30/10) |
| Secondary gray on light | #999999, #808080 | #6B6B6B (`muted_light`) | 5.33 on white, 4.85 on #F4F4F5, 4.88 on #F5F5F1 | Figma grays are 2.85:1 and 3.95:1 (CTO 27/10) |
| Gray on dark | #999999 | #999999 (`muted_on_dark`) | 6.11 on #1A1A1A | Allowed on dark only |
| Gray on panel | #999999, #B2B2B2, white 60% | `--panel-muted` (white 70% + panel, #C4C4C6) | 6.56 on #393942 | #999999 is 4.01:1 on the panel; one pair for every dark panel (CTO 11/11 FD1) |
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
| Heading | `type_heading_font` | Sofia Sans Condensed 700 (`sofia_sans_condensed_n7`) | `--font-heading--family`, `--font-heading--weight`, `--font-heading--weight-display` (800) | 700 headings, 800 display, eyebrow and wordmark |
| Body | `type_primary_font` | Inter 500 (`inter_n5`, Figma Common/Body; settings default still `inter_n4` until FE changes it) | `--font-primary--family`, `--font-body-weight` | 400 form values, 500 body, 600 labels and buttons, 700 titles |

Type scale = the 18 text styles of Figma Design System 2. Headings interpolate
with `clamp()` from the mobile style at 360 to the desktop style at 1280.

| Figma style (mobile → desktop) | CSS variable | 360 | 1280+ | Weight / case |
| --- | --- | --- | --- | --- |
| M/H1 → D/H1 | `--font-size-display` | 52/62 | 100/100 | 800 uppercase, −3% → −4% |
| M/H2 → D/H2 | `--font-size-h1` | 40/48 | 48/58 | 700, −2% |
| M/H3 → D/H3 | `--font-size-h2` | 32/38 | 36/44 | 700, −2% |
| M/H4 = D/H4 | `--font-size-h3` | 28/34 | 28/34 | 700, −2% |
| M/H5 = D/H5 | `--font-size-h4` | 20/24 | 20/24 | 700, −2% |
| M/H6 → D/H6 | `--font-size-eyebrow` | 14/16 | 16/20 | 800 uppercase, +4% |
| Common/Title | `--font-size-lg` | 18/28 | 18/28 | Inter 700, −1% |
| Common/Body | `--font-size-base` | 16/26 | 16/26 | Inter 500, −1% |
| Common/Body small | `--font-size-sm` | 14/22 | 14/22 | Inter 500 |
| Common/Form | `--font-size-sm` | 14/22 | 14/22 | Inter 400 (input values stay 16 so iOS does not zoom) |
| Common/Label | `--font-size-xs` | 13/20 | 13/20 | Inter 600, −2% |
| Common/Button | `--font-size-base` | 16/26 | 16/26 | Inter 600, −1% |
| — | `--font-size-wordmark` | 64 | 200 | Footer EFITCO wordmark |

- Headings line-height `--line-height-heading` (1.2); display 1.19 below
  48rem and 1 above; body `--line-height-body` (1.625 = 26/16).
- Body copy in sentence case. Do not uppercase body text or h2 section
  headings. Why: uppercase is reserved for display headings, eyebrows and
  group labels so they stand out.
- Smallest text is 13px (`--font-size-xs`); never 12px.

## Spacing

One setting, `space_base` (default 4px), drives the scale. Why: the
merchant changes overall density with one control. `--space-1…8` stay for
theme code; new spacing uses the named steps, which match Figma Space/4…64
plus a desktop tier.

| Named variable | px | Index alias | Typical use |
| --- | --- | --- | --- |
| `--space-2xs` | 4 | `--space-1` | Icon nudge, tight gaps |
| `--space-xs` | 8 | `--space-2` | Inline gaps, label → input |
| `--space-sm` | 12 | `--space-3` | Eyebrow → heading, mobile grid gap |
| `--space-md` | 16 | `--space-4` | Card padding, tablet grid gap |
| `--space-lg` | 20 | `space_base × 5` | Panel padding |
| `--space-xl` | 24 | `--space-5` | Heading → content (mobile), desktop grid gap |
| `--space-2xl` | 32 | `--space-6` | Button padding (inline), column gaps |
| `--space-3xl` | 40 | `space_base × 10` | Heading → content (desktop) |
| `--space-4xl` | 56 | `space_base × 14` | Section padding below 64rem |
| `--space-5xl` | 64 | `space_base × 16` | Page title bottom (desktop) |
| `--space-6xl` | 80 | `space_base × 20` | Desktop tier |
| `--space-7xl` | 120 | `--space-8` | Section padding from 64rem |

`--space-7` (48) is outside the Figma DS2 scale; use it for control heights, and for layout gaps only where the page's Figma Final frame measures exactly 48 (home 1280/1920, CTO 20/11 ES1-T527).
Do not write raw px for spacing.

## Corner radius

Scale = Figma Radius/4…20 plus pill. Four settings set the role tokens.

| Variable | px | Setting id | Use |
| --- | --- | --- | --- |
| `--radius-xs` → `--radius-input`, `--radius-button` | 4 | `input_corner_radius`, `button_corner_radius` | Inputs, buttons, chips, tabs |
| `--radius-sm` → `--radius-swatch` | 8 | — | Card swatches, line-item thumbnails |
| `--radius-md` → `--radius-card`, `--radius-hero` | 12 | `card_corner_radius`, `hero_corner_radius` | Product card media, dropdowns, popovers, tables |
| `--radius-lg` → `--radius-panel` | 16 | — | Page banner, article and collection cards, footer panel, dark panels, meter box |
| `--radius-xl` → `--radius-dialog` | 20 | — | Dialogs and bottom sheets |
| `--radius-pill` | 999 | — | Badges, variant pills, pagination numbers |

Round controls (slideshow arrows, dots) use `50%`; that is a shape, not a
token.

## Page rhythm

- Content width: `max_page_width` → `--page-width`, default `91rem`
  (1416px content from Figma + 2 × 20px margin); option `110rem` for wide.
- Side margin: `min_page_margin` → `--page-margin`, default 20px (10–100).
- Layout is the container grid: margin | content | margin. Children sit in the
  content column; `.full-width` spans the viewport. Why: every band lines up to
  the same 1416px edge as Figma.
- Vertical rhythm between bands: `--space-4xl` (56) below 64rem,
  `--space-7xl` (120) from 64rem. Inside a block: heading → content 24, 40
  from 80rem. Grid gap 12 / 16 / 24 (below 48rem / below 80rem / from 80rem).
- Header height: `--header-height` = `space_base` × 20 (80px). Every page has
  the same dark bar (`background_dark` + noise); it never overlays an image.
  Scrolling only adds a shadow (CTO 10/11).
- Breakpoints (mobile-first from 360): `48rem` (768), `64rem` (1024),
  `80rem` (1280). Mobile type and spacing come from Figma Design System 2
  mobile styles (ES1-T527); tablet interpolates.
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
| Collection card image (Browse Categories) | 336 / 220 (card 336 × 270 with title) | Figma 1:395 |
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
    weight 600, height 48px (52px from 80rem). Primary action, one per
    section.
  - `.button--secondary`: transparent, border and text in current color;
    white border and text on dark.
  - `.button--tertiary`: alt background with a `muted_light` border; the
    secondary action next to a primary inside cards and quick view. Never a
    borderless gray button (that is the disabled look).
  - `.button--small`: 44px, 14/600, for cards, suggestions and inline errors.
  - `.button--link`: heading font 700, 28/34, no background, arrow icon
    20 × 16; hover underlines the label and nudges the arrow `--space-1`
    toward inline-end (off with `prefers-reduced-motion`).
- Focus ring: 2px solid `--color-accent`, offset 2px, on every interactive
  element; white on dark backgrounds and dark panels.
- States for every interactive component: default, hover, focus-visible,
  active, disabled, loading (see foundation.md).

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
