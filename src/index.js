import * as api from "./api.js";

export default {
  name: "NHentai",

  async getList(page = 1) {
    return api.getList(page);
  },

  async search(keyword, page = 1) {
    return api.search(keyword, page);
  },

  async getDetail(url) {
    return api.getDetail(url);
  },

  async getPages(chapter) {
    return api.getPages(chapter);
  }
};
