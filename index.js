function execute(url, page) {
  return fetch(url).then(res => res.text());
}
