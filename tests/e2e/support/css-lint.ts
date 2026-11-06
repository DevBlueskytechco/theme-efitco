// ES1-T171: regex TC-02 (TE-1) tách ra để kiểm được cả chiều phải bắt lỗi.
// calc() chỉ hợp lệ khi toán hạng đầu là token: var() cộng trừ var(), nhân chia var() hoặc số không đơn vị. calc(var(--a) + 4px) vẫn là hardcode.
const VAR = String.raw`var\(--[\w-]+\)`;
const TOKEN_CALC = String.raw`calc\(\s*${VAR}(?:\s*[-+]\s*${VAR}|\s*[*/]\s*(?:${VAR}|\d+(?:\.\d+)?))*\s*\)\s*(?:;|\}|$)`;

// (?!\s) chặn \s* lùi về 0 ký tự rồi lọt qua lookahead
export const HARDCODED_RADIUS = new RegExp(String.raw`border-radius\s*:\s*(?!\s|var\(|${TOKEN_CALC}|0(?:px)?\s*[;}]|50%|inherit)`);
