# Ranh giới FE / BE (quy ước team, bắt buộc)

- JS là việc của BE. Dev FE không viết, không sửa file trong `assets/*.js`.
- Dev FE: `blocks/*.liquid`, `snippets/*.liquid`, `templates/*.liquid`, `assets/*.css`, `config/settings_schema.json`, `locales/*.json`.
- Dev BE: `assets/*.js`, các `{% partial %}` region và JS gọi `partials.refresh/fetch/apply`, logic cart/variant/search, snippet Liquid chỉ để xuất JSON cho JS.
- Mỗi task thuộc hẳn một phía. Task có cả markup lẫn JS thì tách thành 2 ticket con FE1/BE1; markup đi trước, có `data-testid` và partial name để BE bám vào.
- Hook `scope-guard.sh` chặn Dev FE ghi `assets/*.js`. Bị chặn là đúng, không tìm cách vòng.
