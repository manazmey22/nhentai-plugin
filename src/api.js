import { parseList, parseDetail } from "./parser.js";
import { buildImageList } from "./image.js";

const BASE = "https://nhentai.net";

const headers = {
  "User-Agent": "Mozilla/5.0",
  "Referer": BASE
};

// универсальный fetch
async function request(url) {
  const res = await fetch(url, { headers });
  return await res.text();
}

// 📚 список
export async function getList(page = 1) {
  const url = page === 1 ? BASE : `${BASE}/?page=${page}`;
  const html = await request(url);
  return parseList(html);
}

// 🔍 поиск
export async function search(query, page = 1) {
  const url = `${BASE}/search/?q=${encodeURIComponent(query)}&page=${page}`;
  const html = await request(url);
  return parseList(html);
}

// 📖 детали
export async function getDetail(url) {
  const html = await request(url);
  return parseDetail(html, url);
}

// 🖼️ страницы
export async function getPages(chapter) {
  return buildImageList(chapter);
}
