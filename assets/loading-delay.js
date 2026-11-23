// ES1-T555, foundation.md §18.1. Caller locks at once; aria-busy (spinner,
// skeleton) after the delay. No import between theme modules (ES1-T81):
// window.busyLater?.(...els) returns cancel.
export const LOADING_DELAY_MS = 500;

export const busyLater = (...els) => {
  const set = (v) => els.forEach((el) => el && (el.ariaBusy = v));
  const t = setTimeout(set, LOADING_DELAY_MS, "true");
  return () => (clearTimeout(t), set(null));
};

window.busyLater ||= busyLater;
