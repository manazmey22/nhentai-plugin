var SERVERS = [
  "https://i1.nhentai.net",
  "https://i2.nhentai.net",
  "https://i3.nhentai.net"
];

function extStr(t) {
  if (t === "j") return "jpg";
  if (t === "p") return "png";
  if (t === "g") return "gif";
  if (t === "w") return "webp";
  return "jpg";
}

class NhentaiProcessor extends Processor {
  get key() {
    return this._key;
  }

  unload() {
    this._dead = true;
  }

  async load(state) {
    this._dead = false;
    var startPage = (state && state.page) ? state.page : 0;
    var galleryId = this.key;

    var g = null;

    // Попытка через API
    try {
      var resp = await fetch("https://nhentai.net/api/gallery/" + galleryId, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
          "Referer":    "https://nhentai.net/",
          "Accept":     "application/json"
        }
      });
      g = await resp.json();
    } catch (e) {
      console.log("[nhentai] processor API error: " + e);
    }

    // Fallback через HeadlessWebView
    if (!g || !g.images) {
      g = await this._loadViaWebView(galleryId);
    }

    if (!g || !g.images || !g.images.pages) {
      this.save(true, null);
      return;
    }

    var mediaId = g.media_id;
    var pages   = g.images.pages;

    // Используем setData для пакетной загрузки
    var imageList = [];
    for (var i = startPage; i < pages.length; i++) {
      var ext = extStr(pages[i].t);
      var num = i + 1;
      var server = SERVERS[num % SERVERS.length];
      imageList.push({
        url:     server + "/galleries/" + mediaId + "/" + num + "." + ext,
        headers: {
          "Referer":    "https://nhentai.net/g/" + galleryId + "/",
          "User-Agent": "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
        }
      });
    }

    this.setData(imageList);
    this.save(true, null);
  }

  _loadViaWebView(galleryId) {
    var self = this;
    return new Promise(function(resolve, reject) {
      var wv = new HeadlessWebView({});

      wv.onloadend = async function(url) {
        try {
          var jsonStr = await wv.eval(
            "(function(){" +
            "  var scripts = document.querySelectorAll('script');" +
            "  for (var i = 0; i < scripts.length; i++) {" +
            "    var m = scripts[i].textContent.match(/window\\._gallery\\s*=\\s*(\\{[\\s\\S]*?\\});/);" +
            "    if (m) return m[1];" +
            "  }" +
            "  return null;" +
            "})()"
          );
          if (jsonStr) {
            resolve(JSON.parse(jsonStr));
          } else {
            reject(new Error("Gallery data not found"));
          }
        } catch(e) {
          reject(e);
        }
        self._wv = null;
      };

      wv.onfail = function(url, err) {
        reject(new Error("WebView failed: " + err));
        self._wv = null;
      };

      self._wv = wv;
      wv.load("https://nhentai.net/g/" + galleryId + "/");
    });
  }

  async checkNew() {
    return null;
  }
}

module.exports = NhentaiProcessor;
