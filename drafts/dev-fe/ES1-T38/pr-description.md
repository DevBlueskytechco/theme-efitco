KHÔNG CHẮC: (1) ticket ghi "9 block + 7 snippet" nhưng lúc viết repo có 14 block + 11 snippet (TE-3/TE-4 đã merge) → Theme map liệt kê đủ 25 theo lệnh DoD vòng for; (2) câu Skeleton "as shown by `tips` in `templates/index.liquid`" đã sai (index.liquid không còn gọi liquid-tips) → trỏ sang `@example` của blocks/liquid-tips.liquid; (3) vài quy tắc ngoài danh sách ticket nhưng có nguồn (No build step — ADR 0004; Works without JavaScript — ADR 0002; empty state + data-testid — CONVENTION.md/Skeleton blocks; a11y, breakpoints — DESIGN.md) → CTO bỏ nếu thấy thừa; (4) scope-guard chặn ghi AGENTS.md ở gốc → bản mới ở drafts/dev-fe/ES1-T38/AGENTS.md, CTO console chép ra gốc lúc review (comment CTO 04/11).

# ES1-T38 TE-14-FE2: AGENTS.md viết lại theo 7 mục outline Canvas

Spec: drafts/techlead/ES1-T33/task-split.md D1, D2, D3. AC: TE-14 AC1.

## Thay đổi
- `drafts/dev-fe/ES1-T38/AGENTS.md` (30 080 B, tiếng Anh): thay toàn bộ AGENTS.md gốc khi chép ra.
- 7 H2 đúng thứ tự: Non-negotiables, Composition model, Block and snippet contracts, Styling and tokens, JavaScript, Translations, Decision guide. Mỗi quy tắc = 1 dòng quy tắc + `Why:`.
- Composition model chứa H3 The block tag, The partial tag, Theme map (bảng 14 block + 11 snippet, 1 câu vai trò).
- Quy tắc dự án thêm: token settings → css-variables → var(--*), 0 literal màu (ADR 0001, trỏ DESIGN.md); Web Components ES module, 1 file tối đa 8 KB, 40 KB/trang (ADR 0002, 0006); critical.css tối đa 10 KB, hero eager, 1 font preload (ADR 0003); logical properties + `:dir(rtl)`; standard events nạp từ CDN, `shopify:product:select`, `shopify:cart:lines-update`, `<s-view-event>` cho view, actions getCart/openCart/updateCart, không showVariant (ES1-T75, ES1-T81, comment CTO 04/11); `partials.fetch(...names, { url, signal })` + `partials.apply(update)`.
- Không đưa quy trình team (FE/BE, nhánh, ticket, store, hook). Không sửa CLAUDE.md, .claude/rules, DESIGN.md.
- Decision guide: 20 dòng tình huống → làm gì → file mẫu có thật.

## Bảng đối chiếu Skeleton cũ → mục mới

| # | Câu/quy tắc AGENTS.md cũ | Vị trí mới |
| --- | --- | --- |
| 1 | Intro: minimal theme, page structure in Liquid; conventions not obvious from a file; code is source of truth | Intro (giữ nguyên, thêm Sidekick + DESIGN.md) |
| 2 | No sections: no `sections/`, no section/sections tag, no JSON templates, no schema `presets` | Non-negotiables › No sections |
| 3 | No Liquid-embedded assets: no stylesheet/javascript tag; CSS and JS in `assets/` | Non-negotiables › No Liquid-embedded assets |
| 4 | Direct Liquid templates; don't introduce a section for one-page markup | Non-negotiables › Direct Liquid templates |
| 5 | Template-owned containers: template = composition root, one or more container, one per vertical slice | Non-negotiables › Template-owned containers + Composition model |
| 6 | theme.liquid wraps only header and footer in own container, `content_for_layout` in plain `<main>` | Composition model bullet 1–2 (cập nhật: + announcement-bar, đúng layout hiện tại) |
| 7 | password.liquid plain `<main>`, its template owns the container | Composition model bullet 3 |
| 8 | Exception gift_card.liquid `{% layout none %}` | Composition model bullet 5 |
| 9 | Whitespace between tag name and Liquid delimiter | Non-negotiables › Whitespace matters |
| 10 | Translated UI only, literal `{{ 'key' \| t }}` | Non-negotiables › Translated UI only + Translations |
| 11 | `routes.*`, never hardcode /cart, /search, /collections | Non-negotiables › Shopify routes + JavaScript (request URLs) + Decision guide |
| 12 | Page structure diagram | Composition model (code block, thêm announcement-bar) |
| 13 | Neither layout wraps content_for_layout in container; template may hold any number of containers | Composition model bullet 1, 4 |
| 14 | Block tag syntax; works like render, renders blocks/name.liquid | The block tag bullet 1 |
| 15 | Named params = plain variables; matching schema setting sets `block.settings.<id>`; otherwise only variable | The block tag bullet 1 |
| 16 | Container example alignment/tag; `tag` không tạo block.settings.tag; dùng `block.settings.<id>` cho control schema; `class` là param thường | The block tag bullet 2 (giữ ví dụ nguyên văn) |
| 17 | `{% doc %}` documents only, không declare/validate/bind; doc-only param không thành setting; dùng schema cho control merchant | The block tag bullet 3 |
| 18 | Inline literal arrays OK trong block args (`tips`); render/partial không nhận | The block tag bullet 4 (ví dụ chuyển sang `@example` liquid-tips, xem KHÔNG CHẮC 2) |
| 19 | Body → `{{ content }}`; luôn đóng `{% endblock %}` | The block tag bullet 5 |
| 20 | Body render trong scope caller, không đọc settings/assign của callee | The block tag bullet 6 |
| 21 | Ưu tiên body cho text/markup hiển thị thay vì param title/body/heading; thêm param khi cần data/đổi cách render | The block tag bullet 7 |
| 22 | `{% block %}` chỉ trong layout/ và templates/; child call ở body của caller; LiquidDoc example được phép nhưng khi dùng phải viết ở layout/template | The block tag bullet 8 + Block contracts "Keep executable child block calls" |
| 23 | Partial syntax; vùng HTML server-render có tên; JS yêu cầu theo tên, tên phải khớp | The partial tag bullet 1 |
| 24 | liquid-tips là ví dụ chuẩn; `liquid-tip` + `partials.refresh("liquid-tip")` | The partial tag bullet 2 |
| 25 | Import `partials` từ `@shopify/partial-rendering`; refresh() cho URL hiện tại; fetch()+apply() khi cần URL/method/body/thời điểm | JavaScript › Partials (cập nhật chữ ký ES1-T75) |
| 26 | Fetch related regions together | JavaScript bullet 7 |
| 27 | Build request URLs từ URL trang hoặc `routes.*` | JavaScript bullet 8 |
| 28 | apply() giữ focus/selection/form values/scroll; giữ cả giá trị input/textarea/select → cập nhật tay control server chỉnh (cart quantity) | JavaScript bullet 9 |
| 29 | AbortSignal, aria-busy, live region, khôi phục trạng thái DOM tạm (disclosure) | JavaScript bullet 10 |
| 30 | URL state từ `window.location.search` | JavaScript bullet 11 |
| 31 | `{% partial %}` chỉ render khi `shop.features.agentic_editor_enabled?` + StorefrontRenderer, nếu không `Unknown tag 'partial'` | The partial tag bullet 3 + JavaScript bullet 12 |
| 32 | Blocks: `{% doc %}` typed params | Block and snippet contracts bullet 1 |
| 33 | `{% schema %}` không presets | Block and snippet contracts bullet 2 |
| 34 | Document mọi named param block đọc (tag, class) | Block and snippet contracts bullet 3 |
| 35 | Document `content` required/optional; self-contained ghi caller để body rỗng | Block and snippet contracts bullet 4 |
| 36 | Render `{{ content }}`; self-contained được bỏ outlet | Block and snippet contracts bullet 5 |
| 37 | Keep executable child block calls in layouts or templates | Block and snippet contracts bullet 6 |
| 38 | `{{ block.shopify_attributes }}` trên root | Block and snippet contracts bullet 7 |
| 39 | `.theme-check.yml` pristine `extends: theme-check:recommended`, zero overrides; sửa Liquid thay vì config | Non-negotiables › Theme Check stays clean + Decision guide dòng Theme Check |
| 40 | Current blocks: container, hello-world, header, footer, liquid-tips | Theme map bảng Blocks (14) |
| 41 | Theme map (blocks, templates, layout, snippets, assets) | Theme map (thêm config, locales, bảng block/snippet) |

## Tự kiểm tra
- `wc -c`: AGENTS.md 30 080 B, DESIGN.md 13 116 B (≤ 51 200).
- `grep -c '^## '` = 7, tên và thứ tự đúng ticket.
- Vòng kiểm basename blocks/ + snippets/ (25 file): 0 MISSING.
- Từ khoá: sections/ 1, presets 3, stylesheet 2, javascript 1, routes. 5, `| t` 6, agentic_editor_enabled 2, shopify_attributes 2, theme-check:recommended 1; DESIGN.md 8 dòng, file có ở gốc.
- `shopify theme check --path .`: 50 file, 0 offense.
- Không file JS/Liquid trong diff (chỉ drafts/). Đối chiếu code: tên biến `--font-size-*`, `routes.*` trong header, `replaceState`, REGIONS picker, `<s-view-event>` product-info/product-card đã grep khớp.
- Cần: 1 approve dev-be cho mục JavaScript; CTO duyệt cuối + chép ra gốc. Preview/Lighthouse: không áp dụng (doc-only), chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
