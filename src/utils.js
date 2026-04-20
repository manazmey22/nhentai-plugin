export function safeText(el) {
  return el?.textContent?.trim() || "";
}
