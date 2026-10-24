// RAWZA — presentation interactions (progressive: the page reads fine without them)
(function () {
  'use strict';

  // size a logo so that its cap height is exactly `cap` CSS pixels (cap = 700 units)
  function sizeToCap(svg, cap) {
    var vb = (svg.getAttribute('viewBox') || '').split(/\s+/).map(Number);
    if (vb.length !== 4) return;
    var k = cap / 700;
    svg.style.height = (vb[3] * k).toFixed(2) + 'px';
    svg.style.width = (vb[2] * k).toFixed(2) + 'px';
  }
  document.querySelectorAll('svg[data-cap]').forEach(function (svg) {
    sizeToCap(svg, parseFloat(svg.getAttribute('data-cap')));
  });

  // segmented toggles that swap variants: data-toggle="key" -> data-toggle-target="key"
  document.querySelectorAll('[data-toggle]').forEach(function (group) {
    var key = group.getAttribute('data-toggle');
    var target = document.querySelector('[data-toggle-target="' + key + '"]');
    if (!target) return;
    group.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-show]');
      if (!btn) return;
      var show = btn.getAttribute('data-show');
      group.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      target.querySelectorAll('[data-variant]').forEach(function (el) {
        el.hidden = el.getAttribute('data-variant') !== show;
      });
    });
  });

  // segmented toggles that set a mode class: data-mode="elementId"
  document.querySelectorAll('[data-mode]').forEach(function (group) {
    var el = document.getElementById(group.getAttribute('data-mode'));
    if (!el) return;
    group.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-set]');
      if (!btn) return;
      group.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      el.classList.toggle('is-evening', btn.getAttribute('data-set') === 'evening');
    });
  });

  // live resize sliders
  document.querySelectorAll('input[data-scale-target]').forEach(function (input) {
    var svg = document.getElementById(input.getAttribute('data-scale-target'));
    var out = document.getElementById(input.id + '-out');
    function update() {
      sizeToCap(svg, +input.value);
      if (out) out.textContent = input.value;
    }
    input.addEventListener('input', update);
    update();
  });

  // highlight the current section in the top bar
  var links = Array.prototype.slice.call(document.querySelectorAll('.topbar__links a'));
  if ('IntersectionObserver' in window && links.length) {
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove('is-active'); });
        var a = map[en.target.id];
        if (a) a.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) io.observe(sec);
    });
  }
})();
