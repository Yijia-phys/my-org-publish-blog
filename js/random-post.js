(function () {
  // Pick a random post from /posts.json (generated at publish time by
  // my/generate-posts-json), instead of scraping the sitemap DOM.

  function go() {
    fetch('/posts.json')
      .then(function (r) { return r.json(); })
      .then(function (posts) {
        if (!posts || !posts.length) return;
        var pick = posts[Math.floor(Math.random() * posts.length)];
        window.location.href = pick.url;
      })
      .catch(function () {});
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.querySelector('.random-post');
    if (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        go();
      });
    }
  });
})();
