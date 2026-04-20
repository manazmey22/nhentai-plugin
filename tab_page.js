// tab_page.js
// Рендерит одну вкладку: Popular / New / Search

const BASE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  'Referer': 'https://nhentai.net/',
  'Accept': 'application/json'
};

function extStr(t) {
  switch (t) {
    case 'j': return 'jpg';
    case 'p': return 'png';
    case 'g': return 'gif';
    case 'w': return 'webp';
    default:  return 'jpg';
  }
}

function coverUrl(g) {
  const ext = extStr(g.images.cover.t);
  return `https://t.nhentai.net/galleries/${g.media_id}/cover.${ext}`;
}

function parseGalleries(json) {
  const result = json.result || [];
  return result.map(g => ({
    id: String(g.id),
    title: (g.title && (g.title.english || g.title.pretty || g.title.japanese)) || 'Unknown',
    cover: coverUrl(g),
    pages: g.num_pages || 0,
    numFavorites: g.num_favorites || 0
  }));
}

function apiUrlFor(type, page, query) {
  if (type === 'popular') {
    return `https://nhentai.net/api/galleries/all?page=${page}&sort=popular-today`;
  } else if (type === 'new') {
    return `https://nhentai.net/api/galleries/new?page=${page}`;
  } else if (type === 'search') {
    if (!query || query.length === 0) return null;
    return `https://nhentai.net/api/galleries/search?query=${encodeURIComponent(query)}&page=${page}`;
  }
  return null;
}

class TabPageController extends Controller {
  load() {
    const { type } = this.data;
    this.data = Object.assign({}, this.data, {
      items: [],
      loading: false,
      noMore: false,
      searchQuery: '',
      page: 1,
      type: type
    });

    if (type !== 'search') {
      this._fetchPage(type, 1);
    }
  }

  unload() {
    this._cancelled = true;
  }

  async _fetchPage(type, page, query) {
    this._cancelled = false;
    const url = apiUrlFor(type, page, query);
    if (!url) return;

    this.data = Object.assign({}, this.data, { loading: true });

    try {
      const resp = await http.get(url, { headers: BASE_HEADERS });
      const json = JSON.parse(resp.data);
      if (this._cancelled) return;

      const newItems = parseGalleries(json);
      const numPages = json.num_pages || 0;

      const existing = (page === 1) ? [] : (this.data.items || []);
      this.data = Object.assign({}, this.data, {
        items: existing.concat(newItems),
        loading: false,
        noMore: page >= numPages,
        page: page
      });
    } catch (e) {
      console.log('[nhentai] fetch error: ' + e);
      if (!this._cancelled) {
        this.data = Object.assign({}, this.data, { loading: false });
      }
    }
  }

  // Вызывается при скролле к концу списка
  loadMore() {
    if (this.data.loading || this.data.noMore) return;
    const nextPage = (this.data.page || 1) + 1;
    this._fetchPage(this.data.type, nextPage, this.data.searchQuery);
  }

  // Вызывается при поиске
  doSearch(query) {
    if (!query || query.trim().length === 0) return;
    this.data = Object.assign({}, this.data, {
      searchQuery: query.trim(),
      items: [],
      page: 1,
      noMore: false
    });
    this._fetchPage('search', 1, query.trim());
  }

  // Открыть страницу книги
  openBook(item) {
    this.push('book', item);
  }
}

module.exports = TabPageController;
