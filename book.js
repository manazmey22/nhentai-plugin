// book.js
// Страница деталей галереи

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
    default: return 'jpg';
  }
}

function coverUrl(g) {
  const ext = extStr(g.images.cover.t);
  return `https://t.nhentai.net/galleries/${g.media_id}/cover.${ext}`;
}

function tagsByType(tags, type) {
  return (tags || []).filter(t => t.type === type).map(t => t.name);
}

class BookController extends Controller {
  async load() {
    const basicInfo = this.data; // { id, title, cover }

    this.data = Object.assign({}, basicInfo, {
      loading: true,
      detail: null,
      error: null
    });

    try {
      const resp = await http.get(
        `https://nhentai.net/api/gallery/${basicInfo.id}`,
        { headers: BASE_HEADERS }
      );
      const g = JSON.parse(resp.data);

      const detail = {
        id: String(g.id),
        mediaId: g.media_id,
        titleEnglish: (g.title && g.title.english) || '',
        titleJapanese: (g.title && g.title.japanese) || '',
        titlePretty: (g.title && g.title.pretty) || basicInfo.title,
        cover: coverUrl(g),
        pages: g.num_pages || 0,
        favorites: g.num_favorites || 0,
        uploadDate: g.upload_date || 0,
        tags: tagsByType(g.tags, 'tag'),
        artists: tagsByType(g.tags, 'artist'),
        characters: tagsByType(g.tags, 'character'),
        parodies: tagsByType(g.tags, 'parody'),
        groups: tagsByType(g.tags, 'group'),
        languages: tagsByType(g.tags, 'language'),
        categories: tagsByType(g.tags, 'category'),
        // Главы для kinoko: одна «глава» = вся галерея
        chapters: [
          {
            key: String(g.id),
            title: (g.title && (g.title.english || g.title.pretty)) || `Gallery #${g.id}`,
            pages: g.num_pages || 0
          }
        ]
      };

      this.data = Object.assign({}, this.data, {
        loading: false,
        detail: detail
      });
    } catch (e) {
      console.log('[nhentai] book load error: ' + e);
      this.data = Object.assign({}, this.data, {
        loading: false,
        error: String(e)
      });
    }
  }

  unload() {}

  // Начать чтение: передаёт key процессору
  readChapter(chapter) {
    this.read(chapter.key, {
      title: chapter.title
    });
  }

  // Добавить в избранное
  toggleFavorite() {
    const key = this.data.id;
    if (FavoritesManager.exist(key)) {
      FavoritesManager.remove(key);
    } else {
      FavoritesManager.add(key, {
        title: this.data.detail ? this.data.detail.titlePretty : this.data.title,
        cover: this.data.detail ? this.data.detail.cover : this.data.cover,
        key: key
      });
    }
    // Обновляем UI
    this.data = Object.assign({}, this.data, {
      isFavorite: FavoritesManager.exist(key)
    });
  }

  // Скачать главу
  downloadChapter(chapter) {
    if (DownloadManager.exist(chapter.key)) {
      DownloadManager.removeKey(chapter.key);
    } else {
      DownloadManager.add(chapter.key, {
        title: chapter.title,
        mangaKey: this.data.id
      });
    }
  }
}

module.exports = BookController;
