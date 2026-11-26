// ES1-T536: thang khoảng cách một hệ tên + dẫn xuất + kích thước component, chép từ snippets/css-variables.liquid
// ở space_base 4 (Liquid không render khi chạy fixture tĩnh). Chèn SAU TOKENS của từng spec: :root sau ghi đè
// --space-8 120 → 128 (×32). Kèm icon / line-height-sm mà CSS ES1-T536 dùng thay calc(var(--space-1) * N).
// Đổi css-variables thì đổi file này.
export const SPACE_TOKENS = `:root{
--space-050:2px;--space-2xs:4px;--space-150:6px;--space-xs:8px;--space-sm:12px;--space-md:16px;--space-lg:20px;--space-xl:24px;
--space-2xl:32px;--space-3xl:40px;--space-4xl:48px;--space-5xl:64px;--space-6xl:80px;--space-7xl:128px;
--space-1:var(--space-2xs);--space-2:var(--space-xs);--space-3:var(--space-sm);--space-4:var(--space-md);
--space-5:var(--space-xl);--space-6:var(--space-2xl);--space-7:var(--space-4xl);--space-8:var(--space-7xl);
--section-gap:var(--space-4xl);--heading-gap:var(--space-xl);--grid-gap:var(--space-sm);--tab-padding-inline:var(--space-xl);
--touch-target:44px;--control-height:48px;--control-height-compact:44px;--tab-height-desktop:40px;--row-height:52px;
--round-button-size:52px;--count-badge-size:20px;--progress-height:4px;--meter-height:8px;
--icon-size-sm:16px;--icon-size-md:20px;--icon-size-lg:24px;--line-height-sm:1.4286}
@media (min-width:48rem){:root{--grid-gap:var(--space-md)}}
@media (min-width:64rem){:root{--section-gap:var(--space-7xl)}}
@media (min-width:80rem){:root{--grid-gap:var(--space-xl);--heading-gap:var(--space-3xl)}}`;
