// Popup kết quả quiz (ES1-T250), nạp lười theo tương tác trên form (ADR 0010). Nghe panel của quiz-finder.js:
// aria-busy thì mở, panel ẩn (Back, làm lại) thì đóng. Không JS: form sang trang search.
for (const dialog of document.querySelectorAll("[data-quiz-dialog]")) {
  const quiz = dialog.closest("quiz-finder");
  const panel = dialog.querySelector("[data-quiz-results-panel]");
  const all = dialog.querySelector("[data-quiz-all]");
  if (!quiz || !panel) continue;

  const show = () => {
    const tags = [...quiz.querySelectorAll("input[data-tag-handle]:checked")].map((o) => o.dataset.tagHandle);
    if (all) all.href = `${quiz.dataset.resultsUrl}/${tags.join("+")}`;
    dialog.showModal();
  };
  const sync = () => {
    if (panel.getAttribute("aria-busy") === "true" && !dialog.open) {
      quiz.querySelector("[data-quiz-empty]").hidden = true;
      panel.hidden = false;
      show();
    } else if (panel.hidden && dialog.open) dialog.close();
  };
  new MutationObserver(sync).observe(panel, { attributes: true, attributeFilter: ["aria-busy", "hidden"] });
  // Về muộn, kết quả đã hiện: chỉ mở popup.
  if (!panel.hidden && !dialog.open) show();
  else sync();

  dialog.addEventListener("click", (e) => {
    if (e.target === dialog || e.target.closest("[data-quiz-close]")) dialog.close();
    else if (e.target.closest("[data-quiz-restart]")) {
      // Làm lại: bỏ chọn, về bước 1 (hàm của quiz-finder)
      for (const o of quiz.querySelectorAll("input[data-tag-handle]:checked")) o.checked = false;
      quiz.clear?.();
      quiz.show?.(0);
    }
  });
}
