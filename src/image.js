const CDN = "https://i.nhentai.net/galleries";

// определяем формат по cover
function detectExtension(coverUrl) {
  if (!coverUrl) return "jpg";

  if (coverUrl.includes(".png")) return "png";
  if (coverUrl.includes(".webp")) return "webp";

  return "jpg";
}

export function buildImageList(chapter) {
  const { mediaId, pagesCount } = chapter;

  const ext = detectExtension(chapter.cover);

  const images = [];

  for (let i = 1; i <= pagesCount; i++) {
    images.push(`${CDN}/${mediaId}/${i}.${ext}`);
  }

  return images;
}
