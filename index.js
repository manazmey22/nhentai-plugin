class IndexController extends Controller {
  load() {
    this.data = {
      tabs: [
        { title: "Popular", type: "popular" },
        { title: "New",     type: "new"     },
        { title: "Search",  type: "search"  }
      ]
    };
  }
  unload() {}
}

module.exports = IndexController;
