### ES1-T45 — AC tách từ body ticket (dùng cho ac_coverage.py)
Nguồn: ticket ES1-T45 (2727475000000144006), ADR 0005, docs/srs.md#TE-2 AC5, docs/srs.md#TE-14 AC4, drafts/dev-fe/ES1-T37/pr-description.md (D6).

- AC1 Container data-testid=container-home-intro có background-color rgb(235, 230, 224). (TE-2 AC5, ADR 0005 QĐ1-2)
- AC2 Heading textContent chuẩn hoá khoảng trắng = "Everything You Need to Train.". (ADR 0005 QĐ3)
- AC3 Ảnh inline (nếu có) alt="". (ADR 0005 QĐ3)
- AC4 CTA rich-text-button cao từ 44px, icon aria-hidden. (ADR 0005 QĐ4-5)
- AC5 Ở 1024 và 1280 heading không tràn cột (scrollWidth <= clientWidth). (ES1-T44 DoD)
- AC6 Dưới 64rem 1 cột. (ES1-T44 DoD)
- AC7 document.documentElement.dir='rtl' thì .slideshow-icon--previous/--next/--arrow có scale -1 1. (TE-14 AC4, ES1-T37 D6)
- AC8 Panel localization bám inline-end ở 1280. (TE-14 AC4)
- AC9 ltr không đổi.
- AC10 Test RTL skip có điều kiện khi stylesheet chưa có rule :dir(rtl).
- AC11 Phần còn lại của TE-2 AC5: body richtext, nút tuỳ chọn, độ rộng tối đa theo setting, heading level h1/h2.
