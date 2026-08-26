(function () {
  // Mobile drawer: hamburger button slides the site menu in from the left.
  // Closed by clicking a link, the backdrop, or pressing Escape.
  // Bound first so no later early return can skip it.
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.querySelector('.nav-menu-btn');
    var drawer = document.getElementById('site-drawer');
    var backdrop = document.getElementById('drawer-backdrop');
    if (btn && drawer && backdrop) {
      function setOpen(open) {
        drawer.classList.toggle('open', open);
        backdrop.classList.toggle('show', open);
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      }

      btn.addEventListener('click', function (event) {
        event.preventDefault();
        setOpen(!drawer.classList.contains('open'));
      });

      backdrop.addEventListener('click', function () {
        setOpen(false);
      });

      drawer.addEventListener('click', function (event) {
        if (event.target.closest('a')) setOpen(false);
      });

      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && drawer.classList.contains('open')) {
          setOpen(false);
        }
      });

      // If the window grows past the mobile breakpoint while open, reset
      // state so the drawer is clean next time it is needed.
      window.addEventListener('resize', function () {
        if (window.innerWidth > 640 && drawer.classList.contains('open')) {
          setOpen(false);
        }
      });
    }
  });

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
      }
    }
  });
})();
