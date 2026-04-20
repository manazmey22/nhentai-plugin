// index.js
// Главная страница: Popular / New / Search

const BASE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  'Referer': 'https://nhentai.net/',
  'Accept': 'application/json'
};

// Вспомогательная функция: расширение → строка
function extStr(t) {
  switch (t) {
    case 'j': return 'jpg';
    case 'p': return 'png';
    case 'g': return 'gif';
    case 'w': return 'webp';
    default:  return 'jpg';
  }
}

// Строит URL обложки
function coverUrl(gallery) {
  const ext = extStr(gallery.images.cover.t);
  return `https://t.nhentai.net/galleries/${gallery.media_id}/cover.${ext}`;
}

// Парсит список галерей из JSON ответа API
function parseGalleries(json) {
  const result = json.result || [];
  return result.map(g => ({
    id: String(g.id),
    mediaId: g.media_id,
    title: (g.title && (g.title.english || g.title.pretty || g.title.japanese)) || 'Unknown',
    cover: coverUrl(g),
    pages: g.num_pages || 0,
    tags: (g.tags || []).filter(t => t.type === 'tag').slice(0, 5).map(t => t.name),
    languages: (g.tags || []).filter(t => t.type === 'language').map(t => t.name)
  }));
}

// ───────── Главный контроллер ─────────
class IndexController extends Controller {
  load() {
    this.data = {
      tabs: [
        { title: 'Popular',  type: 'popular', page: 1 },
        { title: 'New',      type: 'new',     page: 1 },
        { title: 'Search',   type: 'search',  page: 1 }
      ]
    };
  }

  unload() {}
}

module.exports = IndexController;
