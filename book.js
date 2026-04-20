module.exports = async function (url) {
  const res = await fetch(url);
  const html = await res.text();

  const titleMatch = html.match(/<h1 class="title">(.*?)<\/h1>/);
  const coverMatch = html.match(/<img.*?class="lazyload".*?data-src="(.*?)"/);

  return {
    name: titleMatch ? titleMatch[1] : "No title",
    cover: coverMatch ? coverMatch[1] : "",
    chapters: [
      {
        name: "Read",
        url: url
      }
    ]
  };
};
