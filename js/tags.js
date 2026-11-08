(function () {
  // Tag filter with URL sync: ?tag=math is shareable and survives
  // reload/back-forward, without any server-side tag pages.

  function readTag() {
    return new URL(location.href).searchParams.get('tag') || 'all';
  }

  function applyFilter(tag, cards, buttons, showMisc) {
    buttons.forEach(function (b) {
      b.classList.toggle('active', b.dataset.tag === tag);
    });
    cards.forEach(function (card) {
      var tags = (card.dataset.tags || '').split(' ');
      var matches = tag === 'all' || tags.indexOf(tag) !== -1;
      card.style.display = matches && (showMisc || !card.hasAttribute('data-misc')) ? '' : 'none';
    });
  }

  // A tag from the URL that has no button (e.g. typed by hand) falls
  // back to "all" instead of hiding every card.
  function validTag(tag, buttons) {
    if (tag === 'all') return tag;
    return buttons.some(function (b) { return b.dataset.tag === tag; }) ? tag : 'all';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var bar = document.querySelector('.tag-filter');
    if (!bar) return;
    var cards = Array.prototype.slice.call(document.querySelectorAll('.post-card'));
    var buttons = Array.prototype.slice.call(bar.querySelectorAll('button'));

    var toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.checked = true;
    if (cards.some(function (card) { return card.hasAttribute('data-misc'); })) {
      var label = document.createElement('label');
      label.className = 'misc-filter';
      label.append(toggle, 'Show misc posts');
      bar.appendChild(label);
      try { toggle.checked = localStorage.getItem('posts-show-misc') !== 'false'; } catch (_) {}
      toggle.addEventListener('change', function () {
        try { localStorage.setItem('posts-show-misc', String(toggle.checked)); } catch (_) {}
        refresh();
      });
    }
    function refresh() { applyFilter(validTag(readTag(), buttons), cards, buttons, toggle.checked); }
    refresh();
    window.addEventListener('popstate', refresh);

    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      var tag = btn.dataset.tag;
      // Sync the tag into the URL (shareable, no reload).
      var url = new URL(window.location.href);
      if (tag === 'all') url.searchParams.delete('tag');
      else url.searchParams.set('tag', tag);
      history.pushState(null, '', url.toString());
      refresh();
    });
  });
})();
