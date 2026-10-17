(function () {
  'use strict';
  function init() {
    var toc = document.querySelector('#content #table-of-contents');
    if (!toc || !toc.querySelector('a[href^="#"]') || document.querySelector('.toc-dock')) return;
    var dock = document.createElement('div');
    dock.className = 'toc-dock';
    dock.setAttribute('data-pagefind-ignore', '');
    dock.innerHTML = '<button type="button" class="math-settings-trigger" aria-label="Table of contents" aria-controls="floating-toc" aria-expanded="false"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13M3 6h1M3 12h1M3 18h1"/></svg></button><section class="math-settings toc-panel" id="floating-toc" aria-label="Table of contents" hidden><div class="math-settings-header"><strong>Contents</strong><button type="button" class="math-settings-close" aria-label="Close contents">×</button></div><div class="toc-links" role="navigation" aria-label="Article sections"></div></section>';
    var list = toc.querySelector('ul');
    if (!list) return;
    var copy = list.cloneNode(true);
    copy.querySelectorAll('[id]').forEach(function (el) { el.removeAttribute('id'); });
    copy.removeAttribute('id');
    dock.querySelector('.toc-links').appendChild(copy);
    document.body.appendChild(dock);
    toc.classList.add('toc-enhanced');
    var button = dock.querySelector('.math-settings-trigger');
    var panel = dock.querySelector('.toc-panel');
    function open(value) {
      panel.hidden = !value;
      button.setAttribute('aria-expanded', String(value));
      if (value) document.dispatchEvent(new CustomEvent('reading-panel-open', {detail: 'toc'}));
    }
    button.addEventListener('click', function () { open(panel.hidden); });
    dock.querySelector('.math-settings-close').addEventListener('click', function () { open(false); button.focus(); });
    document.addEventListener('click', function (event) { if (!dock.contains(event.target)) open(false); });
    document.addEventListener('reading-panel-open', function (event) { if (event.detail !== 'toc') open(false); });
    var items = Array.from(copy.querySelectorAll('a[href^="#"]')).map(function (link) {
      var target;
      try { target = document.getElementById(decodeURIComponent(link.hash.slice(1))); } catch (_) {}
      return {link: link, target: target};
    }).filter(function (item) { return item.target; });
    function highlight(item) {
      items.forEach(function (entry) {
        if (entry === item) entry.link.setAttribute('aria-current', 'location');
        else entry.link.removeAttribute('aria-current');
      });
    }
    copy.addEventListener('click', function (event) {
      var link = event.target.closest('a');
      var item = items.find(function (entry) { return entry.link === link; });
      if (!item) return;
      open(false);
      highlight(item);
      // Keep native fragment navigation and browser history.
    });
    if (items.length) highlight(items[0]);
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function () {
        var active = items[0];
        for (var i = 0; i < items.length; i++) {
          if (items[i].target.getBoundingClientRect().top <= window.innerHeight * .3) active = items[i];
        }
        if (active) highlight(active);
      }, {rootMargin: '0px 0px -70% 0px', threshold: 0});
      items.forEach(function (item) { observer.observe(item.target); });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
