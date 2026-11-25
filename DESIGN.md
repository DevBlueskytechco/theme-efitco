# Efitco Design Guide

Design intent for the Efitco theme, for people and agents (Sidekick in Canvas,
coding agents) who change how the theme looks. `AGENTS.md` covers code
structure; this file covers visual decisions. When they disagree, `AGENTS.md`
wins.

Source of truth (CTO 21/11, ES1-T567): the HTML mockups in
`drafts/designer/**` (except `drafts/designer/ES1-T252` and `ES1-T174`: old
comparison copies, not a source of truth) and the kit `drafts/designer/_kit/kit.css` (tokens in
`:root`, shared components). `docs/tokens.json`, this file and
`docs/ui-spec/*.md` follow the kit; theme code (`config/settings_schema.json`,
`snippets/css-variables.liquid`) mirrors the kit `:root`. The human designer
rebuilds the design file from the mockups (see
`docs/design/figma-handoff.md`); when the two differ, the mockup wins. Decisions and reasons:
`docs/design/decisions.md`. ADR 0001, 0003, 0005 still apply. Do not add a
token that is not in the kit `:root` and `docs/tokens.json`. Component detail
(anatomy, states, do / don't) lives in `docs/ui-spec/foundation.md` and the
design system screen `drafts/designer/ES1-T251/foundation.html`.

Standards: Polaris first (4px spacing grid, three token tiers named by role,
44px touch targets, line heights in multiples of 4, sentence-case button
labels). Where Polaris gives no rule for a storefront (type scale, column
grid, container, named breakpoints, control height) the source names the
system used instead (Carbon, Material 3, Fluent 2, Spectrum, Ant) or says
"Design:" with the reason. Brand identity is kept: the color palette, the two
font families, the logo, the photos, uppercase condensed display headings,
and the layout and block order of each page.

Design system version: 2.0.0 (number approved by the CTO, 21/11 round 2). The number
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
  - Brand uses of the accent (CTO, `docs/design/decisions.md`; Polaris: the
    Brand role is separate from status roles): eyebrow text on light and sand
    backgrounds (09/11) and the highlighted part of a large heading such as
    "Get 15% off" (09/11). The warning toast (09/11) and the warning form
    message (CTO 21/11) read `--color-warning`, which points to the accent
    (Polaris: warning is orange). Do not add another: color marks status, not
    category, so a category label such as the article tag `.badge--tag` is a
    neutral badge (white background, `border` outline, `foreground` text;
    CTO 21/11, ES1-T567) or plain text.
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
  starting from the kit, with a changelog line and a version number: (1) the
  kit `:root`, (2) `docs/tokens.json`, (3) this file and
  `docs/ui-spec/foundation.md`, (4) theme code: the setting default in
  `config/settings_schema.json` (only when the token has a setting) and the
  variable in `snippets/css-variables.liquid`. Why: the four places drift
  apart otherwise.
- Source of truth for a token value (CTO 21/11, ES1-T567): the kit `:root`.
  A place that differs from the kit is wrong and is logged as "Cần FE"; the
  kit is not changed to match a setting. A CTO decision in
  `docs/design/decisions.md` is applied to the kit first. Known mismatches
  waiting for FE: `badge_new_color` #467A48 → #4B824D (V01),
  `background_alt_color` #F4F4F4 → #F4F4F5 (V18), `type_primary_font`
  inter_n4 → inter_n5 (V05), spacing steps 2, 6, 20, 40,
  64, 80 and the name `--space-4xl` for 48, per-step line heights, body line
  height 1.625 → 1.5, `--band-inset` 60 → 64, `--tab-padding-inline` 28 → 24.
  Every `:root` variable is declared in `snippets/css-variables.liquid`, not
  in `assets/base.css`.
- Write the source of a value in one of five forms: "Chuẩn: Polaris <step>",
  "Chuẩn: <Carbon | M3 | Fluent 2 | Spectrum | Ant> …", "CTO dd/mm",
  "AA: n:1", "Thiết kế: …" (design reason: brand, glyph optics, layout
  stability). Do not credit Polaris for something Polaris does not state.
- Keep contrast at WCAG AA (4.5:1 normal text, 3:1 text ≥ 24px or ≥ 18.66px
  bold). Why: Lighthouse accessibility must stay ≥ 98.

## Token tiers

Three tiers, read top to bottom (CTO 21/11, ES1-T535; foundation.md §32).

| Tier | What it is | Examples |
| --- | --- | --- |
| 1 · Primitive | Raw value on a scale (multiples of 4px). Declared in the kit `:root`; theme settings mirror it | `accent_color` #C8400E, `--space-md` 16, `--radius-md` 12, `--motion-base` 250, `--icon-size-md` 20 |
| 2 · Semantic | Named by role, points to tier 1. Components read this tier | `--color-accent`, `--color-warning`, `--radius-card`, `--shadow-raised`, `--layer-overlay`, `--touch-target` |
| 3 · Component | Value owned by one component: derived from tier 2, or a size token of that component | `--control-height`, `--row-height`, `--round-button-size`, `--progress-height`, `--toast-color`, `--alert-color`, `--tab-padding-inline`, `--thumb-size` |

- A component reads a semantic token first and a primitive only when no role
  exists (spacing has no roles, so components read `--space-*` directly). It
  never reads a hex, a raw px value or a setting. Why: a merchant setting then
  reaches every component through one chain.
- Do not name a variable after its value or after where the value came from
  (`--gray-500`, `--black-1a`). Why: the name becomes wrong the day the value
  changes; one legacy variable named after #666666 already points to #999999.
- Value-named variables with the old prefix are legacy. `assets/base.css`
  still uses 23 of them (85 uses), `assets/aux.css` 2 (6 uses); the table
  that maps each one, by value, to a role token is in foundation.md §32.4,
  and the full names are in `drafts/designer/ES1-T567/notes.md`. Do not add
  a new one and do not use them in new code.
- Token groups and counts (kit `:root`, 150 variables): color 32, typography
  34 (12 of them line heights), space 14 + 8 aliases, radius 6 + 7 roles,
  motion 8 + 3 easings, shadow 4, layer 8, icon 4, size and layout 15,
  component 7. Breakpoints (48rem, 64rem, 80rem) are constants in media
  queries, not variables.

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
| background_sand | #EBE6E0 | `background_sand_color` | `--color-background-sand` | Rich text + training level band, inspiration banner (ES1-T116), product cards |
| background_sand_foreground | #1A1A1A | `background_sand_foreground_color` | `--color-background-sand-foreground` | Text on sand |
| background_dark | #1A1A1A | `background_dark_color` | `--color-background-dark` | Header bar, footer, dark bands, hero fallback, image overlay |
| background_dark_foreground | #FFFFFF | `background_dark_foreground_color` | `--color-background-dark-foreground` | Text on dark and on hero images |
| background_panel | #393942 | `background_panel_color` | `--color-background-panel` | Quiz, shop the look and bundle panels, cart summary. Text uses `background_dark_foreground` |
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
schemes and roles". It is documentation only for now: there is no
`color_scheme` setting and no color value changed (CTO 21/11).

Section backgrounds are set in the template, not in a block setting:
`{% block 'container', background: 'alt' | 'cream' | 'sand' | 'dark' %}`.
The container sets both the background and its matching foreground. Why: one
line in the template changes a band, and text color always follows (ADR 0005).

## Colors adjusted to pass AA (CTO)

The palette is brand identity and is kept as is (CTO 21/11). These values
were changed earlier so text passes WCAG AA; do not change them back.

| Decision | Previous value | Value in use | Ratio | Why |
| --- | --- | --- | --- | --- |
| Accent | #D94610 | #C8400E | 5.01:1 white text on accent, 4.55:1 on #F4F4F5 | #D94610 is 4.34:1, fails AA for 16px CTA text (CTO 30/10) |
| Secondary gray on light | #999999, #808080 | #6B6B6B (`muted_light`) | 5.33 on white, 4.85 on #F4F4F5, 4.88 on #F5F5F1 | The previous grays are 2.85:1 and 3.95:1 (CTO 27/10) |
| Gray on dark | #999999 | #999999 (`muted_on_dark`) | 6.11 on #1A1A1A | Allowed on dark only |
| Gray on panel | #999999, #B2B2B2, white 60% | `--panel-muted` (white 70% + panel, #C4C4C6) | 6.56 on #393942 | #999999 is 4.01:1 on the panel; one pair for every dark panel (CTO 11/11 FD1) |
| Text on sand | — | `muted` #4D4D4D for secondary text | 6.81 | `muted_light` is 4.30 on sand, fails AA |
| Accent text on sand | — | only ≥ 24px or ≥ 18.66px bold | 4.03 | Passes AA large text only (ADR 0005) |
| Alternate gray background | #F4F4F4 | #F4F4F5 (`background_alt`) | 15.83 foreground on it | One alternate gray (CTO 20/11 V18) |
| New badge green | #467A48 | #4B824D (`badge_new`) | 4.57 white text on it | CTO 20/11 V01 |

Hero text sits on photos: keep the slide overlay (`overlay_opacity`, default
30%, `--color-background-dark` mixed with transparent). Why: white text on an
uncontrolled photo has no guaranteed contrast.

## Typography

Two fonts, both from the Shopify font library through `font_picker`. Never
self-host or add a third family. Why: one heading + one body family is the
theme standard (CTO 30/10).

| Role | Setting id | Default | CSS variables | Weights |
| --- | --- | --- | --- | --- |
| Heading | `type_heading_font` | Sofia Sans Condensed 700 (`sofia_sans_condensed_n7`) | `--font-heading--family`, `--font-heading--weight`, `--font-heading--weight-display` (800) | 700 headings, 800 display, eyebrow and wordmark |
| Body | `type_primary_font` | Inter 500 (`inter_n5`, CTO 20/11 V05; settings default still `inter_n4` until FE changes it) | `--font-primary--family`, `--font-body-weight` | 400 form values, 500 body, 600 labels and buttons, 700 titles |

Twelve text styles. Headings interpolate with `clamp()` from 360 to 1280.
Sizes (CTO 20/11 V02, V05) are kept. Polaris does not state a px type scale
for storefronts, so the sizes sit on steps found in Polaris React font (13,
14, 16, 18, 20, 32, 36, 40), M3 (28, 32, 36) and Carbon (28, 32, 36, 48).
Each size step has its own line-height token, and the line lands on a
multiple of 4px at 360 and at 1280 (Polaris React line heights 16, 20, 24,
28, 32, 40, 48). Numbers are size / line in px.

| Style | Size variable · line-height variable | 360 | 1280+ | Weight / case | Source |
| --- | --- | --- | --- | --- | --- |
| Display | `--font-size-display` · `--line-height-display` 1.1538, 1 from 48rem | 52/60 | 100/100 | Sofia 800 uppercase, −3% → −4% from 48rem | Design: brand type style |
| h1 | `--font-size-h1` · `--line-height-h1` 1.2, 1.1667 from 80rem | 40/48 | 48/56 | Sofia 700, −2% | 40/48: Polaris React font 40, line height 48. 48/56: Design, same ratio on the 4px grid (Polaris has no 56 line); size 48 is on the Carbon scale |
| h2 | `--font-size-h2` · `--line-height-h2` 1.25, 1.2222 from 80rem | 32/40 | 36/44 | Sofia 700, −2% | M3 Headline L 32/40, Display S 36/44 |
| h3 | `--font-size-h3` · `--line-height-h3` 1.2857 | 28/36 | 28/36 | Sofia 700, −2% | M3 Headline M 28/36, Carbon heading-04 |
| h4 | `--font-size-h4` · `--line-height-h4` 1.2 | 20/24 | 20/24 | Sofia 700, −2% | Polaris React heading 20/24 |
| Eyebrow | `--font-size-eyebrow` · `--line-height-eyebrow` 1.25rem (fixed 20) | 14/20 | 16/20 | Sofia 800 uppercase, +4% | Design: brand type style; fixed 20 line because the size is fluid (20 is on the Polaris React line-height scale) |
| Title | `--font-size-lg` · `--line-height-title` 1.5556 | 18/28 | 18/28 | Inter 700, −1% | Polaris React font 18, line height 28 |
| Body | `--font-size-base` · `--line-height-body` 1.5 | 16/24 | 16/24 | Inter 500, −1% | Carbon body-02 16/24, M3 Body L 16/24 |
| Body small | `--font-size-sm` · `--line-height-sm` 1.4286 | 14/20 | 14/20 | Inter 500 | Polaris React body 14/20 |
| Form | `--font-size-sm` · `--line-height-sm` | 14/20 | 14/20 | Inter 400 (input values stay 16 so iOS does not zoom) | Polaris React body 14/20 |
| Label | `--font-size-xs` · `--line-height-label` 1.5385 | 13/20 | 13/20 | Inter 600, −2% (`--letter-spacing-label`) | Polaris React body 13/20 |
| Button | `--font-size-base` · `--line-height-body` | 16/24 | 16/24 | Inter 600, −1%, sentence case; small 14/20 | Polaris Button (label); Carbon body-02 |
| Group label | `--font-size-sm` · `--line-height-sm` | 14/20 | 14/20 | Inter 600 uppercase, +4%, muted | CTO 20/11 V76 |

Not in the twelve: long-form text (`.rte`, footer description) uses
`--line-height-reading` 1.75 (16/28); prices are 16/24 (`.price`), 20/28
(`.price--lg`, `--line-height-price-lg` 1.4, Carbon heading-03) and 28/36
(`.price--xl`), with `font-variant-numeric: tabular-nums` (Polaris: tabular
numbers for money); the footer wordmark `--font-size-wordmark` 64 → 200 is a
brand asset.

- Line heights are unitless numbers read from the token of the size step.
  `--line-height-heading` (one 1.2 for h1–h4) is removed from the kit
  (ES1-T567). Do not
  write a line height as a number in a component or a page, except `1` for
  icons and single-line numbers.
- h1 and h2 change their ratio at 80rem because the size interpolates;
  360 and 1280 sit on the 4px grid, in between h1 is off by at most 1.6px
  and h2 by 1px. The eyebrow uses a fixed 20px line (`1.25rem`) because
  its size is fluid. The display uses 1 from 48rem (Design: one block of display
  text), so at 768 its line is not a multiple of 4.
- Letter spacing: body −1%, label −2%, headings −2%, display −3% / −4%,
  uppercase +4%. Body weight is 500: brand identity (CTO 20/11 V05, kept by
  CTO 21/11 round 2).
- Body copy in sentence case. Do not uppercase body text or h2 section
  headings. Why: uppercase is reserved for display headings, eyebrows, group
  labels and the marketing popup title (brand identity, CTO 21/11 round 2) so
  they stand out. The uppercase comes from CSS `text-transform`; the source
  string is always sentence case.
- Headings h1–h4, section titles, dialog and drawer titles, empty states,
  tabs, menu links (header, mega menu, drawer, footer) and filter chip labels
  that are interface text use sentence case: capitalise only the first word
  and proper nouns ("Browse categories", "Order summary", "Our story"; CTO 21/11
  round 2). Keep as written: the brand name, product, collection and article
  titles (merchant data such as "Free Weights"), proper names (Shop Pay,
  Apple Pay) and abbreviations (FAQ, USD).
- Smallest text is 13px (`--font-size-xs`); never 12px.

## Spacing

One setting, `space_base` (default 4px), drives the scale. Why: the
merchant changes overall density with one control. There is one naming
system: the named steps `--space-050…7xl` on a 4px grid. Source: Polaris web
spacing 2 / 4 / 6 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 (`small-500` …
`large-500`); 64 and 80 are in Polaris React space. `--space-1…8` and
`calc(var(--space-1) * N)` are the old names; they remain only as aliases in
existing theme code and are not used in new components.

| Named variable | px | Index alias | Source | Typical use |
| --- | --- | --- | --- | --- |
| `--space-050` | 2 | — | Polaris `small-500` | Half step: icon gap, optical nudge only |
| `--space-2xs` | 4 | `--space-1` | Polaris `small-400` | Icon nudge, tight gaps |
| `--space-150` | 6 | — | Polaris `small-300` | Half step: icon gap, optical nudge only |
| `--space-xs` | 8 | `--space-2` | Polaris `small-200` | Inline gaps, label → input |
| `--space-sm` | 12 | `--space-3` | Polaris `small-100` | Eyebrow → heading, mobile grid gap |
| `--space-md` | 16 | `--space-4` | Polaris `base` | Card padding, tablet grid gap |
| `--space-lg` | 20 | `space_base × 5` | Polaris `large-100` | Panel padding, page margin |
| `--space-xl` | 24 | `--space-5` | Polaris `large-200` | Heading → content (mobile), desktop grid gap, tab padding |
| `--space-2xl` | 32 | `--space-6` | Polaris `large-300` | Button padding (inline), column gaps |
| `--space-3xl` | 40 | `space_base × 10` | Polaris `large-400` | Heading → content (desktop) |
| `--space-4xl` | 48 | `--space-7` | Polaris `large-500` | Section padding below 64rem, dialog padding, page title bottom |
| `--space-5xl` | 64 | `space_base × 16` | Polaris React space 64px | Page title bottom (desktop), wide band inset |
| `--space-6xl` | 80 | `space_base × 20` | Polaris React space 80px | Desktop tier |
| `--space-7xl` | 128 | `--space-8` | Standard: Polaris React space 128px (CTO 21/11 round 2; was 120, off the scale) | Section padding from 64rem |

`--space-4xl` was 56 before ES1-T567; 56 is not on the Polaris scale.
`--space-7` is now only an alias of `--space-4xl`. Do not write raw px for
spacing.

- A value that is off the scale: do not write `calc()` or a raw px value in
  a component. Round it to the nearest step (Carbon: off-scale values
  "should be avoided whenever possible"); for example tab padding 28 → 24,
  toast padding 10 → 12, wide band inset 60 → 64. If three or more
  components need the same off-scale value, propose a new step for the CTO
  to decide.
- The spacing scale is for padding, gap and margin. Sizes (width, height) use
  size tokens and never a spacing token (Polaris): `--control-height`
  (48 at every breakpoint), `--control-height-compact` (44), `--touch-target` (44),
  `--tab-height-desktop` (40), `--row-height` (52), `--round-button-size`
  (52), `--count-badge-size` (20), `--progress-height` (4), `--meter-height`
  (8), `--icon-size-*`.
- Named exceptions: glyph path coordinates (chevron 9 × 5 and 12 × 7, CTA
  arrow 16 × 14, star 14 × 13, check mark) are optical and stay as drawn;
  buttons and icons rendered by Shopify or Apple keep their own values
  (CTO 11/11).
- Theme code still needs the steps 2, 6, 20, 40, 64 and 80 as variables and
  the name `--space-4xl` for 48; until FE adds them `assets/base.css` has 177
  lines with `calc(var(--space-1) * N)` (233 across `assets/*.css`). Factor
  14 (56) maps to 48 or 64 by use. Factors 11, 12 and 13 (44, 48, 52) used
  as heights are sizes, not spacing. Old name → new name table: foundation.md
  §1.2.

## Corner radius

Scale 4 / 8 / 12 / 16 / 20 plus pill (CTO 20/11 V04). The same steps are in
Polaris React border radius (admin, used as a reference) and in M3 shape;
Polaris web states no px radius. Four settings set the role tokens.

| Variable | px | Setting id | Use |
| --- | --- | --- | --- |
| `--radius-xs` → `--radius-input`, `--radius-button` | 4 | `input_corner_radius`, `button_corner_radius` | Inputs, buttons, chips, tabs |
| `--radius-sm` → `--radius-swatch` | 8 | — | Card swatches, line-item thumbnails |
| `--radius-md` → `--radius-card`, `--radius-hero` | 12 | `card_corner_radius`, `hero_corner_radius` | Product card media, dropdowns, popovers, tables |
| `--radius-lg` → `--radius-panel` | 16 | — | Home hero and hero mini (mockup uses 16; `hero_corner_radius` default still 12 in theme code, Cần FE), page banner, article and collection cards, footer panel, dark panels, meter box |
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
- Off-scale radii still in theme code (2, 18, 24, the value-named legacy
  radius variables, `calc(var(--radius-card) ± var(--space-1))`) map to the
  scale: 2 and 18 → pill, 8 → `--radius-sm`, 16 → `--radius-panel`, 24 →
  `--radius-dialog` (20). Full table: foundation.md §1.2.

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
| `--layer-floating` | 15 | Big offer teaser |
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

- Do not scale an icon outside the three sizes. Sizes that belong to one
  component (menu chevron 9 × 5 and 12 × 7, CTA arrow 16 × 14, the 11 × 16
  chevron in the 52px round button, stars 14 × 13, social and trust icons)
  are glyph optics and stay with that component.
- Reserved icons have one meaning each: search, bag (cart), close, arrow
  (go to the next page or step), trash (remove a cart line). Do not reuse
  them for anything else.
- An icon-only button is for a common icon and has an accessible name that
  names the object ("Cart, 2 items", "Remove filter: Color Black"). An
  ambiguous icon always has a text label. Status and decorative icons are
  `aria-hidden` and sit next to words.

## Page rhythm

- Content width: `max_page_width` → `--page-width`, default `91rem`
  (1416px content + 2 × 20px margin; Design: Polaris states no storefront
  container, the value sits near the Polaris React `xl` 1440 breakpoint);
  option `110rem` for wide.
- Side margin: `min_page_margin` → `--page-margin`, default 20px (10–100;
  Polaris `large-100`).
- Layout is the container grid: margin | content | margin. Children sit in the
  content column; `.full-width` spans the viewport. Why: every band lines up to
  the same 1416px content edge.
- Columns 4 / 8 / 12 (below 48rem / from 48rem / from 80rem), grid gap
  12 / 16 / 24. Polaris states no column grid for storefronts; source:
  Fluent 2 layout (12 columns, gutter changes by breakpoint) and M3 margins
  16 / 24. Every value is on the 4px scale.
- Wide bands (home hero, footer panel) pull in at most 64px per side from the
  viewport edge (`--band-inset`, Polaris React space 64px): 1792 wide at
  1920, edge to edge on narrow screens.
- Vertical rhythm between bands: `--space-4xl` (48) below 64rem,
  `--space-7xl` (128) from 64rem. Inside a block: heading → content 24, 40
  from 80rem; eyebrow → heading 12.
- Header height: `--header-height` = `space_base` × 20 (80px). Every page has
  the same dark bar (`background_dark` + noise); it never overlays an image.
  Scrolling only adds a shadow (CTO 10/11).
- Breakpoints (mobile-first from 360): `48rem` (768), `64rem` (1024),
  `80rem` (1280). They are the theme code convention (`AGENTS.md`); Polaris
  web names no breakpoints and 768 equals Polaris React `md`. Mobile type and
  spacing are the 360 values of the kit scales; tablet interpolates. Every
  page is designed at 360, 768, 1280 and 1920 (CTO 09/11).
- Touch targets: `--touch-target` (44px) at every breakpoint for six groups:
  main menu links, form submit (search, add to cart), cart, hamburger, close
  buttons of modals and drawers, variant options (pill, swatch). Every other
  control keeps the floor `--touch-target-min` (24px; 44px below 48rem per
  CTO 09/11). Links in the form error summary (`.form-message__list a`) keep
  the 44px floor below 80rem and 24px from 80rem (CTO 21/11 round 2). Sizes
  per breakpoint: foundation.md §1.3 (CTO 21/11).

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
- Aspect ratios come from one named set, never from the px of a single
  frame. Source: Carbon aspect ratios (1:1, 2:1, 2:3, 3:2, 4:3, 16:9), M3
  carousel items (9:16 to 16:9), Spectrum (preview at most 3:4 tall).

| Place | Ratio | Source |
| --- | --- | --- |
| Product card, quick view, product gallery, featured product | 1 / 1 | Polaris Image default 1/1 |
| Hero / slideshow, mini hero, article cover | 2 / 1 at 1280+, 4 / 3 at 768, 3 / 4 below | Carbon 2:1, 4:3; Spectrum 3:4 at 360 |
| Collection card image | 3 / 2 | Carbon 3:2 |
| Collection card in the mega menu, mega promo image, FAQ image | 4 / 3 | Carbon 4:3 |
| Training level card, shop the look, why choose us | 1 / 1 | Carbon 1:1 |
| Blog card | 3 / 4 | Spectrum 3:4 |
| Testimonial card, inline heading image (scales with the heading em) | 16 / 9 | Carbon 16:9 |
| Vertical video card | 9 / 16 | M3 carousel 9:16 |
| Gift card | 1.586 / 1 | Design: ID-1 card ratio |

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

- Voice: sentence case, 2–4 words, starts with a verb, no articles, no
  punctuation, says what happens next (Polaris Button; CTO 21/11, replaces
  Title Case of 07/11). Mockup copy: "Explore equipment", "Become a member",
  "Add setup to cart", "Add bundle to cart", "View details". Link CTAs and
  "View all …" links follow the same case with 2–5 words that name the
  destination ("Read the full guide", "View all articles"). Proper names,
  abbreviations and branded buttons keep their own spelling. "Checkout" stays
  one word on the button (commerce term). The big offer button reads "View
  offer" (no article). A discount percentage uses the minus sign U+2212:
  "−24%", never a hyphen (CTO 21/11 round 2). Full rules:
  `docs/design/content.md`.
- Standard commerce actions ("Add to cart", "Sold out", "Checkout") use the
  theme locale strings, not custom copy. Why: they must match Shopify checkout
  wording and translations.
- No fake urgency or fake discounts: countdowns hide when the end date passes;
  bundle discounts shown in the theme must match a real automatic discount.
  Why: Theme Store requirement R8.
- Button styles, in `assets/base.css`:
  - `.button`: accent background, accent foreground, `--radius-button`,
    weight 600, height 48px at every breakpoint (CTO 21/11 round 2). Primary action, one per
    section.
  - `.button--secondary`: transparent, border and text in current color;
    white border and text on dark.
  - `.button--tertiary`: alt background with a `muted_light` border; the
    secondary action next to a primary inside cards and quick view. Never a
    borderless gray button (that is the disabled look).
  - `.button--small`: 44px, 14/600, for cards, suggestions and inline errors.
  - `.button--link`: heading font 700, 28/36, no background, arrow icon
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
- Loading indicators appear only after 500 ms: before that keep the old
  content and block repeat actions; after it show a spinner inside the
  loading area or a skeleton of the same size. One number for buttons,
  collection filters, the variant picker and localization (foundation.md
  §18.1; Polaris 500 ms, CTO 21/11 round 2, was 300 ms).
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
  §34 and the mockup section "6d. Right-to-left".

## Component status

Each design system section carries one of four labels (foundation.md §39):
Proposed (designer proposal, not decided), Approved (decided by the CTO, no
theme code yet), Built (classes exist in `assets/` or `snippets/`),
Deprecated (not used on new pages). Check the label before using a
component in a page: only Approved and Built components go into new pages.
