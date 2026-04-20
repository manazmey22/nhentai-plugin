import { safeText } from "./utils.js";

const BASE = "https://nhentai.net";

export function parseList(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");

  return [...doc.querySelectorAll(".gallery")].map(el => {
    const a = el.querySelector("a");
    const img = el.querySelector("img");

    return {
      name: safeText(img?.alt),
      url: BASE + a?.getAttribute("href"),
      cover: img?.dataset?.src || img?.src || ""
    };
  });
}

export function parseDetail(html, url) {
  const doc = new DOMParser().parseFromString(html, "text/html");

  const name =
    safeText(doc.querySelector("#info h1")) ||
    safeText(doc.querySelector("#info h2"));

  const cover =
    doc.querySelector("#cover img")?.src || "";

  const mediaId = url.match(/\/g\/(\d+)/)?.[1];

  const pagesText = [...doc.querySelectorAll(".tag-container")]
    .find(el => el.innerText.includes("Pages"))
    ?.querySelector(".name");

  const pagesCount = parseInt(safeText(pagesText)) || 0;

  return {
    name,
    cover,
    chapters: [
      {
        name: "Read",
        url,
        mediaId,
        pagesCount
      }
    ]
  };
}
