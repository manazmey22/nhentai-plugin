const BASE_URL = "https://nhentai.net";

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
  "Referer": "https://nhentai.net/",
  "Accept": "application/json"
};

function extStr(t) {
  if (t === "j") return "jpg";
  if (t === "p") return "png";
  if (t === "g") return "gif";
  if (t === "w") return "webp";
  return "jpg";
}

function coverUrl(g) {
  const ext = extStr(g.images.cover.t);
  return BASE_URL + "/galleries/" + g.media_id + "/cover." + ext;
}

function parseGalleries(json) {
  var list = json.result || [];
  var out = [];
  for (var i = 0; i < list.length; i++) {
    var g = list[i];
    var title = "";
    if (g.title) {
      title = g.title.english || g.title.pretty || g.title.japanese || "";
    }
    out.push({
      id:     String(g.id),
      title:  title || ("Gallery #" + g.id),
      cover:  coverUrl(g),
      pages:  g.num_pages || 0
    });
  }
  return out;
}

function apiUrl(type, page, query) {
  if (type === "popular") {
    return BASE_URL + "/api/galleries/all?page=" + page + "&sort=popular-today";
  }
  if (type === "new") {
    return BASE_URL + "/api/galleries/new?page=" + page;
  }
  if (type === "search" && query) {
    return BASE_URL + "/api/galleries/search?query=" + encodeURIComponent(query) + "&page=" + page;
  }
  return null;
}

class ListController extends Controller {
  load() {
    var tabData = this.data || {};
    this.data = {
      type:        tabData.type || "popular",
      items:       [],
      loading:     false,
      noMore:      false,
      page:        1,
      query:       "",
      numPages:    1
    };

    if (this.data.type !== "search") {
      this._fetch(this.data.type, 1, "");
    }
  }

  unload() {
    this._dead = true;
  }

  async _fetch(type, page, query) {
    var url = apiUrl(type, page, query);
    if (!url) return;

    this.data = Object.assign({}, this.data, { loading: true });

    try {
      var resp = await fetch(url, { headers: HEADERS });
      if (this._dead) return;

      var json = await resp.json();
      if (this._dead) return;

      var newItems = parseGalleries(json);
      var numPages = json.num_pages || 1;
      var existing = page === 1 ? [] : (this.data.items || []);

      this.data = Object.assign({}, this.data, {
        items:    existing.concat(newItems),
        loading:  false,
        noMore:   page >= numPages,
        page:     page,
        numPages: numPages
      });
    } catch (e) {
      console.log("[nhentai] fetch error: " + e);
      if (!this._dead) {
        this.data = Object.assign({}, this.data, { loading: false });
      }
    }
  }

  loadMore() {
    if (this.data.loading || this.data.noMore) return;
    var next = (this.data.page || 1) + 1;
    this._fetch(this.data.type, next, this.data.query || "");
  }

  doSearch(q) {
    if (!q || q.trim().length === 0) return;
    var trimmed = q.trim();
    this.data = Object.assign({}, this.data, {
      query:   trimmed,
      items:   [],
      page:    1,
      noMore:  false
    });
    this._fetch("search", 1, trimmed);
  }

  openBook(idx) {
    var index = parseInt(idx, 10);
    var item = this.data.items[index];
    if (item) {
      this.push("book", item);
    }
  }
}

module.exports = ListController;
