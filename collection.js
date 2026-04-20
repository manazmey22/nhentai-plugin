function execute(url, page) {
  if (!page) page = 1;

  const target = page === 1
    ? "https://nhentai.net"
    : `https://nhentai.net/?page=${page}`;

  return fetch(target)
    .then(res => res.text())
    .then(html => {
      const doc = new DOMParser().parseFromString(html, "text/html");

      const list = [];

      doc.querySelectorAll(".gallery").forEach(el => {
        const a = el.querySelector("a");
        const img = el.querySelector("img");

        list.push({
          name: img?.alt || "No title",
          link: "https://nhentai.net" + a.getAttribute("href"),
          cover: img?.dataset?.src || img?.src
        });
      });

      return JSON.stringify({
        data: list
      });
    });
}
