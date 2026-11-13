KHÔNG CHẮC: dev-fe không ghi được tests/ (scope-guard, ranh giới vai); bản này là đề xuất sửa spec cho QA áp dụng, số tính tay từ CSS, chờ CI đo.

# ES1-T334 — sửa spec cũ theo AC mới (CTO 13/11: "AC mới đổi hành vi thì sửa spec ES1-Txx tương ứng")

Chỉ đổi assertion trái AC hiện hành của SRS 0.5. Assertion còn đúng AC giữ nguyên, kể cả ES1-T185 và ES1-T220 (CSS đã sửa để `[hidden]` ẩn nút, xem PR).

## 1. tests/e2e/ES1-T118.spec.ts:93 "AC1 768: 2 cột; 1280: lưới không cuộn, 3 cột, đúng 4 mục thì 4 cột"

AC thay: TE-7 AC1 (0.4, HD3 11/11) "mục xếp thành hàng ngang ở mọi mốc ... Ở 1280 card để lộ ≥ 25% card kế tiếp"; TE-7 AC6 "307px ở 768; 360px ở 1280, thấy 3 card + ≥ 25% card 4". Lưới 2/3/4 cột là bản TE-7 cũ (ES1-T114 D1–D3), không còn trong SRS.

Thay test bằng:

```ts
  test('AC1, AC6 768 và 1280: hàng ngang, card 307 / 360, lộ ≥ 25% card kế', async ({ page }) => {
    for (const [width, card] of [[768, 307.2], [1280, 360]] as const) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(TE7);
      for (const id of ['te7-testimonials', 'te7-testimonials-six']) {
        const list = tid(band(page, id), 'testimonials-list');
        const state = await list.evaluate((el) => ({
          display: getComputedStyle(el).display,
          snap: getComputedStyle(el).scrollSnapType,
          scrollable: el.scrollWidth > el.clientWidth,
        }));
        expect(state.display).toBe('flex');
        expect(state.snap).toContain('x');
        expect(state.scrollable).toBeTruthy();
        const boxes = await tid(band(page, id), 'testimonial-item').evaluateAll((els) =>
          els.map((el) => el.getBoundingClientRect()).map((r) => ({ x: r.left, w: r.width })),
        );
        expect(boxes[0].w).toBeCloseTo(card, 0);
        if (width === 1280) expect(1280 - boxes[3].x, 'lộ ≥ 25% card 4').toBeGreaterThanOrEqual(card * 0.25);
      }
    }
  });
```

Số: 768 → `min(40cqi, 336px)` = 307.2; 1280 → `min(456, (1280 − 20 − 3 × 24) / 3.3)` = 360, card 4 bắt đầu ở 20 + 3 × 384 = 1172, lộ 108 (30%).

## 2. tests/e2e/ES1-T179.spec.ts:209 "AC-H24 1280: giữ lưới 4 cột, không cuộn"

AC thay: TE-7 AC6 (1280: 360px, 3 card + ≥ 25% card 4). AC-H24 chỉ nói 1920; "khác biệt theo cỡ màn" do Designer ghi ở `index-1280.md` khối 12.

```ts
  test('AC6 1280: hàng ngang card 360, thấy 3 card + ≥ 25% card 4', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(HOME);
    const scope = band(page, 'home-testimonials');
    const list = tid(scope, 'testimonials-list');
    expect(await list.evaluate((el) => getComputedStyle(el).display)).toBe('flex');
    expect(await list.evaluate((el) => el.scrollWidth > el.clientWidth)).toBeTruthy();
    const boxes = await tid(scope, 'testimonial-item').evaluateAll((els) => els.map((el) => el.getBoundingClientRect()));
    expect(boxes[0].width).toBeCloseTo(360, 0);
    expect(1280 - boxes[3].left).toBeGreaterThanOrEqual(90);
  });
```

## 3. tests/e2e/ES1-T179.spec.ts:221 "CR-8 1920: danh sách khác 4 mục vẫn là lưới"

AC thay: TE-7 AC1 "hàng ngang ở mọi mốc; hàng vừa khung, không còn mục để cuộn Then lưới tĩnh, không nút, không thanh tiến trình". 6 mục × 456 ở 1920 không vừa khung nên là hàng cuộn được.

```ts
  test('AC1 1920: 6 mục là hàng ngang cuộn được, card 456', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(TE7);
    const scope = band(page, 'te7-testimonials-six');
    const six = tid(scope, 'testimonials-list');
    await expect(six).toHaveCSS('display', 'flex');
    expect(await six.evaluate((el) => el.scrollWidth > el.clientWidth)).toBeTruthy();
    expect((await tid(scope, 'testimonial-item').first().boundingBox())!.width).toBeCloseTo(456, 0);
  });
```

Phần "vừa khung → không nút, không tiến trình" (`data-static`) kiểm ở spec của ES1-T335 (BE gắn `data-static`).

## 4. tests/e2e/ES1-T184.spec.ts:136 bảng cỡ card, dòng 1280

AC thay: TE-15 AC1 (HD3 11/11) "1280: card 271px (ảnh 271 × 177, R4 `index-1280.md` §0), thấy 4 card + ≥ 25% card 5". Gap 24 giữ.

```ts
    [1280, 270.7, 24],
```

Số: `min(336, (1280 − 20 − 4 × 24) / 4.3)` = 270.70 (Figma R4 làm tròn 271; `toBeCloseTo(271, 0)` cần sai số < 0.5 nên cũng qua, nhưng ghi 270.7 cho đúng phép tính). Dòng 360 (252), 768 (307.2), 1920 (336) không đổi.

## 5. tests/e2e/ES1-T191.spec.ts:95 "có bài › dưới số mặc định: hiện đúng số bài, cỡ card không đổi" (CI run 43498762210, desktop)

Đang đòi: ở viewport ≥ 1024 (project desktop = Desktop Chrome 1280 × 720) 2 card 336 × 448. Đó là cỡ 1280 cũ của ES1-T191 (hàng card 336 cố định ở mọi mốc ≥ 80rem).

AC thay: TE-16 AC1 (0.5, HD3 sổ 11/11; `index-1280.md` khối 14, R4) "1280 với 4 bài: lưới tĩnh 4 card 292 × 389, không nút, không thanh tiến trình; 1920 với 4 bài: 4 card 336 × 448 vừa khung, lưới tĩnh; 1280 với ≥ 5 bài: hàng ngang card 271px". AC-H27 "blog dưới 5 bài Then hiện số bài có". Template `index.te16` khối `te16-two` có `articles_to_show: 2` → Liquid gắn `blog-posts--grid` → từ 80rem lưới 4 cột: card = (1280 − 2 × 20 − 3 × 24) / 4 = 292, cao 292 × 4 / 3 = 389.3. "Cỡ card không đổi" nghĩa là 2 bài vẫn cỡ cột của lưới 4 bài (không giãn ra lấp chỗ trống), đúng ý test cũ. Dải 1024–1279 là hàng ngang (`min(40cqi, 336)`), không có cỡ cố định trong AC nên không đo ở đó.

Thay đoạn đo bằng (sai số ≤ 2 px theo SRS 0.5, ES1-T309 #4):

```ts
  test('dưới số mặc định: hiện đúng số bài, cỡ card bằng lưới 4 bài (TE-16 AC1, AC-H27)', async ({ page }) => {
    await page.goto(TE16);
    const cards = band(page, 'te16-two').getByTestId('article-card');
    await skipWithoutArticles(page, cards, 2);
    await expect(cards).toHaveCount(2);
    for (const [width, cardWidth, cardHeight] of [
      [1280, 292, 389],
      [1920, 336, 448],
    ] as const) {
      await page.setViewportSize({ width, height: 900 });
      const list = band(page, 'te16-two').getByTestId('blog-posts-list');
      await expect(list).toHaveCSS('display', 'grid');
      for (const size of await sizes(cards)) {
        expect(Math.abs(size.width - cardWidth), `${width} width`).toBeLessThanOrEqual(2);
        expect(Math.abs(size.height - cardHeight), `${width} height`).toBeLessThanOrEqual(2);
      }
    }
  });
```

Không đổi các test khác của ES1-T191: 1920 `figma-blog-posts` 5 bài vẫn hàng ngang `min(336, (1920 − 252 − 4 × 24) / 4.3)` = 336 × 448 (AC-H26); 360 252 × 336, 768 307 × 410 (TE-16 AC1).

## Không sửa

- ES1-T184:178 "hidden thắng display của nút", ES1-T185:171/186/194/224, ES1-T220 (mọi test): đỏ do CSS lượt trước hiện nút `[hidden]` mờ 0.35. Đã sửa CSS: `.carousel-nav .round-button[hidden]` → `visibility: hidden` (Playwright `toBeHidden` đạt, bỏ khỏi Tab, giữ chỗ). Không đổi assertion.
- Khi ES1-T335 đổi JS sang `aria-disabled="true"` ở đầu/cuối hàng (TE-7 AC6, TE-15 AC1 "mờ 0.35, giữ chỗ"), các assertion `toBeHidden` ở đầu/cuối của ES1-T185, ES1-T220 phải đổi sang `toHaveAttribute('aria-disabled', 'true')` trong cùng PR của ES1-T335.
