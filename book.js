const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
  "Referer":    "https://nhentai.net/",
  "Accept":     "application/json"
};

function extStr(t) {
  if (t === "j") return "jpg";
  if (t === "p") return "png";
  if (t === "g") return "gif";
  if (t === "w") return "webp";
  return "jpg";
}

function tagsByType(tags, type) {
  var out = [];
  for (var i = 0; i < tags.length; i++) {
    if (tags[i].type === type) out.push(tags[i].name);
  }
  return out;
}

class BookController extends Controller {
  async load() {
    var basic = this.data || {};

    this.data = Object.assign({}, basic, {
      loading:    true,
      detail:     null,
      isFavorite: FavoritesManager.exist(basic.id || ""),
      error:      null
    });

    try {
      var resp = await fetch(
        "https://nhentai.net/api/gallery/" + (basic.id || ""),
        { headers: HEADERS }
      );
      var g = await resp.json();

      var ext = extStr((g.images.cover || {}).t || "j");
      var cover = "https://t.nhentai.net/galleries/" + g.media_id + "/cover." + ext;

      var detail = {
        id:          String(g.id),
        mediaId:     g.media_id,
        titleEn:     (g.title && g.title.english)  || "",
        titleJp:     (g.title && g.title.japanese) || "",
        titlePretty: (g.title && (g.title.english || g.title.pretty)) || basic.title || "",
        cover:       cover,
        pages:       g.num_pages || 0,
        favorites:   g.num_favorites || 0,
        tags:        tagsByType(g.tags || [], "tag"),
        artists:     tagsByType(g.tags || [], "artist"),
        characters:  tagsByType(g.tags || [], "character"),
        parodies:    tagsByType(g.tags || [], "parody"),
        languages:   tagsByType(g.tags || [], "language"),
        chapterKey:  String(g.id),
        chapterTitle:(g.title && (g.title.english || g.title.pretty)) || ("Gallery #" + g.id)
      };

      this.data = Object.assign({}, this.data, {
        loading: false,
        detail:  detail
      });
    } catch (e) {
      console.log("[nhentai] book error: " + e);
      this.data = Object.assign({}, this.data, {
        loading: false,
        error:   String(e)
      });
    }
  }

  unload() {}

  readNow() {
    var d = this.data.detail;
    if (!d) return;
    this.read(d.chapterKey, { title: d.chapterTitle });
  }

  toggleFavorite() {
    var id = (this.data.detail && this.data.detail.id) || this.data.id;
    if (!id) return;
    if (FavoritesManager.exist(id)) {
      FavoritesManager.remove(id);
    } else {
      FavoritesManager.add(id, {
        title: this.data.detail ? this.data.detail.titlePretty : (this.data.title || ""),
        cover: this.data.detail ? this.data.detail.cover : (this.data.cover || ""),
        key:   id
      });
    }
    this.data = Object.assign({}, this.data, {
      isFavorite: FavoritesManager.exist(id)
    });
  }
}

module.exports = BookController;
