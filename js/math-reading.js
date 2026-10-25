(function () {
  'use strict';
  function init() {
    var content = document.getElementById('content');
    if (!content || (!content.querySelector('.math-env') && !/^\/(posts|notes)\//.test(location.pathname)) || content.dataset.mathReadingReady) return;
    content.dataset.mathReadingReady = 'true';
    document.documentElement.classList.add('has-math-reading');
    var dock = document.createElement('div');
    dock.className = 'math-reading-dock';
    dock.setAttribute('data-pagefind-ignore', '');
    dock.innerHTML = '<button type="button" class="math-settings-trigger" aria-label="Reading settings" aria-expanded="false" aria-controls="math-settings-panel"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 5v15M12 5C9 3 5 3 2 4v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1Z"/></svg></button>' +
      '<section class="math-settings" id="math-settings-panel" aria-label="Reading preferences" hidden>' +
      '<div class="math-settings-header"><strong>Reading settings</strong><button type="button" class="math-settings-close" aria-label="Close reading settings">×</button></div>' +
      '<div class="math-settings-group"><span class="math-settings-caption">VISIBLE CONTENT</span>' +
      '<label><span>Show content<small>Explanations, equations and tables</small></span><input type="checkbox" name="content" checked></label>' +
      '<label><span>Show proofs</span><input type="checkbox" name="proof" checked></label>' +
      '<label><span>Show examples</span><input type="checkbox" name="example" checked></label></div>' +
      '<div class="math-settings-group"><span class="math-settings-caption">INTERACTION</span>' +
      '<label><span>Enable individual folding<small>Fold proofs and examples by title</small></span><input type="checkbox" name="folding" checked></label>' +
      '<label><span>Enable return to reading<small>Return after following a reference</small></span><input type="checkbox" name="returnPosition" checked></label></div>' +
      '<p class="math-settings-note">Definitions and results stay visible.</p></section>';
    document.body.appendChild(dock);
    var panel = dock.querySelector('.math-settings');
    var trigger = dock.querySelector('.math-settings-trigger');
    function setOpen(open) {
      panel.hidden = !open;
      trigger.setAttribute('aria-expanded', String(open));
      if (open) document.dispatchEvent(new CustomEvent('reading-panel-open', {detail: 'math'}));
    }
    document.addEventListener('reading-panel-open', function (event) { if (event.detail !== 'math') setOpen(false); });
    trigger.addEventListener('click', function () { setOpen(panel.hidden); });
    dock.querySelector('.math-settings-close').addEventListener('click', function () { setOpen(false); trigger.focus(); });
    document.addEventListener('click', function (event) {
      if (!panel.hidden && !dock.contains(event.target)) setOpen(false);
    });
    var showContent = panel.querySelector('[name="content"]');
    var proofs = panel.querySelector('[name="proof"]');
    var examples = panel.querySelector('[name="example"]');
    var folding = panel.querySelector('[name="folding"]');
    var storageKey = 'math-reading-preferences-v1';
    var controls = {content: showContent, proof: proofs, example: examples, folding: folding, returnPosition: panel.querySelector('[name="returnPosition"]')};
    var preferences = {content: true, proof: true, example: true, folding: true, returnPosition: true};
    try {
      var saved = JSON.parse(localStorage.getItem(storageKey));
      if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
        Object.keys(preferences).forEach(function (key) {
          if (typeof saved[key] === 'boolean') preferences[key] = saved[key];
        });
      }
    } catch (_) { /* Storage may be unavailable or contain invalid JSON. */ }
    Object.keys(controls).forEach(function (key) { controls[key].checked = preferences[key]; });
    var records = new Map();
    content.querySelectorAll('.math-proof, .math-examp').forEach(function (block) {
      var heading = block.querySelector(':scope > .math-heading');
      if (!heading) return;
      var label = document.createElement('span');
      label.className = 'math-fold-label';
      while (heading.firstChild) label.appendChild(heading.firstChild);
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'math-fold-toggle';
      button.innerHTML = label.innerHTML;
      heading.append(label, button);
      var body = document.createElement('div');
      body.className = 'math-fold-body';
      body.id = block.id + '-body';
      // Snapshot siblings once; never rebuild content when settings change.
      Array.from(block.childNodes).forEach(function (node) { if (node !== heading) body.appendChild(node); });
      block.appendChild(body);
      button.setAttribute('aria-controls', body.id);
      var record = {block: block, button: button, collapsed: false,
        control: block.classList.contains('math-proof') ? proofs : examples};
      records.set(block, record);
      button.setAttribute('aria-expanded', 'true');
      button.addEventListener('click', function () { if (folding.checked) fold(record, !record.collapsed); });
    });
    function fold(record, collapsed) {
      if (record.collapsed === collapsed) return;
      record.collapsed = collapsed;
      record.block.classList.toggle('math-collapsed', collapsed);
      record.button.setAttribute('aria-expanded', String(!collapsed));
    }
    function apply(changed) {
      content.classList.toggle('math-hide-content', !showContent.checked);
      content.classList.toggle('math-no-folding', !folding.checked);
      records.forEach(function (record) {
        record.block.classList.toggle('math-hidden', !record.control.checked && !folding.checked);
        if (!changed || changed === folding || changed === record.control) {
          fold(record, !record.control.checked && folding.checked);
        }
      });
    }
    panel.addEventListener('change', function (event) {
      var key = event.target.name;
      if (!Object.prototype.hasOwnProperty.call(controls, key) || controls[key] !== event.target) return;
      // Save only explicit preference changes, not temporary reference reveals.
      preferences[key] = event.target.checked;
      try { localStorage.setItem(storageKey, JSON.stringify(preferences)); } catch (_) {}
      apply(event.target);
      if (key === "returnPosition") document.dispatchEvent(new CustomEvent("reading-return-preference", {detail: event.target.checked}));
    });
    function reveal(hash) {
      if (!hash || hash === '#') return;
      var target;
      try { target = document.getElementById(decodeURIComponent(hash.slice(1))); } catch (_) { return; }
      if (!target || !content.contains(target)) return;
      if (target.closest('.math-prose') && !showContent.checked) {
        showContent.checked = true; apply(showContent);
      }
      var block = target.closest('.math-proof, .math-examp');
      while (block) {
        var record = records.get(block);
        if (record) {
          if (block.classList.contains('math-hidden')) { record.control.checked = true; apply(record.control); }
          fold(record, false);
        }
        block = block.parentElement.closest('.math-proof, .math-examp');
      }
      requestAnimationFrame(function () { target.scrollIntoView({block: 'start'}); });
    }
    content.addEventListener('click', function (event) {
      var link = event.target.closest('a[href]');
      if (!link) return;
      var url = new URL(link.href, location.href);
      if (url.origin === location.origin && url.pathname === location.pathname && url.search === location.search) reveal(url.hash);
    });
    document.addEventListener('reading-return-reveal', function (event) {
      var target = event.detail;
      if (!target.id) target.id = 'reading-return-source';
      reveal('#' + encodeURIComponent(target.id));
    });
    window.addEventListener('hashchange', function () { reveal(location.hash); });
    apply();
    reveal(location.hash);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
