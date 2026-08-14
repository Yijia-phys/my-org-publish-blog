(function () {
  // Mark the current page's nav link with aria-current="page",
  // so assistive tech users know where they are in the site.
  // Only root-relative hrefs are considered ('#' and external links
  // like the GitHub icon are skipped). The root is treated the same
  // as /index.html, since servers serve the site root as index.html.
  document.addEventListener('DOMContentLoaded', function () {
    var links = document.querySelectorAll('nav a[href]');
    var path = location.pathname;
    var i, a, href;
    for (i = 0; i < links.length; i++) {
      a = links[i];
      href = a.getAttribute('href');
      if (!href || href.charAt(0) !== '/' || href.indexOf('://') !== -1) continue;
      if (href === path ||
          (href === '/index.html' && (path === '/' || path === '/index.html'))) {
        a.setAttribute('aria-current', 'page');
        return;
      }
    }
  });
})();
