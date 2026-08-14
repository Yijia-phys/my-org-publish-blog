(function () {
  var uiCreated = false;
  var modal = null;
  var trigger = null; // the nav button that opened the dialog; focus returns here

  function loadAssets(cb) {
    if (document.getElementById('pagefind-ui-css')) {
      cb();
      return;
    }
    var link = document.createElement('link');
    link.id = 'pagefind-ui-css';
    link.rel = 'stylesheet';
    link.href = '/pagefind/pagefind-ui.css';
    document.head.appendChild(link);
    var s = document.createElement('script');
    s.src = '/pagefind/pagefind-ui.js';
    s.onload = cb;
    s.onerror = function () {
      alert('Failed to load the search component. Please try again later.');
    };
    document.head.appendChild(s);
  }

  function focusInput() {
    var input = document.querySelector('#pagefind-search .pagefind-ui__search-input');
    if (input) input.focus();
  }

  function closeModal() {
    if (modal) modal.classList.add('hidden');
    // Return focus to the button that opened the dialog.
    if (trigger) trigger.focus();
  }

  function openModal() {
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'search-modal hidden';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', 'Search');
      modal.innerHTML = '<div class="search-modal-panel"><div id="pagefind-search"></div></div>';
      document.body.appendChild(modal);
      modal.addEventListener('click', function (e) {
        if (e.target === modal) closeModal();
      });
      // Keep Tab focus inside the dialog while it is open.
      modal.addEventListener('keydown', function (e) {
        if (e.key !== 'Tab') return;
        var focusables = modal.querySelectorAll(
          'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeModal();
      });
    }
    loadAssets(function () {
      modal.classList.remove('hidden');
      if (!uiCreated && window.PagefindUI) {
        new PagefindUI({
          element: '#pagefind-search',
          bundlePath: '/pagefind/',
          showImages: false
        });
        uiCreated = true;
      }
      focusInput();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.querySelector('.nav-search');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      trigger = btn;
      openModal();
    });
  });
})();
