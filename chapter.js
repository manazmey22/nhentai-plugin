function execute(chapter) {
  const CDN = "https://i.nhentai.net/galleries";

  const { mediaId, pagesCount, cover } = chapter;

  let ext = "jpg";

  if (cover?.includes(".png")) ext = "png";
  if (cover?.includes(".webp")) ext = "webp";

  const list = [];

  for (let i = 1; i <= pagesCount; i++) {
    list.push(`${CDN}/${mediaId}/${i}.${ext}`);
  }

  return JSON.stringify({
    data: list
  });
}
