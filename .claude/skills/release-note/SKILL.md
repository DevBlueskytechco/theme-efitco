---
name: release-note
description: Release note từ PR và ticket trong một khoảng tag. Dùng cuối sprint.
---
Nguồn: `git log <tag_cũ>..<tag_mới> --merges` + ticket qua mcp__ticket__list(status=done, sprint=N). Cấu trúc:
```
# <Theme> <version> — <ngày>
## Mới
## Thay đổi (kể cả setting đổi tên/default)
## Sửa lỗi (mã bug)
## Vấn đề đã biết
## Nâng cấp trong Canvas: upload zip thành theme mới → so settings bằng scripts/diff-settings.sh → chuyển theme
```
Mỗi dòng ≤ 20 từ, giọng merchant, không mã ticket trong phần Mới/Thay đổi (để ở Sửa lỗi).
