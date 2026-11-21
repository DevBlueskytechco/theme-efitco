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

Design system version: 1.3.0 (proposed, waiting for CTO approval). The number
lives in `docs/tokens.json` `_version`; rules and history are in
`docs/design/CHANGELOG.md`. Writing rules for every string are in
`docs/design/content.md`. How to propose and land a change is in
`CONTRIBUTING.md`, section "Changing the design system".

## Intent

- Athletic, confident, product-first. Large condensed uppercase headings, plain
  body copy, lots of whitespace, one warm accent for actions.
- One accent color means "do something" (buttons, active controls). Do not use
  it for decoration. Why: a single action color keeps CTAs findable and keeps
  contrast checks to one pair.
  - Decided exceptions (CTO, `docs/design/decisions.md`): eyebrow text on light
    and sand backgrounds (09/11), the highlighted part of a large heading such
    as "Get 15% Off" (09/11), the warning toast (09/11) and the warning form message (CTO 21/11,
    components-06), both through `--color-warning`, and the article tag badge
    `.badge--tag` (Figma 1:1022; CTO 21/11, ES1-T535). Do not add another:
    any other category label uses a neutral badge or plain text.
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
- A new, renamed or re-valued token is changed in four places in one change,
  with a changelog line and a version number: (1) setting default in
  `config/settings_schema.json` (only when the token has a setting), (2)
  variable in `snippets/css-variables.liquid`, (3) `docs/tokens.json`, (4)
  this file, `docs/ui-spec/foundation.md` and the mockup kit. Why: the four
  places drift apart otherwise.
- Source of truth for a token value: a value that has a line in
  `docs/design/decisions.md` follows that line in all four places. For a
  token with no decision line, when the four places disagree the earlier
  place in that list wins (PROPOSED by the designer in ES1-T535, not yet a
  CTO decision). Known mismatches waiting for FE, where the decision wins
  over the setting default: `badge_new_color` #467A48 → #4B824D (V01) and
  `background_alt_color` #F4F4F4 → #F4F4F5 (V18). Every `:root` variable is
  declared in `snippets/css-variables.liquid`, not in `assets/base.css`.
- Keep contrast at WCAG AA (4.5:1 normal text, 3:1 text ≥ 24px or ≥ 18.66px
  bold). Why: Lighthouse accessibility must stay ≥ 98.

## Token tiers

Three tiers, read top to bottom (CTO 21/11, ES1-T535; foundation.md §32).

| Tier | What it is | Examples |
| --- | --- | --- |
| 1 · Primitive | Raw value on a scale. Comes from a theme setting or the Figma Design System 2 scale | `accent_color` #C8400E, `--space-md` 16, `--radius-md` 12, `--motion-base` 250, `--icon-size-md` 20 |
| 2 · Semantic | Named by role, points to tier 1. Components read this tier | `--color-accent`, `--color-warning`, `--radius-card`, `--shadow-raised`, `--layer-overlay`, `--touch-target` |
| 3 · Component | Value owned by one component, derived from tier 2 or kept at the exact Figma number | `--control-height`, `--toast-color`, `--alert-color`, `--tab-padding-inline`, `--thumb-size` |

- A component reads a semantic token first and a primitive only when no role
  exists (spacing has no roles, so components read `--space-*` directly). It
  never reads a hex, a raw px value or a setting. Why: a merchant setting then
  reaches every component through one chain.
- Do not name a variable after its value (`--figma-1a1a1a`, `--gray-500`).
  Why: the name becomes wrong the day the value changes; `--figma-666666`
  already points to #999999.
- `--figma-*` variables are legacy. `assets/base.css` still uses 23 of them
  (85 uses); the table that maps each one to a role token is in foundation.md
  §32.4. Do not add a new one and do not use them in new code.
- Token groups and counts (kit `:root`, 134 variables): color 32, typography
  26, space 12 + 8 aliases, radius 6 + 7 roles, motion 8 + 3 easings, shadow
  4, layer 8, icon 4, size and layout 15, component 1. Breakpoints (48rem,
  64rem, 80rem) are constants in media queries, not variables.

## Color tokens (22 settings + 3 derived + 3 status aliases)

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

Status roles (no setting, no new color value; aliases of existing tokens, CTO
21/11, ES1-T535):

| Alias | Points to | Ratio | Use |
| --- | --- | --- | --- |
| `--color-success`, `--color-success-foreground` | `--color-badge-new`, `--color-badge-new-foreground` | 4.57 white on it; 4.57 as icon or border on white | Success toast, success form message, status icon, meter when the goal is reached |
| `--color-warning`, `--color-warning-foreground` | `--color-accent`, `--color-accent-foreground` | 5.01 | Warning toast, warning form message |
| `--color-critical`, `--color-critical-foreground` | `--color-sale`, `--color-sale-foreground` | 6.38 | Error toast, error form message, alert, field error text, `aria-invalid` border |

- Messages read the status alias. Badges, sale prices and buttons keep reading
  the source token. Why: the alias names the message role, so message styles do not
  depend on a badge or price token name. Aliases have no setting and no value
  of their own.
- Info has no alias: use `--color-muted` (8.45 on white).
- Message body text stays `foreground`; the status color sits on the bar,
  border and icon, always next to an icon and words. Why: color alone never
  carries meaning.
- On dark backgrounds error text is white with a `critical` icon (`sale` on
  dark is 2.73:1).

Color schemes: the six backgrounds (light, alt, cream, sand, dark, panel) are
six schemes that share one set of roles (background, text, text subdued,
border, focus, link). The scheme × role matrix with contrast ratios is in
`docs/ui-spec/foundation.md` §2.2 and in the mockup section "12b. Color
Schemes And Roles". It is documentation only for now: there is no
`color_scheme` setting and no color value changed (CTO 21/11).

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
- Line heights follow Figma Design System 2, not a 4px grid: 62, 58, 38, 34,
  26 and 22 are not multiples of 4. Decided exception to the Polaris
  line-height scale (CTO 21/11, ES1-T535); do not "fix" them.
- Body copy in sentence case. Do not uppercase body text or h2 section
  headings. Why: uppercase is reserved for display headings, eyebrows and
  group labels so they stand out.
- Smallest text is 13px (`--font-size-xs`); never 12px.

## Spacing

One setting, `space_base` (default 4px), drives the scale. Why: the
merchant changes overall density with one control. There is one naming
system: the named steps `--space-2xs…7xl`, which match Figma Space/4…64 plus
a desktop tier (CTO 20/11 V06, CTO 21/11). `--space-1…8` and
`calc(var(--space-1) * N)` are the old names; they remain only as aliases in
existing theme code and are not used in new components.

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

`--space-7` (48) is outside the Figma DS2 scale and has no named step; use it for control heights, and for layout gaps only where the page's Figma Final frame measures exactly 48 (home 1280/1920, CTO 20/11 ES1-T527).
Do not write raw px for spacing.

- A value that is off the scale: do not write `calc()` or a raw px value in
  a component. First round it to the nearest step. If the Figma Final frame
  requires the exact number, declare one component-tier token with its Figma
  node (for example `--tab-padding-inline` 28, Figma 1:490). If three or more
  components need the same value, propose a new step for the CTO to decide.
- The spacing scale is for padding, gap and margin. Sizes (width, height) use
  size tokens: `--control-height`, `--touch-target`, `--icon-size-*`.
- Theme code still needs the steps 20, 40, 56, 64 and 80 as variables; until
  FE adds them `assets/base.css` has 177 lines with
  `calc(var(--space-1) * N)` (233 across `assets/*.css`). Factors 11, 12 and
  13 (44, 48, 52) are sizes, not spacing: they map to `--touch-target` and
  `--control-height(-compact)`. Old name → new name table: foundation.md
  §1.2.

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

- Nested corners: the inner surface is one step smaller than its container
  (thumbnail 8 in a card 12, card 12 in a panel 16, panel 16 in a dialog 20).
  Buttons and badges keep their own radius when nested. An inner radius is
  never larger than the outer one.
- Components read the role (`--radius-card`, `--radius-panel`,
  `--radius-dialog`), not the step. Do not write `calc(radius ± space)` and
  do not use a spacing token as a radius.
- Off-scale radii still in theme code (2, 18, 24, `--figma-radius-*`,
  `calc(var(--radius-card) ± var(--space-1))`) map to the scale: 2 and 18 →
  pill, 8 → `--radius-sm`, 16 → `--radius-panel`, 24 → `--radius-dialog`
  (20). Full table: foundation.md §1.2.

## Elevation and layers

Three shadow steps plus the bottom-bar shadow, and eight layers (CTO 20/11
V15). Do not add a fifth shadow step.

| Variable | Value | Use |
| --- | --- | --- |
| `--shadow-none` | none | Cards, panels, alerts and tables in the page |
| `--shadow-raised` | 0 8 24, foreground 12% | Dropdown, popover, toast, teaser, listbox; button hover, article card hover, header after scrolling |
| `--shadow-overlay` | 0 32 80, foreground 28% | Drawer, dialog, bottom sheet |
| `--shadow-bar` | 0 −4 24, foreground 10% | Sticky bottom bar (shadow points up) |
| `--overlay-scrim` | `background_dark` 50% | Behind drawer, dialog, mega menu |

| Variable | z | Use |
| --- | --- | --- |
| `--layer-content` | 1 | Badge, card gradient, text on an image |
| `--layer-sticky` | 4 | Collection toolbar, cart summary, product gallery |
| `--layer-bottom-bar` | 5 | Sticky add to cart, checkout bar, bundle bar |
| `--layer-header` | 10 | Header, dropdown, mega menu and its scrim |
| `--layer-floating` | 15 | Big Offer teaser |
| `--layer-scrim` | 20 | Fallback scrim |
| `--layer-overlay` | 21 | Drawer and dialog fallback, popover card, localization from 768 |
| `--layer-toast` | 30 | Toast |

- Write `box-shadow: var(--shadow-*)` and `z-index: var(--layer-*)`. No
  hand-written shadow and no numeric `z-index`. Why: a stray shadow or a
  z-index of 1000 breaks the stacking order with the consent banner and
  Shopify Inbox.
- A shadow means "this can be pressed or sits above the page". Do not use it
  as decoration.
- Component → shadow → layer table, and the hand-written shadows still in
  `assets/base.css` with their replacement: foundation.md §31.

## Icons

One set, one style: outlined, single color (`currentColor`), 1.5 stroke on a
20 × 20 frame with a 16 × 16 safe area (CTO 21/11, ES1-T535; foundation.md
§33).

| Variable | px | Use |
| --- | --- | --- |
| `--icon-size-sm` | 16 | Inside 14px text: field error, form message, chip, small button, stepper |
| `--icon-size-md` | 20 | Default: buttons, search field, toast, close button |
| `--icon-size-lg` | 24 | Header (account, cart, menu), alert, compact empty state |
| `--icon-stroke-width` | 1.5 | Every outlined icon |

- Do not scale an icon outside the three sizes. Sizes kept from Figma inside
  one component (menu chevron, CTA arrow, the chevron in the 52px round
  button, stars, social and trust icons) belong to that component.
- Reserved icons have one meaning each: search, bag (cart), close, arrow
  (go to the next page or step), trash (remove a cart line). Do not reuse
  them for anything else.
- An icon-only button is for a common icon and has an accessible name that
  names the object ("Cart, 2 items", "Remove filter: Color Black"). An
  ambiguous icon always has a text label. Status and decorative icons are
  `aria-hidden` and sit next to words.

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
- Touch targets: `--touch-target` (44px) at every breakpoint for six groups:
  main menu links, form submit (search, add to cart), cart, hamburger, close
  buttons of modals and drawers, variant options (pill, swatch). Every other
  control keeps the floor `--touch-target-min` (24px; 44px below 48rem per
  CTO 09/11). Sizes per breakpoint: foundation.md §1.3 (CTO 21/11).

## Motion

Eight durations and three easings, the same as
`snippets/css-variables.liquid`. Do not write a duration as a number in a
component.

| Variable | ms | Use |
| --- | --- | --- |
| `--motion-stagger` | 60 | Offset between elements that enter one after another (× index) |
| `--motion-fast` | 150 | Hover color, exits |
| `--motion-base` | 250 | Drawer, dropdown, toast, chevron |
| `--motion-accordion` | 350 | Accordion and facet open / close |
| `--motion-enter` | 400 | Hero text entrance, first entrance of an element |
| `--motion-slow` | 500 | Card lift, image scale, meter |
| `--motion-reveal` | 900 | Reveal on scroll |
| `--motion-hero` | 1400 | Loading loops: one spinner turn, one skeleton shimmer cycle |

| Easing | Role |
| --- | --- |
| `--ease-out` | User interaction: hover, press, opening a drawer, dropdown or toast |
| `--ease-in-out` | System-driven change and size change: accordion, facet, meter |
| `--ease-expo` | Emphasized entrance: reveal on scroll, dialog, hero |

- `linear` (CSS keyword) only for loading loops (spinner, shimmer).
- Decided exception (CTO 09/11, 21/11): `--motion-reveal` 900 and
  `--motion-hero` 1400 are longer than Polaris's 500ms ceiling. They are only
  for reveal on scroll and loading loops; feedback to a user action is always
  ≤ 500ms.
- Animate only `transform`, `opacity` and `clip-path`;
  `prefers-reduced-motion: reduce` turns motion off.

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

- Two fits: `contain` on the cream background for product images (never crop
  the product), `cover` for lifestyle images. The image radius equals its
  frame radius.
- Thumbnails are square, cream, radius 8, `contain`, in four named sizes only:
  48 (sticky bottom bar), 56 (compact product row, default), 64 (search
  suggestions, gallery thumbs), 80 (cart line).
- Missing or failed image: keep the frame and its background (placeholder
  icon on cream; dark background for hero, banner and dark cards). The frame
  never collapses.
- Mockup section "11b. Media" and foundation.md §36 hold the full rules.

## Calls to action

- Voice: Title Case, 2–4 words, starts with a verb, says what happens next.
  Figma copy: "Explore Equipment", "Become A Member", "View About Us",
  "Add Setup To Cart", "Add Bundle To Cart". Provisional until ES1-T39.
  Title Case is a decided brand exception to Polaris sentence case (CTO
  07/11, confirmed 21/11); the rest of the Polaris rule applies (verb first,
  no articles, no punctuation).
- Standard commerce actions ("Add To Cart", "Sold Out", "Checkout") use the
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
- Disabled is a color pair, never `opacity`: buttons use a `border`
  background with `muted` text (6.70); round arrow buttons at the start or
  end of a row keep their background and use a `border` outline with a
  `muted_light` icon (5.33), and on dark bands, where the enabled button is
  a white disc, a transparent background with a `muted_on_dark` outline and
  icon (6.11); a disabled filter swatch keeps its color and
  gets a diagonal line, its label in `muted_light` (CTO 21/11). Why:
  Lighthouse counts opacity in contrast, and a faded control reads as broken.
- Messages: a toast is for short success or neutral confirmation (success
  title ≤ 3 words and ≤ 24 characters, for example "Added to cart"). Errors
  and warnings appear next to their source with `.field__error`,
  `.form-message` or `.alert`; an error or warning toast is only for a
  background action the shopper cannot see (CTO 21/11).
- Alerts stay in the page. `.alert` has four tones that read existing roles
  (info `muted`, success, warning, critical) and two levels: section (1px
  tone border, white background) and page (`.alert--page`: 4px leading bar
  and a 6% tint, placed outside sections under the header or breadcrumb).
  One message and at most one action per alert; an error alert has no close
  button. Which of banner, inline message or toast to use: foundation.md §35.
- Form errors: leaving an invalid field shows the error under it and does not
  move focus. Submitting a form with two or more fields moves focus to the
  summary at the top of the form (`.form-message--error`, `tabindex="-1"`)
  when at least one field is in error, even if only one is. The summary
  names the number of fields ("Check 1 field", "Check 2 fields") and lists
  each error as a link to its field. A one-field form (newsletter, password)
  returns focus to the field. Why:
  Shopify accessibility guidance asks for focus on the error message (CTO
  21/11, ES1-T535).
- Loading indicators appear only after 300 ms: before that keep the old
  content and block repeat actions; after it show a spinner inside the
  loading area or a skeleton of the same size. One number for buttons,
  collection filters, the variant picker and localization (foundation.md
  §18.1; Polaris says 500 ms, open question for the CTO).
- Tabs, chips and tertiary buttons look alike, so they differ by job: a tab
  switches the panel right below it, a chip filters or suggests, a tertiary
  button performs a secondary action. A small tertiary button in the same
  area as chips gets a 16px icon or its own row (foundation.md §7).
- Long labels: translated text can be 50% longer and short labels up to
  three times longer. Buttons grow with the label, the row wraps, and only
  then `.button--wrap` lets the label wrap inside the button; badges use
  `.badge--wrap`; tabs scroll; chips wrap. Never truncate with "…" (the
  breadcrumb is the only exception) and never lock a control width to the
  English label. Do not build a sentence from several translated strings
  (foundation.md §37).
- Tables with two or three columns become a label–value list below 48rem
  (`.data-table--stack`); wider tables scroll inside a bordered frame.
- Dialogs open only after a user action. Decided exception (CTO 10/11,
  recorded 21/11): the three marketing popups (newsletter, before you leave,
  big offer) open by themselves, within the limits in foundation.md §16.

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
- Name sides by `inline-start` / `inline-end`, not left / right: the menu and
  filter drawers open from inline-start, cart and search from inline-end.
- RTL is turned on only when all six conditions hold: `dir` on `<html>` from
  the locale; logical properties everywhere with a `:dir(rtl)` rule for
  anything directional; carousels and `slideshow.js` scroll by direction;
  direction icons flip and all other icons stay; a font with glyphs for the
  RTL language is chosen (Inter and Sofia Sans Condensed have none; CTO
  decision); QA has run the RTL sample set with labels 50% longer at 360 and
  1280. What flips, what stays, and who owns each condition: foundation.md
  §34 and the mockup section "6d. Right-To-Left".

## Component status

Each design system section carries one of four labels (foundation.md §39):
Proposed (designer proposal, not decided), Approved (decided by the CTO, no
theme code yet), Built (classes exist in `assets/` or `snippets/`),
Deprecated (not used on new pages). Check the label before using a
component in a page: only Approved and Built components go into new pages.
