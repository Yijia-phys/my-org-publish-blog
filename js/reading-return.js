(function () {
  'use strict';
  var key = 'reading-return-v1', pref = 'math-reading-preferences-v1';
  var memory = null, enabled = true, button;
  function read() { try { return JSON.parse(sessionStorage.getItem(key)); } catch (_) { return memory; } }
  function write(value) {
    memory = value;
    try { if (value) sessionStorage.setItem(key, JSON.stringify(value)); else sessionStorage.removeItem(key); } catch (_) {}
  }
  function valid(record) {
    if (!record || typeof record.from !== 'string' || typeof record.to !== 'string' || !Number.isFinite(record.y)) return false;
    try { return new URL(record.from).origin === location.origin && new URL(record.to).origin === location.origin; } catch (_) { return false; }
  }
  function preferences() {
    try { var saved = JSON.parse(localStorage.getItem(pref)); enabled = !saved || saved.returnPosition !== false; } catch (_) {}
  }
  function refresh() {
    var record = read();
    button.hidden = !enabled || !valid(record) || record.restoring || record.to !== location.href;
  }
  function restore() {
    var record = read();
    if (!enabled || !valid(record) || !record.restoring || record.from !== location.href) { refresh(); return; }
    write(null);
    var links = document.querySelectorAll('#content a[href]');
    var link = links[record.index];
    if (link && link.href === record.link) {
      document.dispatchEvent(new CustomEvent('reading-return-reveal', {detail: link}));
    }
    var ready = document.fonts ? document.fonts.ready : Promise.resolve();
    ready.then(function () { requestAnimationFrame(function () { requestAnimationFrame(function () {
      var y = link && link.href === record.link && link.getClientRects().length
        ? window.scrollY + link.getBoundingClientRect().top - record.offset : record.y;
      window.scrollTo({top: y, left: record.x || 0, behavior: 'instant'});
      if (link && link.href === record.link) link.focus({preventScroll: true});
      refresh();
    }); }); });
  }
  function init() {
    preferences();
    button = document.createElement('button');
    button.type = 'button'; button.className = 'reading-return'; button.hidden = true;
    button.textContent = '← Back to reading'; button.setAttribute('data-pagefind-ignore', '');
    document.body.appendChild(button);
    document.addEventListener('click', function (event) {
      if (!enabled || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      var link = event.target.closest('a[href]');
      if (!link || !link.closest('#content') || link.closest('#table-of-contents, .notes-navigation') || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
      var url = new URL(link.href, location.href);
      if (url.origin !== location.origin || !url.hash || url.hash === '#' || url.href === location.href) return;
      var samePage = url.pathname === location.pathname && url.search === location.search;
      if (samePage) {
        try { if (!document.getElementById(decodeURIComponent(url.hash.slice(1)))) return; } catch (_) { return; }
      }
      write({from: location.href, to: url.href, x: window.scrollX, y: window.scrollY,
        index: Array.prototype.indexOf.call(document.querySelectorAll('#content a[href]'), link),
        link: link.href, offset: link.getBoundingClientRect().top});
      if (samePage) setTimeout(refresh, 0);
    }, true);
    button.addEventListener('click', function () {
      var record = read(); if (!valid(record)) return;
      record.restoring = true; write(record); button.hidden = true;
      var url = new URL(record.from);
      if (url.pathname === location.pathname && url.search === location.search) {
        history.replaceState(history.state, '', record.from); restore();
      } else location.assign(record.from);
    });
    document.addEventListener('reading-return-preference', function (event) {
      enabled = event.detail; if (!enabled) write(null); refresh();
    });
    window.addEventListener('storage', function (event) {
      if (event.key === pref || event.key === null) { preferences(); if (!enabled) write(null); refresh(); }
    });
    window.addEventListener('hashchange', refresh);
    window.addEventListener('pageshow', function () { preferences(); restore(); });
    if (!enabled) write(null);
    restore();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
