// Gift card QR, copy, print (ES1-T410). No JS: fallback only.
const $ = (s) => document.querySelector(s);
const qr = $("[data-gift-card-qr]");
const note = $("[data-testid=gift-card-qr-fallback]");
if (qr && window.QRCode) {
	try {
		new QRCode(qr, { text: qr.dataset.identifier, width: 144, height: 144 });
		qr.querySelector("img").alt = qr.dataset.label;
		note.hidden = true;
	} catch {
		qr.replaceChildren(note);
	}
}

const copy = $("[data-gift-card-copy]");
const status = $("[data-gift-card-status]");
if (copy && navigator.clipboard) {
	const { textContent: label, dataset: d } = copy;
	let t;
	copy.hidden = false;
	copy.onclick = () =>
		navigator.clipboard.writeText(d.giftCardCopy).then(() => {
			copy.textContent = d.labelCopied;
			status.textContent = d.labelStatus;
			clearTimeout(t);
			t = setTimeout(() => (copy.textContent = label, status.textContent = ""), 2e3);
		}, () => {});
}

const print = $("[data-gift-card-print]");
if (print) print.hidden = false, print.onclick = () => window.print();
