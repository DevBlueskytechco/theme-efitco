KHÔNG CHẮC: (1) file này thay toàn bộ `docs/requirements-map.md`. BA chỉ ghi trong `drafts/`, Orchestrator chép sang docs/. (2) R19 và R21–22 chưa có task writer R2. CTO chốt ở ES1-T421 rằng writer chỉ nhận point khi CTO tạo ticket; đã hỏi tiếp ở ES1-T440 (im lặng tới 15/11/2026 = nhận mặc định). (3) Ngưỡng CI của R6 lấy theo ES1-T301. `CLAUDE.md` và `docs/checklist-theme-store.md` R6.2 vẫn ghi a11y ≥ 98 cho tới khi DevOps xong ES1-T416.

# Ánh xạ yêu cầu Theme Store (mã R) → story · chuẩn chất lượng nội bộ · bản 0.5 (SRS 0.5, ES1-T397)

Nguồn: `docs/checklist-theme-store.md`, `docs/srs.md` 0.5 (dòng "Mã R" của từng story), CTO 11/11 ES1-T308, ES1-T301, ES1-T419, CTO 12/11 ES1-T422. Chi tiết từ AC tới TC và task R2 xem `drafts/ba/ES1-T397/traceability.md`.

| Mã R | Nội dung | Áp dụng | Story |
| --- | --- | --- | --- |
| R1 Exclusivity | chỉ bán trên Theme Store, không credit | Tham khảo (không bán; CTO 11/11 ES1-T308 #2: chưa nộp Theme Store) | — |
| R2 Uniqueness / codebase | Skeleton Theme; không Dawn/Horizon | Bắt buộc phần codebase | TE-1, TE-14, NFR-2, NFR-3 |
| R3 Design & UX (R3.1, R3.2) | layout, hierarchy, consistency, settings rõ | Bắt buộc | TE-2, TE-3 (AC17), TE-5 (AC14), TE-6 (AC8, AC15), TE-7, TE-12 (AC8, AC9), TE-13 (AC6, AC8), TE-15, TE-16, TE-17 (AC-H37, AC-H38), TE-19 (AC2, AC3), mọi FE |
| R4 Features | discounts, accelerated checkout, filtering, gift card, focal point, page_image, selectors, menu đa cấp, newsletter, pickup, recommendations, rich media, predictive search, selling plans, installments, unit price, variant images, Follow on Shop, shopify-account | Bắt buộc | R4.1 TE-5, TE-12 (AC2); R4.2 TE-1 (AC11), TE-4 (AC4), TE-5 (AC16); R4.3 TE-6, TE-8 (AC7); R4.4 TE-3 (AC15), TE-4 (AC6), TE-5 (AC12), TE-21 (AC13–AC15); R4.5 TE-2; R4.6 TE-1 (AC7); R4.7 TE-1 (AC5, AC9, AC10); R4.8 TE-1 (AC2), TE-22 (AC1–AC5); R4.9 TE-1 (AC12), TE-18, TE-21 (AC10); R4.10 TE-4 (AC20); R4.11 TE-4 (AC28, AC29), TE-19; R4.12 TE-3 (AC14), TE-4 (AC23), TE-13 (AC2); R4.13 TE-8; R4.14 TE-4 (AC19), TE-5 (AC10); R4.15 TE-4 (AC4), TE-5 (AC16); R4.16 TE-3 (AC4, AC15), TE-4 (AC31), TE-5 (AC12); R4.17 TE-4 (AC1); R4.18 TE-1 (AC11); R4.19 TE-1 (AC3) |
| R5 Templates/sections/blocks (R5.1, R5.2) | JSON templates, section groups, app blocks | R5.2 không áp dụng: Skeleton block-first, không JSON template, không section groups (AGENTS.md, CTO 11/11 sổ quyết định). Không vùng app block trong R1: review trang sản phẩm chỉ tóm tắt rating từ metafield (CTO 11/11 ES1-T308 #3), vùng app block hoãn sau R1. R5.1 giữ: có block Custom Liquid | TE-7 (R5.1); TE-4 (AC27, review chỉ metafield, không app block) |
| R6 Lighthouse (R6.1, R6.2) | Shopify: perf ≥ 60, a11y ≥ 90 | Bắt buộc, theo NFR-1. Có 2 ngưỡng. (a) Ngưỡng CI chặn merge theo ES1-T301: perf desktop ≥ 0,96, mobile ≥ 0,9; a11y 1,0; Best Practices chỉ warn 0,78; SEO chỉ warn 1. (b) Chỉ tiêu nghiệm thu NFR-1, đo trên store dev ở 14 template của charter 0.2 (ES1-T419), desktop + mobile: Accessibility 100; Best Practices 100, tính là 0 audit trượt do theme, audit trượt do nền tảng Shopify ghi riêng (ES1-T419); SEO 100 ở trang chủ, collection, sản phẩm, blog, bài viết, page; Performance desktop ≥ 98, mobile ≥ 90 | NFR-1; TE-10 (AC1, AC10, AC-H30, AC-H31); TE-2 (AC10); TE-13 (AC5); TE-18 (AC9); TE-19 (AC6); TE-20 (AC6, AC9, AC14); TE-21 (AC6, AC12, AC16); TE-22 (AC6, AC11) |
| R7 Pages (R7.1–R7.9) | layout lang/routes; product; collection; list-collections; cart; page; blog; article; search; 404; gift card; password | Bắt buộc | R7.1 TE-1 (AC7, AC9); R7.2 TE-4; R7.3 TE-3, TE-6, TE-10 (AC14), TE-11 (AC8, AC10), TE-22 (AC9); R7.4 TE-6 (AC5, AC15); R7.5 TE-5, TE-3 (AC11), TE-11 (AC6), TE-19; R7.6 TE-21 (AC1–AC6); R7.7 TE-20, TE-6 (AC6), TE-10 (AC14); R7.8 TE-8; R7.9 TE-21 (AC7–AC16) |
| R8 Consistency | RTE nhất quán, script trên Shopify CDN, không app-like, không fake urgency; theme mới cài không nội dung mẫu (ES1-T308 #1) | Bắt buộc | TE-1 (AC12, AC-H28), TE-4 (AC17, AC25, AC32), TE-7 (AC5), TE-9 (AC1, AC4), TE-10 (AC3, AC15), TE-11, TE-12, TE-13 (AC1, AC7), TE-17 (AC-H5, AC-H36), TE-18, TE-19 (AC8), TE-20 (AC10, AC15), TE-21 (AC2, AC17), TE-22 (AC14), NFR-6 |
| R9 Browser | desktop/mobile/webview list | Bắt buộc | TE-10 (AC6, AC-H32), NFR-5 |
| R10 Assets | không Sass, không minified | Bắt buộc | TE-1, TE-10 (AC-H34) |
| R11 SEO | meta snippet, rich snippets, không robots.txt.liquid | Bắt buộc | TE-1 (AC7), TE-4 (AC11), TE-20 (AC6, AC14), TE-21 (AC6, AC16), TE-22 (AC3, AC12) |
| R12 Accessibility | keyboard, focus, alt, label, contrast, touch 24px, focus order, headings | Bắt buộc | mọi FE: TE-1, TE-2, TE-3, TE-4, TE-5, TE-6, TE-7, TE-8, TE-10 (AC6–AC13, AC15), TE-11, TE-12, TE-13, TE-14 (AC4), TE-15, TE-16, TE-17 (AC-H7, AC-H35), TE-18, TE-19 (AC7), TE-20, TE-21, TE-22 |
| R13 Social | icon set, OG/Twitter tags, placeholder rỗng | Bắt buộc | TE-1 (AC6, AC12) |
| R14 Settings | text style, terminology, favicon, logo, link_list default, theme_info | Bắt buộc | TE-1 (AC13), TE-2, TE-7, TE-8 (AC4), TE-9, TE-17 (AC-H1, AC-H6, AC-H36), TE-18 (AC10), TE-19 (AC8), TE-20 (AC15), TE-21 (AC17), TE-22 (AC8, AC14) |
| R15 Font picker | font_picker, default, 4 biến thể, không custom font | Bắt buộc | TE-1 (AC8) |
| R16 Color | ≥ 4 màu, background có foreground, type color | Bắt buộc | TE-1 (AC1), TE-17 (AC-H4) |
| R17 Responsive images | srcset, lazy | Bắt buộc | mọi FE: TE-2, TE-3, TE-4 (AC23), TE-5 (AC19), TE-6 (AC15), TE-7 (AC7), TE-8 (AC8, AC14), TE-11 (AC10), TE-13 (AC8), TE-15, TE-16, TE-19 (AC6), TE-20 (AC6, AC9), TE-21 (AC8, AC12), TE-22 (AC6) |
| R18 Naming | 1–2 từ, không trùng Shopify | Tham khảo (không Canvas/Sidekick trong tên; tên theme để sau R1, ES1-T308 #2) | — |
| R19 Version/release notes | version + notes | Bắt buộc. Writer làm: release notes mỗi sprint và bản R1 Canvas 28/12. Không có AC trong SRS, chưa có task writer R2 (ES1-T440 #1) | writer |
| R20 Demo store | client transfer store | Tham khảo; thay bằng dữ liệu demo trên hoa-qua-nhap-khau (efitco-ai-dev) (ES1-T298). Nội dung Figma chỉ cấu hình trên store dev (fixture TE-17-R2-QA0) | TE-9 (AC4, AC7), TE-17 |
| R21–R22 Docs/support | tài liệu, contact form, SLA | Tham khảo; thay bằng docs/merchant + hướng dẫn Canvas | TE-10 (AC5), writer |
| Canvas C1–C5 | mở được; block hiện đúng; sửa trực tiếp; Sidekick 3/10 yêu cầu; theme check sau sửa | Bắt buộc | TE-10 (AC4), TE-14, TE-17 (AC-H6), cuối mỗi sprint |

Đổi so với bản trước:
- R5: theo ES1-T308 #3, R1 không có vùng app block. Review chỉ lấy rating từ metafield, ghi kèm TE-4 AC27. Tách R5.1 (giữ) và R5.2 (N/A) theo checklist.
- R6: theo NFR-1, tách ngưỡng CI (ES1-T301) và chỉ tiêu nghiệm thu (NFR-1, ES1-T419). Bỏ dòng "nội bộ 96/90/98".
- Cột Story: thêm TE-11 đến TE-22 theo dòng "Mã R" của SRS 0.5. Ghi số AC khi story chỉ chạm mã R ở một phần AC.
- R19: người làm là writer, áp mỗi sprint và bản R1. Hiện chưa có task R2.
