# Contributing to Skeleton Theme

## How to contribute

We ❤️ pull requests. If you'd like to fix a bug, contribute a feature, or just correct a typo, feel free to do so, as long as you follow our [Code of Conduct](./CODE_OF_CONDUCT.md).

If you're thinking of adding a new feature or proposing a new pattern across the theme, please consider opening an issue first. This will allow us to discuss your idea, ensure it aligns with the project's direction, and potentially save you some time.

For your contribution to be accepted, you'll need to sign the [Shopify Contributor License Agreement (CLA)](https://cla.shopify.com/).

## Standards

* This codebase must be minimalist, not a fully featured theme.
* This theme must provide a common foundational starting point for most developers.
* Do not include or reference legacy or non-recommended features.
* All changes must preserve the principles defined in the README.

## Steps to contribute

1. Fork the repository: [https://github.com/Shopify/skeleton-theme/fork](https://github.com/Shopify/skeleton-theme/fork)
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to your branch: `git push origin my-new-feature`
5. Create a new Pull Request

## Changing the design system

This section applies to the Efitco theme built on this codebase. It covers any
change to design tokens, shared components, or the rules in `DESIGN.md`. The
rest of this file is unchanged.

### Who decides

| Role | Does |
| --- | --- |
| Designer | Proposes the change: mockup in `drafts/designer/`, spec in `docs/ui-spec/`, a line in the ticket's `notes.md` |
| CTO | Decides. A decision is final once it is written in `docs/design/decisions.md` |
| Dev FE | Builds the CSS and Liquid. JavaScript is Dev BE work |
| QA | Checks the built result against the spec and the acceptance criteria |

A change that reverses a line in `docs/design/decisions.md` needs a new CTO
decision first. Do not reverse one in a pull request.

### Order of sources

1. `docs/design/decisions.md` (CTO decisions)
2. `AGENTS.md`
3. `DESIGN.md`
4. Figma: home frame 1:359 and "Efitco Theme Final / Design System 2"

For a token value: a value that has a line in `docs/design/decisions.md`
follows that line in every copy. For a token with no decision line, when the
copies disagree: `config/settings_schema.json` →
`snippets/css-variables.liquid` → `docs/tokens.json` → `DESIGN.md`,
`docs/ui-spec/foundation.md` and `drafts/designer/_kit/kit.css`; the earlier
one wins (proposed in ES1-T535, waiting for a CTO decision). Known mismatches
where the decision wins over the setting default until FE fixes it:
`badge_new_color` #467A48 → #4B824D (V01), `background_alt_color` #F4F4F4 →
#F4F4F5 (V18).

### Rules for a token change

- Change all four places in one pull request: the setting default (when the
  token has a setting), `snippets/css-variables.liquid`, `docs/tokens.json`,
  and the docs (`DESIGN.md`, `docs/ui-spec/foundation.md`) with the mockup kit.
- Put the token in the right tier (primitive, semantic, component; see
  `DESIGN.md`, "Token tiers"). Components read semantic tokens.
- Name a token by role or scale step, never by value. Do not add a `--figma-*`
  variable.
- A new color token needs a contrast line in `docs/tokens.json` `_contrast`
  in the same change. Do not add a brand color or a font without a CTO
  decision.
- No hex, raw px spacing, hand-written shadow or numeric `z-index` in
  `assets/*.css`.

### Version and changelog

- The design system has one version, `major.minor.patch`, in
  `docs/tokens.json` `_version`.
- major: a token, setting id or component class is renamed or removed. minor:
  something is added. patch: a value or a document is corrected.
- Add one line to `docs/design/CHANGELOG.md` in the same pull request.

### Component status

Set or update the status of the component in `docs/ui-spec/foundation.md`
§39 and on its design system section (`data-status`): Proposed → Approved →
Built → Deprecated. Only Approved and Built components go into new pages.

### Pull request checklist for a design system change

- [ ] Ticket key and the decision line in `docs/design/decisions.md` (or
      "proposal, waiting for CTO")
- [ ] Screenshots at 360, 768, 1280 and 1920
- [ ] Contrast ratios for every new text and background pair (WCAG AA)
- [ ] All states shown: default, hover, focus-visible, active, disabled,
      loading, error
- [ ] Accessibility: accessible names, focus order, touch targets (44 for
      the six key groups, 24 minimum elsewhere), `prefers-reduced-motion`
- [ ] Long labels tried at 360 (label three times longer), and `dir="rtl"`
      for anything directional
- [ ] Spec updated (`docs/ui-spec/`), design system section updated
      (`drafts/designer/ES1-T251/foundation.html`), strings follow
      `docs/design/content.md`
- [ ] Four token places in sync; version and changelog updated
- [ ] No page-level copy of a kit component's CSS
