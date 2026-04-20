function execute(url) {
  return fetch(url)
    .then(res => res.text())
    .then(html => {
      const doc = new DOMParser().parseFromString(html, "text/html");

      const name =
        doc.querySelector("#info h1")?.innerText ||
        "No title";

      const cover =
        doc.querySelector("#cover img")?.src || "";

      const mediaId = url.match(/\/g\/(\d+)/)?.[1];

      const pagesText = [...doc.querySelectorAll(".tag-container")]
        .find(el => el.innerText.includes("Pages"))
        ?.querySelector(".name")?.innerText || "0";

      const pagesCount = parseInt(pagesText);

      return JSON.stringify({
        name,
        cover,
        chapters: [
          {
            name: "Read",
            link: url,
            mediaId,
            pagesCount,
            cover
          }
        ]
      });
    });
}
