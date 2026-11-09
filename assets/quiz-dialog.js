// Popup kết quả quiz (CTO 09/11, ES1-T250). assets/quiz-finder.js không đổi: file này nghe panel kết quả.
// Panel bận (aria-busy) thì mở popup; panel ẩn lại (Back, làm lại) thì đóng. Không JS: form vẫn sang trang search.
for (const dialog of document.querySelectorAll("[data-quiz-dialog]")) {
  const quiz = dialog.closest("quiz-finder");
  const panel = dialog.querySelector("[data-quiz-results-panel]");
  const all = dialog.querySelector("[data-quiz-all]");
  if (!quiz || !panel) continue;

  new MutationObserver(() => {
    if (panel.getAttribute("aria-busy") === "true" && !dialog.open) {
      const tags = [...quiz.querySelectorAll("input[data-tag-handle]:checked")].map((o) => o.dataset.tagHandle);
      if (all) all.href = `${quiz.dataset.resultsUrl}/${tags.join("+")}`;
      quiz.querySelector("[data-quiz-empty]").hidden = true;
      panel.hidden = false;
      dialog.showModal();
    } else if (panel.hidden && dialog.open) dialog.close();
  }).observe(panel, { attributes: true, attributeFilter: ["aria-busy", "hidden"] });

  dialog.addEventListener("click", (e) => {
    if (e.target === dialog || e.target.closest("[data-quiz-close]")) dialog.close();
    else if (e.target.closest("[data-quiz-restart]")) {
      // Làm lại: bỏ chọn hết, về bước 1 (dùng lại hàm của quiz-finder)
      for (const o of quiz.querySelectorAll("input[data-tag-handle]:checked")) o.checked = false;
      quiz.clear?.();
      quiz.show?.(0);
    }
  });
}
