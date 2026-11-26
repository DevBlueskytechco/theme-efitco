KHÔNG CHẮC: phạm vi ticket gồm AGENTS.md, docs/merchant, 16 file tests/e2e cũ nhưng hook scope-guard chặn Dev FE ghi các file này → đã tách ES1-T592 (QA, e2e), ES1-T593 (Writer, docs/merchant), ES1-T594 (câu hỏi CTO, AGENTS.md). e2e chặn merge sẽ đỏ tới khi ES1-T592 xong trên cùng nhánh; AC5 chưa đạt.

# ES1-T578: sentence case cho locale và schema default (gộp ES1-T552)

Nguồn: docs/design/content.md §2, §3, §5, §8.1, §8.2; drafts/designer/ES1-T567/notes.md mục 3 #1, #2, #19, 9.2, 10.4; CTO 23/11 (drawer giữ "Cart").

## Thay đổi

locales/en.default.json (80 dòng chuỗi, không thêm / xoá khoá)
- §8.1 nút: Add to cart, Add bundle to cart, Add setup to cart, View details, View all products, Shop all products, Sign in, Get started now, View about us, Explore equipment, Choose options (+ for {{ title }}), Change my answers, Retake quiz, See my shortlist, Shop all equipment, Sold out, View all {{ total }} matches, Back to homepage, Post comment, View all articles, Send message, Continue shopping (contact, cart), Shop bestsellers, Copy code, Print gift card, Start shopping, Contact us, Try again (general, footer), Notify me, Enter using password, Enter store, Clear all filters, Show fewer.
- §8.2 heading / dialog / empty / eyebrow: Page not found, Search results, Opening soon, Your {{ shop }} gift card, Find your perfect gear, Your gear shortlist, No exact match, We couldn't load your matches, What our customers say?, Level up<br> your fitness, Why choose<br> Efitco?, Send us a message, Quick answers before you write, Questions and answers, Your bundle, Order summary, Your cart is empty, No collections yet, No products here yet / No matching products / No products on this page, Nothing matches “{{ terms }}” yet / No products match these filters / This page has no results, No articles yet / No articles on this topic / More articles, Feature product, Setup discount (%p%), Level fitness (bỏ 2 dấu cách).
- Số đếm: blog.comments_count, blocks.level_card.products_count, blocks.bundle_builder.count_one/other, cart.item_count_badge → chữ thường ("{{ count }} items").
- ES1-T552: blocks.footer.newsletter_invalid "Enter an email like name@example.com."; cart.error "Check your connection, then try again."; toast cart.added "Added to cart" (3 từ, 13 ký tự) giữ.
- Giữ: cart.title "Cart" (drawer + trang giỏ), View cart, Checkout, Clear all, 4 khoá tên riêng (Custom Liquid, Apple Wallet, Shopify Search and Discovery, Online Store), hello_world.*.
- Không đổi: products.card.sale_percent, cart.discount_value (U+2212, ES1-T579).

blocks/ schema default (9 file, 13 giá trị)
- blog-posts "Training tips & inspiration"; bundle-builder "Pick your kit, save as you go", "View preset bundles"; collection-list "Browse categories"; featured-collection "What people are buying?"; multicolumn-column "Shop all products"; rich-text "Everything you need", "to train.", "Become a member"; shop-by-level "Choose your training level"; shop-the-look "A complete corner gym, itemised", "Browse all setups"; video-carousel "See real equipment in action, before you buy".
- "to train.", "Become a member" ngoài regex AC2 nhưng nằm trong content.md §2.1 / phụ lục ES1-T567 → đổi cùng.
- Giữ "Portable Fitness" (tên collection, notes 10.4).

tests/e2e/ES1-T578.spec.ts (mới): tĩnh AC1, AC2, giá trị §8 + ES1-T552 + khoá giữ; storefront AC3 (404 h1, giỏ rỗng, drawer "Cart" ở trang chủ, PDP "Add to cart", badge "4 items" seed TE1_PRODUCT_HANDLE), AC4 (computed uppercase eyebrow + display 404); AC5 test.fixme.

Không chạm CSS, JS, templates. Template test (index.te*, index.figma, article.figma) còn literal Title Case, ngoài phạm vi ticket.

## Ngoài phạm vi / bàn giao
- ES1-T592 QA: đổi assert chuỗi cũ; danh sách dòng drafts/dev-fe/ES1-T578/e2e-old-strings.txt (166 dòng heuristic, 43 file).
- ES1-T593 Writer: docs/merchant/bundle-builder.md, pre-publish.md.
- ES1-T594 CTO: AGENTS.md 513–514 (đề xuất câu thay trong ticket). Dòng 349 trên develop không chứa Title Case.
- Doc comment `{% doc %}` vài block còn trích chuỗi cũ ("Back To Homepage", "Try Again"…): chỉ là chú thích, không render.

## Tự kiểm tra
- shopify theme check: 0 lỗi, 9 warning có sẵn ở quiz-step, index, index.figma, index.te12 (không file trong diff).
- AC1: grep regex trên en.default.json còn 4 dòng hello_world + 4 khoá tên riêng.
- AC2: `git grep -nE '"default": "[^"]*[A-Z][a-z]+ [A-Z][a-z]+' -- blocks sections` → chỉ featured-collection.liquid:405 "Portable Fitness".
- Không file JS, CSS trong diff; JSON không trùng khoá (chỉ đổi giá trị).
- Playwright, preview, Lighthouse, ảnh cart / drawer / 404 ở 360, 1280: chờ CI. e2e cũ đỏ tới khi ES1-T592 xong; AC5 chờ ES1-T594.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
