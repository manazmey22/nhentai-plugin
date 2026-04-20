// processor.js
// Загружает страницы манги для Kinoko v3

const IMAGE_SERVERS = [
  "https://i1.nhentai.net",
  "https://i2.nhentai.net",
  "https://i3.nhentai.net"
];

function extToMime(t) {
  switch (t) {
    case 'j': return 'jpg';
    case 'p': return 'png';
    case 'g': return 'gif';
    case 'w': return 'webp';
    default:  return 'jpg';
  }
}

class NhentaiProcessor extends Processor {
  get key() {
    return this._key;
  }

  unload() {
    this._cancelled = true;
    if (this._webview) {
      this._webview = null;
    }
  }

  async load(state) {
    this._cancelled = false;

    let startPage = 0;
    if (state && state.page) {
      startPage = state.page;
    }

    // key формат: "galleryId"
    const galleryId = this.key;

    let galleryData = null;

    // Попытка 1: прямой API запрос
    try {
      const resp = await http.get(
        `https://nhentai.net/api/gallery/${galleryId}`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
            'Referer': 'https://nhentai.net/',
            'Accept': 'application/json'
          }
        }
      );
      galleryData = JSON.parse(resp.data);
    } catch (e) {
      console.log('[nhentai] Direct API failed, trying HeadlessWebView: ' + e);
    }

    // Попытка 2: HeadlessWebView если прямой запрос не удался
    if (!galleryData) {
      galleryData = await this._loadViaWebView(galleryId);
    }

    if (!galleryData || !galleryData.images || !galleryData.images.pages) {
      console.log('[nhentai] Failed to load gallery data for id: ' + galleryId);
      this.save(true, null);
      return;
    }

    const mediaId = galleryData.media_id;
    const pages = galleryData.images.pages;
    const total = pages.length;

    for (let i = startPage; i < total; i++) {
      if (this._cancelled) break;

      const pageInfo = pages[i];
      const ext = extToMime(pageInfo.t);
      const pageNum = i + 1;
      const serverIdx = pageNum % IMAGE_SERVERS.length;
      const url = `${IMAGE_SERVERS[serverIdx]}/galleries/${mediaId}/${pageNum}.${ext}`;

      this.save(false, { page: i });

      this.picture({
        url: url,
        headers: {
          'Referer': `https://nhentai.net/g/${galleryId}/`,
          'User-Agent': 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
        }
      });
    }

    if (!this._cancelled) {
      this.save(true, null);
    }
  }

  _loadViaWebView(galleryId) {
    return new Promise((resolve, reject) => {
      const wv = new HeadlessWebView({});

      wv.onloadend = async (url) => {
        try {
          const jsonStr = await wv.eval(
            `(function(){
              const el = document.querySelector('#gallery-json');
              if (el) return el.textContent;
              const scripts = document.querySelectorAll('script');
              for (let s of scripts) {
                const m = s.textContent.match(/window\\._gallery\\s*=\\s*(\\{.*?\\});/s);
                if (m) return m[1];
              }
              return null;
            })()`
          );
          if (jsonStr) {
            resolve(JSON.parse(jsonStr));
          } else {
            reject(new Error('Gallery data not found in page'));
          }
        } catch(e) {
          reject(e);
        }
      };

      wv.onfail = (url, err) => {
        reject(new Error('WebView load failed: ' + err));
      };

      wv.load(`https://nhentai.net/g/${galleryId}/`);
      this._webview = wv;
    });
  }

  async checkNew() {
    // Для nhentai каждая галерея — это отдельный одноглавный тайтл.
    // Возвращаем null — новых глав нет.
    return null;
  }
}

module.exports = NhentaiProcessor;
