# Efitco Theme Agent Guide

Efitco is built on the Shopify Skeleton theme: a minimal theme that defines
page structure directly in Liquid. This file lists the repository conventions
that aren't obvious from an individual file, for every agent that edits the
theme (Sidekick in Canvas, coding agents) and for people. The code is the
source of truth. Visual decisions (tokens, contrast, rhythm, images, CTA voice)
live in `DESIGN.md`; when the two files disagree, this file wins.

Each rule is one line, followed by the reason (`Why:`). Keep the reason when you
edit a rule.

## Non-negotiables

- **No sections:** no `sections/` folder, no `{% section %}`/`{% sections %}`
  tags, no JSON templates, no schema `presets`.
  Why: the theme is block-first; pages are composed in Liquid templates, and
  Canvas and Sidekick are trained on this structure.
- **No Liquid-embedded assets:** no `{% stylesheet %}`, no `{% javascript %}`.
  All CSS and JavaScript live in `assets/`.
  Why: one place per asset type; files in `assets/` are cached, measured and
  budgeted (see Styling and tokens, JavaScript).
- **Direct Liquid templates:** templates render page content from blocks,
  snippets, and inline markup. Don't introduce a section for markup that is
  used by only one page.
  Why: one-page markup belongs to the page that uses it; an extra layer only
  hides it.
- **Template-owned containers:** each `templates/*.liquid` file is the
  composition root and wraps its page content in one or more `container`
  blocks — one per vertical slice (details in Composition model).
  Why: the template decides page order and bands, so a page change is one
  edit in one file.
- **Whitespace matters:** include whitespace between an HTML tag name and a
  following Liquid delimiter (`<li {% ... %}`, not `<li{% ... %}`).
  Why: without the space the parser can read the tag name and the Liquid as
  one token and the output breaks.
- **Translated UI only:** every user-facing string uses a literal
  `{{ 'key' | t }}` call (see Translations).
  Why: merchants translate and edit copy in the language editor, never in code.
- **Shopify routes for storefront URLs:** use Liquid `routes.*` for every
  storefront path; never hardcode `/cart`, `/search`, or `/collections`.
  Why: `routes.*` keeps the locale and market prefix (`/fr`, `/en-ca`).
- **Theme Check stays clean:** `.theme-check.yml` is a pristine
  `extends: theme-check:recommended` with **zero overrides**. Fix Theme Check
  errors in the Liquid instead of adding configuration exceptions; the theme
  must report 0 errors.
  Why: an exception hides the same problem for every later change.
- **No build step:** no SCSS, bundler, framework or generated files. What is in
  the repository is what the store serves.
  Why: agents edit the served files directly; a build step would make their
  edits disappear or drift.
- **No hardcoded design values:** colors, fonts, spacing and radii come from
  theme settings through CSS variables (see Styling and tokens, `DESIGN.md`).
  Why: merchants and Sidekick change the look in theme settings; a literal in
  CSS ignores that setting.
- **Works without JavaScript:** markup, links, forms and `<details>`
  disclosures must work before JavaScript loads; JavaScript only enhances.
  Why: progressive enhancement keeps the store usable when a script fails
  and keeps Lighthouse performance high.

## Composition model

```
layout/theme.liquid    → {% block 'container' %} (announcement-bar) + {% block 'container' %} (header) + <main> content_for_layout + {% block 'container' %} (footer)
layout/password.liquid → <main> content_for_layout
templates/*.liquid     → {% block 'container' %} → blocks / snippets / inline HTML
```

- Neither layout wraps `content_for_layout` in a `container` block; each
  renders it in a plain `<main>`.
  Why: page containers belong to the template, so the layout never doubles a
  wrapper.
- `layout/theme.liquid` wraps the `announcement-bar`, `header` and `footer`
  blocks each in their own `container` block.
  Why: these appear on every page, so the layout is their composition root.
- `layout/password.liquid` renders `content_for_layout` in a plain `<main>`,
  and its template (`templates/password.liquid`) owns the container.
  Why: same rule as every other template.
- Every template is the composition root and wraps its page content in one or
  more `container` blocks — a template may hold any number of containers, one
  per vertical slice (`templates/index.liquid`, `templates/product.liquid`).
  Why: one container per band keeps background, alignment and spacing per band.
- The exception is `templates/gift_card.liquid` (`{% layout none %}`): it
  manages its own document structure.
  Why: the gift card page is printed and shared outside the storefront layout.
- When a template holds more than one static block of the same type, pass a
  unique `id` (`{% block 'container', id: 'home-intro' %}`).
  Why: static blocks of one type without an id share one set of settings.
- Band backgrounds are a template parameter:
  `{% block 'container', background: 'alt' | 'cream' | 'sand' | 'dark' %}`.
  Why: one line in the template changes a band, and the container sets the
  matching foreground color (`DESIGN.md`, Color tokens).

### The block tag

```liquid
{% block 'name', named_parameter: value %}
  Body content
{% endblock %}
```

- The tag works like `{% render %}`, but renders `blocks/name.liquid`. Every
  named parameter is available as a plain variable inside the block. If its
  name matches a setting declared in the block's schema, it also sets
  `block.settings.<id>`. A parameter with no matching schema setting is only a
  variable.
  Why: a template can preset a merchant setting or pass plain data with the
  same syntax.
- For example, the container schema declares `alignment`, but not `tag`:

  ```liquid
  {% block 'container', alignment: 'center', tag: 'div' %}
    {{ page.content }}
  {% endblock %}
  ```

  Inside the container, both `alignment` and `block.settings.alignment` return
  `center`; `tag` returns `div` and does not create `block.settings.tag`.
  Continue to use `block.settings.<id>` for schema-backed controls in block
  implementations. `class` is an ordinary parameter with no special platform
  behavior.
  Why: `block.settings.<id>` also reflects what the merchant set in the editor.
- `{% doc %}` documents parameters; it does not declare, validate, or bind
  them. A parameter documented only in LiquidDoc is read as a plain variable
  and does not become a schema setting. Use `{% schema %}` for
  merchant-editable controls.
  Why: only the schema reaches the theme editor.
- Inline literal arrays are supported in `{% block %}` arguments, as shown by
  `tips` in the `@example` of `blocks/liquid-tips.liquid`; `{% render %}` and
  `{% partial %}` do not accept inline literal arrays.
  Why: `render` and `partial` reject them, so build the array with `split`
  first.
- The content between `{% block %}` and `{% endblock %}` is available inside
  the block as `{{ content }}`. Always include the closing `{% endblock %}`
  tag, even when the call has no body content.
  Why: an unclosed block tag swallows the rest of the template.
- The body is rendered in the caller's scope; it cannot read the callee's
  settings or local assignments.
  Why: the body is rendered before the block runs and arrives as a string.
  For the same reason a parent cannot count or read its children
  (`blocks/slideshow.liquid` leaves slide count to JavaScript).
- Prefer body content for display-only text and markup instead of adding
  `title`, `body`, or `heading` parameters. Add parameters when the block
  needs data or must change how it renders.
  Why: body content stays editable in the template without growing the block
  API.
- Executable `{% block %}` tags are allowed only in `layout/` and
  `templates/`. Keep child calls in the caller-owned body, never in block or
  snippet implementations. LiquidDoc examples may show block calls, but must
  be authored in a layout or template when used.
  Why: the composition root stays the only place that decides what renders
  where.

### The partial tag

```liquid
{% partial 'name' %}...{% endpartial %}
```

- Partials name inline regions of server-rendered HTML. JavaScript can
  request a region by name and replace the matching region in the DOM. The
  name in the Liquid template and the name in JavaScript must match.
  Why: the name is the only link between the Liquid region and the script.
- The `liquid-tips` block is the theme's canonical partial-refresh example:
  its tip sentence lives in a `{% partial 'liquid-tip' %}` region, and
  `assets/liquid-tips.js` calls `partials.refresh("liquid-tip")` to swap in a
  fresh server-rendered tip. With a different URL:
  `blocks/product-form.liquid` + `assets/product-variant-picker.js`.
  Why: copy a working pattern instead of inventing one.
- The `{% partial %}` tag renders on the storefront only when
  `shop.features.agentic_editor_enabled?` is on and the page is served by
  StorefrontRenderer; otherwise the storefront raises `Unknown tag 'partial'`.
  Why: a partial on a store without the feature breaks the whole page, so
  check the store before adding one.
- JavaScript usage of partials is in the JavaScript section.

### Theme map

```
blocks/      merchant-editable components with {% doc %} + {% schema %}
snippets/    internal utilities rendered with {% render %}
templates/   *.liquid page structure (no JSON templates)
layout/      theme.liquid document shell, password.liquid
assets/      CSS, JavaScript, SVG and other static assets
config/      settings_schema.json (theme settings and design tokens)
locales/     en.default.json (storefront strings), en.default.schema.json (editor labels)
```

Blocks (`blocks/`):

| Block | Role |
| --- | --- |
| `announcement-bar` | One-line announcement above the header, optional link; renders nothing when empty. |
| `container` | Semantic wrapper (`tag`, `background`, `alignment`) every template composes into. |
| `featured-collection` | Product grid from one collection, built from `product-card`; up to 4 collection tabs, hidden panels in template elements. |
| `footer` | Newsletter, menu, social links, localization, payment icons, trust bar, wordmark. |
| `header` | Logo, two-level menu, mobile drawer, search, account and cart links; `cart-count` partial. |
| `hello-world` | Skeleton starter block: welcome message and highlight cards from `{{ content }}`. |
| `liquid-tips` | Canonical `{% partial %}` refresh example (`liquid-tip` region). |
| `product-form` | Product buy form: variant picker, quantity, add to cart; product partials. |
| `product-info` | Product title, vendor, `product-price` partial, description, view event. |
| `product-media` | Product gallery: images, video, external video, 3D model. |
| `product-sticky-bar` | Mobile sticky add-to-cart bar; hidden until JavaScript shows it. |
| `rich-text` | Heading with optional inline image, rich text and link CTA. |
| `slideshow` | Home hero carousel (scroll-snap, works without JavaScript). |
| `slideshow-slide` | One slide of `slideshow`: media, overlay, text, up to two buttons. |

Snippets (`snippets/`):

| Snippet | Role |
| --- | --- |
| `css-variables` | Outputs every design token as a CSS custom property plus `@font-face`. |
| `header-icon` | Decorative header icons (menu, close, search, chevron). |
| `icon-social` | Decorative social network icons for footer links. |
| `icon-trust` | Decorative trust bar icons. |
| `image` | Responsive image (`image_url` + `image_tag`, srcset, lazy by default). |
| `meta-tags` | Title, description, social and canonical meta tags. |
| `price` | Price, sale and compare-at price, unit price. |
| `product-card` | One product card: image, badge, title, price, swatches. |
| `product-structured-data` | The single JSON-LD Product for the product page. |
| `slideshow-icon` | Direction and media icons (previous, next, pause, play, arrow). |
| `variant-json` | Variant data as JSON for `assets/product-variant-picker.js`; no visible markup. |

- Adding, renaming or removing a block or snippet updates these tables in the
  same change.
  Why: agents read this map before opening files; a missing row hides a file.

## Block and snippet contracts

Every block must:

- Start with a `{% doc %}` header with typed params.
  Why: LiquidDoc is the block's API for agents and Theme Check.
- Include a `{% schema %}` tag without `presets`.
  Why: blocks are placed by templates, not added from the editor's block
  picker.
- Document each named parameter that the block reads, such as `tag` or
  `class`, and use every parameter it documents.
  Why: Theme Check reports undocumented arguments and unused documented
  parameters.
- Document `content` in LiquidDoc and indicate whether it is required or
  optional: `@param {string} content` or `@param {string} [content]`. For
  self-contained blocks, describe that callers must leave the body empty.
  Why: the caller must know whether its body is rendered or ignored.
- Render `{{ content }}` where caller-supplied body content belongs.
  Self-contained blocks may omit the outlet and use an empty caller body.
  Why: without the outlet, child blocks composed in the template disappear.
- Keep executable child block calls in layouts or templates.
  Why: see The block tag.
- Keep `{{ block.shopify_attributes }}` on the root element so the theme
  editor can identify the block.
  Why: without it the editor cannot select or highlight the block.
- Read merchant controls through `block.settings.<id>`; setting ids are
  `snake_case`, labels use `t:` keys (see Translations).
  Why: one naming scheme lets agents find a setting from its label.
- Keep settings flat and add only settings the design needs.
  Why: every setting is a control merchants and Sidekick must understand.
- Handle the empty state: when the required resource or text is empty, render
  a placeholder with instructions inside `{% if request.design_mode %}` and
  render nothing on the storefront (`blocks/announcement-bar.liquid`,
  `blocks/rich-text.liquid`). Exception: an empty page result (collection
  with no products, search with no results) is content, not missing setup —
  show the empty message to shoppers (`templates/collection.liquid`, ES1-T113).
  Why: the merchant sees how to fill the block, shoppers never see an empty
  frame.
- Keep existing `data-testid` attributes and JavaScript hooks (`data-*`,
  custom element names, partial names) listed in the block's `{% doc %}`;
  new interactive elements and partial regions get a
  `data-testid="<block>-<element>"`.
  Why: scripts and end-to-end tests select by these names; renaming one
  breaks them silently.

Every snippet must:

- Start with a `{% doc %}` header with typed params and an `@example`
  (`snippets/price.liquid`, `snippets/image.liquid`).
  Why: snippets are called from many places; the doc is their contract.
- Receive data only through `{% render %}` parameters; never call
  `{% block %}`.
  Why: `render` isolates scope, and block calls belong to layouts and
  templates.
- Render images through `snippets/image.liquid`, and keep `image_url` and
  `image_tag` in one filter chain.
  Why: one place for srcset, sizes and lazy loading; splitting the chain
  triggers Theme Check `RemoteAsset`.
- Mark decorative SVG icons `aria-hidden="true"` and color them with
  `currentColor`; the caller supplies the accessible name
  (`snippets/icon-social.liquid`).
  Why: the icon then follows text color and is not read twice.
- A snippet that only outputs data for JavaScript renders a
  `<script type="application/json">` and no visible markup
  (`snippets/variant-json.liquid`).
  Why: one JSON source per page avoids parsing data out of HTML.

Accessibility for blocks and snippets:

- Use semantic elements (`<details>`, `<dialog>`, `<button>`, `<a>`), one `h1`
  per page, visible focus, touch targets of at least 44px for controls.
  Why: Lighthouse accessibility must stay at 98 or more.
- Give every image an alt from the image's alt text in Shopify; decorative
  images use `alt=""`; `<img>` always has `width` and `height`.
  Why: missing alt fails accessibility, missing dimensions cause layout shift.

## Styling and tokens

- Design tokens flow one way: theme setting in `config/settings_schema.json`
  → CSS variable in `snippets/css-variables.liquid` → `var(--*)` in
  `assets/*.css` (ADR 0001). The token tables are in `DESIGN.md`.
  Why: merchants and Sidekick change the look in theme settings without
  touching CSS.
- CSS uses only `var(--color-*)`, `var(--font-*)`, `var(--space-*)`,
  `var(--radius-*)`, `var(--font-size-*)`, `--page-width`,
  `--page-margin`. Zero color literals in `assets/*.css`: no hex, `rgb()` or
  `hsl()`; tints and shadows use `color-mix()` with a variable.
  Why: a literal ignores the merchant's setting, and 0 literals is a release
  check.
- Setting id → variable naming: `<token>_color` → `--color-<token>`
  (underscores become hyphens); `type_primary_font` → `--font-primary--*`,
  `type_heading_font` → `--font-heading--*`; `space_base` → `--space-1..8`;
  `*_corner_radius` → `--radius-*`.
  Why: a predictable name lets an agent go from setting to CSS without
  searching.
- A new token needs, in one change: setting in `config/settings_schema.json`
  → variable in `snippets/css-variables.liquid` → row in `DESIGN.md` (and
  `docs/tokens.json` where the repository has it).
  Why: the places drift apart otherwise.
- Keep contrast at WCAG AA (4.5:1 normal text, 3:1 large text); the CTO
  contrast decisions in `DESIGN.md` (accent #C8400E, secondary gray #6B6B6B)
  override Figma.
  Why: Lighthouse accessibility must stay at 98 or more.
- Logical properties only: `margin-inline`, `margin-block-start`,
  `padding-inline-start`, `inset-inline-start`, `inset-block-end`,
  `text-align: start | end`. No `left` / `right` / `top` / `bottom`
  properties and no `margin-left`-style properties.
  Why: an RTL locale can be turned on later without rewriting CSS.
- Direction icons flip with `:dir(rtl)` and `scale: -1 1` (slideshow
  `previous`, `next`, CTA `arrow` in `assets/base.css`); properties with no
  logical keyword get a `:dir(rtl)` override next to the LTR rule.
  Why: arrows must point the reading direction.
- Merchant alignment settings keep `left` / `center` / `right`;
  `blocks/container.liquid` maps them to `start` / `center` / `end` for CSS.
  Why: labels stay familiar for merchants while CSS stays direction-neutral.
- `assets/critical.css` holds above-the-fold styles (layout, header, hero,
  buttons) and stays at most 10 KB (10 240 B); everything else goes in
  `assets/base.css`. Both load from `layout/theme.liquid` (ADR 0003).
  Why: a small critical file keeps first render and LCP fast.
- Because the theme does not use `{% stylesheet %}`, Shopify CSS subsetting
  does not apply; keep selectors scoped to the block class
  (`.rich-text__heading`) and remove CSS when you remove markup.
  Why: every rule ships on every page.
- Images: only the LCP image of each page loads `loading="eager"` with
  `fetchpriority="high"`: the first hero slide on the home page
  (`priority: true` on the first `slideshow-slide`), the banner on a
  collection page or its first card row when there is no banner (ES1-T113);
  every other image is lazy; hero image at most 200 KB WebP; preload one font
  only (ADR 0003).
  Why: one LCP element per page; extra eager loads slow it down.
- Breakpoints are mobile-first `min-width` media queries at `48rem`, `64rem`,
  `80rem`.
  Why: the same three steps everywhere keep blocks aligned with each other.

## JavaScript

- JavaScript lives only in `assets/*.js` as an ES module loaded with
  `<script src="{{ 'name.js' | asset_url }}" type="module"></script>` from the
  block that needs it (`blocks/header.liquid`, `blocks/slideshow.liquid`);
  shared scripts load once from `layout/theme.liquid`
  (`assets/standard-events.js`).
  Why: a page loads only the code of the blocks it renders, and modules
  defer by default.
- Vanilla Web Components, no framework: one feature = one file = one custom
  element (`assets/header-sticky.js`, `assets/slideshow.js`); guard the
  definition with `if (!customElements.get(name))` (ADR 0002).
  Why: no dependency weight, and a custom element upgrades the server
  markup in place.
- Size budget: each file at most 8 KB (8 192 B); all theme JavaScript a page
  references (script tags plus static imports, Shopify's own scripts
  excluded) at most 40 KB (40 960 B) per page (ADR 0002, ADR 0006).
  Why: Lighthouse performance must stay at 96 desktop and 90 mobile.
- Progressive enhancement: the server markup works first (links, forms,
  `<details>`, `<noscript>` select); JavaScript sets a flag such as
  `data-enhanced` before showing enhanced controls.
  Why: a script error or slow network must not block buying.
- Read Liquid output through `data-*` attributes and JSON snippets
  (`snippets/variant-json.liquid`); translated strings for JavaScript come
  from `data-label-*` attributes rendered with `| t`.
  Why: JavaScript cannot call `| t` or `routes.*`, so Liquid hands over
  finished values.
- Partials: import `partials` from `@shopify/partial-rendering`. Use
  `partials.refresh(...names)` to fetch and apply regions from the current
  page URL, or `partials.fetch(...names, { url, signal })` followed by
  `partials.apply(update)` when you need control over the request URL,
  method, body, or when the update appears. Names are passed as separate
  arguments, not an array. `partials.get(name)` and `partials.getAll(scope)`
  read regions in the DOM.
  Why: the server renders the HTML, so Liquid stays the single template.
- Fetch related regions together so one response keeps them synchronized
  (`assets/product-variant-picker.js` fetches price, buttons and pickup in
  one call).
  Why: separate requests can return different variant states.
- Build request URLs from the current page URL or Liquid `routes.*` to
  preserve locale and market routing.
  Why: a hardcoded path drops the locale and market prefix.
- `apply()` preserves focus, text selection, form values, and scroll
  position. It also preserves input, textarea, and select values when
  returned markup changes them: explicitly update server-adjusted controls
  after applying the partial (for example, a cart quantity corrected by
  inventory validation).
  Why: otherwise the shopper sees a value the server already rejected.
- Cancel stale requests with an `AbortSignal` (one `AbortController` per
  request; ignore `AbortError`), use `aria-busy` while loading, announce
  meaningful results in a live region (`role="status"` / `aria-live`), and
  restore transient DOM state such as open disclosures. Re-enable controls in
  `finally` so an error never leaves a button disabled.
  Why: fast repeated input must show the last result, and screen reader
  users must hear the change.
- Read URL state from `window.location.search` so shared links and browser
  navigation produce the same result; update it with `history.replaceState`
  when the state changes (`?variant=`).
  Why: a deep link must open the same state the shopper shared.
- Partial regions render only where `shop.features.agentic_editor_enabled?`
  is on (see The partial tag); keep the full-page form submit as the
  fallback.
  Why: the page must still work where partials are unavailable.
- Standard storefront events: load the library once from the CDN,
  `https://cdn.shopify.com/storefront/standard-events.js`, through
  `loadStandardEvents()` in `assets/standard-events.js`. Do not add an import
  map.
  Why: a theme import map would shadow the one Shopify provides for
  `@shopify/partial-rendering`, and one URL means one library instance.
- After a cart, product or search change, dispatch the matching `shopify:*`
  event: `shopify:product:select` from the product element when options
  change (`assets/product-variant-picker.js`), `shopify:cart:lines-update`
  when lines are added (`assets/product-form.js`).
  Why: apps and Shopify features listen to these events instead of
  scraping the DOM.
- `shopify:product:view` is not dispatched from JavaScript: wrap the product
  in `<s-view-event view-event-payload='{{ product | standard_event_data:
  "view", context: "page" | escape }}'>` in Liquid (`blocks/product-info.liquid`;
  cards use `view-event-trigger="intersect"`, `snippets/product-card.liquid`).
  Why: the library fires the event with a payload Shopify builds.
- Standard storefront actions are `Shopify.actions.getCart`, `openCart` and
  `updateCart`. When the theme has its own UI for one (for example a cart
  drawer), override that action so it drives the theme UI; there is no
  `showVariant` action.
  Why: apps call these actions and must reach the theme's UI.
- Respect `prefers-reduced-motion` (no autoplay, no motion) and the theme
  editor events (`shopify:block:select` in `assets/slideshow.js`).
  Why: motion can harm users, and merchants must see the block they select.
- No console errors or `console.log`, and no inline `<script>` with logic
  (JSON data scripts are fine).
  Why: a clean console is a release check, and logic in `assets/` stays
  cacheable and inside the size budget.

## Translations

- Storefront strings live in `locales/en.default.json`, grouped under
  `blocks.<block_name>` (for example `blocks.announcement_bar.label`) or the
  existing page group (`products`, `cart`, `customers`, `search`).
  Why: grouping by block lets an agent find every string of a block in one
  place.
- Use a literal key: `{{ 'blocks.slideshow.next' | t }}`, never a key built
  from variables.
  Why: Theme Check and the language editor can only track literal keys.
- Interpolate with named arguments (`{{ 'blocks.slideshow.dot_label' | t:
  index: 1 }}`); assign a filtered value to a variable first, because filters
  do not run inside `t` arguments.
  Why: translators can reorder `{{ index }}` without touching code.
- Editor labels, info and option labels in schemas use `t:` keys from
  `locales/en.default.schema.json` (`general`, `labels`, `info`, `options`).
  Why: the theme editor shows them in the merchant's admin language.
- Add new keys into the existing group; never repeat a key or a top-level
  group in the same JSON file.
  Why: a duplicate key silently overrides the first one and the string is
  lost.
- Copy is American English; labels and setting names are sentence case
  without `&`; standard commerce strings ("Add to cart", "Sold out",
  "Checkout") keep Shopify wording. CTA voice is in `DESIGN.md`.
  Why: one voice across the theme, and commerce words match checkout.
- Visually hidden text and `aria-label` values are translated too.
  Why: screen reader users get the same language as the page.

## Decision guide

| Situation | Do this | Example in this theme |
| --- | --- | --- |
| Add a block | New `blocks/<kebab-name>.liquid` with `{% doc %}`, `{% schema %}` without presets, `block.shopify_attributes`, editor placeholder; call it inside a `container` in the template; add a row to Theme map | `blocks/rich-text.liquid`, composed in `templates/index.liquid` |
| Add a block that holds other blocks | Render `{{ content }}`; child calls go in the template body | `blocks/slideshow.liquid` + `blocks/slideshow-slide.liquid` in `templates/index.liquid` |
| Reuse a fragment in several blocks | New snippet with `{% doc %}` + `@example`, called with `{% render %}` | `snippets/price.liquid`, `snippets/product-card.liquid` |
| Add a block setting | Add to the block `{% schema %}` with `t:` labels in `locales/en.default.schema.json`; read `block.settings.<id>` | `blocks/announcement-bar.liquid` |
| Add a theme-wide setting | Add to `config/settings_schema.json` in the right group; read `settings.<id>` | Social group used by `blocks/footer.liquid` |
| Add or change a color, font, spacing or radius | Setting → `snippets/css-variables.liquid` → `var(--*)` in CSS → `DESIGN.md`; never a literal in CSS | `background_sand_color` → `--color-background-sand` |
| Change a band background | Set `background:` on the template's `container` call | `{% block 'container', id: 'home-intro', background: 'sand' %}` in `templates/index.liquid` |
| Add styles | Block-scoped classes in `assets/base.css`; above-the-fold only in `assets/critical.css` (at most 10 KB); logical properties | `.button--link` in `assets/base.css` |
| Add an icon | Add a named case to the matching icon snippet; `aria-hidden`, `currentColor` | `snippets/slideshow-icon.liquid`, `snippets/header-icon.liquid` |
| Add an image | `{% render 'image' %}`; eager + high priority only for the page's LCP image (first hero slide, collection banner or first card row) | `snippets/image.liquid`, `blocks/slideshow-slide.liquid` (`priority`) |
| Add a string | Key under `blocks.<block_name>` in `locales/en.default.json`, literal `\| t` call | `blocks.announcement_bar.*` used in `blocks/announcement-bar.liquid` |
| Add a page type | New `templates/<type>.liquid` composing `container` blocks; no JSON template | `templates/page.liquid`, `templates/product.liquid` |
| Link to a storefront page | `routes.*` (`routes.root_url`, `routes.cart_url`, `routes.search_url`) | `blocks/header.liquid` |
| Add JavaScript | One ES module in `assets/` (at most 8 KB), one custom element, loaded by the block with `type="module"`; markup works without it | `assets/header-sticky.js` loaded in `blocks/header.liquid` |
| Update part of the page without reload | Wrap the region in `{% partial 'name' %}`, refresh it from JS with the same name | `blocks/liquid-tips.liquid` + `assets/liquid-tips.js`; with a URL: `blocks/product-info.liquid` (`product-price`) + `assets/product-variant-picker.js` |
| Give JavaScript server data | JSON snippet or `data-*` attributes | `snippets/variant-json.liquid` |
| Report a storefront event | Liquid `<s-view-event>` for views; `shopify:*` event from JS for changes | `blocks/product-info.liquid`, `assets/product-form.js` |
| Add product structured data | Extend the single JSON-LD snippet; do not add a second Product | `snippets/product-structured-data.liquid` |
| Theme Check reports an error | Fix the Liquid; never edit `.theme-check.yml` | `{% doc %}` params in `blocks/slideshow-slide.liquid` |
| A rule here blocks the request | Keep the rule, explain which rule and why, and offer the closest compliant change | This file |
