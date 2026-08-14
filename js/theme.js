(function () {
  var KEY = 'theme';
  var THEMES = ['system', 'light', 'dark'];
  var NEXT = { system: 'light', light: 'dark', dark: 'system' };
  var ICONS = {
    light: '<circle cx="12" cy="12" r="6"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.5 1.5M17.9 17.9l1.5 1.5M2.5 12h2M19.5 12h2M6.1 17.9l-1.5 1.5M19.4 4.6l-1.5 1.5"/>',
    dark: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
    system: '<rect x="4.5" y="3" width="15" height="13" rx="2"/><path d="M12 16v4"/><path d="M8.5 20h7"/><circle cx="12" cy="9.5" r="3.5"/><path d="M8.5 9.5 A3.5 3.5 0 0 1 15.5 9.5 Z" fill="currentColor" stroke="none"/>'
  };
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  var themeBtn = null;

  function pref() {
    var t = localStorage.getItem(KEY);
    return THEMES.indexOf(t) !== -1 ? t : 'system';
  }

  function resolved(t) {
    if (t !== 'system') return t;
    return mq && mq.matches ? 'dark' : 'light';
  }

  function apply() {
    var t = pref();
    document.documentElement.setAttribute('data-theme', t);
    document.documentElement.setAttribute('data-resolved', resolved(t));
    if (themeBtn) {
      themeBtn.title = 'Switch to ' + NEXT[t];
      var svg = themeBtn.querySelector('svg');
      if (svg) svg.innerHTML = ICONS[NEXT[t]];
    }
  }

  function cycle() {
    var t = pref();
    var next = THEMES[(THEMES.indexOf(t) + 1) % THEMES.length];
    localStorage.setItem(KEY, next);
    apply();
  }

  if (mq) {
    mq.addEventListener('change', function () {
      if (pref() === 'system') apply();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    themeBtn = document.querySelector('.theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', function (e) {
        e.preventDefault();
        cycle();
      });
    }
    apply();
  });

  apply();
})();
