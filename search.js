const BASE = "https://nhentai.net";

module.exports = async function (keyword, page) {
  const url = keyword
    ? `${BASE}/search/?q=${encodeURIComponent(keyword)}&page=${page}`
    : `${BASE}/?page=${page}`;

  const res = await fetch(url);
  const html = await res.text();

  const results = [];

  const regex = /<a class="cover" href="(.*?)".*?<img.*?src="(.*?)".*?title="(.*?)"/gs;

  let match;
  while ((match = regex.exec(html)) !== null) {
    results.push({
      name: match[3],
      cover: match[2],
      url: BASE + match[1]
    });
  }

  return results;
};
