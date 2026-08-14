(function () {
  // Tag filter with URL sync: ?tag=math is shareable and survives
  // reload/back-forward, without any server-side tag pages.

  function readTag() {
    var m = location.search.match(/[?&]tag=([^&]+)/);
    return m ? decodeURIComponent(m[1]) : 'all';
  }

  function applyFilter(tag, cards, buttons) {
    buttons.forEach(function (b) {
      b.classList.toggle('active', b.dataset.tag === tag);
    });
    cards.forEach(function (card) {
      var tags = (card.dataset.tags || '').split(' ');
      card.style.display = (tag === 'all' || tags.indexOf(tag) !== -1) ? '' : 'none';
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

    // Apply the tag from the URL on load.
    applyFilter(validTag(readTag(), buttons), cards, buttons);

    // Keep the filter in sync when navigating back/forward.
    window.addEventListener('popstate', function () {
      applyFilter(validTag(readTag(), buttons), cards, buttons);
    });

    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      var tag = btn.dataset.tag;
      applyFilter(tag, cards, buttons);
      // Sync the tag into the URL (shareable, no reload).
      var url = new URL(window.location.href);
      if (tag === 'all') url.searchParams.delete('tag');
      else url.searchParams.set('tag', tag);
      history.pushState(null, '', url.toString());
    });
  });
})();
