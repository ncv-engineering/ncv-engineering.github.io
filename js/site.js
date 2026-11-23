// N&CV Engineering — site.js
(function () {
  var root = document.documentElement;

  root.classList.add('js');

  // section drawing: builds in construction order once, then one system can be isolated
  var sect = document.querySelector('.sect');
  var dwg = document.getElementById('sect');
  if (sect && dwg) {
    sect.classList.add('build');
    var btns = sect.querySelectorAll('.ly');
    var focus = function (layer) {
      if (!layer || layer === 'all') dwg.removeAttribute('data-focus');
      else dwg.setAttribute('data-focus', layer);
    };
    var setPressed = function (layer) {
      btns.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.layer === layer ? 'true' : 'false'); });
    };
    var current = 'all';
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        current = (b.dataset.layer === current) ? 'all' : b.dataset.layer;
        setPressed(current); focus(current);
      });
    });
  }

  // mobile menu
  var btn = document.querySelector('.nav__toggle');
  var list = document.getElementById('nav-list');
  if (btn && list) {
    btn.addEventListener('click', function () {
      var open = list.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.textContent = open ? 'ปิดเมนู' : 'เมนู';
    });
    list.addEventListener('click', function (e) {
      if (e.target.closest('a')) { list.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); btn.textContent = 'เมนู'; }
    });
  }


  // ---------- motion layer (all of it respects reduced-motion) ----------
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  // header shadow + red scroll-progress bar
  var top = document.querySelector('.top'), bar = document.querySelector('.progress span'), totop = document.querySelector('.totop');
  var onScroll = function () {
    var y = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight;
    if (top) top.classList.toggle('is-scrolled', y > 8);
    if (bar) bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(y / h, 1) : 0) + ')';
    if (totop) totop.classList.toggle('is-on', y > 900);
  };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // reveal cards once when they enter the screen
  var rev = document.querySelectorAll('[data-reveal]');
  if (!still && hasIO && rev.length) {
    root.classList.add('rv');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rev.forEach(function (el, i) { el.style.setProperty('--d', (i % 3) * 90 + 'ms'); io.observe(el); });
  }

  // count-up numbers in the red band
  var nums = document.querySelectorAll('[data-count]');
  if (!still && hasIO && nums.length) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || '', t0 = null;
        var step = function (t) {
          if (!t0) t0 = t;
          var k = Math.min((t - t0) / 1100, 1), v = Math.round(end * (1 - Math.pow(1 - k, 3)));
          el.textContent = v + (k === 1 ? suf : '');
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step); cio.unobserve(el);
      });
    }, { threshold: .6 });
    nums.forEach(function (n) { cio.observe(n); });
  }

  // building section draws itself when it scrolls into view
  if (sect && hasIO) {
    sect.classList.remove('build');
    var sio = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { sect.classList.add('build'); sio.disconnect(); }
    }, { threshold: .25 });
    sio.observe(sect);
  }

  // hero slideshow
  var slides = document.querySelectorAll('.slides .slide'), dots = document.querySelectorAll('.slides__dots i');
  if (slides.length > 1) {
    var cur = 0;
    var show = function (i) {
      slides[cur].classList.remove('is-on'); if (dots[cur]) dots[cur].classList.remove('on');
      cur = i; slides[cur].classList.add('is-on'); if (dots[cur]) dots[cur].classList.add('on');
    };
    if (dots[0]) dots[0].classList.add('on');
    if (!still) setInterval(function () { if (!document.hidden) show((cur + 1) % slides.length); }, 4200);
  }

  // projects page: filter by type
  var fbtn = document.querySelectorAll('[data-filter]');
  fbtn.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.dataset.filter;
      fbtn.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      document.querySelectorAll('.prj').forEach(function (p) { p.hidden = !(f === 'all' || p.dataset.type === f); });
    });
  });

  // floating contact widget
  var fab = document.getElementById('fab');
  if (fab) {
    var fb = fab.querySelector('.fab__btn'), fp = document.getElementById('fab-panel');
    var setOpen = function (o) { fp.hidden = !o; fab.classList.toggle('is-open', o); fb.setAttribute('aria-expanded', o ? 'true' : 'false'); };
    fb.addEventListener('click', function () { setOpen(fp.hidden); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !fp.hidden) { setOpen(false); fb.focus(); } });
    document.addEventListener('click', function (e) { if (!fp.hidden && !fab.contains(e.target)) setOpen(false); });
    fp.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    if (!still) setTimeout(function () { fab.classList.add('ping'); }, 2500);
  }

  // project gallery: open full photo in a dialog
  var lb = document.getElementById('lb');
  if (lb && lb.showModal) {
    var lbImg = lb.querySelector('img'), lbCap = lb.querySelector('.lb__bar p');
    document.querySelectorAll('.gal__btn').forEach(function (b) {
      b.addEventListener('click', function () {
        var im = b.querySelector('img');
        lbImg.src = b.dataset.full; lbImg.alt = im.alt; lbCap.textContent = im.alt;
        lb.showModal();
      });
    });
    lb.querySelector('.lb__close').addEventListener('click', function () { lb.close(); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
  }

  // forms (quote + job application) -> email via FormSubmit
  var FORM_TO = 'suwisit.ncv@gmail.com';
  var FORM_CC = 'vichitnam@yahoo.com';
  var WEB3FORMS_KEY = '';
  document.querySelectorAll('form[data-form]').forEach(function (form) {
    var msg = form.querySelector('.form__msg');
    var btn = form.querySelector('button[type=submit]');
    var btnText = btn.textContent;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      msg.className = 'form__msg';
      var missing = [];
      form.querySelectorAll('[required]').forEach(function (el) {
        var bad = !el.value.trim();
        el.setAttribute('aria-invalid', bad ? 'true' : 'false');
        if (bad) missing.push(el.dataset.label || el.name);
      });
      if (missing.length) {
        msg.textContent = 'ยังไม่ได้กรอก: ' + missing.join(', ');
        msg.classList.add('err');
        form.querySelector('[aria-invalid="true"]').focus();
        return;
      }
      var tel = form.querySelector('input[type=tel]');
      if (tel && tel.value.replace(/\D/g, '').length < 9) {
        tel.setAttribute('aria-invalid', 'true');
        msg.textContent = 'เบอร์โทรต้องมีอย่างน้อย 9 หลัก';
        msg.classList.add('err'); tel.focus(); return;
      }
      if (form.elements.botcheck && form.elements.botcheck.checked) return;
      btn.disabled = true; btn.textContent = 'กำลังส่ง…';
      var data = new FormData(form);
      data.delete('botcheck');
      var url = 'https://formsubmit.co/ajax/' + FORM_TO;
      data.append('_subject', form.dataset.subject + ' — ' + (form.querySelector('select') ? form.querySelector('select').value : ''));
      data.append('_cc', FORM_CC);
      data.append('_template', 'table');
      data.append('_captcha', 'false');
      if (WEB3FORMS_KEY) {
        url = 'https://api.web3forms.com/submit';
        data.append('access_key', WEB3FORMS_KEY);
        data.append('subject', form.dataset.subject);
      }
      fetch(url, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (!(j.success === true || j.success === 'true')) throw new Error(j.message || 'fail');
          form.reset();
          msg.textContent = form.dataset.ok;
          msg.classList.add('ok');
        })
        .catch(function (err) {
          msg.textContent = /activat/i.test(err && err.message || '')
            ? 'ระบบรับฟอร์มกำลังรอยืนยันอีเมลบริษัท ระหว่างนี้โทร 089-023-1676 หรือส่งทาง LINE'
            : 'ส่งไม่สำเร็จเพราะการเชื่อมต่อ โทร 089-023-1676 แทนได้';
          msg.classList.add('err');
        })
        .then(function () { btn.disabled = false; btn.textContent = btnText; });
    });
  });
})();
