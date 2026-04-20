module.exports = async function (url) {
  const res = await fetch(url);
  const html = await res.text();

  const images = [];

  const regex = /data-src="(https:\/\/i\.nhentai\.net\/galleries\/.*?\.(jpg|png|webp))"/g;

  let match;
  while ((match = regex.exec(html)) !== null) {
    images.push(match[1]);
  }

  return {
    pages: images
  };
};
