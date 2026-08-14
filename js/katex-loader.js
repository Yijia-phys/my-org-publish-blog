(function () {
  var MATH_PATTERN = /\\\(|\\\[|\$\$/;

  function hasMath() {
    return MATH_PATTERN.test(document.body.innerHTML);
  }

  function loadKaTeX(cb) {
    if (document.getElementById('katex-css')) {
      cb();
      return;
    }
    var link = document.createElement('link');
    link.id = 'katex-css';
    link.rel = 'stylesheet';
    link.href = '/vendor/katex/katex.min.css';
    document.head.appendChild(link);
    var core = document.createElement('script');
    core.src = '/vendor/katex/katex.min.js';
    core.onload = function () {
      var render = document.createElement('script');
      render.src = '/vendor/katex/auto-render.min.js';
      render.onload = cb;
      document.head.appendChild(render);
    };
    document.head.appendChild(core);
  }

  function renderMath() {
    loadKaTeX(function () {
      if (window.renderMathInElement) {
        renderMathInElement(document.body, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '\\[', right: '\\]', display: true },
            { left: '\\(', right: '\\)', display: false }
          ],
          throwOnError: false
        });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (hasMath()) renderMath();
  });
})();
